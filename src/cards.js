// ---------------------------------------------------------------------------
// Cards
// ---------------------------------------------------------------------------
import { ICONS } from "./core.js";
import { DPAD, F, INTEGRATIONS, OFF_STATES, REPEATABLE, REPEAT_DELAY_MS, REPEAT_EVERY_MS, SWIPE_PX, logoOf } from "./integrations.js";
import { BANNER_STYLE, available, esc, firstEntity, isNight, keySpec, morph, progress, resolve, sceneDevice, sceneSvg, serviceCall, stateKey, supports, svgIcon, t, textWidth } from "./helpers.js";
import { BASE_STYLE, FULL_STYLE, MINI_STYLE, sameDeps, watchOutside } from "./styles.js";

export let rcUid = 0;

export class RemoteCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._html = "";
    this._uid = ++rcUid;
    const root = this.shadowRoot;
    root.addEventListener("click", (ev) => this._onClick(ev));
    root.addEventListener("pointerdown", (ev) => this._onDown(ev));
    root.addEventListener("pointermove", (ev) => this._onMove(ev));
    root.addEventListener("contextmenu", (ev) => {
      if (ev.composedPath().some((n) => n.dataset?.key)) ev.preventDefault();
    });
    root.addEventListener("keydown", (ev) => {
      if (ev.key === "Escape" && this._popup) {
        ev.stopPropagation();
        return this._setPopup(null);
      }
      if ((ev.key !== "Enter" && ev.key !== " ") || ev.target?.getAttribute?.("role") !== "button") return;
      ev.preventDefault();
      ev.target.click();
    });
    this._onUp = (ev) => this._release(ev?.type === "pointercancel");
  }

  static getConfigElement() {
    return document.createElement("remote-card-editor");
  }

  static getStubConfig(hass) {
    const id = firstEntity(hass);
    return id ? { entity: id } : {};
  }

  getCardSize() {
    return 9;
  }

  getGridOptions() {
    return { columns: 12, min_columns: 6, rows: "auto" };
  }

  set hass(hass) {
    this._hass = hass;
    const deps = this._deps();
    if (deps && sameDeps(this._lastDeps, deps)) return;
    this._lastDeps = deps;
    this._update();
  }

  get hass() {
    return this._hass;
  }

  // What a render reads from hass: the registries, the language, day or night and the states of the remote and the player.
  _deps() {
    const h = this._hass;
    if (!h || !this._config) return null;
    const r = resolve(h, this._config);
    return [h.entities, h.devices, h.language, h.locale, h.themes?.darkMode, h.states[r.remote], h.states[r.mp]];
  }

  connectedCallback() {
    this._outside ??= watchOutside(this, () => this._outsideClick());
    this._outside.on();
    if (this._hass && this._config) this._update();
    // A new width (or the web font loaded): the status pill is fitted again, in the next frame.
    if (typeof ResizeObserver === "function") {
      this._resize ??= new ResizeObserver((entries) => {
        const w = Math.round(entries.at(-1).contentRect.width);
        if (w === this._fitWidth) return;
        this._fitWidth = w;
        cancelAnimationFrame(this._fitFrame);
        this._fitFrame = requestAnimationFrame(() => this._fitPill());
      });
      this._resize.observe(this);
    }
    document.fonts?.ready?.then(() => this._fitPill());
  }

  disconnectedCallback() {
    this._outside?.off();
    this._resize?.disconnect();
    this._fitWidth = null;
    // A key still held is let go without sending anything.
    this._release(true);
    // Left (another view, a conditional card hidden): the popup closes, sending nothing.
    this._popup = null;
  }

  _outsideClick() {
    if (!this._popup) return;
    this._popup = null;
    this._update();
  }

  setConfig(config) {
    if (!config || typeof config !== "object") throw new Error("Invalid configuration");
    if (config.apps !== undefined && !Array.isArray(config.apps)) throw new Error("apps must be a list");
    if (config.commands !== undefined && (typeof config.commands !== "object" || Array.isArray(config.commands) || config.commands === null)) {
      throw new Error("commands must be a map of keys to commands");
    }
    this._config = { ...config };
    this._lastDeps = null;
    this._html = "";
    this._update();
  }

  _t(key, vars) {
    return t(this._hass, this._config, key, vars);
  }

  // The card is not rewritten while a key is held: the element under the finger stays the one pressed (and keeps its
  // pressed look); the update waiting is drawn at the release.
  _update() {
    if (!this._hass || !this._config) return;
    if (this._press) {
      this._dirty = true;
      return;
    }
    this._dirty = false;
    const html = this._render();
    if (html === this._html) return;
    this._html = html;
    morph(this.shadowRoot, html);
    this._fitPill();
  }

  // The status pill stays right after the title only while the whole title and the pill's whole label fit on that
  // row; otherwise it takes a line of its own under the subtitle (.below), and when even then the title, the subtitle
  // and the pill would not fit above the banner's ground strip, it keeps its dot alone (.pill-dot). Measured in the
  // real fonts, so that every language and title length gets its own answer.
  _fitPill() {
    for (const t of this.shadowRoot?.querySelectorAll?.(".titles") || []) {
      const row = t.querySelector(":scope > .trow");
      const chip = row?.querySelector(":scope > .pill");
      if (!chip?.getBoundingClientRect) continue;
      t.classList.remove("below", "pill-dot");
      const name = row.querySelector(":scope > .name");
      const gap = parseFloat(getComputedStyle(row).columnGap) || 0;
      const title = name ? textWidth(name) + gap : 0;
      const pill = chip.getBoundingClientRect().width;
      if (title + pill <= row.getBoundingClientRect().width) continue;
      t.classList.add("below");
      const r = t.getBoundingClientRect();
      const banner = t.closest(".banner");
      const box = banner?.getBoundingClientRect();
      const floor = banner?.querySelector(".rc-strip")?.getBoundingClientRect().top ?? box?.bottom;
      const tall = box && (r.bottom > floor + 0.5 || r.top < box.top - 0.5);
      if (tall || pill > r.width + 0.5) t.classList.add("pill-dot");
    }
  }

  _show(name) {
    return this._config[name] !== false;
  }

  // ---- Sending -----------------------------------------------------------

  _ctx() {
    return resolve(this._hass, this._config);
  }

  _spec(key, ctx = this._ctx()) {
    const spec = keySpec(this._config, ctx.integration, key);
    return available(spec, ctx.remote, this._hass.states[ctx.mp]) ? spec : null;
  }

  _send(key) {
    const ctx = this._ctx();
    const spec = this._spec(key, ctx);
    if (!spec) return false;
    return this._call(serviceCall(spec, ctx.remote, ctx.mp, this._hass.states));
  }

  _call(c) {
    if (!c) return false;
    if (this._config.haptic !== false) this.dispatchEvent(new CustomEvent("haptic", { detail: "light", bubbles: true, composed: true }));
    this._hass.callService(c[0], c[1], c[2]);
    return true;
  }

  // Press on a key: sent at once (and again while held, for the repeatable keys). With swipe gestures, a press on
  // the D-pad waits: a swipe sends its direction, a tap the key under the finger, a hold repeats it.
  _onDown(ev) {
    if (ev.button > 0) return;
    const el = ev.composedPath().find((n) => n.dataset?.key);
    if (!el) return;
    this._release();
    const key = el.dataset.key;
    const swipe = this._config.swipe === true && DPAD.has(key);
    const p = { key, el, x: ev.clientX, y: ev.clientY, swipe, sent: false };
    this._press = p;
    this._fromPointer = true;
    el.classList?.add("pressed");
    window.addEventListener?.("pointerup", this._onUp, true);
    window.addEventListener?.("pointercancel", this._onUp, true);
    const hold = () => {
      p.sent = this._send(key) || p.sent;
      if (this._config.repeat !== false && REPEATABLE.has(key)) {
        p.timer = setTimeout(() => {
          p.timer = setInterval(() => this._send(key), REPEAT_EVERY_MS);
        }, REPEAT_DELAY_MS);
      }
    };
    if (!swipe) return hold();
    p.timer = setTimeout(() => {
      p.timer = null;
      if (REPEATABLE.has(key) || key === "ok") hold();
    }, REPEAT_DELAY_MS);
  }

  _onMove(ev) {
    const p = this._press;
    if (!p?.swipe) return;
    const dx = ev.clientX - p.x;
    const dy = ev.clientY - p.y;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < SWIPE_PX) return;
    clearTimeout(p.timer);
    clearInterval(p.timer);
    p.timer = null;
    const dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : dy > 0 ? "down" : "up";
    p.sent = this._send(dir) || p.sent;
    p.swiped = true;
    p.x = ev.clientX;
    p.y = ev.clientY;
  }

  // End of a press: the repeat stops; a tap on the D-pad with swipe gestures sends its key now, unless the press was
  // cancelled (pointercancel, or the card left the page).
  _release(cancel = false) {
    const p = this._press;
    window.removeEventListener?.("pointerup", this._onUp, true);
    window.removeEventListener?.("pointercancel", this._onUp, true);
    if (!p) return;
    this._press = null;
    clearTimeout(p.timer);
    clearInterval(p.timer);
    p.el.classList?.remove("pressed");
    if (p.swipe && !p.sent && !p.swiped && !cancel) this._send(p.key);
    if (this._dirty) this._update();
  }

  _onClick(ev) {
    const path = ev.composedPath();
    const el = path.find((n) => n.dataset && (n.dataset.key || n.dataset.action));
    if (!el) return;
    ev.stopPropagation();
    const { key, action } = el.dataset;
    if (key) {
      // Sent at the press already; a keyboard click (Enter, Space) or one that came with no press sends it here.
      if (!this._fromPointer || ev.detail === 0) this._send(key);
      this._fromPointer = false;
      return;
    }
    if (action === "zoom") return this._toggleZoom(ev);
    if (action === "popup") return this._setPopup(this._popup ? null : "popup", ev);
    if (action === "close") return this._setPopup(null);
    if (action === "source") return this._selectSource(el.dataset.source);
    if (action === "app") return this._launch(Number(el.dataset.index));
    if (action === "more_info") return this.dispatchEvent(new CustomEvent("hass-more-info", { detail: { entityId: el.dataset.entity }, bubbles: true, composed: true }));
  }

  _toggleZoom() {}

  // The focus moves into the popup only for the keyboard (a mouse or a finger would draw its ring).
  _setPopup(name, ev) {
    this._popup = name;
    this._update();
    if (name && ev?.detail === 0) this.shadowRoot.querySelector?.(".popup .source.on, .popup .app.on, .popup .close")?.focus?.({ preventScroll: true });
  }

  _selectSource(source) {
    const { mp } = this._ctx();
    this._popup = null;
    if (mp && source !== undefined) this._call(["media_player", "select_source", { entity_id: mp, source }]);
    this._update();
  }

  // An app shortcut: a source of the player, an activity of the remote (an app link or package on Android TV), a
  // remote command, or any Home Assistant action. The popup closes.
  _launch(index) {
    const app = (this._config.apps || [])[index];
    this._popup = null;
    this._update();
    if (!app || typeof app !== "object") return;
    const { remote, mp } = this._ctx();
    if (app.source !== undefined && mp) return this._call(["media_player", "select_source", { entity_id: mp, source: app.source }]);
    if (app.activity !== undefined && remote) return this._call(["remote", "turn_on", { entity_id: remote, activity: app.activity }]);
    if (app.command !== undefined && remote) return this._call(["remote", "send_command", { entity_id: remote, command: app.command }]);
    if (app.action || app.service) return this._call(serviceCall(app, remote, mp, this._hass.states));
  }

  // ---- Parts -------------------------------------------------------------

  _name(ctx) {
    const d = ctx.device;
    const s = this._hass.states[ctx.mp] || this._hass.states[ctx.remote];
    return this._config.title || d?.name_by_user || d?.name || s?.attributes?.friendly_name || ctx.mp || ctx.remote || INTEGRATIONS[ctx.integration].name;
  }

  // State of the TV or box, and what it plays: { on, state (text), app, title, artist, playing, pic, progress }.
  _media(ctx) {
    const mpState = this._hass.states[ctx.mp];
    const s = mpState || this._hass.states[ctx.remote];
    const k = stateKey(s);
    const on = !!s && !OFF_STATES.has(s.state);
    const a = (on && mpState?.attributes) || {};
    const episode = a.media_season && a.media_episode ? `S${a.media_season} · E${a.media_episode}` : "";
    const st = mpState?.state;
    return {
      known: !!s,
      on,
      paused: on && st === "paused",
      buffering: on && st === "buffering",
      // The icon's colour: blue on, grey off, amber buffering, red unavailable.
      status: s?.state === "unavailable" ? "alert" : on && st === "buffering" ? "warn" : on ? "" : "off",
      // The picture's state: playing (the screen pans, the TV's light breathes), paused, on, off, unavailable.
      scene: s?.state === "unavailable" ? "alert" : !on ? "off" : st === "playing" ? "play" : st === "paused" ? "pause" : st === "buffering" ? "buffer" : "on",
      state: this._t(`state_${k}`),
      app: a.app_name || a.source || "",
      title: a.media_title || a.media_channel || "",
      artist: [a.media_artist || a.media_series_title || a.media_album_name, episode].filter(Boolean).join(" · "),
      playing: on && mpState?.state === "playing",
      pic: on ? a.entity_picture_local || a.entity_picture : "",
      progress: on ? progress(mpState) : null,
    };
  }

  _eq(m) {
    return m.playing && m.title ? `<span class="eq${m.playing ? " run" : ""}" aria-hidden="true"><i></i><i></i><i></i></span>` : "";
  }

  _track(p) {
    if (!p) return "";
    return `<div class="track" data-k="track"><div class="${p.playing ? "run" : ""}" style="--from:${p.pct.toFixed(2)}%;--left:${Math.max(0, Math.round(p.left))}s"></div></div>`;
  }

  // The full card's subtitle: what is playing (app · title), else the state.
  _subtitle(m, ctx) {
    if (!m.known) return INTEGRATIONS[ctx.integration].name;
    // The state is in the pill: not repeated here.
    if (!m.on) return "";
    const app = m.title && m.app === m.title ? "" : m.app;
    return [app, m.title].filter(Boolean).join(" · ");
  }

  // The header: the illustration (the title and the subtitle on its wall, power and the detail button at its top
  // right), or the classic header with `illustration: false`.
  _header(ctx, m, sub) {
    const entity = ctx.mp || ctx.remote;
    const more = entity ? ` role="button" tabindex="0" data-action="more_info" data-entity="${esc(entity)}"` : "";
    const power = this._show("show_power") ? this._key(ctx, "power", { cls: "key power", on: m.on, title: m.known ? `${this._t("k_power")} · ${m.state}` : "" }) : "";
    // The brand logo of the integration as a white badge at the bottom right of the pastille.
    const logo = logoOf(ctx.integration);
    const badge = logo ? `<span class="brand-badge" title="${esc(INTEGRATIONS[ctx.integration].name)}"><img src="${logo}" alt=""></span>` : "";
    const icon = `<span class="type-icon${m.status ? ` ${m.status}` : ""}">${svgIcon(ICONS.tv)}${badge}</span>`;
    // The status pill right after the title, in the icon's colour.
    const pill = m.known ? `<span class="pill ${m.status || "on"}" title="${esc(m.state)}"><span class="dot"></span><span class="t">${esc(m.state)}</span></span>` : "";
    const titles = `<div class="titles"${more}>
          <div class="trow">${this._show("show_title") ? `<div class="name">${esc(this._name(ctx))}</div>` : ""}${pill}</div>
          ${sub && this._show("show_subtitle") ? `<div class="sub" title="${sub.replace(/<[^>]*>/g, "").trim()}">${sub}</div>` : ""}
        </div>`;
    const zoom = this._zoomButton();
    // Power and the detail button: one line of small rounds in the top right corner, the detail button last.
    const btns = power || zoom ? `<div class="hbtns">${power}${zoom}</div>` : "";
    if (this._config.illustration === false) return `<div class="header${power && zoom ? " two" : power || zoom ? " one" : ""}">${icon}${titles}${btns}</div>`;
    const cls = `banner s-${m.scene}${isNight(this._hass, this._config) ? " night" : ""}${power && zoom ? " two" : ""}`;
    return `<div class="${cls}" data-k="banner"><div class="rc-strip"></div>${this._scene(ctx, m)}<div class="htext">${icon}${titles}</div>${btns}</div>`;
  }

  // The picture of the banner: what the TV's screen shows, the box and the remote of the integration.
  _scene(ctx, m) {
    const [box, remote] = sceneDevice(ctx);
    const mode = !m.on ? "off" : m.playing || m.paused || m.buffering || m.title ? "show" : "home";
    return sceneSvg(this._uid, { mode, paused: m.paused, pic: m.pic, pct: m.progress?.pct, ambilight: ctx.integration === "philips_js", box, remote });
  }

  // The banner's styles, only when it is shown.
  _bannerStyle() {
    return this._config.illustration === false ? "" : BANNER_STYLE;
  }

  _zoomButton() {
    return "";
  }

  // A key: its icon (or text), its label, the accent when active. Hidden when the integration has no such key.
  _key(ctx, key, { cls = "key", icon = ICONS[key], text, on = false, extra = "", title = "" } = {}) {
    if (!this._spec(key, ctx)) return "";
    const label = esc(this._t(`k_${key}`));
    const pressed = key === "mute" || key === "power" ? ` aria-pressed="${on}"` : "";
    return `<button class="${cls}${on ? " on" : ""}${extra}" data-key="${key}" data-k="${key}" title="${title ? esc(title) : label}" aria-label="${label}"${pressed}>${text ? esc(text) : svgIcon(icon)}</button>`;
  }

  _playPause(ctx, m, cls = "key") {
    const s = this._hass.states[ctx.mp];
    return this._key(ctx, "play_pause", { cls, icon: s ? (m.playing ? ICONS.pause : ICONS.play) : ICONS.play_pause, on: m.playing });
  }

  _volume(ctx, cls = "key", extra = "") {
    const muted = !!this._hass.states[ctx.mp]?.attributes?.is_volume_muted;
    return [
      this._key(ctx, "volume_down", { cls, icon: ICONS.minus }),
      this._key(ctx, "mute", { cls, icon: ICONS.mute, on: muted, extra }),
      this._key(ctx, "volume_up", { cls, icon: ICONS.plus }),
    ].join("");
  }

  // What the popup holds: the app shortcuts of the card and the sources of the player.
  _choices(ctx) {
    const s = this._hass.states[ctx.mp];
    const apps = this._show("show_apps") ? (this._config.apps || []).map((a, i) => [a, i]).filter(([a]) => a && typeof a === "object") : [];
    const sources = this._show("show_sources") && s && supports(s, F.SELECT_SOURCE) ? s.attributes?.source_list || [] : [];
    const label = this._t(apps.length && sources.length ? "sources_apps" : apps.length ? "apps" : "sources");
    return { apps, sources, label, cur: s?.attributes };
  }

  _popupButton(ctx) {
    const { apps, sources, label } = this._choices(ctx);
    if (!apps.length && !sources.length) return "";
    const l = esc(label);
    return `<button class="key small${this._popup ? " on" : ""}" data-action="popup" data-k="popup-button" title="${l}" aria-label="${l}" aria-haspopup="dialog" aria-expanded="${!!this._popup}">${svgIcon(apps.length ? ICONS.apps : ICONS.sources)}</button>`;
  }

  _popupHtml(ctx) {
    if (!this._popup) return "";
    const { apps, sources, label, cur } = this._choices(ctx);
    const close = esc(this._t("close"));
    const appItems = apps
      .map(([a, i]) => {
        const name = String(a.name ?? a.source ?? a.activity ?? "");
        const on = a.source !== undefined && cur && (cur.source === a.source || cur.app_name === a.source);
        const icon = a.icon ? `<ha-icon icon="${esc(a.icon)}"></ha-icon>` : `<span class="initial">${esc(name.slice(0, 1).toUpperCase())}</span>`;
        return `<button class="app${on ? " on" : ""}" data-action="app" data-index="${i}" title="${esc(name)}">${icon}<span>${esc(name)}</span></button>`;
      })
      .join("");
    const sourceItems = sources
      .map((src) => {
        const on = src === (cur?.source ?? cur?.app_name);
        return `<button class="source${on ? " on" : ""}" data-action="source" data-source="${esc(src)}" aria-pressed="${on}"><span>${esc(src)}</span>${on ? svgIcon(ICONS.check) : ""}</button>`;
      })
      .join("");
    const both = apps.length && sources.length;
    return `<div class="scrim" data-action="close" data-k="scrim"></div>
      <div class="popup" role="dialog" aria-label="${esc(label)}" data-k="popup">
        <div class="popup-head">${svgIcon(apps.length ? ICONS.apps : ICONS.sources)}<span>${esc(label)}</span>
          <button class="key small close" data-action="close" title="${close}" aria-label="${close}">${svgIcon(ICONS.close)}</button></div>
        <div class="popup-body">
          ${apps.length ? `${both ? `<div class="group-title">${esc(this._t("apps"))}</div>` : ""}<div class="apps">${appItems}</div>` : ""}
          ${sources.length ? `${both ? `<div class="group-title">${esc(this._t("sources"))}</div>` : ""}<div class="sources">${sourceItems}</div>` : ""}
        </div>
      </div>`;
  }

  _rockers(ctx) {
    const parts = [];
    if (this._show("show_volume")) {
      const vol = this._volume(ctx);
      if (vol) parts.push(`<div class="rocker" role="group" aria-label="${esc(this._t("volume"))}" data-k="vol">${vol}</div>`);
    }
    if (this._show("show_channels")) {
      const down = this._key(ctx, "channel_down", { icon: ICONS.down });
      const up = this._key(ctx, "channel_up", { icon: ICONS.up });
      if (down || up) parts.push(`<div class="rocker" role="group" aria-label="${esc(this._t("channel"))}" data-k="ch">${down}<span class="label" aria-hidden="true">CH</span>${up}</div>`);
    }
    return parts.join("");
  }

  _dpad(ctx) {
    const arrows = ["up", "left", "right", "down"].map((k) => this._key(ctx, k, { cls: `arrow ${k}` })).join("");
    const ok = this._key(ctx, "ok", { cls: "ok", text: this._t("k_ok") });
    if (!arrows && !ok) return "";
    return `<div class="dpad${this._config.swipe === true ? " swipe" : ""}" data-k="dpad">${arrows}${ok}</div>`;
  }

  _transport(ctx, m) {
    const keys = this._show("show_transport") ? [this._key(ctx, "previous"), this._playPause(ctx, m), this._key(ctx, "next")].join("") : "";
    const popup = this._popupButton(ctx);
    if (!keys && !popup) return "";
    return `<div class="transport" data-k="transport">${keys}${keys && popup ? `<span class="sep" aria-hidden="true"></span>` : ""}${popup}</div>`;
  }

  _errorCard(key) {
    return `<style>${BASE_STYLE}</style><ha-card${this._hass.themes?.darkMode ? ' class="dark"' : ""}><div class="warning">${esc(this._t(key))}</div></ha-card>`;
  }

  // null, or the error to show.
  _check(ctx) {
    if (ctx.standalone) return null;
    if (!ctx.remote && !ctx.mp) return this._config.entity || this._config.media_player ? "unknown_entity" : "no_entity";
    if (!this._hass.states[ctx.remote] && !this._hass.states[ctx.mp]) return "unknown_entity";
    return null;
  }

  _render() {
    const ctx = this._ctx();
    const error = this._check(ctx);
    if (error) return this._errorCard(error);
    const m = this._media(ctx);
    const nav = ["back", "home", "menu"].map((k) => this._key(ctx, k)).join("");
    const sub = this._subtitle(m, ctx);
    return `<style>${BASE_STYLE}${FULL_STYLE}${this._bannerStyle()}</style>
      <ha-card${this._hass.themes?.darkMode ? ' class="dark"' : ""}>
        ${this._header(ctx, m, sub ? `${m.on ? this._eq(m) : ""}<span>${esc(sub)}</span>` : "")}
        ${m.progress && this._show("show_subtitle") ? `<div class="progress" data-k="progress">${this._track(m.progress)}</div>` : ""}
        <div class="content">
          ${this._dpad(ctx)}
          <div class="controls" data-k="controls">${nav ? `<div class="keys" data-k="nav">${nav}</div>` : ""}${this._rockers(ctx)}</div>
          ${this._transport(ctx, m)}
        </div>
        ${this._popupHtml(ctx)}
      </ha-card>`;
  }
}

