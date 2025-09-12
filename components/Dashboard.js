export default class Dashboard extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    this.innerHTML = "<h2>Dashboard</h2>";
  }
  render() {}
}

// Custom element names need a hyphen (spec requirement)
customElements.define("dashboard-page", Dashboard);
