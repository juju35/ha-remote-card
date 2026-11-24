// ---------------------------------------------------------------------------
// Visual editors (ha-form)
// ---------------------------------------------------------------------------
import { INTEGRATIONS } from "./integrations.js";
import { lang, t } from "./helpers.js";
import { sameDeps } from "./styles.js";

export const LANGUAGES = [
  ["en", "English"],
  ["fr", "Français"],
  ["de", "Deutsch"],
  ["es", "Español"],
  ["it", "Italiano"],
  ["nl", "Nederlands"],
  ["pt", "Português (Portugal)"],
  ["pl", "Polski"],
  ["sr", "Српски"],
  ["sr-Latn", "Srpski (latinica)"],
  ["ro", "Română"],
  ["da", "Dansk"],
  ["sv", "Svenska"],
  ["bg", "Български"],
  ["ru", "Русский"],
  ["uk", "Українська"],
  ["hu", "Magyar"],
  ["sk", "Slovenčina"],
  ["cs", "Čeština"],
  ["sl", "Slovenščina"],
  ["lv", "Latviešu"],
  ["el", "Ελληνικά"],
];

// [name, default] of the switches of the full card's editor.
export const TOGGLES = [
  ["illustration", true],
  ["show_title", true],
  ["show_subtitle", true],
  ["show_power", true],
  ["show_volume", true],
  ["show_channels", true],
  ["show_transport", true],
  ["show_sources", true],
  ["show_apps", true],
  ["haptic", true],
  ["repeat", true],
  ["swipe", false],
];

// The illustration's day / night choice; "auto" follows Home Assistant's theme alone (night with a dark theme).
export const THEMES = ["auto", "day", "night"];

// Keeps the YAML minimal: drops empty values and options left at their default.
export const cleanConfig = (value, defaults) => {
  const config = { ...value };
  for (const [k, v] of Object.entries(config)) {
    if (v === "" || v === undefined || v === null || (k in defaults && JSON.stringify(v) === JSON.stringify(defaults[k]))) delete config[k];
  }
  return config;
};

export class RemoteCardEditor extends HTMLElement {
  static get toggles() {
    return TOGGLES;
  }

  setConfig(config) {
    this._config = { ...config };
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  _schema() {
    const tr = (k) => t(this._hass, this._config, k);
    const integrations = Object.entries(INTEGRATIONS)
      .filter(([k]) => k !== "generic")
      .map(([value, i]) => ({ value, label: i.name }));
    return [
      { name: "entity", selector: { entity: { domain: ["remote", "media_player"] } } },
      { name: "media_player", selector: { entity: { domain: "media_player" } } },
      {
        name: "integration",
        selector: { select: { mode: "dropdown", options: [{ value: "", label: tr("integration_auto") }, ...integrations, { value: "generic", label: tr("integration_generic") }] } },
      },
      { name: "title", selector: { text: {} } },
      { name: "illustration_theme", selector: { select: { mode: "dropdown", options: THEMES.map((v) => ({ value: v, label: tr(`theme_${v}`) })) } } },
      { type: "grid", name: "", schema: this.constructor.toggles.map(([name]) => ({ name, selector: { boolean: {} } })) },
      {
        name: "language",
        selector: { select: { mode: "dropdown", options: [{ value: "", label: tr("lang_auto") }, ...LANGUAGES.map(([value, label]) => ({ value, label }))] } },
      },
    ];
  }

  _render() {
    if (!this._hass || !this._config) return;
    const toggles = this.constructor.toggles;
    const defaults = { ...Object.fromEntries(toggles), illustration_theme: "auto" };
    if (!this._form) {
      this._form = document.createElement("ha-form");
      this._form.computeLabel = (s) => t(this._hass, this._config, s.name);
      this._form.computeHelper = (s) => (["entity", "media_player", "swipe", "zoom"].includes(s.name) ? t(this._hass, this._config, `${s.name}_helper`) : undefined);
      this._form.addEventListener("value-changed", (ev) => {
        ev.stopPropagation();
        this._config = cleanConfig(ev.detail.value, defaults);
        this.dispatchEvent(new CustomEvent("config-changed", { detail: { config: this._config }, bubbles: true, composed: true }));
      });
      this.appendChild(this._form);
    }
    const data = { ...this._config };
    for (const [name, def] of Object.entries(defaults)) if (data[name] === undefined) data[name] = def;
    this._form.hass = this._hass;
    if (!sameDeps(this._dataDeps, [this._config])) {
      this._dataDeps = [this._config];
      this._form.data = data;
    }
    const deps = [lang(this._hass, this._config)];
    if (!sameDeps(this._schemaDeps, deps)) {
      this._schemaDeps = deps;
      this._form.schema = this._schema();
    }
  }
}

// The full card's options, which the unfolded mini card uses, and the detail button.
export class RemoteMiniCardEditor extends RemoteCardEditor {
  static get toggles() {
    return [...TOGGLES, ["zoom", true]];
  }
}
