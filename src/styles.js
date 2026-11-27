// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

export const BASE_STYLE = `
  /* Accent blue-grey; its lighter tint carries icons, text, rings and bars on a dark theme. */
  :host { --rc-accent: #546e7a; --rc-accent-light: #90a4ae; --rc-fg: var(--rc-accent);
          --rc-idle: var(--secondary-text-color, #9e9e9e);
          --rc-glass: color-mix(in srgb, var(--primary-text-color) 3%, transparent);
          --rc-glass-hover: color-mix(in srgb, var(--primary-text-color) 7%, transparent);
          --rc-ring: color-mix(in srgb, var(--rc-fg) 75%, transparent);
          --rc-line: color-mix(in srgb, var(--primary-text-color) 14%, transparent);
          --rc-accent-text: var(--rc-fg); }
  ha-card.dark { --rc-fg: var(--rc-accent-light); }
  /* Resolved on the card, so that they follow its --rc-fg. */
  ha-card { --rc-accent-text: var(--rc-fg); --rc-ring: color-mix(in srgb, var(--rc-fg) 75%, transparent); }
  :host { display: block; min-width: 0; --rc-natural-width: 360px; }
  :host::before { content: ""; display: grid; grid-template-columns: minmax(0, var(--rc-natural-width)); height: 0; }
  ha-card { overflow: hidden; container: rc-card / inline-size; position: relative; }
  .icon { width: 20px; height: 20px; fill: currentColor; flex: none; }
  [role="button"] { cursor: pointer; }
  [role="button"]:focus-visible, button:focus-visible { outline: 2px solid var(--primary-color, var(--rc-accent)); outline-offset: 2px; }
  @media (prefers-reduced-motion: reduce) { *, *::before, *::after { transition: none !important; animation: none !important; } }
  .header { display: flex; align-items: center; gap: 10px; padding: 12px 12px 0; }
  .titles { flex: 1 1 0; min-width: 5ch; border-radius: 6px; }
  .name { font-size: 16px; font-weight: 500; line-height: 1.25; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .sub { font-size: 12px; line-height: 1.4; color: var(--secondary-text-color); white-space: nowrap; overflow: hidden; display: flex; align-items: center; gap: 6px; }
  .sub span { min-width: 0; overflow: hidden; text-overflow: ellipsis; }
  .type-icon { display: flex; flex: none; width: 40px; height: 40px; border-radius: 50%; align-items: center; justify-content: center;
               background: color-mix(in srgb, var(--rc-fg) 18%, transparent); transition: background-color .2s ease; }
  .type-icon .icon { width: 24px; height: 24px; fill: var(--rc-fg); transition: fill .2s ease; }
  /* The brand logo: an 18 px white badge at the bottom right of the pastille, ringed with the card's background. */
  .type-icon { position: relative; }
  .brand-badge { position: absolute; right: -3px; bottom: -3px; width: 18px; height: 18px; border-radius: 50%; background: #fff; overflow: hidden;
                 box-shadow: 0 0 0 1.5px var(--card-background-color, #fff), 0 1px 2px rgba(0,0,0,.25); display: grid; place-items: center; }
  .brand-badge img { width: 12px; height: 12px; object-fit: contain; display: block; }
  .type-icon.off { background: color-mix(in srgb, var(--rc-idle) 14%, transparent); }
  .type-icon.off .icon { fill: var(--secondary-text-color); }
  .type-icon.warn { background: color-mix(in srgb, var(--warning-color, #ffa600) 16%, transparent); }
  .type-icon.warn .icon { fill: var(--warning-color, #ffa600); }
  .type-icon.alert { background: color-mix(in srgb, var(--error-color, #db4437) 14%, transparent); }
  .type-icon.alert .icon { fill: var(--error-color, #db4437); }
  .warning { padding: 16px; color: color-mix(in srgb, var(--warning-color, #ffa600) 50%, var(--primary-text-color)); }
  /* Keys: outlined smoked glass, never filled; the accent marks an active state (on, muted, playing). */
  .key { all: unset; box-sizing: border-box; display: grid; place-items: center; cursor: pointer; color: var(--primary-text-color);
         background: transparent; border: 1px solid var(--rc-line); border-radius: 50%; width: 48px; height: 48px; flex: none;
         touch-action: manipulation; user-select: none; -webkit-user-select: none; -webkit-touch-callout: none; -webkit-tap-highlight-color: transparent;
         transition: background-color .15s ease, transform .1s ease, color .2s ease, border-color .2s ease; }
  .key:hover { background: var(--rc-glass-hover); }
  .key:active, .key.pressed { transform: scale(.93); color: var(--rc-accent-text); border-color: var(--rc-ring); }
  .key.on { color: var(--rc-accent-text); border-color: var(--rc-ring); }
  .key.small { width: 40px; height: 40px; }
  .key.power { width: 36px; height: 36px; }
  .key.power .icon { width: 18px; height: 18px; }
  .key.small .icon { width: 18px; height: 18px; }
  .key:focus-visible { outline: 2px solid var(--primary-color, var(--rc-accent)); outline-offset: 2px; }
  /* The header's buttons (power, detail): 24 px rounds on one line in the top right corner, the detail button last. */
  .hbtns { position: absolute; z-index: 2; top: 5px; right: 5px; display: flex; gap: 4px; }
  .hbtns .key.power, .hbtns .zoom { width: 24px; height: 24px; }
  .hbtns .key.power .icon, .hbtns .zoom .icon { width: 16px; height: 16px; }
  .header { position: relative; }
  .header .hbtns { top: 10px; right: 10px; }
  .header.one { padding-right: 40px; } .header.two { padding-right: 68px; }
  /* The status pill at the right of the header, on the title's line, while the title stays whole and the pill's whole
     label fits beside it; otherwise (measured by the card, see _fitPill) the pill on its own line under a one-line subtitle, and
     if even that would not fit in the header, its dot alone (the label stays in title and aria-label). */
  .titles { display: flex; flex-direction: column; }
  .trow { display: flex; align-items: center; gap: 8px; min-width: 0; }
  .trow .name { flex: 1 1 auto; min-width: 0; }
  .trow .pill { flex: none; max-width: none; margin-left: auto; }
  .titles.below { display: grid; grid-template-columns: minmax(0, 1fr); justify-items: start; }
  .titles.below .trow { display: contents; }
  .titles.below .name { max-width: 100%; }
  .titles.below > .sub { justify-self: stretch; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .titles.below .pill { grid-row: 3; max-width: 100%; margin-left: 0; }
  .titles.pill-dot .pill { padding: 4px; }
  .titles.pill-dot .pill .t { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); }
  .pill { --c: var(--rc-fg); flex: none; display: inline-flex; align-items: center; gap: 4px; padding: 1px 8px; border-radius: 12px; font-size: 11px; font-weight: 500;
          line-height: 16px; white-space: nowrap; box-sizing: border-box; max-width: calc(100% - 56px); overflow: hidden;
          background: color-mix(in srgb, var(--c) 15%, transparent); color: color-mix(in srgb, var(--c) 40%, var(--primary-text-color)); }
  .pill .t { min-width: 0; overflow: hidden; text-overflow: ellipsis; }
  .pill .dot { width: 6px; height: 6px; border-radius: 50%; background: var(--c); flex: none; }
  .pill.off { --c: var(--rc-idle); } .pill.warn { --c: var(--warning-color, #ffa600); } .pill.alert { --c: var(--error-color, #db4437); }
  @container rc-card (max-width: 200px) { .pill { padding: 4px; } .pill .t { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); } }
  .zoom { all: unset; box-sizing: border-box; flex: none; cursor: pointer; width: 36px; height: 36px; border-radius: 50%;
          display: grid; place-items: center; color: var(--secondary-text-color); background: transparent; border: 1px solid var(--rc-line);
          transition: background-color .15s ease, color .2s ease, border-color .2s ease; }
  .zoom .icon { width: 18px; height: 18px; }
  .zoom:hover { background: var(--rc-glass-hover); color: var(--primary-text-color); }
  .zoom[aria-pressed="true"] { color: var(--rc-accent-text); border-color: var(--rc-ring); }
  .zoom:focus-visible { outline: 2px solid var(--primary-color, var(--rc-accent)); outline-offset: 1px; }
  /* Three bars dance while playing. */
  .eq { display: inline-flex; align-items: flex-end; gap: 2px; height: 11px; flex: none; }
  .eq i { width: 3px; height: 100%; border-radius: 1px; background: var(--rc-fg); transform-origin: bottom; transform: scaleY(.35); }
  .eq.run i { animation: rc-eq .9s ease-in-out infinite; }
  .eq.run i:nth-child(2) { animation-delay: -.3s; animation-duration: .7s; }
  .eq.run i:nth-child(3) { animation-delay: -.6s; animation-duration: 1.1s; }
  @keyframes rc-eq { 0%, 100% { transform: scaleY(.3); } 50% { transform: scaleY(1); } }
  /* Progress of the media playing, moving on its own between two updates. */
  .track { height: 3px; border-radius: 2px; background: var(--rc-line); overflow: hidden; }
  .track > div { height: 100%; border-radius: 2px; background: var(--rc-fg); width: var(--from); }
  .track > div.run { animation: rc-progress var(--left) linear forwards; }
  @keyframes rc-progress { from { width: var(--from); } to { width: 100%; } }
  @container rc-card (max-width: 230px) {
    .header { gap: 6px; }
  }
`;

