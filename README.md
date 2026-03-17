# FIAS | Remove Background

<img src="logo.svg" width="80" height="80" align="right" />

A free, open-source Figma plugin that removes image backgrounds instantly — no API key, no server, no cost. Everything runs directly in your browser using WebAssembly.

![Free](https://img.shields.io/badge/Free-100%25-1bc47d?style=flat-square) ![Open Source](https://img.shields.io/badge/Open%20Source-GitHub-181717?style=flat-square&logo=github)

---

## Features

- **One click** — select an image layer, click Remove Background
- **Batch processing** — select multiple images and process them all at once
- **Two quality modes** — Quality (medium model) or Fast (small model)
- **Non-destructive** — original fills are hidden, not deleted. You can restore them anytime
- **100% free** — no API key, no subscription, no backend
- **Runs in-browser** — uses [@imgly/background-removal](https://github.com/imgly/background-removal-js) via WebAssembly

---

## How It Works

1. Select one or more image layers in Figma
2. Open the plugin and click **Remove Background**
3. The plugin reads the image bytes and sends them to the UI
4. The UI runs the AI model (via WASM) entirely in your browser
5. The result is added as a new fill on the same layer — original fills are hidden

---

## Installation

### From Figma Community
*(Coming soon)*

### Local Development

1. Clone this repo:
   ```bash
   git clone https://github.com/fiasuz/plugin-remove-bg.git
   cd plugin-remove-bg
   ```

2. Open Figma → Plugins → Development → **Import plugin from manifest**

3. Select `manifest.json` from this folder

4. The plugin is ready — no build step required

---

## Files

| File | Description |
|------|-------------|
| `manifest.json` | Plugin metadata and entry points |
| `code.js` | Figma sandbox code — reads/writes nodes |
| `ui.html` | Plugin UI — runs AI model in the browser |

---

## Tech Stack

- **[@imgly/background-removal](https://github.com/imgly/background-removal-js)** — AI background removal via WASM
- **Figma Plugin API** — reads image fills, creates new image hashes
- **Plain JavaScript** — no build step, no bundler, no TypeScript

---

## License

MIT — free to use, modify, and distribute.

---

Built by [FIAS](https://github.com/fiasuz)
