// Bundles the ES modules of src/ (entry src/index.js, assembled by scripts/bundle.mjs) into the single file dist/remote-card.js, inlining the brand logos of the header badge
// ("__IMG_FILE:<file>__") from images/badges/<file> (36 px PNGs, left out when the file is not there).
// Usage: node scripts/build.mjs  (dist/ is not committed: CI and the release workflow build it)
import { existsSync, mkdirSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { splitDist } from "./i18n-split.mjs";
import { bundle } from "./bundle.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
const pkg = JSON.parse(readFileSync(`${root}package.json`, "utf8"));

const badge = (file) => `${root}images/badges/${file}`;
const out = bundle("src/index.js")
  .replace("__VERSION__", pkg.version)
  .replace(/__IMG_FILE:([\w.-]+\.png)__/g, (_, file) => (existsSync(badge(file)) ? `data:image/png;base64,${readFileSync(badge(file)).toString("base64")}` : ""));

mkdirSync(`${root}dist`, { recursive: true });
writeFileSync(`${root}dist/remote-card.js`, out);
console.log(`Built dist/remote-card.js (${(out.length / 1024).toFixed(1)} KB)`);

// Translations: English stays in the bundle, each other language goes to dist/remote-card.i18n.<lang>.js,
// fetched when a card needs it (scripts/i18n-split.mjs).
if (process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))) splitDist(`${root}dist`, "remote-card.js", { version: pkg.version });
