# Plugin Review Checklist

> Some checks below are now **automated by CI** — see
> [the verification contract](README.md#verification-contract) and
> `.github/workflows/validate.yml`. Items marked ★ are enforced by CI;
> reviewers should still verify them but can rely on CI as the primary gate.

Before approving a plugin submission, verify the following:

## Manifest

- [ ] `id` is a valid reverse-domain identifier (e.g. `com.example.my-plugin`)
- [ ] `name` is present and not misleading
- [ ] `version` is valid SemVer
- [ ] `planes` is an array containing only `"app"` or `"editor"`
- [ ] `permissions` only uses valid permission strings
- [ ] `main` points to the correct entry file
- [ ] If `settingsFile` is set, the file exists and exports a valid `settings` function

## Security

- [ ] Permissions requested match the plugin's described functionality
- [ ] No obfuscated or minified code (except bundled dependencies)
- [ ] Plugin does not request unnecessary permissions
- [ ] Network requests have a clear purpose and are documented

## Quality

- [ ] Plugin has a README with installation and usage instructions
- [★] Plugin has a valid GitHub Release with a `.beax` file attached
- [★] `manifest.json` id matches the plugin's declared `id`
- [ ] `manifest.json` version matches the GitHub Release tag
- [ ] Plugin does not bundle unnecessary files in the `.beax`
- [ ] No console.log spam (acceptable for debug builds)
- [ ] Plugin handles errors gracefully

## Publishing

- [ ] `plugins.json` entry has correct `id`, `name`, `author`, `description`, `repo`, and `branch` fields
- [ ] Plugin repo is public
- [ ] Plugin has a valid LICENSE file

## Post-Merge

- [ ] Confirm the plugin appears in the in-app browser after merge
- [ ] Confirm install works end-to-end: browse → install → activate → test

## Rejection Reasons

- Plugin requests permissions not required for its functionality
- Plugin contains malware, tracking, or unauthorized data collection
- Plugin violates Beaver Notes developer policies
- Plugin is a duplicate of an existing plugin
- Plugin is unmaintained or broken

## Removal

Plugin is eligible for removal if:
- It has been unmaintained for 6+ months and is broken
- It violates policies after merge
- Author requests removal

To remove a plugin, file a PR removing its entry from `plugins.json` and adding it to `plugins-removed.json`.
