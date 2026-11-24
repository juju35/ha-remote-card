// ---------------------------------------------------------------------------
// Integrations: how each key is sent
// ---------------------------------------------------------------------------

// A key is sent as one of:
//   "Command" or ["A", "B"]          remote.send_command on the remote entity
//   { mp: "service" }                media_player.<service> on the media player (shown only when the player supports it)
//   { call: "domain.service", data } a service of the integration on the media player (webostv.button, kodi.call_method…);
//                                    with `target: false` it is sent without entity (freebox_player.remote)
//   POWER / MUTE                     turned on or off (muted or not) from the current state
//   null                             the integration has no such key: the key is hidden
export const POWER = { power: true };
export const MUTE = { mute: true };
export const MP = (mp) => ({ mp });
export const call = (service, data, extra = {}) => ({ call: service, data, ...extra });

export const NAV = ["up", "down", "left", "right", "ok", "back", "home", "menu"];
export const VOL = ["volume_up", "volume_down", "mute"];
export const CH = ["channel_up", "channel_down"];
export const TRANSPORT = ["play_pause", "previous", "next"];
export const ALL_BUT_POWER = [...NAV, ...VOL, ...CH, ...TRANSPORT];
export const KEYS = ["power", ...ALL_BUT_POWER];
// Keys sent again and again while held (long press).
export const REPEATABLE = new Set(["up", "down", "left", "right", "volume_up", "volume_down", "channel_up", "channel_down"]);
export const DPAD = new Set(["up", "down", "left", "right", "ok"]);

// Media player keys every integration falls back to.
export const MEDIA = {
  power: POWER,
  volume_up: MP("volume_up"),
  volume_down: MP("volume_down"),
  mute: MUTE,
  play_pause: MP("media_play_pause"),
  previous: MP("media_previous_track"),
  next: MP("media_next_track"),
};

export const fromList = (keys, values) => Object.fromEntries(keys.map((k, i) => [k, values[i] ?? null]));
// The values are given in the order of ALL_BUT_POWER: navigation, volume, channels, transport.
export const remoteKeys = (values) => ({ power: POWER, ...fromList(ALL_BUT_POWER, values) });
export const serviceKeys = (service, field, values, extra) => ({
  ...MEDIA,
  ...Object.fromEntries(ALL_BUT_POWER.map((k, i) => [k, typeof values[i] === "string" ? call(service, { [field]: values[i] }, extra) : (values[i] ?? null)])),
});

