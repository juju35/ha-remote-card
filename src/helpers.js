// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
import { F, INTEGRATIONS, MP_FEATURE, OFF_STATES } from "./integrations.js";
import { STRINGS } from "./i18n/strings.js";

export const esc = (v) =>
  String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

export const lang = (hass, config) => {
  const l = config?.language || (hass && (hass.locale?.language || hass.language)) || "en";
  return STRINGS[l] ? l : STRINGS[l.split("-")[0]] ? l.split("-")[0] : "en";
};

export const t = (hass, config, key, vars = {}) =>
  String(STRINGS[lang(hass, config)][key] ?? STRINGS.en[key] ?? key).replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? "");

// The whole width of an element's text in its own font, an ellipsised one included.
export const textWidth = (el) => {
  const range = document.createRange();
  range.selectNodeContents(el);
  return range.getBoundingClientRect().width;
};

export const svgIcon = (path, cls = "") => `<svg class="icon ${cls}" viewBox="0 0 24 24" aria-hidden="true"><path d="${path}"/></svg>`;

export const domainOf = (id) => String(id || "").split(".")[0];
export const supports = (s, bits) => !!s && (Number(s.attributes?.supported_features) & bits) !== 0;

// The entity ids of each device, indexed once per entity registry (Home Assistant hands a new registry object only when
// it changes): finding the sibling of an entity no longer walks the whole registry on every state change.
export const deviceIndex = new WeakMap();
export const byDevice = (ents, dev) => {
  let idx = deviceIndex.get(ents);
  if (!idx) {
    idx = new Map();
    for (const [e, entry] of Object.entries(ents)) {
      if (!entry?.device_id) continue;
      if (!idx.has(entry.device_id)) idx.set(entry.device_id, []);
      idx.get(entry.device_id).push(e);
    }
    deviceIndex.set(ents, idx);
  }
  return idx.get(dev) || [];
};

// The remote and the media player of the card: the ones configured, the other one found on the same device, the
// integration from their platform (the remote's first) unless `integration` is set.
export const resolve = (hass, config) => {
  const ents = hass?.entities || {};
  // No entity (nor a standalone integration): the first TV remote, as getStubConfig picks.
  const entity = config.entity || (config.media_player || INTEGRATIONS[config.integration]?.standalone ? undefined : defaultEntity(hass));
  let remote = entity && domainOf(entity) === "remote" ? entity : undefined;
  let mp = config.media_player || (entity && domainOf(entity) === "media_player" ? entity : undefined);
  const sibling = (id, domain) => {
    const dev = ents[id]?.device_id;
    if (!dev) return undefined;
    return byDevice(ents, dev).find((e) => domainOf(e) === domain && !ents[e].hidden && hass.states[e]);
  };
  if (remote && !mp) mp = sibling(remote, "media_player");
  if (mp && !remote) remote = sibling(mp, "remote");
  const platform = ents[remote]?.platform || ents[mp]?.platform;
  const integration = INTEGRATIONS[config.integration] ? config.integration : INTEGRATIONS[platform] ? platform : "generic";
  const device = hass?.devices?.[ents[remote]?.device_id || ents[mp]?.device_id];
  // An integration without entity (Freebox Player): the card works from `integration` alone.
  const standalone = !!INTEGRATIONS[integration].standalone && config.integration === integration;
  return { remote, mp, integration, device, standalone };
};

// The first remote of a known integration (a HomePod, which has an apple_tv remote too, left out), else the first TV
// or player: the card's default entity.
export const firstEntity = (hass) => {
  const ents = hass?.entities || {};
  const ids = Object.keys(hass?.states || {});
  const speaker = (id) => /homepod/i.test(`${hass?.devices?.[ents[id]?.device_id]?.model || ""} ${hass?.devices?.[ents[id]?.device_id]?.name || ""}`);
  return (
    ids.find((id) => domainOf(id) === "remote" && INTEGRATIONS[ents[id]?.platform] && ents[id]?.platform !== "generic" && !speaker(id)) ||
    ids.find((id) => domainOf(id) === "media_player" && hass.states[id].attributes?.device_class === "tv") ||
    ids.find((id) => domainOf(id) === "remote")
  );
};

