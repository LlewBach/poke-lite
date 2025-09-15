export default class Battle extends HTMLElement {
  constructor() {
    super();
    this.pid;
  }
  connectedCallback() {
    this.pid = app.store?.session?.currentEncounter.pid;
    console.log("pid: ", this.pid);
    if (!this.pid) {
      location.hash = "#/encounter";
    }
    this.load();
  }
  async load() {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${this.pid}`);
    if (!res.ok) throw new Error("Darn it");
    const data = await res.json();
    console.log("Data: ", data);
    const farName = data.name;
    const farTypes = data.types.map((obj) => obj.type.name);
    const farStats = Object.fromEntries(
      data.stats.map((s) => [s.stat.name, s.base_stat])
    );
    const farImg = data.sprites.other.showdown.front_default;
    const nearImg = data.sprites.other.showdown.back_default;
    this.render(farName, farTypes, farStats, farImg, nearImg);
  }
  render(farName, farTypes, farStats, farImg, nearImg) {
    this.innerHTML = `
        <h2>Battle</h2>
        <div id="battle-grid">
            <div class="battle-row">
                <div id="far-stats">
                <div class="type-container">
                    ${farTypes
                      .map(
                        (type) =>
                          `<img class="type-icon" src="../assets/types/${type}.svg">`
                      )
                      .join("")}
                </div>
                    <p>${farName}</p>
                    <p>HP: ${farStats.hp}</p>
                    <p>ATK: ${farStats.attack}</p>
                    <p>DEF: ${farStats.defense}</p>
                    <p>SPE: ${farStats.speed}</p>
                    <p>S ATK: ${farStats["special-attack"]}</p>
                    <p>S DEF: ${farStats["special-defense"]}</p>
                </div>
                <div id="far-poke">
                    <img id="farImg" src="${farImg}">
                </div>
            </div>
            <div class="battle-row">
                <div id="near-poke">
                    <img id="nearImg" src="${nearImg}">
                </div>
                <div id="near-stats">
                    <p>Near stats</p>
                </div>
            </div>
        </div>
    `;
  }
}

customElements.define("battle-page", Battle);