// The mini card: power, what is playing, play / pause and volume; its detail button (top right, `zoom: false` removes
// it) unfolds it into the full remote, and a click anywhere else on the page brings the compact view back.
export class RemoteMiniCard extends RemoteCard {
  constructor() {
    super();
    this._unzoom = watchOutside(this, () => {
      if (this._zoomed) this._setZoom(false);
    });
  }

  static getConfigElement() {
    return document.createElement("remote-mini-card-editor");
  }

  connectedCallback() {
    super.connectedCallback();
    this._unzoom.on();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._unzoom.off();
    this._zoomed = false;
  }

  getCardSize() {
    return this._zoomed ? super.getCardSize() : 2;
  }

  getGridOptions() {
    return this._zoomed ? super.getGridOptions() : { columns: 6, min_columns: 6, rows: "auto" };
  }

  _zoomButton() {
    if (this._config.zoom === false) return "";
    const z = this._zoomed;
    const label = esc(this._t(z ? "zoom_out" : "zoom_in"));
    return `<button class="zoom" data-action="zoom" title="${label}" aria-label="${label}" aria-pressed="${!!z}">${svgIcon(z ? ICONS.collapse : ICONS.expand)}</button>`;
  }

  _setZoom(on) {
    this._zoomed = on;
    if (!on) this._popup = null;
    this._update();
    this.dispatchEvent(new CustomEvent("iron-resize", { bubbles: true, composed: true }));
  }