// firstEntity, scanned again only when the entity registry changes (or the entity found is gone).
export const defaultEntities = new WeakMap();
export const defaultEntity = (hass) => {
  const reg = hass?.entities;
  if (!reg || !hass.states) return firstEntity(hass);
  let id = defaultEntities.get(reg);
  if (id === undefined || (id && !hass.states[id])) {
    id = firstEntity(hass) || null;
    defaultEntities.set(reg, id);
  }
  return id || undefined;
};

// One key, as the card sends it: the `commands` override, else the integration's. undefined: not available.
export const keySpec = (config, integration, key) => {
  const over = config.commands;
  if (over && typeof over === "object" && key in over) return over[key] === null || over[key] === false ? null : over[key];
  return INTEGRATIONS[integration]?.keys[key] ?? null;
};

// Whether a key can be sent with the entities there are (and what the media player supports).
export const available = (spec, remote, mpState) => {
  if (!spec) return false;
  if (typeof spec === "string") return !!remote;
  if (Array.isArray(spec)) return !!remote && spec.length > 0;
  if (spec.power) return !!remote || !!mpState;
  if (spec.mute) return supports(mpState, F.VOLUME_MUTE);
  if (spec.mp) return !!mpState && (!(spec.mp in MP_FEATURE) || supports(mpState, MP_FEATURE[spec.mp]));
  if (spec.call) return spec.target === false || !!mpState;
  if (spec.action || spec.service) return true;
  return false;
};

// The service call of a key: [domain, service, data], or null.
export const serviceCall = (spec, remote, mp, states) => {
  const mpState = states[mp];
  if (typeof spec === "string" || Array.isArray(spec)) return remote ? ["remote", "send_command", { entity_id: remote, command: spec }] : null;
  if (!spec || typeof spec !== "object") return null;
  if (spec.power) {
    const on = mpState ? !OFF_STATES.has(mpState.state) : states[remote]?.state === "on";
    const feature = on ? F.TURN_OFF : F.TURN_ON;
    const service = on ? "turn_off" : "turn_on";
    if (mpState && (supports(mpState, feature) || !remote)) return ["media_player", service, { entity_id: mp }];
    return remote ? ["remote", service, { entity_id: remote }] : null;
  }
  if (spec.mute) return mp ? ["media_player", "volume_mute", { entity_id: mp, is_volume_muted: !mpState?.attributes?.is_volume_muted }] : null;
  if (spec.mp) return mp ? ["media_player", spec.mp, { entity_id: mp }] : null;
  if (spec.call) {
    const [d, s] = String(spec.call).split(".");
    if (spec.target === false) return [d, s, { ...(spec.data || {}) }];
    return mp ? [d, s, { entity_id: mp, ...(spec.data || {}) }] : null;
  }
  // A Home Assistant action of the `commands` option: { action: "script.turn_on", data: {…}, target: {…} }.
  const action = spec.action || spec.service;
  if (action) {
    const [d, s] = String(action).split(".");
    if (!d || !s) return null;
    const data = { ...(spec.data || {}), ...(spec.target || {}) };
    if (!spec.target && !("entity_id" in data) && !["script", "scene", "automation", "notify"].includes(d)) {
      const id = d === "remote" ? remote : mp || remote;
      if (id) data.entity_id = id;
    }
    return [d, s, data];
  }
  return null;
};

export const stateKey = (s) => {
  if (!s) return "unknown";
  const k = String(s.state);
  return ["on", "off", "playing", "paused", "idle", "standby", "buffering", "unavailable"].includes(k) ? k : "unknown";
};

