// The README screenshots (PNG) and animations (GIF) rendered by scripts/screenshots.mjs.
// Every capture has a twin in the other theme ("-dark" for a light capture, "-light" for a dark one)
// that shows exactly the same state: only the theme differs (checked by test/screenshots.test.mjs).
import { APPS } from "./mock-states.mjs";

const pair = (file, type, width, config = {}, extra = {}, first = "light") => {
  const second = first === "light" ? "dark" : "light";
  return [
    { file, type, theme: first, width, config, ...extra },
    { file: `${file}-${second}`, type, theme: second, width, config, ...extra },
  ];
};

const ATV = { entity: "remote.living_room_apple_tv", apps: APPS };
const PHILIPS = { entity: "remote.bedroom_tv_remote" };
const POPUP = ".transport [data-action=popup]";

export const shots = [
  ...pair("card", "remote-card", 400, ATV),
  ...pair("card-philips", "remote-card", 400, PHILIPS, {}, "dark"),
  ...pair("card-popup", "remote-card", 400, ATV, { clicks: [POPUP] }),
  ...pair("card-android-tv", "remote-card", 400, { entity: "remote.office_shield" }, {}, "dark"),
  ...pair("mini-card", "remote-mini-card", 380, ATV),
  ...pair("mini-card-philips", "remote-mini-card", 380, PHILIPS, {}, "dark"),
  ...pair("mini-card-zoom", "remote-mini-card", 400, ATV, { clicks: [".zoom"] }),
  // Narrow cards: the full card at 6 of 12 columns of a phone's Sections view, the mini card at 3.
  ...pair("card-narrow", "remote-card", 238, PHILIPS),
  ...pair("mini-card-narrow", "remote-mini-card", 170, ATV),
];

// One looping GIF per distinct animation: while the TV plays, the three bars of the equalizer dance next to what is
// playing (and the progress bar moves on).
export const gifs = [...pair("playing", "remote-mini-card", 380, ATV)];
