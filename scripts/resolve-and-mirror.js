const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');

const PLUGINS_DIR = path.join(__dirname, '..', 'plugins');
const OUTPUT = path.join(__dirname, '..', 'plugins.json');
const GHCR_NS = 'ghcr.io/beaver-notes/plugins';
const GHCR_ORG = 'beaver-notes';
const TMP = path.join(__dirname, '..', '.tmp-mirror');

function walkDir(dir) {
  const results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkDir(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.json')) {
      results.push(fullPath);
    }
  }
  return results;
}

async function latestRelease(repo, token) {
  const url = `https://api.github.com/repos/${repo}/releases/latest`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'beaver-notes-plugin-registry-ci',
    },
  });
  if (!res.ok) {
    throw new Error(`GitHub API ${res.status} for ${repo}/releases/latest: ${res.statusText}`);
  }
  return res.json();
}

async function downloadAsset(url, dest) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed: ${res.status} ${res.statusText}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(dest, buffer);
}

function sha256File(file) {
  const buf = fs.readFileSync(file);
  return crypto.createHash('sha256').update(buf).digest('hex');
}

function checkManifest(beaxPath, expectedId) {
  const result = execSync(`unzip -p "${beaxPath}" manifest.json 2>/dev/null`, {
    encoding: 'utf-8',
    maxBuffer: 1024 * 1024,
  });
  if (!result || !result.trim()) {
    throw new Error(`manifest.json not found inside .beax archive`);
  }
  let manifest;
  try {
    manifest = JSON.parse(result);
  } catch {
    throw new Error(`manifest.json inside .beax is not valid JSON`);
  }
  if (!manifest.id) {
    throw new Error(`manifest.json is missing required field "id"`);
  }
  if (manifest.id !== expectedId) {
    throw new Error(
      `manifest.json id "${manifest.id}" does not match plugin id "${expectedId}"`
    );
  }
  console.log(`  manifest.json id "${manifest.id}" verified OK`);
}

function getExistingTags(ref) {
  try {
    const output = execSync(`oras repo tags --format json "${ref}" 2>/dev/null`, {
      encoding: 'utf-8',
      stdio: 'pipe',
    });
    const parsed = JSON.parse(output);
    return parsed.tags || [];
  } catch {
    return [];
  }
}

function orasLogin() {
  execSync('oras login ghcr.io -u github-actions --password-stdin', {
    input: process.env.GITHUB_TOKEN,
    stdio: ['pipe', 'inherit', 'inherit'],
  });
}

function pushArtifact(id, versionTag, beaxPath, sha, publishedAt, name) {
  const ref = `${GHCR_NS}/${id.toLowerCase()}`;
  const cmd = [
    `oras push ${ref}:${versionTag}`,
    `--artifact-type application/vnd.beaver.plugin.v1+beax`,
    `--annotation "org.opencontainers.image.title=${name}"`,
    `--annotation "org.opencontainers.image.version=${versionTag}"`,
    `--annotation "beavernotes/sha256=${sha}"`,
    `--annotation "beavernotes/plugin-id=${id}"`,
    `--annotation "org.opencontainers.image.created=${publishedAt}"`,
    `"${beaxPath}":application/vnd.beaver.plugin.beax`,
  ].join(' ');
  execSync(cmd, { stdio: 'inherit' });
  console.log(`  Pushed ${ref}:${versionTag}`);
}

function tagLatest(ref, versionTag) {
  execSync(`oras tag "${ref}:${versionTag}" latest`, { stdio: 'inherit' });
  console.log(`  Tagged ${ref}:latest -> ${versionTag}`);
}

async function setPackageVisibility(id, token) {
  const pkg = `plugins/${id.toLowerCase()}`;
  const encoded = encodeURIComponent(pkg);
  const url = `https://api.github.com/orgs/${GHCR_ORG}/packages/container/${encoded}/visibility`;
  try {
    const res = await fetch(url, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json',
        'User-Agent': 'beaver-notes-plugin-registry-ci',
      },
      body: JSON.stringify({ visibility: 'public' }),
    });
    if (res.ok) {
      console.log('  Package visibility set to public');
    } else if (res.status === 403) {
      console.warn('  Warning: Cannot set package visibility to public (permission denied).');
      console.warn('  A maintainer should run: gh api --method PATCH /orgs/beaver-notes/packages/container/.../visibility -f visibility=public');
    } else if (res.status === 404) {
      console.warn('  Warning: Package not yet visible via Packages API (may need time to propagate).');
    } else {
      const body = await res.text().catch(() => '');
      console.warn(`  Warning: Failed to set package visibility (HTTP ${res.status}): ${body.substring(0, 200)}`);
    }
  } catch (err) {
    console.warn(`  Warning: Error setting package visibility: ${err.message}`);
  }
}

function parseTag(tag, version) {
  const prefix = `${version}_`;
  if (tag.startsWith(prefix)) {
    const rest = tag.slice(prefix.length);
    const n = parseInt(rest, 10);
    if (!isNaN(n) && String(n) === rest) return n;
  }
  return 0;
}