// Progress of the media playing: { pct, left (s), playing }, or null.
export const progress = (s, now = Date.now()) => {
  const a = s?.attributes || {};
  const dur = Number(a.media_duration);
  const pos = Number(a.media_position);
  if (!(dur > 0) || !Number.isFinite(pos)) return null;
  const playing = s.state === "playing";
  const since = playing && a.media_position_updated_at ? Math.max(0, (now - Date.parse(a.media_position_updated_at)) / 1000) : 0;
  const at = Math.min(dur, pos + (Number.isFinite(since) ? since : 0));
  return { pct: (at / dur) * 100, left: dur - at, playing };
};

// ---------------------------------------------------------------------------
// The illustrated header: a living-room wall at the right of a 90 px banner, the TV on its stand, the streaming box
// of the integration (Apple TV, SHIELD, Chromecast, Fire TV, Roku, Freebox Player, Kodi box…) and its remote standing
// in front, on a 10 px shelf strip that runs edge to edge. The TV's screen tells the state: dark with a red standby
// light when off, the home screen when on, the artwork (or a picture panning) while something plays, a pause sign
// when paused. The left of the banner is the bare wall: the card's text sits there.
// ---------------------------------------------------------------------------


// Night picture: forced by illustration_theme, else Home Assistant's dark mode alone (a light theme keeps the day
// picture after sunset).
export const isNight = (hass, config) => {
  if (config.illustration_theme === "night") return true;
  if (config.illustration_theme === "day") return false;
  return !!hass?.themes?.darkMode;
};

// The device drawn next to the TV, from the integration and the device's model: [box, remote].
export const sceneDevice = (ctx) => {
  const model = `${ctx.device?.manufacturer || ""} ${ctx.device?.model || ""} ${ctx.device?.name || ""}`.toLowerCase();
  switch (ctx.integration) {
    case "apple_tv":
      return ["apple_tv", "siri"];
    case "androidtv_remote":
      if (/chromecast|google tv streamer/.test(model)) return ["chromecast", "tv"];
      return [/shield|nvidia/.test(model) ? "shield" : "android_box", "tv"];
    case "androidtv":
      if (/fire|amazon|aft/.test(model)) return [/cube/.test(model) ? "fire_cube" : "fire_stick", "fire"];
      return ["android_box", "tv"];
    case "roku":
      return ["roku", "roku"];
    case "freebox_player":
      return ["freebox", "freebox"];
    case "kodi":
      return ["kodi", "tv"];
    default:
      return ["", "tv"];
  }
};

// The boxes, standing on the shelf (y 80) right of the TV, or plugged under it (sticks, Chromecast).
export const RC_BOXES = {
  apple_tv: `<rect class="rc-box" x="151" y="70.5" width="25" height="9.5" rx="2.8"/><rect class="rc-box-top" x="152.4" y="70.5" width="22.2" height="1.5" rx=".7"/><circle class="rc-dot" cx="172" cy="76" r=".6"/>`,
  shield: `<path class="rc-box" d="M150 80 153.6 69.5H174.4L178 80Z"/><path class="rc-shield" d="M153.6 69.5H174.4L173.8 71.2H154.2Z"/><circle class="rc-dot green" cx="164" cy="75.5" r=".7"/>`,
  android_box: `<rect class="rc-box" x="150" y="71.5" width="28" height="8.5" rx="1.6"/><rect class="rc-box-top" x="151" y="71.5" width="26" height="1.3" rx=".6"/><circle class="rc-dot" cx="174" cy="76" r=".6"/>`,
  fire_cube: `<rect class="rc-box" x="155" y="64" width="17" height="16" rx="2"/><rect class="rc-fire" x="158" y="64" width="11" height="1.4" rx=".7"/>`,
  roku: `<rect class="rc-box" x="152" y="70" width="22" height="10" rx="3.2"/><rect class="rc-roku" x="174" y="72" width="2.6" height="4.6" rx=".8"/><circle class="rc-dot" cx="163" cy="75" r=".6"/>`,
  freebox: `<rect class="rc-box" x="147" y="72" width="33" height="8" rx="1.6"/><rect class="rc-box-top" x="148" y="72" width="31" height="1.2" rx=".6"/><rect class="rc-free" x="155" y="75.2" width="8" height="2" rx=".4"/>`,
  kodi: `<rect class="rc-pc" x="151" y="67" width="26" height="13" rx="1.8"/><rect class="rc-pc-top" x="152" y="67" width="24" height="1.6" rx=".8"/><circle class="rc-dot blue" cx="173" cy="76" r=".7"/>`,
  // Plugged at the back of the TV: they hang under its bottom right corner.
  fire_stick: `<rect class="rc-stick" x="124" y="61.5" width="5.5" height="11" rx="1.6"/><circle class="rc-dot blue" cx="126.75" cy="70.4" r=".55"/>`,
  chromecast: `<path class="rc-cable" d="M127 62v3"/><circle class="rc-cast" cx="127" cy="69" r="4.6"/><circle class="rc-cast-in" cx="127" cy="69" r="1.6"/>`,
};

