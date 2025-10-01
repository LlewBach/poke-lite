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
      this._bindDnD();
    } catch (err) {
      this.innerHTML = `<p style="color:red">Failed to load: ${String(
        err
      )}</p>`;
    }
  }
  _bindDnD() {
    this.querySelectorAll(".card-space[data-pid]").forEach((el) => {
      el.setAttribute("draggable", "true");
      el.addEventListener("dragstart", (e) => {
        const payload = {
          pid: Number(el.dataset.pid),
          from: el.dataset.source,
        };
        e.dataTransfer.setData("application/json", JSON.stringify(payload));
        e.dataTransfer.effectAllowed = "move";
      });
    });

    const teamZone = this.querySelector("#team-grid");
    const caughtZone = this.querySelector("#caught-grid");

    [teamZone, caughtZone].forEach((zone) => {
      if (!zone) return;

      zone.addEventListener("dragover", (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        zone.classList.add("drop-over");
      });

      zone.addEventListener("dragleave", (e) => {
        e.preventDefault();
        zone.classList.remove("drop-over");
      });

      zone.addEventListener("drop", (e) => {
        e.preventDefault();
        zone.classList.remove("drop-over");
        const raw = e.dataTransfer.getData("application/json");
        if (!raw) return;

        const { pid, from } = JSON.parse(raw);
        const to = zone.id === "team-grid" ? "team" : "caught";
        this._movePokemon(pid, from, to);
      });
    });
  }
  _movePokemon(pid, from, to) {
    if (from === to) return;

    const team = [...app.store.team];
    const caught = [...app.store.caught];

    // Remove from source
    const removeFrom = (arr) => {
      const i = arr.indexOf(pid);
      if (i !== -1) arr.splice(i, 1);
    };
    if (from === "team") removeFrom(team);
    else removeFrom(caught);

    // Add to target, with checks
    const addToTeam = () => {
      if (team.includes(pid)) return true;
      if (team.length >= 6) return false;
      team.push(pid);
      return true;
    };

    const addToCaught = () => {
      if (!caught.includes(pid)) caught.push(pid);
      return true;
    };

    let added = true;
    if (to === "team") added = addToTeam();
    else added = addToCaught();

    // If failed to add, revert removal
    if (!added) {
      if (from === "team") team.push(pid);
      else if (!caught.includes(pid)) caught.push(pid);
      alert("Your team is full (max 6).");
    }

    app.store.team = team;
    app.store.caught = caught;
    this.load();
  }
  render = () => {
    const teamSlots = Array.from({ length: 6 }, (_, i) => {
      const p = this.teamDetails[i];
      if (!p) return `<div class="card-space empty" data-source="team">?</div>`;
      return `
        <div class="card-space" data-source="team" data-pid="${p.pid}">
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

    const caughtSlots = this.caughtDetails
      .map((_, i) => {
        const p = this.caughtDetails[i];
        if (!p)
          return `<div class="card-space empty" data-source="caught">?</div>`;
        return `
        <div class="card-space" data-source="caught" data-pid="${p.pid}">
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
      })
      .join("");

    this.innerHTML = `
      <section class="dashboard">
        <h2>Dashboard</h2>
        <h3>Team</h3>
        <div id="team-grid">
          ${teamSlots}
        </div>
        <h3>Caught</h3>
          <div id="caught-grid">
          ${
            caughtSlots ||
            `<p class="center">Drop here to remove from team.</p>`
          }
        </div>
      </section>
    `;
  };
}

// Custom element names need a hyphen (spec requirement)
customElements.define("dashboard-page", Dashboard);
