const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const TMP = path.join(__dirname, '..', '.tmp-validate');

async function main() {
  const pluginFile = process.argv[2];
  if (!pluginFile) {
    console.error('Usage: node scripts/validate-release.js <plugin-json-file>');
    process.exit(1);
  }

  const plugin = JSON.parse(fs.readFileSync(pluginFile, 'utf-8'));
  const { id, repo } = plugin;

  if (!id || !repo) {
    console.error(`Plugin file ${pluginFile} is missing "id" or "repo"`);
    process.exit(1);
  }

  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    console.error('GITHUB_TOKEN environment variable is required');
    process.exit(1);
  }

  console.log(`Validating ${id} (${repo})...`);

  const url = `https://api.github.com/repos/${repo}/releases/latest`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'beaver-notes-plugin-registry-ci',
    },
  });

  if (res.status === 404) {
    console.error(`FAILED: Repo "${repo}" has no releases. Create a GitHub Release with a .beax asset.`);
    process.exit(1);
  }
  if (!res.ok) {
    console.error(`FAILED: GitHub API error ${res.status} for ${repo}: ${res.statusText}`);
    process.exit(1);
  }

  const release = await res.json();
  console.log(`  Latest release: ${release.tag_name}`);

  const asset = release.assets.find(a => a.name.endsWith('.beax'));
  if (!asset) {
    console.error(
      `FAILED: Release ${release.tag_name} has no .beax asset. ` +
      `Attach the plugin's .beax file to the release.`
    );
    process.exit(1);
  }

  console.log(`  Found .beax: ${asset.name} (${asset.size} bytes)`);

  fs.mkdirSync(TMP, { recursive: true });
  const beaxPath = path.join(TMP, asset.name);

  try {
    const dlRes = await fetch(asset.browser_download_url);
    if (!dlRes.ok) {
      throw new Error(`Download failed: ${dlRes.status} ${dlRes.statusText}`);
    }
    const buffer = Buffer.from(await dlRes.arrayBuffer());
    fs.writeFileSync(beaxPath, buffer);

    const result = execSync(`unzip -p "${beaxPath}" manifest.json 2>/dev/null`, {
      encoding: 'utf-8',
      maxBuffer: 1024 * 1024,
    });

    if (!result || !result.trim()) {
      throw new Error(`manifest.json not found inside .beax archive`);
    }

    const manifest = JSON.parse(result);
    if (manifest.id !== id) {
      throw new Error(
        `manifest.json id "${manifest.id}" does not match plugin id "${id}"`
      );
    }

    console.log(`  manifest.json id "${manifest.id}" matches plugin id`);
    console.log(`  Release validation passed for ${id}`);
  } finally {
    fs.rmSync(TMP, { recursive: true, force: true });
  }
}

main().catch(err => {
  console.error(`FAILED: ${err.message}`);
  process.exit(1);
});
