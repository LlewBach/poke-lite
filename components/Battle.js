export default class Battle extends HTMLElement {
  constructor() {
    super();
    this.farPid;
    this.teamIndex = 0;
    this.isMyTurn = false;
    this.far;
    this.near;
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
  _bindListeners() {
    const atkBtn = this.querySelector("#atk-btn");
    atkBtn.addEventListener("click", this._attack);
  }
  _attack = () => {
    console.log("Attacking!");
    if (this.isMyTurn) {
      this.far.stats.hp -= this.near.stats.attack;
    } else {
      this.near.stats.hp -= this.far.stats.attack;
    }
    this.isMyTurn = !this.isMyTurn;
    console.log("Far HP: ", this.far.stats.hp);
    console.log("Near HP: ", this.near.stats.hp);
    this.render();
  };
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
    this.far = farPokeInfo;
    this.near = nearPokeInfo;
    this.render();
  }
  render() {
    this.innerHTML = `
        <h2>Battle</h2>
        <div id="battle-grid">
            <div class="battle-row">
                <div id="far-stats">
                    <div class="type-container">
                        ${this.far.types
                          .map(
                            (type) =>
                              `<img class="type-icon" src="../assets/types/${type}.svg">`
                          )
                          .join("")}
                    </div>
                    <p>${this.far.name}</p>
                    <p>HP: ${this.far.stats.hp}</p>
                    <p>ATK: ${this.far.stats.attack}</p>
                    <p>DEF: ${this.far.stats.defense}</p>
                    <p>SPE: ${this.far.stats.speed}</p>
                    <p>S ATK: ${this.far.stats["special-attack"]}</p>
                    <p>S DEF: ${this.far.stats["special-defense"]}</p>
                </div>
                <div class="img-div">
                    <img id="farImg" src="${this.far.img}">
                </div>
            </div>
            <div id="control-btns">
                <button id="atk-btn">Attack</button>
            </div>
            <div class="battle-row">
                <div class="img-div">
                    <img id="nearImg" src="${this.near.img}">
                </div>
                <div id="near-stats">
                    <div class="type-container">
                        ${this.near.types
                          .map(
                            (type) =>
                              `<img class="type-icon" src="../assets/types/${type}.svg">`
                          )
                          .join("")}
                    </div>
                    <p>${this.near.name}</p>
                    <p>HP: ${this.near.stats.hp}</p>
                    <p>ATK: ${this.near.stats.attack}</p>
                    <p>DEF: ${this.near.stats.defense}</p>
                    <p>SPE: ${this.near.stats.speed}</p>
                    <p>S ATK: ${this.near.stats["special-attack"]}</p>
                    <p>S DEF: ${this.near.stats["special-defense"]}</p>
                </div>
            </div>
        </div>
    `;
    this._bindListeners();
  }
}

customElements.define("battle-page", Battle);
