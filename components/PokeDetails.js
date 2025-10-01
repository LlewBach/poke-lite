import { getPokemon, getSpecies } from "../services/pokeApi.js";
import { getImage } from "../services/dataHandlers.js";

export default class PokeDetails extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    this.pid = this.getAttribute("pid");
    this.innerHTML = "<p>Loading...</p>";
    this.load();
  }
  async load() {
    try {
      const poke = await getPokemon(this.pid);
      console.log("Poke: ", poke);

      const species = await getSpecies(this.pid);
      console.log("Species: ", species);

      let chain = [];
      if (species.evolution_chain?.url) {
        const evo = await fetch(species.evolution_chain.url).then((r) =>
          r.json()
        );
        console.log("Evo: ", evo);
        chain = this.flattenChain(evo.chain); // [{pid, name, stage}]

        // Add image for each pokemon in chain
        chain = await Promise.all(
          chain.map(async (p) => {
            const pokeDeets = await getPokemon(p.pid);
            console.log("Pokedeets: ", pokeDeets);
            const evoImg =
              pokeDeets.sprites.other["official-artwork"].front_default ||
              pokeDeets.sprites.front_default;
            return { ...p, img: evoImg };
          })
        ); // [{pid, name, stage, img}]
      }

      const img = getImage(poke);
      const types = poke.types.map((t) => t.type.name);
      const stats = Object.fromEntries(
        poke.stats.map((s) => [s.stat.name, s.base_stat])
      );
      const flavor =
        species.flavor_text_entries.find((f) => f.language.name === "en")
          ?.flavor_text || "";

      this.render({
        img,
        types,
        stats,
        flavor,
        name: poke.name,
        chain,
      });
    } catch (err) {
      this.innerHTML = `<p style="color:red">Failed to load: ${String(
        err
      )}</p>`;
    }
  }
  // flatten the evo chain into a simple list with stage numbers
  flattenChain(node, stage = 1, acc = []) {
    if (!node) return acc;
    const url = node.species.url;
    const m = url.match(/\/pokemon-species\/(\d+)\//);
    const id = m ? Number(m[1]) : null;
    acc.push({
      pid: id,
      name: node.species.name,
      stage,
    });
    (node.evolves_to || []).forEach((n) =>
      this.flattenChain(n, stage + 1, acc)
    );
    return acc;
  }
  render({ img, types, stats, flavor, name, chain }) {
    this.innerHTML = `
      <section class="details">
        <header>
          <h2>${name}</h2>
        </header>

        <div id="poke-details-grid">
          <div>
            <p>Pokedex ID: ${this.pid}</p>
            <p>HP: ${stats.hp}</p>
            <p>Attack: ${stats.attack}</p>
            <p>Defense: ${stats.defense}</p>
            <p>Special Attack: ${stats["special-attack"]}</p>
            <p>Special Defense: ${stats["special-defense"]}</p>
            <p>Speed: ${stats.speed}</p>
            
          </div>
          <div class="img-container">
            <img id="main-detail-img" src="${img}">
          </div>
          <div>
            <div class="type-container">
              ${types
                .map(
                  (type) =>
                    `
                  <img class="type-icon" src="../assets/types/${type}.svg">
                  <span>${type}</span>
                  `
                )
                .join("")}
            </div>
            <p class="flavor">${flavor}</p>
          </div>
        </div>

        <div id="evo-chain">
          ${chain
            .map(
              (evoP, i) => `
                <div class="evo-chain-item">
                  <h3>${evoP.name}</h3>
                  <a href="#/pokemon/${evoP.pid}">
                    <img class="evo-img" src="${evoP.img}">
                  </a>
                  <p>Stage ${evoP.stage}</p>
                </div>
                ${i < chain.length - 1 ? '<span class="arrow">→</span>' : ""}
              `
            )
            .join("")}
        </div> 
      </section>
    `;
  }
}

customElements.define("pokemon-details", PokeDetails);
