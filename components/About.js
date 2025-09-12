export default class About extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    this.innerHTML = "<h2>About</h2>";
  }
  render() {
    // const h2 = document.createElement("h2");
    // h2.innerText = "About";
  }
}

customElements.define("about-page", About);
