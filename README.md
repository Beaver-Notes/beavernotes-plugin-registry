# Beaver Notes Plugin Registry

Community plugin directory for [Beaver Notes](https://beavernotes.com). Browse plugins at the **[Plugin Store](https://beaver-notes.github.io/beaver-notes-plugin-registry/)**.

This repo does not accept issues. For plugin-specific problems, open an issue on the plugin's own repo. For Beaver Notes issues, see [Beaver's GitHub repo](https://github.com/Beaver-Notes/Beaver-Notes).

## Repository Structure

```
├── plugins/                  # Individual plugin files (one .json per plugin)
│   └── com.example.plugin.json
├── plugins.json              # Aggregated registry (auto-generated, enriched by CI)
├── plugins-removed.json      # Graveyard for removed plugins
├── store/                    # Static store front (Vue/Vite/Tailwind)
├── scripts/
│   ├── generate-plugins-json.js
│   ├── resolve-and-mirror.js # Resolve releases, mirror .beax to GHCR, compute SHA-256
│   └── validate-release.js   # PR-time validation of release assets
└── .github/workflows/
    ├── validate.yml          # Validates plugin files + release assets on PR
    ├── mirror-plugins.yml    # Scheduled mirror + SHA-256 pinning to GHCR
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

## Verification Contract

Every plugin listed in `plugins.json` carries a `sha256` resolved and pinned by CI from the plugin's GitHub Release, plus a `ghcr_ref` mirror on GitHub Container Registry.

Clients **MUST** download the `.beax` (from `ghcr_ref` or `download_url`), compute its SHA-256, and compare it against the `sha256` field in `plugins.json` **before** installing. Reject the install on any mismatch. Do **not** trust a hash fetched from the plugin's own repo at install time — only the value pinned in this registry is authoritative, since that value went through PR review and CI verification.

### Verification logic

```
sha256(downloaded .beax) === plugins.json[plugin.id].sha256
```

If the hashes do not match, the client should refuse to install and log an error. This prevents tampered or corrupted plugins from ever being installed, even if the upstream release asset has been replaced.

## License

MIT
