export default class Pokedex extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    this.innerHTML = "<p>Loading Pokédex…</p>";
    this.load();
  }
  async load() {
    try {
      const res = await fetch(
        "https://pokeapi.co/api/v2/pokemon?limit=20&offset=0"
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const list = await res.json();

      const details = await Promise.all(
        list.results.map((animal) => fetch(animal.url).then((r) => r.json()))
      );

      console.log(details);

      this.items = details.map((d) => ({
        id: d.id,
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
    } catch (err) {
      this.innerHTML = `<p style="color:red">Error loading Pokédex: ${String(
        err
      )}</p>`;
    }
  }
  render() {
    const items = this.items ?? [];
    this.innerHTML = `
            <section>
            <h2>Pokedex</h2>
            <ul>
                ${items.map(
                  (p) => `
                    <li>
                        <img
                            loading="lazy" 
                            src=${p.img}
                            alt=${p.name}
                            width="96"
                            height="96"
                        >
                        <p>#${p.id} ${p.name}</p>
                        <small>Types: ${p.types.join(", ")}</small>
                        <div class="stats">
                            <span>HP ${p.stats.hp}</span>
                            <span>ATK ${p.stats.attack}</span>
                            <span>DEF ${p.stats.defense}</span>
                        </div>
                    </li>
                `
                )}
            </ul>
            </section>
        `;
  }
}

customElements.define("pokedex-page", Pokedex);