// The remotes, standing upright in front of the box: [body, D-pad ring, its centre, the accent key].
export const RC_REMOTES = {
  siri: ["#c9ccd1", "#1c1c1e", "#2c2c2e", "#2c2c2e"],
  roku: ["#2b2730", "#6c3c97", "#4a2a68", "#6c3c97"],
  fire: ["#202226", "#4b5058", "#2c3036", "#00a8e1"],
  freebox: ["#33363b", "#5a5f67", "#3d4147", "#e5484d"],
  tv: ["#23262b", "#4c5159", "#33373d", "#e5484d"],
};
export const remoteSvg = (style) => {
  const [body, ring, ok, accent] = RC_REMOTES[style] || RC_REMOTES.tv;
  const keys = [53, 57.5, 62]
    .map((y) => `<circle cx="188.4" cy="${y}" r="1.25" fill="${ring}"/><circle cx="193.6" cy="${y}" r="1.25" fill="${ring}"/>`)
    .join("");
  const colours = style === "tv" ? `<g class="rc-colours">${["#e5484d", "#43a047", "#f2c200", "#2f80ed"].map((c, i) => `<rect x="${186.9 + i * 2.2}" y="67" width="1.6" height="1.1" rx=".4" fill="${c}"/>`).join("")}</g>` : "";
  return `<g class="rc-remote"><rect x="185" y="40" width="12" height="40" rx="3" fill="${body}"/><rect class="rc-remote-edge" x="185.6" y="40.6" width="10.8" height="1.6" rx=".8"/>
    <circle cx="191" cy="46.4" r="3.9" fill="${ring}"/><circle cx="191" cy="46.4" r="1.6" fill="${ok}"/><circle cx="194.6" cy="41.9" r=".6" fill="${accent}"/>
    ${keys}${colours}</g>`;
};

// Rolling hills on the screen, repeating every 60 (the length the picture pans by), from x0 to past the screen.
export const rcWave = (x0, y, amp) => {
  let d = `M${x0} ${y}`;
  for (let x = x0; x < 200; x += 60) d += `C${x + 20} ${y - amp} ${x + 40} ${y - amp} ${x + 60} ${y}`;
  return `${d}V60H${x0}Z`;
};

