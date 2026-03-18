# AI Switch

A lightweight desktop app for managing AI coding assistant configurations. Quickly switch between multiple profiles for **Claude Code** and **OpenAI Codex** — no more manually editing config files.

## Installation

### Homebrew (macOS)

```bash
brew install ji233-Sun/tap/ai-switch
```

To upgrade:

```bash
brew upgrade ai-switch
```

### Manual Download

Download the latest installer from [GitHub Releases](https://github.com/ji233-Sun/ai-switch/releases/latest):

| Platform       | File                              |
| -------------- | --------------------------------- |
| macOS (Apple Silicon) | `ai-switch_x.x.x_aarch64.dmg` |
| macOS (Intel)  | `ai-switch_x.x.x_x64.dmg`       |
| Windows        | `ai-switch_x.x.x_x64-setup.exe` |
| Linux          | `ai-switch_x.x.x_amd64.deb`     |

## Features

- **Multi-profile management** — Create and organize Claude Code / Codex configuration profiles
- **One-click switching** — Instantly activate a profile to apply API keys, models, and settings
- **Import existing configs** — Pull in configurations directly from Claude Code / Codex
- **Favorites** — Star frequently used profiles for quick access
- **Codex direct-connect** — Native OpenAI direct-connect mode support
- **Cross-platform** — Windows, macOS, Linux

## Development

### Prerequisites

- [Node.js](https://nodejs.org/) >= 18
- [pnpm](https://pnpm.io/) >= 8
- [Rust](https://www.rust-lang.org/tools/install) (stable)
- Platform-specific Tauri dependencies — see [Tauri v2 prerequisites](https://v2.tauri.app/start/prerequisites/)

### Quick Start

```bash
pnpm install
pnpm tauri dev
```

### Build

```bash
pnpm tauri build
```

## Tech Stack

| Layer    | Technology                   |
| -------- | ---------------------------- |
| Frontend | React 18 + TypeScript + Vite |
| Backend  | Rust + Tauri 2               |
| Package  | pnpm                         |

## Release

Push a version tag to trigger CI builds and auto-publish to Homebrew:

```bash
git tag v0.1.0
git push origin v0.1.0
```

GitHub Actions builds all platform artifacts, creates a release, and updates the [Homebrew tap](https://github.com/ji233-Sun/homebrew-tap) automatically.

## License

[MIT](./LICENSE)