export const FULL_STYLE = `
  .progress { margin: 10px 12px 0; }
  .content { padding: 16px 12px 14px; display: flex; flex-direction: column; align-items: center; gap: 14px; }
  /* The D-pad: a ring with four chevrons and OK in the middle, sized to the card. */
  .dpad { position: relative; width: min(100%, 190px); aspect-ratio: 1; border-radius: 50%; flex: none;
          background: transparent; border: 1px solid var(--rc-line); box-sizing: border-box; }
  .dpad.swipe, .dpad.swipe .arrow, .dpad.swipe .ok { touch-action: none; }
  .dpad .arrow { all: unset; position: absolute; display: grid; place-items: center; cursor: pointer; color: var(--primary-text-color);
                 touch-action: manipulation; user-select: none; -webkit-user-select: none; -webkit-touch-callout: none; -webkit-tap-highlight-color: transparent;
                 border-radius: 50%; transition: background-color .15s ease; }
  .dpad .arrow .icon { width: 28px; height: 28px; transition: transform .1s ease, color .15s ease; }
  .dpad .arrow:hover { background: var(--rc-glass-hover); }
  .dpad .arrow:active .icon, .dpad .arrow.pressed .icon { transform: scale(.85); color: var(--rc-accent-text); }
  .dpad .arrow:focus-visible { outline: 2px solid var(--primary-color, var(--rc-accent)); outline-offset: -4px; }
  .dpad .up { top: 2%; left: 30%; width: 40%; height: 28%; }
  .dpad .down { bottom: 2%; left: 30%; width: 40%; height: 28%; }
  .dpad .left { left: 2%; top: 30%; width: 28%; height: 40%; }
  .dpad .right { right: 2%; top: 30%; width: 28%; height: 40%; }
  .dpad .ok { all: unset; position: absolute; left: 31%; top: 31%; width: 38%; height: 38%; border-radius: 50%; box-sizing: border-box;
              display: grid; place-items: center; cursor: pointer; font-size: 15px; font-weight: 600; letter-spacing: .04em;
              color: var(--primary-text-color); background: transparent; border: 1px solid var(--rc-line);
              touch-action: manipulation; user-select: none; -webkit-user-select: none; -webkit-touch-callout: none; -webkit-tap-highlight-color: transparent;
              transition: background-color .15s ease, transform .1s ease, color .15s ease, border-color .15s ease; }
  .dpad .ok:hover { background: var(--rc-glass-hover); }
  .dpad .ok:active, .dpad .ok.pressed { transform: scale(.94); color: var(--rc-accent-text); border-color: var(--rc-ring); }
  .dpad .ok:focus-visible { outline: 2px solid var(--primary-color, var(--rc-accent)); outline-offset: 2px; }
  .controls { display: flex; justify-content: center; align-items: center; flex-wrap: wrap; gap: 12px 16px; }
  .keys { display: flex; justify-content: center; gap: 8px; }
  /* Rockers: volume and channel, one outlined pill each. */
  .rocker { display: flex; align-items: center; gap: 0; padding: 0 2px; border-radius: 26px; border: 1px solid var(--rc-line); background: transparent; }
  .rocker .key { background: transparent; border-color: transparent; }
  .rocker .key:hover { background: var(--rc-glass-hover); }
  .rocker .key.on, .rocker .key.pressed { border-color: transparent; }
  .rocker .label { font-size: 11px; font-weight: 500; color: var(--secondary-text-color); letter-spacing: .05em; padding: 0 2px; min-width: 2ch; text-align: center; }
  .transport { display: flex; justify-content: center; align-items: center; gap: 10px; }
  .transport .sep { width: 1px; height: 24px; background: var(--rc-line); margin: 0 2px; }
  /* Popup at the top of the card: apps and sources. */
  .scrim { position: absolute; inset: 0; z-index: 2; background: color-mix(in srgb, var(--card-background-color, #fff) 45%, transparent); }
  .popup { position: absolute; top: 8px; left: 8px; right: 8px; z-index: 3; max-height: calc(100% - 16px); display: flex; flex-direction: column;
           background: var(--card-background-color, #fff); border: 1px solid var(--rc-line); border-radius: 14px;
           box-shadow: 0 8px 28px rgba(0,0,0,.22); overflow: hidden; }
  .popup-head { display: flex; align-items: center; gap: 8px; padding: 10px 10px 6px 14px; font-weight: 500; font-size: 14px; }
  .popup-head > .icon { color: var(--rc-accent-text); }
  .popup-head span { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .popup-body { overflow-y: auto; padding: 0 8px 10px; display: flex; flex-direction: column; gap: 6px; }
  .group-title { font-size: 11px; font-weight: 500; text-transform: uppercase; letter-spacing: .05em; color: var(--secondary-text-color); padding: 6px 6px 2px; }
  .apps { display: grid; grid-template-columns: repeat(auto-fill, minmax(96px, 1fr)); gap: 6px; }
  .app { all: unset; box-sizing: border-box; display: flex; align-items: center; gap: 8px; padding: 7px 10px; border-radius: 12px; cursor: pointer; min-width: 0;
         background: var(--rc-glass); border: 1px solid var(--rc-line); font-size: 13px; transition: background-color .15s ease; }
  .app:hover { background: var(--rc-glass-hover); }
  .app.on { border-color: var(--rc-ring); color: var(--rc-accent-text); }
  .app:focus-visible { outline: 2px solid var(--primary-color, var(--rc-accent)); outline-offset: 2px; }
  .app span { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .app ha-icon { --mdc-icon-size: 18px; width: 18px; height: 18px; flex: none; color: var(--rc-accent-text); }
  .app .initial { flex: none; width: 20px; height: 20px; border-radius: 50%; display: grid; place-items: center; font-size: 11px; font-weight: 600;
                  background: color-mix(in srgb, var(--rc-fg) 18%, transparent); color: var(--rc-accent-text); }
  .sources { display: flex; flex-direction: column; gap: 2px; }
  .source { all: unset; box-sizing: border-box; display: flex; align-items: center; gap: 10px; padding: 8px 10px; border-radius: 10px; cursor: pointer; font-size: 14px; }
  .source:hover { background: var(--rc-glass); }
  .source.on { color: var(--rc-accent-text); font-weight: 500; }
  .source .icon { width: 18px; height: 18px; margin-left: auto; }
  .source span { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .source:focus-visible { outline: 2px solid var(--primary-color, var(--rc-accent)); outline-offset: -2px; }
  @container rc-card (max-width: 280px) {
    .key { width: 44px; height: 44px; }
    .key.small { width: 40px; height: 40px; }
    .controls { gap: 10px; }
    .transport { gap: 6px; }
  }
`;

