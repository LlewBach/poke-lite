const Router = {
  init() {
    window.addEventListener("hashchange", () => this.renderFromHash());

    if (!location.hash) {
      location.replace("#/");
    }
    this.renderFromHash();
  },
  renderFromHash() {
    // hash looks like "#/pokedex" — strip the leading "#"
    const raw = location.hash.slice(1) || "/";
    const [path, query] = raw.split("?");

    let pageElement = null;
    switch (path) {
      case "/":
        pageElement = document.createElement("dashboard-page");
        break;
      case "/pokedex":
        pageElement = document.createElement("pokedex-page");
        break;
      case "/about":
        pageElement = document.createElement("about-page");
        break;
      default:
        const m = path.match(/^\/pokemon\/(\d+)$/);
        if (m) {
          pageElement = document.createElement("pokemon-details");
          pageElement.setAttribute("pid", m[1]);
        } else {
          pageElement = document.createElement("div");
          pageElement.innerHTML = "<h2>Not found</h2>";
        }
    }

    const main = document.querySelector("main");
    main.innerHTML = "";
    main.appendChild(pageElement);
    window.scrollTo(0, 0);
  },

  // Keep hash routing during local dev, then switch back to History API
  // and 404 trick for GitHub pages deployment?

  // init: () => {
  // document.querySelectorAll("a.navlink").forEach((a) => {
  //   a.addEventListener("click", (e) => {
  //     e.preventDefault();
  //     console.log("Link clicked");
  //     const url = a.getAttribute("href");
  //     Router.go(url);
  //   });
  // });

  // // Event handler for URL changes
  // window.addEventListener("popstate", (e) => {
  //   const route = e.state?.route || location.pathname;
  //   Router.go(route, false);
  // });

  // // Initial render
  // Router.go(location.pathname);
  // },
  // go(route, addToHistory = true) {
  //   console.log(`Going to ${route}`);

  //   if (addToHistory) {
  //     history.pushState({ route }, null, route);
  //   }

  //   let pageElement = null;
  //   switch (route) {
  //     case "/":
  //       pageElement = document.createElement("dashboard-page");
  //       break;
  //     case "/pokedex":
  //       pageElement = document.createElement("pokedex-page");
  //       break;
  //     case "/about":
  //       pageElement = document.createElement("about-page");
  //       break;
  //   }

  //   if (pageElement) {
  //     const main = document.querySelector("main");
  //     main.innerHTML = "";
  //     main.appendChild(pageElement);
  //     window.scrollTo(0, 0);
  //   }
  // },
};

export default Router;
