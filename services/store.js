const store = {
  team: [25],
  caught: [],
  currentEncounter: {},
};

const handler = {
  // The 'set' trap - runs whenever you do proxiedStore[property] = value
  set(target, property, value) {
    target[property] = value;
    window.dispatchEvent(new Event("appstatechange"));
    return true;
  },
};

const proxiedStore = new Proxy(store, handler);

export default proxiedStore;
