import { getCardInfo } from "../services/dataHandlers.js";

export default class Pokedex extends HTMLElement {
  constructor() {
    super();
    this.MAX = 1025;
    this.pokeIndex = null;
    this.limit = 24;
    this.page = this._readPageFromHash() || 1;
    this.items = [];
    this.count = this.MAX;
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

  _bindSearch() {
    const form = this.querySelector("#search-form");
    const input = this.querySelector("#search-input");
    const clearBtn = this.querySelector("#clear-search");

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      this.search = input.value.trim().toLowerCase();
      if (this.search) {
        this.load();
      }
    });

    clearBtn.addEventListener("click", (e) => {
      e.preventDefault();
      if (!this.search) return;
      this.search = "";
      this.load();
    });
  }

  async ensureIndex() {
    // Cache hit
    if (this.pokeIndex) {
      console.log("Hitting cache!");
      return this.pokeIndex;
    }

    // Start fetch
    console.log("Fetching pokeIndex");
    const res = await fetch(
      "https://pokeapi.co/api/v2/pokemon?limit=1025&offset=0"
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    this.pokeIndex = data.results.map((r) => {
      const id = r.url.match(/\/pokemon\/(\d+)\//)[1];
      return { pid: id, name: r.name, url: r.url };
    });
  }
  async load() {
    if (this.search) {
      // Search load
      try {
        await this.ensureIndex();
        const searchUrl = this.pokeIndex.find(
          (p) => p.pid == this.search || p.name == this.search
        ).url;
        if (searchUrl) {
          const urlRes = await fetch(searchUrl);
          if (!urlRes.ok) throw new Error(`HTTP ${urlRes.status}`);
          const data = await urlRes.json();
          this.items = [getCardInfo(data)];
        }
      } catch (err) {
        this.innerHTML = `<p style="color:red">Error finding Pokémon: ${String(
          err
        )}</p>`;
      }
    } else {
      // Full load
      const offset = (this.page - 1) * this.limit;
      const effectiveLimit = Math.max(
        0,
        Math.min(this.limit, this.MAX - offset)
      );

      // If someone navigates past the cap, snap back to last page
      if (effectiveLimit <= 0) {
        const totalPages = Math.max(1, Math.ceil(this.MAX / this.limit));
        this.page = totalPages;
        this._writePageToHash();
        return this.load();
      }
      try {
        const res = await fetch(
          `https://pokeapi.co/api/v2/pokemon?limit=${effectiveLimit}&offset=${offset}`
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const list = await res.json();
        console.log("List: ", list);

        const details = await Promise.all(
          list.results.map((animal) => fetch(animal.url).then((r) => r.json()))
        );

        console.log("Details: ", details);

        this.items = details.map(getCardInfo);
      } catch (err) {
        this.innerHTML = `<p style="color:red">Error loading Pokédex: ${String(
          err
        )}</p>`;
      }
    }
    this.render();
    this._bindSearch();
    this._bindPager();
  }
  render() {
    const items = this.items ?? [];
    const totalPages = Math.max(1, Math.ceil(this.MAX / this.limit));
    this.innerHTML = `
        <section>
            <h2>Pokedex</h2>

            <form id="search-form">
                <input 
                    id="search-input"
                    type="search"
                    placeholder="Search name or #id"
                >
                <button type="submit">Search</button>
                <button id="clear-search">Clear</button>
            </form>

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
