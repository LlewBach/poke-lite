import { getPokemon, getSpecies } from "../services/pokeApi.js";
import { getImage } from "../services/dataHandlers.js";

export default class Battle extends HTMLElement {
  constructor() {
    super();
    this.farPid;
    this.teamImgs;
    this.teamIndex = 0;
    this.isMyTurn = true;
    this.far;
    this.near;
    this.hasWon;
    this.battleOver = false;
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
    const throwBtn = this.querySelector("#throw");
    if (atkBtn) atkBtn.addEventListener("click", this._attack);
    if (throwBtn) throwBtn.addEventListener("click", this._throwBall);
  }
  async getPokeInfo(id, isFar) {
    const [pokemon, species] = await Promise.all([
      getPokemon(id),
      getSpecies(id),
    ]);
    console.log("Poke: ", pokemon);
    console.log("Species: ", species);
    const types = pokemon.types.map((obj) => obj.type.name);
    const stats = Object.fromEntries(
      pokemon.stats.map((s) => [s.stat.name, s.base_stat])
    );
    const showdown = pokemon.sprites.other.showdown;
    const img = isFar ? showdown.front_default : showdown.back_default;
    const maxHP = pokemon.stats.find((s) => s.stat.name == "hp").base_stat;
    return {
      name: pokemon.name,
      types,
      stats,
      img,
      captureRate: species.capture_rate,
      maxHP,
      curHP: maxHP,
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
    this.teamImgs = await Promise.all(
      app.store.team.map(async (id) => {
        const pokemon = await getPokemon(id);
        return getImage(pokemon);
      })
    );
    this.render();
  }
  _attack = () => {
    console.log("Attacking!");
    // I attack
    if (this.isMyTurn) {
      this.far.curHP -= Math.ceil(this.near.stats.attack / 3);
      if (this.far.curHP <= 0) {
        this.far.curHP = 0;
        this.battleOver = true;
        this.hasWon = true;
      }
      // Enemy attacks
    } else {
      this.near.curHP -= Math.ceil(this.far.stats.attack / 3);
      if (this.near.curHP <= 0) {
        this.near.curHP = 0;
        this.battleOver = true;
        this.hasWon = false;
      }
    }
    this.isMyTurn = !this.isMyTurn;
    console.log("Far HP: ", this.far.curHP);
    console.log("Near HP: ", this.near.curHP);
    this.render();
    if (!this.isMyTurn) this._attack();
  };
  _throwBall = () => {
    const chance = this._catchChance(
      this.far.captureRate,
      this.far.maxHP,
      this.far.curHP
    );
    const success = Math.random() < chance;
    if (success) {
      app.store.caught = [...app.store.caught, this.farPid];
      this.battleOver = true;
      this.hasWon = true;
      console.log("Caught!");
    } else {
      this.isMyTurn = false;
      console.log("Broke free!");
    }
    this.render();
  };
  _catchChance(captureRate, maxHP, curHP) {
    const a = ((3 * maxHP - 2 * curHP) * captureRate) / (3 * maxHP);
    return Math.max(0, Math.min(0.95, a / 255));
  }
  render() {
    const teamSlots = Array.from({ length: 6 }, (_, i) => {
      const img = this.teamImgs[i];
      if (!img) return `<div>?</div>`;
      return `
        <div class="team-icon">
            <img class="team-img" src="${img}" />
        </div>
        `;
    }).join("");

    this.innerHTML = !this.battleOver
      ? `
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
                    <p>HP: ${this.far.curHP}</p>
                    <p>ATK: ${this.far.stats.attack}</p>
                    <p>DEF: ${this.far.stats.defense}</p>
                    <p>SPE: ${this.far.stats.speed}</p>
                    <p>S ATK: ${this.far.stats["special-attack"]}</p>
                    <p>S DEF: ${this.far.stats["special-defense"]}</p>
                    <p>Cap Rate: ${this.far.captureRate}</p>
                </div>
                <div class="img-div">
                    <img id="farImg" src="${this.far.img}">
                </div>
            </div>
            <div id="control-btns">
                <button id="atk-btn">Attack</button>
                <button id="throw">Throw Poke Ball</button>
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
                    <p>HP: ${this.near.curHP}</p>
                    <p>ATK: ${this.near.stats.attack}</p>
                    <p>DEF: ${this.near.stats.defense}</p>
                    <p>SPE: ${this.near.stats.speed}</p>
                    <p>S ATK: ${this.near.stats["special-attack"]}</p>
                    <p>S DEF: ${this.near.stats["special-defense"]}</p>
                </div>
            </div>
        </div>
        <h2>Team Bench</h2>
        <div id="bench-grid">
            ${teamSlots}
        </div>
        `
      : `
        <h2>You ${this.hasWon ? "Won" : "Lost"}!</h2>
        <a href="#/">Continue</a>
      `;
    this._bindListeners();
  }
}

customElements.define("battle-page", Battle);
