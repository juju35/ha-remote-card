import assert from "node:assert/strict";
import { test } from "node:test";
import { APPS, devices, entities, states } from "../scripts/mock-states.mjs";
import { load } from "./load.mjs";

const rc = load();

const makeHass = (over = {}, extra = {}) => {
  const calls = [];
  const st = structuredClone(states);
  for (const [id, o] of Object.entries(over)) st[id] = { ...st[id], ...o, attributes: { ...st[id]?.attributes, ...o.attributes } };
  return { calls, states: st, entities, devices, language: "en", callService: (d, s, data) => calls.push([d, s, data]), ...extra };
};
const newCard = (config, hass = makeHass(), Card = rc.RemoteCard) => {
  const card = new Card();
  card.setConfig(config);
  card.hass = hass;
  return card;
};
const html = (card) => card.shadowRoot.innerHTML;
const keyEl = (key) => ({ dataset: { key }, classList: { add() {}, remove() {} } });
const ev = (el, extra = {}) => ({ button: 0, clientX: 100, clientY: 100, detail: 1, composedPath: () => [el], stopPropagation() {}, preventDefault() {}, ...extra });
const press = (card, key, at = {}) => card.shadowRoot.emit("pointerdown", ev(keyEl(key), at));
const release = () => rc.window.emit("pointerup", {});
const click = (card, dataset, extra = {}) => card._onClick(ev({ dataset, classList: { add() {}, remove() {} } }, extra));
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const call = (integration, key, hass = makeHass(), ids = {}) => {
  const ctx = { ...rc.resolve(hass, ids), integration };
  return rc.serviceCall(rc.keySpec({}, integration, key), ctx.remote, ctx.mp, hass.states);
};
const plain = (v) => JSON.parse(JSON.stringify(v));

test("every integration says how it sends every key, or that it has none", () => {
  for (const [name, i] of Object.entries(rc.INTEGRATIONS)) {
    assert.deepEqual(Object.keys(i.keys).sort(), [...rc.KEYS].sort(), name);
    for (const [k, v] of Object.entries(i.keys)) assert.ok(v === null || typeof v === "string" || (typeof v === "object" && !Array.isArray(v)), `${name}.${k}`);
  }
});

test("the remote and the media player are paired through their device, the integration read from their platform", () => {
  const h = makeHass();
  assert.deepEqual(plain(rc.resolve(h, { entity: "remote.living_room_apple_tv" })), {
    remote: "remote.living_room_apple_tv",
    mp: "media_player.living_room_apple_tv",
    integration: "apple_tv",
    device: devices.dev_atv,
    standalone: false,
  });
  const fromPlayer = rc.resolve(h, { media_player: "media_player.bedroom_tv" });
  assert.equal(fromPlayer.remote, "remote.bedroom_tv_remote");
  assert.equal(fromPlayer.integration, "philips_js");
  const lg = rc.resolve(h, { entity: "media_player.lounge_lg" });
  assert.equal(lg.remote, undefined);
  assert.equal(lg.integration, "webostv");
  assert.equal(rc.resolve(h, { entity: "remote.office_shield", integration: "generic" }).integration, "generic");
  assert.equal(rc.resolve(h, { entity: "remote.office_shield", integration: "nope" }).integration, "androidtv_remote");
  assert.equal(rc.firstEntity(h), "remote.living_room_apple_tv");
  // A HomePod has an apple_tv remote too: it is not a TV.
  const pod = makeHass({}, { devices: { ...devices, dev_atv: { ...devices.dev_atv, model: "HomePod mini" } } });
  assert.equal(rc.firstEntity(pod), "remote.bedroom_tv_remote");
  assert.deepEqual(plain(rc.RemoteCard.getStubConfig(h)), { entity: "remote.living_room_apple_tv" });
});