  _toggleZoom(ev) {
    this._setZoom(!this._zoomed);
    if (ev?.detail === 0) this.shadowRoot.querySelector?.(".zoom")?.focus({ preventScroll: true });
  }

  _nowPlaying(ctx, m) {
    if (!this._hass.states[ctx.mp]) return `<div class="now" data-k="now"></div>`;
    const title = m.on ? m.title || m.app || m.state : m.state;
    const sub = m.on && m.title ? m.artist : "";
    return `<div class="now" role="button" tabindex="0" data-action="more_info" data-entity="${esc(ctx.mp)}" data-k="now">
        <div class="art">${m.pic ? `<img src="${esc(m.pic)}" alt="">` : svgIcon(ICONS.tv_play)}</div>
        <div class="now-text">
          <div class="now-title">${m.on ? this._eq(m) : ""}<span>${esc(title)}</span></div>
          ${sub ? `<div class="now-sub">${esc(sub)}</div>` : ""}
          ${this._track(m.progress)}
        </div>
      </div>`;
  }

  _render() {
    if (this._zoomed) return super._render();
    const ctx = this._ctx();
    const error = this._check(ctx);
    if (error) return this._errorCard(error);
    const m = this._media(ctx);
    // On a narrow card, the power key leaves the header for the keys, leaving the name its room.
    const keys = [
      this._show("show_power") ? this._key(ctx, "power", { cls: "key small narrow-only", on: m.on }) : "",
      this._show("show_transport") ? this._playPause(ctx, m, "key small") : "",
      this._show("show_volume") ? this._volume(ctx, "key small wide-only") : "",
    ].join("");
    // The state is in the pill: the subtitle tells the app only.
    const sub = !m.known ? INTEGRATIONS[ctx.integration].name : m.on ? m.app : "";
    return `<style>${BASE_STYLE}${MINI_STYLE}${this._bannerStyle()}</style>
      <ha-card${this._hass.themes?.darkMode ? ' class="dark"' : ""}>
        ${this._header(ctx, m, sub ? `<span>${esc(sub)}</span>` : "")}
        <div class="content">
          ${this._nowPlaying(ctx, m)}
          <div class="mini-keys" data-k="mini-keys">${keys}</div>
        </div>
      </ha-card>`;
  }
}
