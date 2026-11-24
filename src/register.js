// ---------------------------------------------------------------------------
// Registration
// ---------------------------------------------------------------------------
import { pickerDefine } from "./card-picker.js";
import { VERSION } from "./core.js";
import { RemoteCard, RemoteMiniCard } from "./cards.js";
import { RemoteCardEditor, RemoteMiniCardEditor } from "./visual-editors.js";

export const define = (name, cls) => {
  if (!customElements.get(name)) pickerDefine(name, cls);
};
define("remote-card", RemoteCard);
define("remote-mini-card", RemoteMiniCard);
define("remote-card-editor", RemoteCardEditor);
define("remote-mini-card-editor", RemoteMiniCardEditor);

window.customCards = window.customCards || [];
for (const card of [
  {
    type: "remote-card",
    name: "Remote Card",
    description: "Remote control for TVs and streaming boxes: D-pad, back, home, menu, volume, channels, transport, sources and apps (Apple TV, Android TV, Philips, Samsung, LG, Roku, Fire TV, Freebox, Kodi).",
  },
  { type: "remote-mini-card", name: "Remote Mini Card", description: "Compact remote: power, now playing, play / pause and volume, unfolding into the full remote." },
]) {
  if (!window.customCards.some((c) => c.type === card.type)) window.customCards.push({ ...card, preview: true, documentationURL: "https://github.com/juju35/ha-remote-card" });
}

console.info(`%c REMOTE-CARD %c v${VERSION} `, "color: white; background: #546e7a; font-weight: 700;", "color: #546e7a; background: white; font-weight: 700;");
