const STORAGE_KEY = "poke-lite:v1";

const DEFAULT_STATE = {
  team: [25],
  caught: [],
  currentEncounter: {},
};

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function fetchState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_STATE };
    const parsed = JSON.parse(raw);
    return parsed;
  } catch {
    return { ...DEFAULT_STATE };
  }
}

const store = fetchState();

const handler = {
  // The 'set' trap - runs whenever you do proxiedStore[property] = value
  set(target, property, value) {
    target[property] = value;
    saveState(target);
    window.dispatchEvent(new Event("appstatechange"));
    return true;
  },
};

const proxiedStore = new Proxy(store, handler);

export default proxiedStore;