test("each integration gets its own commands and services", () => {
  const h = makeHass();
  const atv = { entity: "remote.living_room_apple_tv" };
  assert.deepEqual(plain(call("apple_tv", "up", h, atv)), ["remote", "send_command", { entity_id: "remote.living_room_apple_tv", command: "up" }]);
  assert.deepEqual(plain(call("apple_tv", "back", h, atv))[2].command, "menu");
  assert.deepEqual(plain(call("apple_tv", "menu", h, atv))[2].command, "top_menu");
  assert.equal(call("apple_tv", "channel_up", h, atv), null, "no channel keys on the Siri Remote");
  const ph = { entity: "remote.bedroom_tv_remote" };
  assert.equal(call("philips_js", "ok", h, ph)[2].command, "Confirm");
  assert.equal(call("philips_js", "menu", h, ph)[2].command, "Options");
  assert.equal(call("androidtv_remote", "ok", h, { entity: "remote.office_shield" })[2].command, "DPAD_CENTER");
  assert.equal(call("samsungtv", "back", h, { entity: "remote.den_samsung" })[2].command, "KEY_RETURN");
  assert.deepEqual(plain(call("samsungtv", "play_pause", h, { entity: "remote.den_samsung" })), ["media_player", "media_play_pause", { entity_id: "media_player.den_samsung" }]);
  assert.equal(call("roku", "play_pause", h, { entity: "remote.kitchen_roku" })[2].command, "play");
  assert.deepEqual(plain(call("webostv", "up", h, { entity: "media_player.lounge_lg" })), ["webostv", "button", { entity_id: "media_player.lounge_lg", button: "UP" }]);
  assert.deepEqual(plain(call("androidtv", "channel_up", h, { entity: "media_player.attic_fire_tv" })), [
    "androidtv",
    "adb_command",
    { entity_id: "media_player.attic_fire_tv", command: "input keyevent 166" },
  ]);
  assert.deepEqual(plain(call("kodi", "ok", h, { entity: "media_player.studio_kodi" })), ["kodi", "call_method", { entity_id: "media_player.studio_kodi", method: "Input.Select" }]);
  // Freebox Player: the freebox_player.remote service, without entity, power included.
  assert.deepEqual(plain(call("freebox_player", "channel_up", h)), ["freebox_player", "remote", { code: "prgm_inc" }]);
  assert.deepEqual(plain(call("freebox_player", "power", h)), ["freebox_player", "remote", { code: "power" }]);
});

test("Freebox Player: the card works from `integration` alone, with no entity", () => {
  const h = makeHass();
  const card = newCard({ integration: "freebox_player" }, h);
  const out = html(card);
  assert.match(out, /class="name">Freebox Player</);
  for (const k of ["power", "up", "ok", "back", "home", "menu", "volume_up", "mute", "channel_up", "play_pause", "next"]) assert.match(out, new RegExp(`data-key="${k}"`), k);
  assert.doesNotMatch(out, /data-action="more_info"/);
  click(card, { key: "ok" }, { detail: 0 });
  assert.deepEqual(plain(h.calls), [["freebox_player", "remote", { code: "ok" }]]);
  // Detected from a platform only when it is asked for: without `integration`, no entity is an error.
  assert.match(html(newCard({}, makeHass({}, { states: {}, entities: {} }))), /No remote or media player found/);
});

test("power turns on or off from the state, through the player when it can, else the remote; mute toggles", () => {
  const h = makeHass();
  // Apple TV playing: the player turns it off.
  assert.deepEqual(plain(call("apple_tv", "power", h, { entity: "remote.living_room_apple_tv" })), ["media_player", "turn_off", { entity_id: "media_player.living_room_apple_tv" }]);
  // Philips TV off: its player cannot turn it on (no TURN_ON), the remote does.
  const off = makeHass({ "media_player.bedroom_tv": { state: "off" } });
  assert.deepEqual(plain(call("philips_js", "power", off, { entity: "remote.bedroom_tv_remote" })), ["remote", "turn_on", { entity_id: "remote.bedroom_tv_remote" }]);
  assert.deepEqual(plain(call("philips_js", "power", h, { entity: "remote.bedroom_tv_remote" }))[1], "turn_off");
  // Kodi not muted: mutes; LG sends its own MUTE button.
  assert.deepEqual(plain(call("kodi", "mute", h, { entity: "media_player.studio_kodi" })), ["media_player", "volume_mute", { entity_id: "media_player.studio_kodi", is_volume_muted: true }]);
  assert.deepEqual(plain(call("webostv", "mute", h, { entity: "media_player.lounge_lg" })), ["webostv", "button", { entity_id: "media_player.lounge_lg", button: "MUTE" }]);
});

