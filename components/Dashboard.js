import { getPokemon } from "../services/pokeApi.js";
import { getCardInfo } from "../services/dataHandlers.js";

export default class Dashboard extends HTMLElement {
  constructor() {
    super();
    this.teamDetails = [];
    this.caughtDetails = [];
  }
  connectedCallback() {
    this.load();
  }
  async load() {
    try {
      // Team
      console.log("Loading");
      const team = app.store.team;
      const caught = app.store.caught;

      const teamDetails = await Promise.all(
        team.map(async (id) => {
          const pokemon = await getPokemon(id);
          return getCardInfo(pokemon);
        })
      );
      this.teamDetails = teamDetails;
      console.log("Team details: ", teamDetails);

      const caughtDetails = await Promise.all(
        caught.map(async (id) => {
          const pokemon = await getPokemon(id);
          return getCardInfo(pokemon);
        })
      );
      this.caughtDetails = caughtDetails;
      this.render();
    } catch (err) {
      this.innerHTML = `<p style="color:red">Failed to load: ${String(
        err
      )}</p>`;
    }
  }
  render = () => {
    const teamSlots = Array.from({ length: 6 }, (_, i) => {
      const p = this.teamDetails[i];
      if (!p) return `<div class="card-space empty">?</div>`;
      return `
        <div class="card-space">
          <poke-card
            pid="${p.pid}"
            name="${p.name}"
            img="${p.img}"
            types="${p.types.join(",")}"
            hp="${p.stats.hp}"
            attack="${p.stats.attack}"
            defense="${p.stats.defense}"
            spattack="${p.stats["special-attack"]}"
            spdefense="${p.stats["special-defense"]}"
            speed="${p.stats.speed}"
          >
          </poke-card>
        </div>
      `;
    }).join("");

    const caughtSlots = Array.from({ length: 6 }, (_, i) => {
      const p = this.caughtDetails[i];
      if (!p) return `<div class="card-space empty">?</div>`;
      return `
        <div class="card-space">
          <poke-card
            pid="${p.pid}"
            name="${p.name}"
            img="${p.img}"
            types="${p.types.join(",")}"
            hp="${p.stats.hp}"
            attack="${p.stats.attack}"
            defense="${p.stats.defense}"
            spattack="${p.stats["special-attack"]}"
            spdefense="${p.stats["special-defense"]}"
            speed="${p.stats.speed}"
          >
          </poke-card>
        </div>
      `;
    }).join("");

    this.innerHTML = `
      <section class="dashboard">
        <h2>Dashboard</h2>
        <h3>Team</h3>
        <div id="card-grid">
          ${teamSlots}
        </div>
        <h3>Caught</h3>
        <div id="caught-grid">
          ${caughtSlots}
        </div>
      </section>
    `;
  };
}

// Custom element names need a hyphen (spec requirement)
customElements.define("dashboard-page", Dashboard);
