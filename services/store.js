const Store = {
  caught: 0,
  team: [],
};

const proxiedStore = new Proxy(Store, {
  set(target, property, value) {
    const prev = { ...target };
    const ok = Reflect.set(target, property, value);
    const next = { ...target };

    window.dispatchEvent(
      new CustomEvent("appstatechange", {
        detail: { prev, next, patch: { [property]: value } },
      })
    );
    return ok;
  },
});

export default proxiedStore;
