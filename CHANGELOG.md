# Changelog

## 1.0.0 - 2026-11-14

### Features
- **Remote Card** (`custom:remote-card`): a TV and streaming box remote with a header showing the device name, what is playing (app · title, dancing bars while it plays, progress bar) and the power key (outlined in the accent color while on); a large round D-pad with OK; back, home and menu; a volume rocker with mute and a channel rocker when the TV has channels; play / pause, previous and next; a popup at the top of the card with app shortcuts (`apps`: a source, an Android TV activity, a remote command or any action) and the player's sources.
- **Remote Mini Card** (`custom:remote-mini-card`): power, what is playing (artwork, title, progress), play / pause and volume, with a detail button that unfolds the full remote and folds back on a click elsewhere.
- Integrations: **Apple TV**, **Android TV Remote**, **Philips TV**, **Samsung Smart TV**, **LG webOS TV**, **Roku**, **Android Debug Bridge** (Fire TV), **Freebox Player** (custom `freebox_player`, no entity) and **Kodi**, detected from the platform of the remote or the player of the same device; any other media player gets its media keys. `commands` remaps or hides any key (YAML only).
- Long press repeats the direction, volume and channel keys, keys are sent on the press, optional swipe gestures on the D-pad, haptic feedback; keys the TV or its player does not support are hidden.
- Visual editor for both cards, Sections view sizes, narrow layouts, light and dark themes, `prefers-reduced-motion`, keyboard navigation, 22 languages (English in the bundle, the others loaded on demand).
