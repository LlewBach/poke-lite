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
          fromIndex:
            el.dataset.source == "team" ? Number(el.dataset.index) : -1,
        };
        e.dataTransfer.setData("application/json", JSON.stringify(payload));
        e.dataTransfer.effectAllowed = "move";
      });
    });

    const teamZone = this.querySelector("#team-grid");
    const caughtZone = this.querySelector("#caught-grid");

    teamZone?.querySelectorAll(".card-space").forEach((slot) => {
      slot.addEventListener("dragover", (e) => {
        e.preventDefault();
        slot.classList.add("drop-over");
        e.dataTransfer.dropEffect = "move";
      });
      slot.addEventListener("dragleave", () =>
        slot.classList.remove("drop-over")
      );
      slot.addEventListener("drop", (e) => {
        e.preventDefault();
        slot.classList.remove("drop-over");
        const raw = e.dataTransfer.getData("application/json");
        if (!raw) return;
        const { pid, from, fromIndex } = JSON.parse(raw);
        const toIndex = Number(slot.dataset.index);
        this._movePokemon(pid, from, "team", { fromIndex, toIndex });
      });
    });
    if (caughtZone) {
      caughtZone.addEventListener("dragover", (e) => {
        e.preventDefault();
        caughtZone.classList.add("drop-over");
        e.dataTransfer.dropEffect = "move";
      });
      caughtZone.addEventListener("dragleave", () =>
        caughtZone.classList.remove("drop-over")
      );
      caughtZone.addEventListener("drop", (e) => {
        e.preventDefault();
        caughtZone.classList.remove("drop-over");
        const raw = e.dataTransfer.getData("application/json");
        if (!raw) return;
        const { pid, from, fromIndex } = JSON.parse(raw);
        this._movePokemon(pid, from, "caught", { fromIndex });
      });
    }
  }
  _movePokemon(pid, from, to, pos = {}) {
    const team = [...app.store.team];
    const caught = [...app.store.caught];

    // Reorder within team
    if (from === "team" && to === "team") {
      const { fromIndex, toIndex } = pos;
      if (fromIndex === toIndex) return;

      const currentIdx = team.indexOf(pid);
      if (currentIdx === -1) return;

      // Remove and insert at new index (clamped)
      team.splice(currentIdx, 1);
      const insertAt = Math.max(0, Math.min(toIndex, team.length));
      team.splice(insertAt, 0, pid);

      app.store.team = team;
      this.load();
      return;
    }

    // Move between lists
    const removeFrom = (arr) => {
      const i = arr.indexOf(pid);
      if (i !== -1) arr.splice(i, 1);
    };
    if (from === "team") removeFrom(team);
    if (from === "caught") removeFrom(caught);

    if (to === "team") {
      if (team.includes(pid)) return; // no duplicates
      if (team.length >= 6) {
        alert("Your team is full (max 6).");
        // revert removal
        if (from === "team") team.push(pid);
        else if (!caught.includes(pid)) caught.push(pid);
      } else {
        // Optional: support inserting at a specific slot when moving from caught → team
        const insertAt = Number.isInteger(pos.toIndex)
          ? Math.max(0, Math.min(pos.toIndex, team.length))
          : team.length;
        team.splice(insertAt, 0, pid);
      }
    } else {
      if (!caught.includes(pid)) caught.push(pid);
    }

    app.store.team = team;
    app.store.caught = caught;
    this.load();
  }

  render = () => {
    const teamSlots = Array.from({ length: 6 }, (_, i) => {
      const p = this.teamDetails[i];
      if (!p)
        return `<div class="card-space empty" data-source="team" data-index="${i}">?</div>`;
      return `
        <div class="card-space" data-source="team" data-index="${i}" data-pid="${
        p.pid
      }">
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