// The whole picture (220 × 80, the shelf at y 80). `uid` keeps each card's ids apart on a page with several cards.
export const sceneSvg = (uid, { mode, paused, pic, pct, ambilight, box, remote }) => {
  const screen = 'x="39" y="9" width="96" height="51"';
  const show =
    mode === "show"
      ? pic
        ? `<image href="${esc(pic)}" ${screen} preserveAspectRatio="xMidYMid slice"/>`
        : `<rect ${screen} fill="url(#rc-air-${uid})"/><circle class="rc-sun" cx="114" cy="22" r="5"/><g class="rc-pan"><path class="rc-hill far" d="${rcWave(39, 47, 10)}"/><path class="rc-hill" d="${rcWave(9, 53, 6)}"/></g>`
      : "";
  const home =
    mode === "home"
      ? `<rect ${screen} fill="url(#rc-home-${uid})"/><rect class="rc-ui" x="44" y="14" width="22" height="2" rx="1"/>${[0, 1, 2, 3]
          .map((i) => `<rect class="rc-tile${i === 1 ? " sel" : ""}" x="${44 + i * 22.5}" y="36" width="19" height="13" rx="2"/>`)
          .join("")}`
      : "";
  const bar = mode === "show" && pct != null ? `<rect class="rc-bar" x="44" y="55" width="86" height="1.6" rx=".8"/><rect class="rc-bar-on" x="44" y="55" width="${((86 * pct) / 100).toFixed(1)}" height="1.6" rx=".8"/>` : "";
  const ir = [0, 1, 2].map((i) => `<path class="rc-ir i${i}" d="M${182.6 - i * 2.6} ${41 - i * 1.6}q-${2 + i} ${3.4 + i * 1.6} 0 ${6.8 + i * 3.2}"/>`).join("");
  return `<svg class="rc-scene" viewBox="0 0 220 80" preserveAspectRatio="xMaxYMax meet" aria-hidden="true" focusable="false">
    <defs>
      <clipPath id="rc-clip-${uid}"><rect ${screen}/></clipPath>
      <linearGradient id="rc-air-${uid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" class="rc-air-a"/><stop offset="1" class="rc-air-b"/></linearGradient>
      <linearGradient id="rc-home-${uid}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2a3f6e"/><stop offset="1" stop-color="#4a6fb3"/></linearGradient>
      <radialGradient id="rc-glow-${uid}"><stop offset="0" class="rc-glow-a"/><stop offset="1" class="rc-glow-b"/></radialGradient>
      <filter id="rc-blur-${uid}" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="4"/></filter>
    </defs>
    <g class="rc-window"><rect class="rc-pane" x="4" y="8" width="24" height="32" rx="1.5"/><circle class="rc-day rc-wsun" cx="21" cy="18" r="3"/>
      <g class="rc-night"><circle class="rc-moon" cx="21" cy="17" r="2.6"/><circle class="rc-star" cx="9" cy="14" r=".5"/><circle class="rc-star" cx="13" cy="28" r=".45"/><circle class="rc-star" cx="25" cy="31" r=".4"/></g>
      <path class="rc-frame" d="M16 8V40M4 24H28"/><rect class="rc-frame-o" x="4" y="8" width="24" height="32" rx="1.5"/><rect class="rc-sill" x="2" y="40" width="28" height="2" rx=".6"/></g>
    ${mode === "off" ? "" : `<ellipse class="rc-glow" cx="87" cy="35" rx="74" ry="40" fill="url(#rc-glow-${uid})"/>`}
    ${ambilight && mode !== "off" ? `<rect class="rc-amb" x="34" y="4" width="106" height="61" rx="4" filter="url(#rc-blur-${uid})"/>` : ""}
    <path class="rc-neck" d="M83.5 63H90.5L89.4 77H84.6Z"/><rect class="rc-foot" x="69" y="76.4" width="36" height="3.6" rx="1.4"/>
    <rect class="rc-bezel" x="36" y="6" width="102" height="57" rx="2.2"/>
    <rect class="rc-screen" ${screen}/>
    <g clip-path="url(#rc-clip-${uid})">${show}${home}${bar}
      ${paused ? `<g class="rc-paused"><circle cx="87" cy="34.5" r="7"/><rect x="84" y="31" width="2.2" height="7" rx=".6"/><rect x="87.8" y="31" width="2.2" height="7" rx=".6"/></g>` : ""}
      <path class="rc-shine" d="M39 9H79L54 60H39Z"/></g>
    <circle class="rc-led" cx="87" cy="61.6" r=".75"/>
    ${RC_BOXES[box] || ""}
    ${remoteSvg(remote)}
    <g class="rc-signal">${ir}</g>
    <g class="rc-plant"><path class="rc-leaf" d="M210 66C203 60 202 52 204 47 208 52 210 58 210 66Z"/><path class="rc-leaf b" d="M210 66C211 57 214 50 219 47 219 55 215 62 210 66Z"/><path class="rc-leaf" d="M210 66C209 58 210 50 212 44 214 51 213 59 210 66Z"/><path class="rc-pot" d="M204.5 66H215.5L214 80H206Z"/></g>
  </svg>`;
};

