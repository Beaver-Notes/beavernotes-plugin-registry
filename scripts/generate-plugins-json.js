const fs = require('fs');
const path = require('path');

const PLUGINS_DIR = path.join(__dirname, '..', 'plugins');
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

const errors = [];
const enriched = [];

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

    enriched.push(plugin);
  } catch (e) {
    errors.push(`${relPath}: ${e.message}`);
  }
}

if (errors.length > 0) {
  console.error('Errors found:');
  errors.forEach(e => console.error(`  - ${e}`));
  process.exit(1);
}

const storeFile = path.join(STORE_PUBLIC, 'plugins.json');
fs.writeFileSync(storeFile, JSON.stringify(enriched, null, 2) + '\n');

console.log(`Wrote ${enriched.length} plugin(s) to store/public/plugins.json`);
