import Router from "./services/Router.js";

// Link web components
import Dashboard from "./components/Dashboard.js";
import About from "./components/About.js";

console.log("app.js running");

window.app = {};
app.router = Router;

window.addEventListener("DOMContentLoaded", () => {
  app.router.init();
});
