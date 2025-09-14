export default class Pokedex extends HTMLElement {
  constructor() {
    super();
    this.limit = 24;
    this.page = this._readPageFromHash() || 1;
    this.items = [];
    this.count = 0;
  }

  connectedCallback() {
    this.innerHTML = "<p>Loading Pokédex…</p>";
    this.load();
  }

  _readPageFromHash() {
    // hash looks like "#/pokedex?page=2"
    const m = location.hash.match(/[?&]page=(\d+)/);
    return m ? Number(m[1]) : 1;
  }

  _writePageToHash() {
    const base = "#/pokedex";
    const suffix = this.page > 1 ? `?page=${this.page}` : "";
    location.hash = base + suffix;
  }

  _bindPager() {
    this.querySelector("#extra-prev").addEventListener("click", () => {
      if (this.page > 10) {
        this.page -= 10;
        this._writePageToHash();
        this.load();
      }
    });
    this.querySelector("#prev").addEventListener("click", () => {
      if (this.page > 1) {
        this.page--;
        this._writePageToHash();
        this.load();
      }
    });
    this.querySelector("#next").addEventListener("click", () => {
      const totalPages = Math.ceil(this.count / this.limit);
      if (this.page < totalPages) {
        this.page++;
        this._writePageToHash();
        this.load();
      }
    });
    this.querySelector("#extra-next").addEventListener("click", () => {
      const totalPages = Math.ceil(this.count / this.limit);
      if (this.page < totalPages - 9) {
        this.page += 10;
        this._writePageToHash();
        this.load();
      }
    });
  }

  async load() {
    const offset = (this.page - 1) * this.limit;
    // this.querySelector("#status").textContent = "Loading...";
    try {
      const res = await fetch(
        `https://pokeapi.co/api/v2/pokemon?limit=${this.limit}&offset=${offset}`
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const list = await res.json();
      this.count = list.count;
      console.log("List: ", list);

      const details = await Promise.all(
        list.results.map((animal) => fetch(animal.url).then((r) => r.json()))
      );

      console.log(details);

      this.items = details.map((d) => ({
        pid: d.id,
        name: d.name,
        img:
          d.sprites?.other?.["official-artwork"]?.front_default ||
          d.sprites?.front_default ||
          "",
        types: d.types.map((t) => t.type.name),
        stats: Object.fromEntries(
          d.stats.map((s) => [s.stat.name, s.base_stat])
        ),
      }));
      this.render();
      this._bindPager();
    } catch (err) {
      this.innerHTML = `<p style="color:red">Error loading Pokédex: ${String(
        err
      )}</p>`;
    }
  }
  render() {
    const items = this.items ?? [];
    const totalPages = Math.ceil(this.count / this.limit) || 1;
    this.innerHTML = `
        <section>
            <h2>Pokedex</h2>
            <div class="pokedex-grid">
                ${items
                  .map(
                    (p) => `
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
                `
                  )
                  .join("")}
            </div>
            <div id="pager">
                <button id="extra-prev">< -10</button>  
                <button id="prev">< Previous</button>
                <span id="pager-info">Page ${this.page} of ${totalPages}</span>
                <button id="next">Next ></button>
                <button id="extra-next">+10 ></button>
            </div>
        </section>
    `;
  }
}

customElements.define("pokedex-page", Pokedex);