export const MINI_STYLE = `
  :host { --rc-natural-width: 300px; }
  .content { padding: 10px 12px 12px; display: flex; align-items: center; gap: 10px; }
  .now { flex: 1; display: flex; align-items: center; gap: 10px; min-width: 0; border-radius: 8px; }
  .art { flex: none; width: 40px; height: 40px; border-radius: 9px; overflow: hidden; display: grid; place-items: center;
         background: var(--rc-glass); border: 1px solid var(--rc-line); color: var(--secondary-text-color); box-sizing: border-box; }
  .art img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .art .icon { width: 20px; height: 20px; }
  .now-text { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
  .now-title { font-size: 13px; font-weight: 500; white-space: nowrap; overflow: hidden; display: flex; align-items: center; gap: 6px; }
  .now-title span, .now-sub { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .now-sub { font-size: 12px; color: var(--secondary-text-color); }
  .now .track { margin-top: 3px; }
  .mini-keys { display: flex; gap: 4px; flex: none; margin-left: auto; }
  .mini-keys .narrow-only { display: none; }
  @container rc-card (max-width: 250px) {
    .mini-keys .wide-only, .header .key.power, .hbtns .key.power { display: none; }
    .mini-keys .narrow-only { display: grid; }
    .art { display: none; }
    .banner.two .htext { right: 36px; }
    .header.two { padding-right: 40px; }
  }
`;

