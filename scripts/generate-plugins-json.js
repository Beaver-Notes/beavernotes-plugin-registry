const fs = require('fs');
const path = require('path');

const PLUGINS_DIR = path.join(__dirname, '..', 'plugins');
const OUTPUT_FILE = path.join(__dirname, '..', 'plugins.json');
const STORE_PUBLIC = path.join(__dirname, '..', 'store', 'public');

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

const files = walkDir(PLUGINS_DIR);

const plugins = [];
const errors = [];

for (const file of files) {
  const relPath = path.relative(PLUGINS_DIR, file);
  try {
    const content = fs.readFileSync(file, 'utf-8');
    const plugin = JSON.parse(content);

    const requiredFields = ['id', 'name', 'author', 'description', 'repo', 'branch'];
    for (const field of requiredFields) {
      if (!plugin[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    plugins.push({
      id: plugin.id,
      name: plugin.name,
      author: plugin.author,
      description: plugin.description,
      repo: plugin.repo,
      branch: plugin.branch,
    });
  } catch (e) {
    errors.push(`${relPath}: ${e.message}`);
  }
}

if (errors.length > 0) {
  console.error('Errors found:');
  errors.forEach(e => console.error(`  - ${e}`));
  process.exit(1);
}

const aggregate = plugins;
const enriched = [];

for (const file of files) {
  try {
    const content = fs.readFileSync(file, 'utf-8');
    enriched.push(JSON.parse(content));
  } catch {}
}

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(aggregate, null, 2) + '\n');

const storeFile = path.join(STORE_PUBLIC, 'plugins.json');
fs.writeFileSync(storeFile, JSON.stringify(enriched, null, 2) + '\n');

console.log(`Generated plugins.json with ${aggregate.length} plugin(s)`);
console.log(`Wrote enriched data to store/public/plugins.json`);
