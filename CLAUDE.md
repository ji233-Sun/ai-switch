# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ai-switch is a Tauri 2 desktop application with a React + TypeScript frontend and a Rust backend. It uses pnpm for JS dependency management and Cargo for Rust dependencies. Currently at scaffolding stage (generated from the official Tauri + React + TS template).

## Architecture

Two-layer architecture connected via Tauri's IPC bridge:

- **Frontend (`src/`)**: React 18 + TypeScript, bundled by Vite. Entry point is `src/main.tsx` -> `src/App.tsx`. Calls Rust backend via `invoke()` from `@tauri-apps/api/core`.
- **Backend (`src-tauri/`)**: Rust application using Tauri 2. `src-tauri/src/main.rs` launches the app; `src-tauri/src/lib.rs` defines the Tauri builder and command handlers. Commands are registered with `tauri::generate_handler![]` and exposed to the frontend via `#[tauri::command]`.
- **IPC pattern**: Frontend calls `invoke("command_name", { args })` which maps to a Rust function annotated with `#[tauri::command]`. Add new commands in `src-tauri/src/lib.rs` and register them in the `invoke_handler`.
- **Capabilities** (`src-tauri/capabilities/default.json`): Controls what permissions the main window has. Currently grants `core:default` and `opener:default`.

## Commands

### Development

```bash
# Install JS dependencies
pnpm install

# Run the Tauri desktop app in dev mode (starts both Vite dev server and Rust backend)
pnpm tauri dev

# Run only the Vite frontend dev server (no Tauri shell, accessible at http://localhost:1420)
pnpm dev
```

### Build

```bash
# Build the full desktop application (runs tsc + vite build, then compiles Rust)
pnpm tauri build

# Build only the frontend
pnpm build
```

### Rust-specific

```bash
# Check Rust code (from src-tauri/)
cd src-tauri && cargo check

# Run Rust tests (from src-tauri/)
cd src-tauri && cargo test

# Run clippy linter (from src-tauri/)
cd src-tauri && cargo clippy
```

### TypeScript-specific

```bash
# Type-check frontend code
npx tsc --noEmit
```

## Key Configuration

- **Vite**: `vite.config.ts` -- dev server fixed on port 1420; ignores `src-tauri/` for file watching
- **Tauri**: `src-tauri/tauri.conf.json` -- app identifier is `com.ai-switch.app`, window defaults to 800x600
- **TypeScript**: `tsconfig.json` -- strict mode enabled, targets ES2020, uses `react-jsx` transform
- **Rust**: `src-tauri/Cargo.toml` -- lib crate named `ai_switch_lib`, depends on `tauri`, `serde`, `serde_json`
