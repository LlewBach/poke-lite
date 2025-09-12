export default class Dashboard extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    // this._onState = () => this.render();
    // window.addEventListener("appstatechange", this._onState); --- Alternative to render arrow binding
    window.addEventListener("appstatechange", this.render);
    this.render();
  }
  disconnectedCallback() {
    window.removeEventListener("appstatechange", this.render);
  }
  // render is arrow function for this binding
  render = () => {
    const { caught, team } = app.store;

    this.innerHTML = `
      <section class="dashboard">
        <h2>Dashboard</h2>
        <p><strong>${caught}</strong> caught, <strong>${team.length}</strong> in team.</p>
        <button id="btn-catch">Simulate catch</button>
      </section>
    `;

    this.querySelector("#btn-catch").addEventListener("click", () => {
      app.store.caught++;
      console.log(app.store);
    });
  };
}

// Custom element names need a hyphen (spec requirement)
customElements.define("dashboard-page", Dashboard);
