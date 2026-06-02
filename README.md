# Safe Net AI MVP

Safe Net AI MVP is a Chrome extension prototype that scans webpage text and hides content detected as toxic. It uses `@huggingface/transformers` with the `Xenova/toxic-bert` model for local inference.

## Setup

Install dependencies:

```sh
npm install
```

Build the extension files:

```sh
npm run build
```

## Load In Chrome

1. Open `chrome://extensions`.
2. Enable **Developer mode**.
3. Click **Load unpacked**.
4. Select this project folder.

After changing source files, run `npm run build`, reload the extension in `chrome://extensions`, and refresh the webpage you are testing.

## Project Files

- `manifest.json` configures the Chrome extension.
- `content.js` scans webpage text and replaces toxic content.
- `background.js` forwards messages between the content script and offscreen page.
- `offscreen.js` loads the toxicity model and runs classification.
- `vite.config.mjs` builds the extension bundles.

## Notes

The extension runs on all sites using `<all_urls>`. The first classification may take a while because the model needs to download and initialize.
