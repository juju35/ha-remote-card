// Mock Home Assistant registries and states for the screenshots and the tests: neutral names, no real home.
// Shaped like the real integrations: a remote and a media player on the same device (Apple TV, Philips TV, Android TV
// Remote, Samsung, Roku), or a media player alone (LG webOS, Android Debug Bridge, Kodi).
export const NOW = Date.parse("2026-11-14T20:30:00Z");
const iso = (ms) => new Date(ms).toISOString();

// A 400×400 poster drawn in SVG, standing for the artwork of the media playing.
const poster = (a, b) =>
  `data:image/svg+xml;base64,${Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><rect width="40" height="40" fill="url(#g)"/><circle cx="28" cy="13" r="6" fill="#fff" fill-opacity=".55"/><path d="M0 34 L12 20 L22 30 L28 24 L40 36 V40 H0Z" fill="#000" fill-opacity=".28"/></svg>`,
  ).toString("base64")}`;
export const POSTER = poster("#5b4bdb", "#e0567a");

const SOURCES_APPLE = ["App Store", "Apple TV", "Arcade", "Music", "Netflix", "Photos", "Plex", "Podcasts", "Prime Video", "Settings", "YouTube"];
const SOURCES_PHILIPS = ["Watch TV", "HDMI 1", "HDMI 2", "HDMI 3", "Netflix", "YouTube", "Media"];

// [entity_id, platform, device, state, attributes]
const LIST = [
  ["remote.living_room_apple_tv", "apple_tv", "dev_atv", "on", { friendly_name: "Living Room Apple TV", supported_features: 0 }],
  [
    "media_player.living_room_apple_tv",
    "apple_tv",
    "dev_atv",
    "playing",
    {
      friendly_name: "Living Room Apple TV",
      supported_features: 450487,
      source_list: SOURCES_APPLE,
      app_name: "Plex",
      app_id: "com.plexapp.plex",
      media_content_type: "video",
      media_title: "The Northern Lights",
      media_artist: "Nature Documentaries",
      media_duration: 3120,
      media_position: 1270,
      media_position_updated_at: iso(NOW - 20e3),
      entity_picture: POSTER,
      volume_level: 0.42,
    },
  ],
  ["remote.bedroom_tv_remote", "philips_js", "dev_philips", "on", { friendly_name: "Bedroom TV Remote", supported_features: 0 }],
  [
    "media_player.bedroom_tv",
    "philips_js",
    "dev_philips",
    "on",
    {
      friendly_name: "Bedroom TV",
      device_class: "tv",
      supported_features: 155453,
      source_list: SOURCES_PHILIPS,
      source: "Watch TV",
      media_channel: "News 24",
      media_title: "News 24",
      media_content_type: "channel",
      volume_level: 0.18,
      is_volume_muted: false,
    },
  ],
  ["remote.office_shield", "androidtv_remote", "dev_shield", "on", { friendly_name: "Office Shield", supported_features: 4, current_activity: "com.google.android.youtube.tv" }],
  [
    "media_player.office_shield",
    "androidtv_remote",
    "dev_shield",
    "on",
    { friendly_name: "Office Shield", supported_features: 152461, app_id: "com.google.android.youtube.tv", app_name: "YouTube", is_volume_muted: false, volume_level: 0.3 },
  ],
  ["remote.kitchen_roku", "roku", "dev_roku", "on", { friendly_name: "Kitchen Roku", supported_features: 0 }],
  ["media_player.kitchen_roku", "roku", "dev_roku", "idle", { friendly_name: "Kitchen Roku", supported_features: 23997, source_list: ["Home", "Netflix", "YouTube"], source: "Home" }],
  ["remote.den_samsung", "samsungtv", "dev_samsung", "on", { friendly_name: "Den TV", supported_features: 0 }],
  ["media_player.den_samsung", "samsungtv", "dev_samsung", "on", { friendly_name: "Den TV", device_class: "tv", supported_features: 20413, source_list: ["TV", "HDMI"], source: "TV" }],
  ["media_player.lounge_lg", "webostv", "dev_lg", "on", { friendly_name: "Lounge TV", device_class: "tv", supported_features: 24509, source_list: ["Live TV", "HDMI 1", "Netflix"], source: "Live TV", is_volume_muted: true }],
  ["media_player.attic_fire_tv", "androidtv", "dev_fire", "paused", { friendly_name: "Attic Fire TV", supported_features: 21437, app_name: "Prime Video", source_list: ["Prime Video", "Netflix"] }],
  ["media_player.studio_kodi", "kodi", "dev_kodi", "playing", { friendly_name: "Studio Kodi", supported_features: 155359, media_title: "Morning Jazz", media_artist: "Studio Band", is_volume_muted: false }],
];

export const states = Object.fromEntries(
  LIST.map(([id, , , state, attributes]) => [id, { entity_id: id, state, attributes, last_changed: iso(NOW - 3600e3), last_updated: iso(NOW - 20e3) }]),
);
export const entities = Object.fromEntries(LIST.map(([id, platform, device_id]) => [id, { entity_id: id, platform, device_id }]));

const DEVICES = {
  dev_atv: ["Living Room Apple TV", "Apple", "Apple TV 4K"],
  dev_philips: ["Bedroom TV", "Philips", "55PUS7000"],
  dev_shield: ["Office Shield", "NVIDIA", "SHIELD Android TV"],
  dev_roku: ["Kitchen Roku", "Roku", "Express"],
  dev_samsung: ["Den TV", "Samsung", "UE50"],
  dev_lg: ["Lounge TV", "LG", "OLED"],
  dev_fire: ["Attic Fire TV", "Amazon", "Fire TV Stick"],
  dev_kodi: ["Studio Kodi", "Kodi", ""],
};
export const devices = Object.fromEntries(Object.entries(DEVICES).map(([id, [name, manufacturer, model]]) => [id, { id, name, manufacturer, model }]));

export const APPS = [
  { name: "YouTube", icon: "mdi:youtube", source: "YouTube" },
  { name: "Netflix", icon: "mdi:netflix", source: "Netflix" },
  { name: "Plex", icon: "mdi:plex", source: "Plex" },
  { name: "Music", icon: "mdi:music", source: "Music" },
];
