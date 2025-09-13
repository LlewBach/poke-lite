import Router from "./services/router.js";
import Store from "./services/store.js"; // Actually proxiedStore

// Link web components
import Dashboard from "./components/Dashboard.js";
import Pokedex from "./components/Pokedex.js";
import PokeCard from "./components/PokeCard.js";
import PokeDetails from "./components/PokeDetails.js";
import About from "./components/About.js";

console.log("app.js running");

window.app = {};
app.router = Router;
app.store = Store;

window.addEventListener("DOMContentLoaded", () => {
  app.router.init();
});
