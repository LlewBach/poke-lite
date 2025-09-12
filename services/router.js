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
  },
  go(route, addToHistory = true) {
    console.log(`Going to ${route}`);

    let pageElement = null;
    switch (route) {
      case "/":
        pageElement = document.createElement("dashboard-page");
        pageElement.textContent = "Dashboard";
        break;
      case "/about":
        pageElement = document.createElement("about-page");
        pageElement.textContent = "About";
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