async function main() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    console.error('GITHUB_TOKEN environment variable is required');
    process.exit(1);
  }

  try {
    execSync('oras version', { stdio: 'pipe' });
  } catch {
    console.error('oras CLI not found. Install from https://oras.land');
    process.exit(1);
  }

  fs.mkdirSync(TMP, { recursive: true });

  const prevData = {};
  try {
    const existing = JSON.parse(fs.readFileSync(OUTPUT, 'utf-8'));
    for (const e of existing) {
      if (e.id) prevData[e.id] = e;
    }
  } catch {}

  const files = walkDir(PLUGINS_DIR);
  console.log(`Found ${files.length} plugin file(s)\n`);

  const entries = [];
  let failed = 0;

  for (const file of files) {
    const plugin = JSON.parse(fs.readFileSync(file, 'utf-8'));
    const { id, repo } = plugin;
    const name = plugin.name || id;
    console.log(`=== ${id} (${repo}) ===`);

    let beaxFile;
    try {
      const release = await latestRelease(repo, token);
      const asset = release.assets.find(a => a.name.endsWith('.beax'));
      if (!asset) {
        throw new Error(`No .beax asset found in release ${release.tag_name}`);
      }

      const version = release.tag_name.replace(/^v/, '');
      beaxFile = path.join(TMP, asset.name);

      console.log(`  Version: ${version}`);
      console.log(`  Asset: ${asset.name} (${asset.size} bytes)`);
      console.log(`  Published: ${release.published_at}`);

      console.log(`  Downloading...`);
      await downloadAsset(asset.browser_download_url, beaxFile);

      console.log(`  Computing SHA-256...`);
      const hash = sha256File(beaxFile);
      console.log(`  SHA-256: ${hash}`);

      console.log(`  Verifying manifest.json...`);
      checkManifest(beaxFile, id);

      const ref = `${GHCR_NS}/${id.toLowerCase()}`;
      const existingTags = getExistingTags(ref);
      const prev = prevData[id];

      let skipPush = false;
      let pushTag = version;
      let rebuildNum = 0;

      if (existingTags.includes(version)) {
        const prevSha = prev && prev.latest_version === version ? prev.sha256 : null;

        if (prevSha && prevSha === hash) {
          console.log(`  SHA-256 unchanged (${hash}), already mirrored`);
          skipPush = true;
          if (prev && prev.ghcr_ref) {
            const prevTag = prev.ghcr_ref.split(':').pop();
            pushTag = prevTag;
            rebuildNum = parseTag(prevTag, version);
          }
        } else {
          for (let i = 1; i <= 99; i++) {
            if (!existingTags.includes(`${version}_${i}`)) {
              pushTag = `${version}_${i}`;
              rebuildNum = i;
              break;
            }
          }
          if (rebuildNum === 0) {
            throw new Error(`Too many rebuilds for version ${version} (≥100)`);
          }
          console.log(`  SHA-256 changed from previous mirror → pushing rebuild as ${pushTag}`);
        }
      }

      if (!skipPush) {
        orasLogin();
        pushArtifact(id, pushTag, beaxFile, hash, release.published_at, name);

        if (rebuildNum === 0) {
          tagLatest(ref, pushTag);
        }

        await setPackageVisibility(id, token);
      }

      const entry = {
        id,
        name: plugin.name,
        author: plugin.author,
        description: plugin.description,
        repo,
        branch: plugin.branch,
      };
      if (plugin.screenshots) entry.screenshots = plugin.screenshots;
      if (plugin.tags) entry.tags = plugin.tags;
      if (plugin.homepage) entry.homepage = plugin.homepage;
      entry.latest_version = version;
      entry.sha256 = hash;
      entry.size = asset.size;
      entry.published_at = release.published_at;
      entry.ghcr_ref = `${ref}:${pushTag}`;
      entry.download_url = asset.browser_download_url;
      if (rebuildNum > 0) entry.rebuild = rebuildNum;
      entries.push(entry);

      const status = skipPush ? 'up-to-date' : `mirrored as ${pushTag}`;
      console.log(`  OK: ${id} ${status}\n`);
    } catch (err) {
      console.error(`  FAILED: ${err.message}\n`);
      const fallback = {
        id: plugin.id,
        name: plugin.name,
        author: plugin.author,
        description: plugin.description,
        repo: plugin.repo,
        branch: plugin.branch,
      };
      if (plugin.screenshots) fallback.screenshots = plugin.screenshots;
      if (plugin.tags) fallback.tags = plugin.tags;
      if (plugin.homepage) fallback.homepage = plugin.homepage;
      entries.push(fallback);
      failed++;
    } finally {
      if (beaxFile) {
        try { fs.rmSync(beaxFile); } catch {}
      }
    }
  }

  fs.rmSync(TMP, { recursive: true, force: true });

  fs.writeFileSync(OUTPUT, JSON.stringify(entries, null, 2) + '\n');
  console.log(`\nWritten ${entries.length} plugins to plugins.json`);
  if (failed > 0) {
    console.log(`${failed} plugin(s) failed mirroring`);
    process.exit(1);
  }
}

main().catch(err => {
  console.error(err.message);
  process.exit(1);
});
