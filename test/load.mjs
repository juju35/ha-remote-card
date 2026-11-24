// Evaluates the bundled card source (test/source.mjs) (a classic script, bundled as is by scripts/build.mjs) in a sandbox with minimal DOM
// stand-ins and returns the names the tests need. No dependency, no browser: the cards fall back to innerHTML when
// there is no <template> to patch from.
import vm from "node:vm";
import { source } from "./source.mjs";


// Event target stand-in: every listener of every type, fired by hand with emit(type, ev).
const target = (obj = {}) =>
  Object.assign(obj, {
    _listeners: {},
    addEventListener(type, fn) {
      (this._listeners[type] ||= new Set()).add(fn);
    },
    removeEventListener(type, fn) {
      this._listeners[type]?.delete(fn);
    },
    emit(type, ev) {
      for (const fn of [...(this._listeners[type] || [])]) fn(ev);
    },
    count(type) {
      return this._listeners[type]?.size ?? 0;
    },
  });

const fakeNode = (tag) =>
  target({
    tagName: String(tag).toUpperCase(),
    children: [],
    appendChild(child) {
      this.children.push(child);
      return child;
    },
  });

export const load = () => {
  const registry = new Map();
  class HTMLElement {
    attachShadow() {
      this.shadowRoot = target({ innerHTML: "", querySelector: () => null, querySelectorAll: () => [] });
      return this.shadowRoot;
    }
    dispatchEvent(ev) {
      (this.events ||= []).push(ev);
    }
    appendChild() {}
  }
  class CustomEvent {
    constructor(type, init = {}) {
      this.type = type;
      this.detail = init.detail;
    }
  }
  const sandbox = {
    HTMLElement,
    CustomEvent,
    console: { info() {}, warn() {} },
    customElements: { get: (t) => registry.get(t), define: (t, c) => registry.set(t, c) },
    setTimeout,
    clearTimeout,
    setInterval,
    clearInterval,
  };
  sandbox.document = target({ createElement: (t) => (registry.has(t) ? new (registry.get(t))() : fakeNode(t)) });
  target(sandbox);
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  return vm.runInContext(
    `${source}
    ({ STRINGS, INTEGRATIONS, KEYS, REPEATABLE, LANGUAGES, TOGGLES, resolve, firstEntity, keySpec, available, serviceCall, progress, cleanConfig, esc,
       RemoteCard: customElements.get("remote-card"), RemoteMiniCard: customElements.get("remote-mini-card"),
       RemoteCardEditor: customElements.get("remote-card-editor"), RemoteMiniCardEditor: customElements.get("remote-mini-card-editor"), window, document })`,
    sandbox,
  );
};