test("a key is hidden when the integration has none or the player does not support it", () => {
  const h = makeHass();
  const card = newCard({ entity: "remote.living_room_apple_tv" }, h);
  const out = html(card);
  for (const k of ["power", "up", "down", "left", "right", "ok", "back", "home", "menu", "volume_up", "volume_down", "play_pause", "previous", "next"]) {
    assert.match(out, new RegExp(`data-key="${k}"`), k);
  }
  assert.doesNotMatch(out, /data-key="mute"/, "this Apple TV player cannot mute");
  // Mute through the player once it supports it (VOLUME_MUTE), between − and +.
  const muting = makeHass({ "media_player.living_room_apple_tv": { attributes: { supported_features: 450487 | 8 } } });
  assert.match(html(newCard({ entity: "remote.living_room_apple_tv" }, muting)), /data-key="volume_down"[\s\S]*data-key="mute"[\s\S]*data-key="volume_up"/);
  assert.doesNotMatch(out, /data-key="channel_up"/, "nor channel keys");
  const philips = html(newCard({ entity: "remote.bedroom_tv_remote" }, h));
  assert.match(philips, /data-key="channel_up"/);
  assert.match(philips, /data-key="mute"/);
  const kodi = html(newCard({ entity: "media_player.studio_kodi" }, h));
  assert.doesNotMatch(kodi, /data-key="channel_up"/);
  assert.match(kodi, /data-key="mute"/);
  // A player without remote and of an unknown integration: media keys only.
  const generic = html(newCard({ entity: "media_player.lounge_lg", integration: "generic" }, h));
  assert.doesNotMatch(generic, /data-key="up"/);
  assert.match(generic, /data-key="volume_up"/);
  assert.match(generic, /data-key="play_pause"/);
  // show_* options.
  const bare = html(newCard({ entity: "remote.bedroom_tv_remote", show_volume: false, show_channels: false, show_transport: false, show_power: false, show_subtitle: false }, h));
  for (const k of ["volume_up", "channel_up", "play_pause", "power"]) assert.doesNotMatch(bare, new RegExp(`data-key="${k}"`), k);
  assert.doesNotMatch(bare, /class="sub"/);
});

test("commands overrides a key: a remote command, a list, a Home Assistant action, or null to hide it", () => {
  const h = makeHass();
  const card = newCard(
    {
      entity: "remote.living_room_apple_tv",
      commands: {
        menu: "control_center",
        home: ["home", "home"],
        mute: { action: "script.turn_on", data: { entity_id: "script.mute_receiver" } },
        next: null,
        channel_up: "channel_up",
        volume_up: { action: "media_player.volume_up", target: { entity_id: "media_player.receiver" } },
      },
    },
    h,
  );
  assert.doesNotMatch(html(card), /data-key="next"/);
  assert.match(html(card), /data-key="channel_up"/);
  assert.match(html(card), /data-key="mute"/);
  for (const k of ["menu", "home", "mute", "volume_up"]) {
    click(card, { key: k }, { detail: 0 });
  }
  assert.deepEqual(plain(h.calls), [
    ["remote", "send_command", { entity_id: "remote.living_room_apple_tv", command: "control_center" }],
    ["remote", "send_command", { entity_id: "remote.living_room_apple_tv", command: ["home", "home"] }],
    ["script", "turn_on", { entity_id: "script.mute_receiver" }],
    ["media_player", "volume_up", { entity_id: "media_player.receiver" }],
  ]);
  // An action without target goes to the media player.
  assert.deepEqual(plain(rc.serviceCall({ action: "media_player.select_source", data: { source: "HDMI 1" } }, "remote.x", "media_player.y", {})), [
    "media_player",
    "select_source",
    { source: "HDMI 1", entity_id: "media_player.y" },
  ]);
  assert.throws(() => newCard({ entity: "remote.x", commands: ["up"] }), /commands must be a map/);
  assert.throws(() => newCard({ entity: "remote.x", apps: { a: 1 } }), /apps must be a list/);
});

