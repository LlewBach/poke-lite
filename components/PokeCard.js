export default class PokeCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = `
      <style>
        div.card {
          max-width: 400px;
          padding:12px;
          background:#eee; 
          border:1px solid #ddd; 
          border-radius:12px;
          text-align:center; 
          box-shadow:0 5px 4px rgba(0,0,0,0.3);
        }
        a {
            display: block; 
            border: 1px solid black;
            text-decoration: none;
        }
        img { 
            margin:0 auto 8px;
            width:120px;
            height:120px;
        }
        p.name { 
            margin:6px 0 4px;
            font-weight:600;
            text-transform:capitalize;
        }
        small.types {
            color:#666;
            text-transform:capitalize;
        }
        div.stats {
            margin-top: 4px;
            display:grid;
            grid-template-columns: repeat(3, 1fr);
            gap:10px;
            font-size:12px;
            color:#444; }
      </style>

      <div class="card">
        <a href="">
            <img id="img" src="" alt="">
            <p class="name" id="name"></p>
            <small class="types" id="types"></small>
            <div class="stats">
                <span id="hp"></span>
                <span id="attack"></span>
                <span id="defense"></span>
                <span id="spattack"></span>
                <span id="spdefense"></span>
                <span id="speed"></span>
            </div>
        </a>
      </div>
    `;
  }
  connectedCallback() {
    this.render();
  }
  render() {
    // Getting card info
    const pid = this.getAttribute("pid") || "";
    const name = this.getAttribute("name") || "";
    const img = this.getAttribute("img") || "";
    const types = (this.getAttribute("types") || "").split(",").filter(Boolean); // ?
    const hp = this.getAttribute("hp");
    const attack = this.getAttribute("attack");
    const defense = this.getAttribute("defense");
    const spattack = this.getAttribute("spattack");
    const spdefense = this.getAttribute("spdefense");
    const speed = this.getAttribute("speed");

    // Link
    this.shadowRoot.querySelector("a").setAttribute("href", `#/pokemon/${pid}`);

    // Filling out card
    this.shadowRoot.getElementById("img").src = img;
    this.shadowRoot.getElementById("img").alt = name;
    this.shadowRoot.getElementById("name").textContent = `#${pid} ${name}`;
    this.shadowRoot.getElementById("types").textContent = types.join(", ");
    this.shadowRoot.getElementById("hp").textContent = `HP: ${hp}`;
    this.shadowRoot.getElementById("attack").textContent = `ATK: ${attack}`;
    this.shadowRoot.getElementById("defense").textContent = `DEF: ${defense}`;
    this.shadowRoot.getElementById("speed").textContent = `SPE: ${speed}`;
    this.shadowRoot.getElementById(
      "spattack"
    ).textContent = `S ATK: ${spattack}`;
    this.shadowRoot.getElementById(
      "spdefense"
    ).textContent = `S DEF: ${spdefense}`;
  }
}

customElements.define("poke-card", PokeCard);