export const INTEGRATIONS = {
  apple_tv: {
    name: "Apple TV",
    logo: "__IMG_FILE:apple_tv.png__",
    keys: remoteKeys([
      ...["up", "down", "left", "right", "select", "menu", "home", "top_menu"],
      // No mute command on the Siri Remote: through the media player, when it supports it.
      ...["volume_up", "volume_down", MUTE],
      // The Siri Remote has no channel keys (pyatv's channel_up / channel_down can be set with `commands`).
      ...[null, null],
      ...["play_pause", "previous", "next"],
    ]),
  },
  androidtv_remote: {
    name: "Android TV",
    logo: "__IMG_FILE:androidtv.png__",
    keys: remoteKeys([
      ...["DPAD_UP", "DPAD_DOWN", "DPAD_LEFT", "DPAD_RIGHT", "DPAD_CENTER", "BACK", "HOME", "MENU"],
      ...["VOLUME_UP", "VOLUME_DOWN", "VOLUME_MUTE"],
      ...["CHANNEL_UP", "CHANNEL_DOWN"],
      ...["MEDIA_PLAY_PAUSE", "MEDIA_PREVIOUS", "MEDIA_NEXT"],
    ]),
  },
  philips_js: {
    name: "Philips TV",
    logo: "__IMG_FILE:philips.png__",
    keys: remoteKeys([
      ...["CursorUp", "CursorDown", "CursorLeft", "CursorRight", "Confirm", "Back", "Home", "Options"],
      ...["VolumeUp", "VolumeDown", "Mute"],
      ...["ChannelStepUp", "ChannelStepDown"],
      ...["PlayPause", "Previous", "Next"],
    ]),
  },
  samsungtv: {
    name: "Samsung TV",
    logo: "__IMG_FILE:samsung.png__",
    keys: remoteKeys([
      ...["KEY_UP", "KEY_DOWN", "KEY_LEFT", "KEY_RIGHT", "KEY_ENTER", "KEY_RETURN", "KEY_HOME", "KEY_MENU"],
      ...["KEY_VOLUP", "KEY_VOLDOWN", "KEY_MUTE"],
      ...["KEY_CHUP", "KEY_CHDOWN"],
      ...[MP("media_play_pause"), MP("media_previous_track"), MP("media_next_track")],
    ]),
  },
  webostv: {
    name: "LG webOS TV",
    logo: "__IMG_FILE:webostv.png__",
    keys: serviceKeys("webostv.button", "button", [
      ...["UP", "DOWN", "LEFT", "RIGHT", "ENTER", "BACK", "HOME", "MENU"],
      ...["VOLUMEUP", "VOLUMEDOWN", "MUTE"],
      ...["CHANNELUP", "CHANNELDOWN"],
      ...[MP("media_play_pause"), MP("media_previous_track"), MP("media_next_track")],
    ]),
  },
  roku: {
    name: "Roku",
    logo: "__IMG_FILE:roku.png__",
    keys: remoteKeys([
      ...["up", "down", "left", "right", "select", "back", "home", "info"],
      ...["volume_up", "volume_down", "volume_mute"],
      ...["channel_up", "channel_down"],
      ...["play", MP("media_previous_track"), MP("media_next_track")],
    ]),
  },
  androidtv: {
    name: "Fire TV / Android (ADB)",
    logo: "__IMG_FILE:amazon.png__",
    keys: serviceKeys("androidtv.adb_command", "command", [
      ...["UP", "DOWN", "LEFT", "RIGHT", "CENTER", "BACK", "HOME", "MENU"],
      ...["VOLUME_UP", "VOLUME_DOWN", "MUTE"],
      ...["input keyevent 166", "input keyevent 167"],
      ...[MP("media_play_pause"), MP("media_previous_track"), MP("media_next_track")],
    ]),
  },
  // Freebox Player (Révolution, Delta, mini 4K…) through the freebox_player custom integration, which has no entity:
  // its service freebox_player.remote sends the network remote's codes. The Pop is an Android TV (androidtv_remote).
  freebox_player: {
    name: "Freebox Player",
    logo: "__IMG_FILE:freebox.png__",
    standalone: true,
    keys: {
      ...serviceKeys(
        "freebox_player.remote",
        "code",
        [
          ...["up", "down", "left", "right", "ok", "back", "home", "options"],
          ...["vol_inc", "vol_dec", "mute"],
          ...["prgm_inc", "prgm_dec"],
          ...["play", "prev", "next"],
        ],
        { target: false },
      ),
      power: call("freebox_player.remote", { code: "power" }, { target: false }),
    },
  },
  kodi: {
    name: "Kodi",
    logo: "__IMG_FILE:kodi.png__",
    keys: serviceKeys("kodi.call_method", "method", [
      ...["Input.Up", "Input.Down", "Input.Left", "Input.Right", "Input.Select", "Input.Back", "Input.Home", "Input.ContextMenu"],
      ...[MP("volume_up"), MP("volume_down"), MUTE],
      ...[null, null],
      ...[MP("media_play_pause"), MP("media_previous_track"), MP("media_next_track")],
    ]),
  },
  generic: {
    name: "",
    keys: { ...fromList(KEYS, []), ...MEDIA },
  },
};

// The integration's brand logo, inlined by scripts/build.mjs (a 36 px PNG from images/badges/); none when unbuilt.
export const logoOf = (integration) => {
  const logo = INTEGRATIONS[integration]?.logo || "";
  return logo.startsWith("data:image/") ? logo : "";
};

// media_player supported_features bits.
export const F = { PAUSE: 1, VOLUME_SET: 4, VOLUME_MUTE: 8, PREVIOUS: 16, NEXT: 32, TURN_ON: 128, TURN_OFF: 256, VOLUME_STEP: 1024, SELECT_SOURCE: 2048, PLAY: 16384 };
export const MP_FEATURE = {
  volume_up: F.VOLUME_STEP | F.VOLUME_SET,
  volume_down: F.VOLUME_STEP | F.VOLUME_SET,
  media_play_pause: F.PAUSE | F.PLAY,
  media_previous_track: F.PREVIOUS,
  media_next_track: F.NEXT,
};

export const REPEAT_DELAY_MS = 450;
export const REPEAT_EVERY_MS = 180;
export const SWIPE_PX = 28;
export const OFF_STATES = new Set(["off", "standby", "unavailable", "unknown"]);