// The banner: the wall, the shelf strip, the text on the left and the keys at the top right. The colours of the
// picture, day and night, and its animations (the picture panning on the screen and the light of the TV breathing
// on the wall while it plays, the remote's signal, the stars).
export const BANNER_STYLE = `
  .banner { position: relative; height: 90px; overflow: hidden; color: #2a2722; --rc-sky-muted: #6b645a; --rc-on: #2f80ed;
            background: linear-gradient(90deg, #f8f5f0 0%, #f2eee8 52%, #ebe5dc 100%); }
  .banner.night { color: #fff; --rc-sky-muted: rgba(255,255,255,.78); --rc-on: #8fbaff;
                  background: linear-gradient(90deg, #333a4f 0%, #2a2f3d 52%, #222633 100%); }
  .rc-strip { position: absolute; left: 0; right: 0; bottom: 0; height: 10px; background: #e9e4dc;
              box-shadow: inset 0 2px 0 #fff, inset 0 -2px 0 #cfc7bb; }
  .night .rc-strip { background: #3a3f4c; box-shadow: inset 0 2px 0 #4a5060, inset 0 -2px 0 #30343f; }
  .rc-scene { position: absolute; right: 0; bottom: 10px; height: 80px; width: min(44cqw, 220px); overflow: hidden; }
  .htext { position: absolute; left: 12px; top: 0; bottom: 10px; right: calc(min(44cqw, 220px) + 4px);
           display: flex; align-items: center; gap: 10px; min-width: 0; }
  .htext .titles { flex: 1 1 auto; min-width: 0; gap: 2px; }
  .htext .name { font-size: 16px; font-weight: 600; }
  .htext .sub { color: var(--rc-sky-muted); }
  .htext .eq i { background: var(--rc-on); }
  /* The round icon, its colour the state: blue on, grey off, amber buffering, red unavailable. */
  .banner .type-icon { background: rgba(255,255,255,.66); box-shadow: inset 0 0 0 1px rgba(0,0,0,.08); }
  .banner.night .type-icon { background: rgba(255,255,255,.12); box-shadow: inset 0 0 0 1px rgba(255,255,255,.14); }
  .banner .type-icon .icon { fill: var(--rc-on); }
  .banner .type-icon.off .icon { fill: #8a8f98; }
  .banner.night .type-icon.off .icon { fill: #a3a9b4; }
  .banner .type-icon.warn .icon { fill: var(--warning-color, #ffa600); }
  .banner .type-icon.alert .icon { fill: var(--error-color, #db4437); }
  .banner .hbtns .key.power, .banner .hbtns .zoom { color: #33506b; border: 0; background: rgba(255,255,255,.55);
                                                     box-shadow: inset 0 0 0 1px rgba(255,255,255,.7); backdrop-filter: blur(4px); }
  .night .hbtns .key.power, .night .hbtns .zoom { color: #fff; background: rgba(255,255,255,.12); box-shadow: inset 0 0 0 1px rgba(255,255,255,.2); }
  .hbtns .key.power.on { color: var(--rc-on); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--rc-on) 60%, transparent); }
  .banner .hbtns .key.power:hover, .banner .hbtns .zoom:hover { background: rgba(255,255,255,.75); }
  .night .hbtns .key.power:hover, .night .hbtns .zoom:hover { background: rgba(255,255,255,.22); }
  /* The pill on the wall: frosted glass under the state's colour. */
  .banner .pill { background: color-mix(in srgb, var(--c) 18%, rgba(255,255,255,.78)); color: color-mix(in srgb, var(--c) 45%, #0d2a45); }
  .banner.night .pill { background: color-mix(in srgb, var(--c) 30%, rgba(8,18,38,.55)); color: color-mix(in srgb, var(--c) 35%, #ffffff); }
  .banner .pill.on { --c: var(--rc-on); } .banner .pill.off { --c: #8a8f98; }
  /* Narrow card: no room for the picture beside the text, the bare wall stays. */
  @container rc-card (max-width: 300px) { .rc-scene { display: none; } .htext { right: 36px; } .banner.two .htext { right: 64px; } }
  .rc-night, .night .rc-day { display: none; }
  .night .rc-night { display: inline; }
  .rc-pane { fill: #bfe0f7; } .night .rc-pane { fill: #1b2f52; }
  .rc-wsun { fill: #ffd65a; } .rc-moon { fill: #f3eed2; } .rc-star { fill: #fff; animation: rc-twinkle 3s ease-in-out infinite alternate; }
  .rc-frame { stroke: #fff; stroke-width: 1.3; fill: none; } .rc-frame-o { fill: none; stroke: #fff; stroke-width: 1.6; }
  .night .rc-frame, .night .rc-frame-o { stroke: #4a5568; }
  .rc-sill { fill: #e2dbcf; } .night .rc-sill { fill: #434a5b; }
  .rc-glow-a { stop-color: #7fb2ff; stop-opacity: .42; } .rc-glow-b { stop-color: #7fb2ff; stop-opacity: 0; }
  .night .rc-glow-a { stop-opacity: .6; }
  .rc-glow { transform-box: fill-box; transform-origin: center; }
  .s-play .rc-glow { animation: rc-breathe 4s ease-in-out infinite; }
  .rc-amb { fill: #ff9a4d; opacity: .75; } .night .rc-amb { opacity: .95; }
  .s-play .rc-amb { animation: rc-amb 6s ease-in-out infinite; }
  .rc-bezel { fill: #1b1d22; } .night .rc-bezel { fill: #22252c; stroke: #4c5364; stroke-width: .6; }
  .night .rc-remote > rect:first-child, .night .rc-box, .night .rc-stick { stroke: rgba(255,255,255,.22); stroke-width: .5; } .rc-screen { fill: #15181e; } .night .rc-screen { fill: #0d0f14; }
  .rc-neck, .rc-foot { fill: #3a3e46; } .night .rc-neck, .night .rc-foot { fill: #1f2228; }
  .rc-shine { fill: #fff; opacity: .05; }
  .rc-led { fill: #e5484d; } .s-on .rc-led, .s-play .rc-led, .s-pause .rc-led, .s-buffer .rc-led { fill: #fff; opacity: .55; }
  .s-alert .rc-led { animation: rc-blink 1.6s steps(2, jump-none) infinite; }
  .rc-air-a { stop-color: #5aa2e6; } .rc-air-b { stop-color: #c9e6f8; }
  .rc-sun { fill: #ffe08a; } .rc-hill { fill: #3f8f5a; } .rc-hill.far { fill: #79b77f; }
  .s-play .rc-pan, .s-on .rc-pan { animation: rc-pan 14s linear infinite; }
  .rc-ui { fill: rgba(255,255,255,.7); }
  .rc-tile { fill: rgba(255,255,255,.22); } .rc-tile.sel { fill: rgba(255,255,255,.85); }
  .rc-bar { fill: rgba(255,255,255,.35); } .rc-bar-on { fill: #fff; }
  .rc-paused circle { fill: rgba(0,0,0,.45); } .rc-paused rect { fill: #fff; }
  .rc-box { fill: #1d1e22; } .night .rc-box { fill: #111215; }
  .rc-box-top { fill: #3a3b40; } .night .rc-box-top { fill: #26272c; }
  .rc-shield { fill: #76b900; } .rc-fire { fill: #00a8e1; } .rc-roku { fill: #6c3c97; } .rc-free { fill: #e5484d; opacity: .85; }
  .rc-pc { fill: #c9ced6; } .rc-pc-top { fill: #e3e7ec; } .night .rc-pc { fill: #7d848f; } .night .rc-pc-top { fill: #969ca6; }
  .rc-stick { fill: #1d1e22; } .rc-cast { fill: #f1f1ee; stroke: #c9c9c4; stroke-width: .5; } .rc-cast-in { fill: #d9d9d4; }
  .night .rc-cast { fill: #c2c4c6; }
  .rc-cable { stroke: #3a3e46; stroke-width: 1; }
  .rc-dot { fill: #fff; opacity: .7; } .rc-dot.green { fill: #76b900; opacity: 1; } .rc-dot.blue { fill: #4fc3f7; opacity: 1; }
  .s-off .rc-dot, .s-alert .rc-dot { opacity: 0; }
  .rc-remote-edge { fill: rgba(255,255,255,.18); }
  .rc-ir { fill: none; stroke: var(--rc-on); stroke-width: 1; stroke-linecap: round; opacity: 0; }
  .s-play .rc-ir, .s-on .rc-ir { animation: rc-ir 3.6s ease-out infinite; }
  .rc-ir.i1 { animation-delay: .15s !important; } .rc-ir.i2 { animation-delay: .3s !important; }
  .rc-pot { fill: #c98b5e; } .night .rc-pot { fill: #7a5a42; }
  .rc-leaf { fill: #5aa86a; } .rc-leaf.b { fill: #7cc07f; } .night .rc-leaf { fill: #2f5e3e; } .night .rc-leaf.b { fill: #3d7250; }
  @keyframes rc-breathe { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: .65; transform: scale(.94); } }
  @keyframes rc-amb { 0%, 100% { fill: #ff9a4d; } 33% { fill: #c46bff; } 66% { fill: #4fa8ff; } }
  @keyframes rc-pan { to { transform: translateX(-60px); } }
  @keyframes rc-ir { 0%, 70% { opacity: 0; } 76% { opacity: .9; } 92%, 100% { opacity: 0; } }
  @keyframes rc-blink { 0% { opacity: 1; } 100% { opacity: .15; } }
  @keyframes rc-twinkle { from { opacity: .35; } to { opacity: 1; } }
  @media (prefers-reduced-motion: reduce) { .rc-scene * { animation: none !important; } }
`;

