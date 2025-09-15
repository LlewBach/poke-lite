export default class Battle extends HTMLElement {
  constructor() {
    super();
    this.farPid;
    this.teamIndex = 0;
  }
  connectedCallback() {
    this.farPid = app.store.currentEncounter?.pid;
    console.log("farPid: ", this.farPid);
    if (!this.farPid) {
      location.hash = "#/encounter";
      return;
    }
    this.load();
  }
  async getPokeInfo(id, isFar) {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
    if (!res.ok) throw new Error("Darn it");
    const data = await res.json();
    console.log("Data: ", data);
    const name = data.name;
    const types = data.types.map((obj) => obj.type.name);
    const stats = Object.fromEntries(
      data.stats.map((s) => [s.stat.name, s.base_stat])
    );
    const showdown = data.sprites.other.showdown;
    const img = isFar ? showdown.front_default : showdown.back_default;
    return {
      name,
      types,
      stats,
      img,
    };
  }
  async load() {
    const farPokeInfo = await this.getPokeInfo(this.farPid, true);
    const nearPokeInfo = await this.getPokeInfo(
      app.store.team[this.teamIndex],
      false
    );
    this.render(farPokeInfo, nearPokeInfo);
  }
  render(farPokeInfo, nearPokeInfo) {
    const {
      name: farName,
      types: farTypes,
      stats: farStats,
      img: farImg,
    } = farPokeInfo;
    const {
      name: nearName,
      types: nearTypes,
      stats: nearStats,
      img: nearImg,
    } = nearPokeInfo;
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
                <div class="img-div">
                    <img id="farImg" src="${farImg}">
                </div>
            </div>
            <div class="battle-row">
                <div class="img-div">
                    <img id="nearImg" src="${nearImg}">
                </div>
                <div id="near-stats">
                    <div class="type-container">
                        ${farTypes
                          .map(
                            (type) =>
                              `<img class="type-icon" src="../assets/types/${type}.svg">`
                          )
                          .join("")}
                    </div>
                    <p>${nearName}</p>
                    <p>HP: ${nearStats.hp}</p>
                    <p>ATK: ${nearStats.attack}</p>
                    <p>DEF: ${nearStats.defense}</p>
                    <p>SPE: ${nearStats.speed}</p>
                    <p>S ATK: ${nearStats["special-attack"]}</p>
                    <p>S DEF: ${nearStats["special-defense"]}</p>
                </div>
            </div>
        </div>
    `;
  }
}

customElements.define("battle-page", Battle);