test("a press sends at once and repeats while held, the click after it sends nothing more; the keyboard sends on click", async () => {
  const h = makeHass();
  const card = newCard({ entity: "remote.living_room_apple_tv" }, h);
  press(card, "up");
  assert.equal(h.calls.length, 1);
  await wait(450 + 180 * 4);
  release();
  const held = h.calls.length;
  assert.ok(held >= 3, `repeated ${held} times`);
  click(card, { key: "up" });
  await wait(250);
  assert.equal(h.calls.length, held, "no repeat after the release, no second send at the click");
  // Not repeatable: once.
  press(card, "home");
  await wait(700);
  release();
  click(card, { key: "home" });
  assert.equal(h.calls.length, held + 1);
  // Keyboard (Enter / Space make a click with detail 0).
  click(card, { key: "ok" }, { detail: 0 });
  assert.equal(h.calls.at(-1)[2].command, "select");
  // repeat: false.
  const h2 = makeHass();
  const once = newCard({ entity: "remote.living_room_apple_tv", repeat: false }, h2);
  press(once, "volume_up");
  await wait(700);
  release();
  assert.equal(h2.calls.length, 1);
});

test("every key sent gives a light haptic feedback, unless haptic: false", () => {
  const card = newCard({ entity: "remote.living_room_apple_tv" });
  click(card, { key: "ok" }, { detail: 0 });
  assert.deepEqual(plain(card.events.filter((e) => e.type === "haptic").map((e) => e.detail)), ["light"]);
  const quiet = newCard({ entity: "remote.living_room_apple_tv", haptic: false });
  click(quiet, { key: "ok" }, { detail: 0 });
  assert.equal((quiet.events || []).filter((e) => e.type === "haptic").length, 0);
});

test("swipe gestures: a swipe sends its direction, a tap the key under the finger", () => {
  const h = makeHass();
  const card = newCard({ entity: "remote.living_room_apple_tv", swipe: true }, h);
  assert.match(html(card), /class="dpad swipe"/);
  press(card, "ok", { clientX: 100, clientY: 100 });
  assert.equal(h.calls.length, 0, "nothing at the press");
  card.shadowRoot.emit("pointermove", { clientX: 140, clientY: 104 });
  card.shadowRoot.emit("pointermove", { clientX: 142, clientY: 150 });
  release();
  assert.deepEqual(
    h.calls.map((c) => c[2].command),
    ["right", "down"],
  );
  press(card, "left");
  release();
  assert.equal(h.calls.at(-1)[2].command, "left");
  assert.equal(h.calls.length, 3);
});

test("sources and apps: a popup at the top of the card; one picked is selected and closes it", () => {
  const h = makeHass();
  const card = newCard({ entity: "media_player.bedroom_tv" }, h);
  card.connectedCallback();
  assert.match(html(card), /data-action="popup"[^>]*aria-label="Sources"/);
  assert.doesNotMatch(html(card), /class="popup"/);
  click(card, { action: "popup" });
  assert.match(html(card), /class="popup"/);
  assert.match(html(card), /class="source on" data-action="source" data-source="Watch TV"/);
  assert.doesNotMatch(html(card), /class="group-title"/, "no group titles for the sources alone");
  click(card, { action: "source", source: "HDMI 2" });
  assert.deepEqual(plain(h.calls), [["media_player", "select_source", { entity_id: "media_player.bedroom_tv", source: "HDMI 2" }]]);
  assert.doesNotMatch(html(card), /class="popup"/);
  // A click elsewhere closes it, sending nothing; so does leaving the page.
  click(card, { action: "popup" });
  card._outside.tap({ composedPath: () => [] });
  assert.doesNotMatch(html(card), /class="popup"/);
  click(card, { action: "popup" });
  card.disconnectedCallback();
  card.connectedCallback();
  assert.doesNotMatch(html(card), /class="popup"/);
  assert.equal(h.calls.length, 1);
  assert.doesNotMatch(html(newCard({ entity: "media_player.bedroom_tv", show_sources: false }, h)), /data-action="popup"/);
});