// ---------------------------------------------------------------------------
// DOM patching: the new HTML is applied onto the elements there are, so that nothing is replaced that did not
// change (a running animation, the key under the finger, the focus).
// ---------------------------------------------------------------------------

export const sameNode = (a, b) =>
  a.nodeType === b.nodeType && a.nodeName === b.nodeName && (a.nodeType !== 1 || a.getAttribute("data-k") === b.getAttribute("data-k"));

export const patchChildren = (into, from) => {
  const old = [...into.childNodes];
  const next = [...from.childNodes];
  next.forEach((n, i) => {
    const o = old[i];
    if (!o) into.appendChild(n);
    else if (!sameNode(o, n)) into.replaceChild(n, o);
    else if (o.nodeType !== 1) {
      if (o.nodeValue !== n.nodeValue) o.nodeValue = n.nodeValue;
    } else {
      for (const { name } of [...o.attributes]) if (!n.hasAttribute(name)) o.removeAttribute(name);
      for (const { name, value } of [...n.attributes]) if (o.getAttribute(name) !== value) o.setAttribute(name, value);
      patchChildren(o, n);
    }
  });
  for (let i = old.length - 1; i >= next.length; i--) old[i].remove();
};

export const morph = (root, html) => {
  const tpl = document.createElement("template");
  tpl.innerHTML = html;
  if (!tpl.content || !root.childNodes) {
    root.innerHTML = html;
    return;
  }
  patchChildren(root, tpl.content);
};