// ---------------------------------------------------------------------------
// "A click elsewhere" (closes the popup, brings the mini card back): caught on the pointer, as
// iOS sends no click for a tap on something not clickable. It counts when the press and the release are both outside
// the card; keyboard clicks go through the click event.
// ---------------------------------------------------------------------------

export const DIALOG_TAGS = new Set(["HA-MORE-INFO-DIALOG", "HA-DIALOG", "DIALOG"]);
export const isOutside = (card, ev) => {
  const path = ev.composedPath();
  return !path.includes(card) && !path.some((n) => DIALOG_TAGS.has(n.tagName));
};

export const watchOutside = (card, handler) => {
  let downOutside = false;
  const onDown = (ev) => {
    downOutside = isOutside(card, ev);
  };
  const onUp = (ev) => {
    if (downOutside && isOutside(card, ev)) handler(ev);
    downOutside = false;
  };
  const onClick = (ev) => {
    if (ev.detail === 0 && isOutside(card, ev)) handler(ev);
  };
  return {
    on() {
      document.addEventListener("pointerdown", onDown, true);
      document.addEventListener("pointerup", onUp, true);
      document.addEventListener("click", onClick, true);
    },
    tap(ev) {
      onDown(ev);
      onUp(ev);
    },
    off() {
      document.removeEventListener("pointerdown", onDown, true);
      document.removeEventListener("pointerup", onUp, true);
      document.removeEventListener("click", onClick, true);
    },
  };
};

export const sameDeps = (a, b) => !!a && a.length === b.length && a.every((d, i) => d === b[i]);
