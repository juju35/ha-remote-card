# Changelog

## 1.2.1 - 2026-11-22

### Performance
- Card picker: the cards no longer ask Home Assistant for a live preview (`preview: false` in `window.customCards`). The picker drew every card at once (history requests, animations), which made the list slow to open; it now shows each card's description instead.

## 1.2.0 - 2026-11-20

### Features
- The header's round icon carries the brand logo of the integration (Apple TV, Android TV, Philips, Samsung, LG webOS, Roku, Fire TV, Freebox, Kodi) as an 18 px white badge at its bottom right, in the full and the mini card.
- The status pill sits at the right of the header, on the title's line (under the subtitle when the title would be cut, as before).
- Without `entity`, the card takes the first TV remote (as the visual editor proposes) instead of showing an error.

### Fixes
- Illustrated header: the picture takes less of the width (44 % of the card, at most 220 px), so the title is less often cut at around 400 px.
- With swipe gestures, a press on the D-pad cancelled by the browser (`pointercancel`) or still held when the card leaves the page no longer sends the key under the finger.

### Performance
- The media player (or remote) of the same device is found from an index of the entity registry built once per registry change, instead of walking the whole registry on every state change of the instance.

### Maintenance
- The commitlint config is an ES module (the package is `"type": "module"`): the local `commit-msg` hook no longer crashes.

## 1.1.1 - 2026-11-18

### Fixes
- Illustrated header: `auto` now follows the Home Assistant theme alone — a light theme keeps the day picture after sunset, a dark theme still shows the night one.

## 1.1.0 - 2026-11-17

### Features
- Illustrated header on both cards (90 px): a living-room wall with the title on the left, the TV on its stand with the integration's box (Apple TV, SHIELD, Chromecast, Fire TV, Roku, Freebox Player, Kodi box) and its remote standing on a shelf strip running edge to edge; Philips TVs glow with Ambilight. The screen tells the state: dark with a red standby light when off, the home screen when on, the artwork (or a panning picture) with its progress while playing, a pause sign when paused. The header icon's colour follows the state (blue on, grey off, amber buffering, red unavailable).
- Day and night pictures night after sunset (`sun.sun`) or with the dark theme, forced with `illustration_theme: day | night`; `illustration: false` keeps the classic header. Both options are in the visual editors, translated in the 22 languages; animations honour `prefers-reduced-motion`.
- **Status pill** right after the title on both cards (illustration on and off): a dot and the state (Playing, Paused, On, Off, Buffering, Unavailable…) in the colour of the header icon; the subtitle no longer repeats the state. It stays beside the title only while the whole title and the pill's whole label fit on that row (measured in the real fonts, so in every language); otherwise it takes its own line under a one-line subtitle, and keeps only its dot when even that would not fit above the ground strip or on a card of 200 px or less.
- The header's power and expand / collapse buttons are 24 px frosted rounds on one line in the top right corner (the detail button last), on the banner and on the classic header, instead of larger buttons in the middle of the header.

### Fixes
- Night picture with the dark theme even while the sun is up (`illustration_theme: auto`): the header is night when `sun.sun` is below the horizon or Home Assistant's theme is dark; `day` / `night` still force it.

## 1.0.0 - 2026-11-14

### Features
- **Remote Card** (`custom:remote-card`): a TV and streaming box remote with a header showing the device name, what is playing (app · title, dancing bars while it plays, progress bar) and the power key (outlined in the accent color while on); a large round D-pad with OK; back, home and menu; a volume rocker with mute and a channel rocker when the TV has channels; play / pause, previous and next; a popup at the top of the card with app shortcuts (`apps`: a source, an Android TV activity, a remote command or any action) and the player's sources.
- **Remote Mini Card** (`custom:remote-mini-card`): power, what is playing (artwork, title, progress), play / pause and volume, with a detail button that unfolds the full remote and folds back on a click elsewhere.
- Integrations: **Apple TV**, **Android TV Remote**, **Philips TV**, **Samsung Smart TV**, **LG webOS TV**, **Roku**, **Android Debug Bridge** (Fire TV), **Freebox Player** (custom `freebox_player`, no entity) and **Kodi**, detected from the platform of the remote or the player of the same device; any other media player gets its media keys. `commands` remaps or hides any key (YAML only).
- Long press repeats the direction, volume and channel keys, keys are sent on the press, optional swipe gestures on the D-pad, haptic feedback; keys the TV or its player does not support are hidden.
- Visual editor for both cards, Sections view sizes, narrow layouts, light and dark themes, `prefers-reduced-motion`, keyboard navigation, 22 languages (English in the bundle, the others loaded on demand).
