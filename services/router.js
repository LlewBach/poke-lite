const Router = {
  init: () => {
    document.querySelectorAll("a.navlink").forEach((a) => {
      a.addEventListener("click", (e) => {
        e.preventDefault();
        console.log("Link clicked");
        const url = a.getAttribute("href");
        Router.go(url);
      });
    });

    // Event handler for URL changes
    window.addEventListener("popstate", (e) => {
      const route = e.state?.route || location.pathname;
      Router.go(route, false);
    });

    // Initial render
    Router.go(location.pathname);
  },
  go(route, addToHistory = true) {
    console.log(`Going to ${route}`);

    if (addToHistory) {
      history.pushState({ route }, null, route);
    }

    let pageElement = null;
    switch (route) {
      case "/":
        pageElement = document.createElement("dashboard-page");
        break;
      case "/pokedex":
        pageElement = document.createElement("pokedex-page");
        break;
      case "/about":
        pageElement = document.createElement("about-page");
        break;
    }

    if (pageElement) {
      const main = document.querySelector("main");
      main.innerHTML = "";
      main.appendChild(pageElement);
      window.scrollTo(0, 0);
    }
  },
};

export default Router;
