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
            <div class="pokedex-grid">
                ${items
                  .map(
                    (p) => `
                    <poke-card
                        id="${p.id}"
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
            </section>
        `;
  }
}

customElements.define("pokedex-page", Pokedex);
