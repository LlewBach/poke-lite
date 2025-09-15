export default class Encounter extends HTMLElement {
  constructor() {
    super();
    this.found = null;
  }
  connectedCallback() {
    this.render();
    this._bindListeners();
  }
  _bindListeners() {
    const exploreBtn = this.querySelector("#explore-btn");
    exploreBtn.addEventListener("click", this._getPokemon);
    const battleBtn = this.querySelector("#battle-btn");
    battleBtn.addEventListener("click", () => (location.hash = "#/battle"));
  }
  _getPokemon = () => {
    console.log("Get Pokemon");
    const randomId = Math.ceil(Math.random() * 200);
    this.found = randomId;

    if (!app.store.session) app.store.session = {};
    app.store.session.currentEncounter = { pid: randomId };

    this.render();
    this._bindListeners();
    return randomId;
  };
  render() {
    this.innerHTML = `
        <h2>Encounter</h2>
        <button id="explore-btn">Explore</button>
        <button id="battle-btn">Battle</button>
        ${
          this.found
            ? `<pokemon-details pid="${this.found}"></pokemon-details>`
            : ""
        }
    `;
  }
}

customElements.define("encounter-page", Encounter);
