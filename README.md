# Beaver Notes Plugin Registry

Community plugin directory for [Beaver Notes](https://beavernotes.com). Browse plugins at the **[Plugin Store](https://beaver-notes.github.io/beaver-notes-plugin-registry/)**.

This repo does not accept issues. For plugin-specific problems, open an issue on the plugin's own repo. For Beaver Notes issues, see [Beaver's GitHub repo](https://github.com/Beaver-Notes/Beaver-Notes).

## Repository Structure

```
├── plugins/                  # Individual plugin files (one .json per plugin)
│   └── com.example.plugin.json
├── plugins.json              # Aggregated registry (auto-generated)
├── plugins-removed.json      # Graveyard for removed plugins
├── store/                    # Static store front (Vue/Vite/Tailwind)
├── scripts/
│   └── generate-plugins-json.js
└── .github/workflows/
    ├── validate.yml          # Validates plugin files on PR
    └── deploy-store.yml      # Deploys store to GitHub Pages
```

## Submitting a Plugin

1. Build your plugin with `@beaver-notes/plugin-builder`
2. Create a GitHub Release on your plugin's repo, attach the `.beax` file
3. Add your plugin as a new file in `plugins/`:

```json
{
  "id": "com.example.my-plugin",
  "name": "My Plugin",
  "author": "Your Name",
  "description": "What it does",
  "repo": "your-username/your-plugin-repo",
  "branch": "main",
  "screenshots": [
    "https://raw.githubusercontent.com/your-username/your-plugin-repo/main/screenshots/01.png"
  ],
  "tags": ["productivity", "editor"],
  "homepage": "https://github.com/your-username/your-plugin-repo"
}
```

4. Open a PR. A maintainer checks against the [review checklist](REVIEW.md).

## Fields

| Field | Required | Description |
|---|---|---|
| `id` | Yes | Reverse-domain ID matching the plugin's `manifest.json` id |
| `name` | Yes | Display name |
| `author` | Yes | Your name or organization |
| `description` | Yes | Short description shown in the store and in-app browser |
| `repo` | Yes | GitHub `owner/repo` for the plugin |
| `branch` | Yes | Default branch of the repo |
| `screenshots` | No | Array of raw image URLs for previews in the store |
| `tags` | No | Array of strings for categorization and search |
| `homepage` | No | URL to the plugin's website or documentation |

## License

MIT
