# AI Switch

A desktop application for managing AI coding assistant configurations. Quickly switch between multiple profiles for **Claude Code** and **OpenAI Codex** without manually editing config files.

## Features

- Manage multiple Claude Code / Codex configuration profiles
- One-click profile activation — instantly switch API keys, models, and settings
- Import existing configurations directly from Claude Code / Codex
- Star / favorite frequently used profiles
- OpenAI direct-connect mode for Codex
- Cross-platform: Windows, macOS, Linux

## Tech Stack

| Layer    | Technology                   |
| -------- | ---------------------------- |
| Frontend | React 18 + TypeScript + Vite |
| Backend  | Rust + Tauri 2               |
| Package  | pnpm                         |

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) >= 18
- [pnpm](https://pnpm.io/) >= 8
- [Rust](https://www.rust-lang.org/tools/install) (stable)
- Platform-specific Tauri dependencies — see the [Tauri v2 prerequisites](https://v2.tauri.app/start/prerequisites/)

### Development

```bash
# Install dependencies
pnpm install

# Run in development mode (frontend + Tauri shell)
pnpm tauri dev
```

### Build

```bash
# Build the production desktop app
pnpm tauri build
```

## CI / CD

The project uses **GitHub Actions** to automatically build release artifacts for:

| Platform | Target                          |
| -------- | ------------------------------- |
| Linux    | `x86_64-unknown-linux-gnu`      |
| macOS    | `aarch64-apple-darwin` (ARM)    |
| macOS    | `x86_64-apple-darwin` (Intel)   |
| Windows  | `x86_64-pc-windows-msvc`        |

Push a tag matching `v*` (e.g. `v0.1.0`) to trigger a build. A **draft GitHub Release** will be created with all platform installers attached.

```bash
git tag v0.1.0
git push origin v0.1.0
```

You can also trigger the workflow manually from the **Actions** tab.

## License

[MIT](./LICENSE)
