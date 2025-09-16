export default class Dashboard extends HTMLElement {
  constructor() {
    super();
    this.teamDetails = [];
  }
  connectedCallback() {
    this.load();
  }
  async load() {
    try {
      console.log("Loading");
      const team = app.store.team;

      const teamDetails = await Promise.all(
        team.map(async (id) => {
          const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const data = await res.json();
          console.log("Data: ", data);
          const img =
            data.sprites?.other?.["official-artwork"]?.front_default ||
            data.sprites?.front_default;
          const types = data.types.map((t) => t.type.name);
          const stats = Object.fromEntries(
            data.stats.map((s) => [s.stat.name, s.base_stat])
          );
          return {
            pid: id,
            name: data.name,
            img,
            types,
            stats,
          };
        })
      );
      this.teamDetails = teamDetails;
      console.log("Team details: ", teamDetails);
      this.render();
    } catch (err) {
      this.innerHTML = `<p style="color:red">Failed to load: ${String(
        err
      )}</p>`;
    }
  }
  render = () => {
    const slots = Array.from({ length: 6 }, (_, i) => {
      const p = this.teamDetails[i];
      if (!p) return `<div class="team-space empty">?</div>`;
      return `
        <div class="team-space">
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
        <div id="team-grid">
          ${slots}
        </div>
      </section>
    `;
  };
}

// Custom element names need a hyphen (spec requirement)
customElements.define("dashboard-page", Dashboard);