test("apps: a source, an activity, a remote command or any action, in the popup with the sources", () => {
  const h = makeHass();
  const apps = [...APPS, { name: "Kids", activity: "com.example.kids" }, { name: "Guide", command: "GUIDE" }, { name: "Lights", action: "light.toggle", data: { entity_id: "light.lamp" } }];
  const card = newCard({ entity: "remote.living_room_apple_tv", apps }, h);
  card.connectedCallback();
  assert.match(html(card), /data-action="popup"[^>]*aria-label="Sources and apps"/);
  click(card, { action: "popup" });
  const out = html(card);
  assert.match(out, /<ha-icon icon="mdi:youtube">/);
  assert.match(out, /class="initial">K</);
  assert.match(out, /class="app on" data-action="app" data-index="2"/, "Plex is the app playing");
  assert.match(out, /class="group-title">Apps</);
  assert.match(out, /class="group-title">Sources</);
  for (let i = 0; i < apps.length; i++) click(card, { action: "app", index: String(i) });
  assert.doesNotMatch(html(card), /class="popup"/, "an app picked closes the popup");
  assert.deepEqual(plain(h.calls.slice(0, 1)), [["media_player", "select_source", { entity_id: "media_player.living_room_apple_tv", source: "YouTube" }]]);
  assert.deepEqual(plain(h.calls.slice(4)), [
    ["remote", "turn_on", { entity_id: "remote.living_room_apple_tv", activity: "com.example.kids" }],
    ["remote", "send_command", { entity_id: "remote.living_room_apple_tv", command: "GUIDE" }],
    ["light", "toggle", { entity_id: "light.lamp" }],
  ]);
  // Apps alone (a remote without player): the popup holds the apps only.
  const only = newCard({ entity: "remote.living_room_apple_tv", apps, show_sources: false }, h);
  assert.match(html(only), /aria-label="Apps"/);
  assert.doesNotMatch(html(newCard({ entity: "remote.living_room_apple_tv", apps, show_apps: false, show_sources: false }, h)), /data-action="popup"/);
});

