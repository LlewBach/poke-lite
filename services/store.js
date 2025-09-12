const Store = {
  caught: 0,
  team: [],
};

const proxiedStore = new Proxy(Store, {
  // The 'set' trap - runs whenever you do proxiedStore[property] = value
  set(target, property, value) {
    const prev = { ...target };
    const ok = Reflect.set(target, property, value);
    const next = { ...target };

    window.dispatchEvent(new Event("appstatechange"));
    return ok;
  },
});

export default proxiedStore;