test("header: the device name, what is playing as subtitle, power on the right with the accent when on", () => {
  const card = newCard({ entity: "remote.living_room_apple_tv" });
  const out = html(card);
  assert.match(out, /class="name">Living Room Apple TV</);
  assert.match(out, /class="sub"[^>]*><span class="eq run"[\s\S]*<span>Plex · The Northern Lights<\/span>/);
  assert.match(out, /class="track" data-k="track"><div class="run"/);
  assert.match(out, /class="key power on" data-key="power"[^>]*title="Power · Playing"[^>]*aria-pressed="true"/);
  assert.match(out, /data-action="more_info" data-entity="media_player.living_room_apple_tv"/);
  const off = html(newCard({ entity: "remote.bedroom_tv_remote" }, makeHass({ "media_player.bedroom_tv": { state: "off" } })));
  assert.match(off, /class="type-icon off"/);
  assert.match(off, /class="key power" data-key="power"/);
  // The state in the pill after the name, in the icon's colour, not repeated in the subtitle.
  assert.match(off, /<div class="trow"><div class="name">[^<]*<\/div><span class="pill off" title="Off">/);
  assert.doesNotMatch(off, /class="sub"/);
  assert.match(out, /<span class="pill on" title="Playing">/);
  assert.doesNotMatch(off, /class="eq/);
  // On, not playing: no dancing bars, the source and the channel.
  const tv = html(newCard({ entity: "remote.bedroom_tv_remote" }));
  assert.match(tv, /class="sub"[^>]*><span>Watch TV · News 24<\/span>/);
  const p = rc.progress({ state: "paused", attributes: { media_duration: 100, media_position: 25, media_position_updated_at: new Date(0).toISOString() } });
  assert.deepEqual(plain(p), { pct: 25, left: 75, playing: false });
  assert.equal(rc.progress({ state: "playing", attributes: {} }), null);
});

test("the card is not rewritten while a key is held; the update waiting is drawn at the release", () => {
  const h = makeHass();
  const card = newCard({ entity: "remote.living_room_apple_tv" }, h);
  press(card, "volume_up");
  const before = html(card);
  card.hass = makeHass({ "media_player.living_room_apple_tv": { state: "paused" } });
  assert.equal(html(card), before);
  release();
  assert.notEqual(html(card), before);
  assert.match(html(card), /title="Power · Paused"/);
});

test("no entity, or one that does not exist, gives a clear message", () => {
  const h = makeHass({}, { states: {}, entities: {} });
  assert.match(html(newCard({}, h)), /No remote or media player found/);
  assert.match(html(newCard({ entity: "remote.nope" })), /Entity not found/);
});

test("the mini card shows power, now playing, play / pause and volume; its detail button unfolds the full remote", () => {
  const h = makeHass();
  const card = newCard({ entity: "remote.living_room_apple_tv" }, h, rc.RemoteMiniCard);
  card.connectedCallback();
  const out = html(card);
  for (const k of ["power", "play_pause", "volume_down", "volume_up"]) assert.match(out, new RegExp(`data-key="${k}"`), k);
  assert.match(out, /class="now-title"><span class="eq run"[\s\S]*The Northern Lights/);
  assert.match(out, /class="now-sub">Nature Documentaries</);
  assert.match(out, /<img src="data:image\/svg\+xml/);
  assert.match(out, /class="sub"[^>]*><span>Plex<\/span>/);
  assert.doesNotMatch(out, /class="dpad/);
  assert.match(out, /data-action="zoom"/);
  assert.deepEqual(plain(card.getGridOptions()), { columns: 6, min_columns: 6, rows: "auto" });
  click(card, { action: "zoom" });
  assert.match(html(card), /class="dpad/);
  assert.deepEqual(plain(card.getGridOptions()), { columns: 12, min_columns: 6, rows: "auto" });
  card._unzoom.tap({ composedPath: () => [] });
  assert.doesNotMatch(html(card), /class="dpad/);
  click(card, { action: "zoom" });
  card.disconnectedCallback();
  card.connectedCallback();
  assert.doesNotMatch(html(card), /class="dpad/);
  assert.doesNotMatch(html(newCard({ entity: "remote.living_room_apple_tv", zoom: false }, h, rc.RemoteMiniCard)), /data-action="zoom"/);
});

test("the editors keep the YAML minimal; the mini card's editor has the full card's options and the detail button", () => {
  assert.deepEqual(plain(rc.cleanConfig({ type: "custom:remote-card", entity: "remote.x", title: "", show_title: true, swipe: false, haptic: false }, { show_title: true, swipe: false, haptic: true })), {
    type: "custom:remote-card",
    entity: "remote.x",
    haptic: false,
  });
  const ed = new rc.RemoteCardEditor();
  ed.setConfig({ entity: "remote.x" });
  ed.hass = makeHass();
  const names = (schema) => schema.flatMap((s) => (s.schema ? names(s.schema) : [s.name]));
  const full = names(ed._form.schema);
  for (const n of ["entity", "media_player", "integration", "title", "show_power", "show_volume", "show_channels", "show_transport", "show_sources", "show_apps", "haptic", "repeat", "swipe", "language"]) {
    assert.ok(full.includes(n), n);
  }
  assert.ok(!full.includes("zoom"));
  assert.ok(!full.includes("apps") && !full.includes("commands"), "lists and maps stay YAML only");
  const integrations = ed._form.schema.find((s) => s.name === "integration").selector.select.options.map((o) => o.value);
  assert.ok(integrations.includes("freebox_player") && integrations.includes("generic"));
  const mini = new rc.RemoteMiniCardEditor();
  mini.setConfig({});
  mini.hass = makeHass();
  const m = names(mini._form.schema);
  assert.ok(m.includes("zoom") && full.every((n) => m.includes(n)));
  assert.equal(ed._form.data.show_title, true);
  let sent;
  ed.dispatchEvent = (e) => {
    sent = e.detail.config;
  };
  ed._form.emit("value-changed", { detail: { value: { ...ed._form.data, show_volume: false } }, stopPropagation() {} });
  assert.deepEqual(plain(sent), { entity: "remote.x", show_volume: false });
});

test("every language has every English text, and nothing else; the language option is followed", () => {
  const en = Object.keys(rc.STRINGS.en).sort();
  for (const [l, s] of Object.entries(rc.STRINGS)) {
    assert.deepEqual(Object.keys(s).sort(), en, l);
    for (const [k, v] of Object.entries(s)) assert.ok(typeof v === "string" && v.trim(), `${l}.${k}`);
  }
  assert.deepEqual(plain(rc.LANGUAGES.map(([l]) => l).sort()), plain(Object.keys(rc.STRINGS).sort()));
  assert.equal(Object.keys(rc.STRINGS).length, 22);
  const fr = html(newCard({ entity: "remote.living_room_apple_tv", language: "fr" }));
  assert.match(fr, /title="Marche \/ arrêt · Lecture"/);
  assert.match(fr, /aria-label="Retour"/);
  const sr = html(newCard({ entity: "remote.living_room_apple_tv" }, makeHass({}, { language: "sr-Latn" })));
  assert.match(sr, /aria-label="Nazad"/);
});

test("a dark theme gives the card its lighter accent tint", () => {
  assert.doesNotMatch(html(newCard({ entity: "remote.living_room_apple_tv" })), /<ha-card class="dark">/);
  const card = newCard({ entity: "remote.living_room_apple_tv" }, makeHass({}, { themes: { darkMode: true } }));
  assert.match(html(card), /<ha-card class="dark">/);
  assert.match(html(card), /ha-card\.dark \{ --rc-fg: var\(--rc-accent-light\); \}/);
});

test("names are escaped", () => {
  assert.equal(rc.esc(`<a href="x">'&`), "&lt;a href=&quot;x&quot;&gt;&#39;&amp;");
  const out = html(newCard({ entity: "remote.living_room_apple_tv", title: "<b>TV</b>" }));
  assert.match(out, /&lt;b&gt;TV&lt;\/b&gt;/);
});

test("illustrated header: the screen and the icon follow the state, the box follows the integration, day or night", () => {
  const atv = html(newCard({ entity: "remote.living_room_apple_tv" }));
  assert.match(atv, /class="banner s-play"/);
  assert.match(atv, /<div class="rc-strip"><\/div>/);
  assert.match(atv, /<image href="data:image\/svg\+xml/, "the artwork on the screen");
  assert.match(atv, /class="rc-box" x="151" y="70.5"/, "the Apple TV box");
  assert.match(atv, /class="type-icon">/, "the icon in the active colour");
  assert.match(atv, /class="hbtns"><button class="key power on"/);
  const off = html(newCard({ entity: "remote.bedroom_tv_remote" }, makeHass({ "media_player.bedroom_tv": { state: "off" } })));
  assert.match(off, /class="banner s-off"/);
  assert.match(off, /class="type-icon off"/);
  assert.doesNotMatch(off, /class="rc-glow"/);
  const philips = html(newCard({ entity: "remote.bedroom_tv_remote" }));
  assert.match(philips, /class="rc-amb"/, "Ambilight on a Philips TV");
  assert.match(html(newCard({ entity: "remote.kitchen_roku" })), /class="rc-tile sel"/, "the home screen when on and idle");
  assert.match(html(newCard({ entity: "media_player.attic_fire_tv" })), /class="rc-paused"/);
  assert.match(html(newCard({ entity: "remote.den_samsung" }, makeHass({ "media_player.den_samsung": { state: "buffering" } }))), /class="type-icon warn"[\s\S]*class="pill warn" title="Buffering"/);
  assert.match(html(newCard({ entity: "media_player.lounge_lg" }, makeHass({ "media_player.lounge_lg": { state: "unavailable" } }))), /class="type-icon alert"/);
  // Night: forced, else the sun below the horizon or the dark theme (even with the sun up).
  assert.match(html(newCard({ entity: "remote.kitchen_roku", illustration_theme: "night" })), /class="banner s-on night"/);
  assert.match(html(newCard({ entity: "remote.kitchen_roku" }, makeHass({ "sun.sun": { state: "below_horizon" } }))), /class="banner[^"]* night"/);
  assert.doesNotMatch(html(newCard({ entity: "remote.kitchen_roku", illustration_theme: "day" }, makeHass({}, { themes: { darkMode: true } }))), /class="banner[^"]* night"/);
  const sunUp = { "sun.sun": { state: "above_horizon" } };
  assert.match(html(newCard({ entity: "remote.kitchen_roku" }, makeHass(sunUp, { themes: { darkMode: true } }))), /class="banner[^"]* night"/);
  assert.doesNotMatch(html(newCard({ entity: "remote.kitchen_roku" }, makeHass(sunUp, { themes: { darkMode: false } }))), /class="banner[^"]* night"/);
  assert.doesNotMatch(html(newCard({ entity: "remote.kitchen_roku", illustration_theme: "day" }, makeHass(sunUp, { themes: { darkMode: true } }))), /class="banner[^"]* night"/);
  assert.match(html(newCard({ entity: "remote.kitchen_roku", illustration_theme: "night" }, makeHass(sunUp, { themes: { darkMode: false } }))), /class="banner[^"]* night"/);
  // Each card its own ids; illustration: false keeps the classic header.
  const a = html(newCard({ entity: "remote.kitchen_roku" }));
  const b = html(newCard({ entity: "remote.kitchen_roku" }));
  assert.notEqual(a.match(/id="rc-clip-(\d+)"/)[1], b.match(/id="rc-clip-(\d+)"/)[1]);
  const classic = html(newCard({ entity: "remote.kitchen_roku", illustration: false }));
  assert.match(classic, /<div class="header[^"]*"><span class="type-icon">/);
  assert.match(classic, /<div class="hbtns"><button class="key power/);
  assert.doesNotMatch(classic, /class="banner|rc-scene|\.rc-strip/);
  // The mini card has the same banner, its detail button beside power.
  const mini = html(newCard({ entity: "remote.kitchen_roku" }, makeHass(), rc.RemoteMiniCard));
  assert.match(mini, /class="banner s-on two"/);
  assert.match(mini, /class="hbtns">[\s\S]*class="zoom"/);
});

// A measured layout stand-in for _fitPill: the title block (.titles) with its row (title + pill) in a banner whose
// ground strip starts at 80 px. Widths in px; `tall` makes the block run past the strip once the pill drops.
const fitLayout = ({ title, pill, row, tall = false, banner = true }) => {
  const rect = (o) => ({ top: 0, bottom: 0, left: 0, right: 0, width: 0, height: 0, ...o });
  const classes = new Set();
  const name = { textContent: "x", width: title, getClientRects: () => [1] };
  const chip = { getBoundingClientRect: () => rect({ width: classes.has("pill-dot") ? 14 : pill }) };
  const trow = { querySelector: (s) => (s.includes(".name") ? name : chip), getBoundingClientRect: () => rect({ width: row }) };
  const ground = { getBoundingClientRect: () => rect({ top: 80 }) };
  const box = { getBoundingClientRect: () => rect({ top: 0, bottom: 90 }), querySelector: () => ground };
  const t = {
    classList: {
      add: (c) => classes.add(c),
      remove: (...c) => {
        for (const x of c) classes.delete(x);
      },
    },
    querySelector: () => trow,
    closest: () => (banner ? box : null),
    getBoundingClientRect: () => rect({ top: 10, bottom: classes.has("below") && tall ? 86 : 70, width: row }),
  };
  return { t, classes };
};

test("the status pill stays beside a whole title, else drops under the subtitle, else keeps its dot (measured)", () => {
  const w = rc.window;
  w.getComputedStyle = () => ({ columnGap: "8px" });
  w.document.createRange = () => {
    let el;
    return { selectNodeContents: (e) => (el = e), getBoundingClientRect: () => ({ width: el.width }) };
  };
  const fit = (opts) => {
    const card = newCard({ entity: "remote.kitchen_roku" });
    const l = fitLayout(opts);
    card.shadowRoot.querySelectorAll = () => [l.t];
    card._fitPill();
    return [...l.classes].sort().join(" ");
  };
  // Whole title + gap + whole pill fit on the row: the pill stays beside the title.
  assert.equal(fit({ title: 60, pill: 70, row: 140 }), "");
  // One pixel short: never an ellipsised title beside the pill, the pill goes under the subtitle.
  assert.equal(fit({ title: 63, pill: 70, row: 140 }), "below");
  // Long Greek/Cyrillic/German labels: decided by the measure, not by a fixed width.
  assert.equal(fit({ title: 40, pill: 130, row: 160 }), "below");
  assert.equal(fit({ title: 40, pill: 112, row: 160 }), "");
  // Under the subtitle but the block would run into the ground strip, or the label is wider than the line: dot only.
  assert.equal(fit({ title: 90, pill: 70, row: 140, tall: true }), "below pill-dot");
  assert.equal(fit({ title: 90, pill: 150, row: 140 }), "below pill-dot");
  // The classic header (no banner) follows the same rule.
  assert.equal(fit({ title: 90, pill: 70, row: 140, banner: false }), "below");
  delete w.getComputedStyle;
  delete w.document.createRange;
});

test("no fixed width decides the pill's place: only the dot-only rule at 200 px is a width rule", () => {
  const css = (newCard({ entity: "remote.kitchen_roku" })).shadowRoot.innerHTML;
  assert.doesNotMatch(css, /@container rc-head/);
  assert.match(css, /\.titles\.below \.trow \{ display: contents; \}/);
  assert.match(css, /\.titles\.pill-dot \.pill \.t \{ position: absolute;/);
  assert.match(css, /@container rc-card \(max-width: 200px\) \{ \.pill \{ padding: 4px; \} \.pill \.t \{ position: absolute;/);
});
