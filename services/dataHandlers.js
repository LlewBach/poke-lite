export function getCardInfo(pokemon) {
  const img =
    pokemon.sprites?.other?.["official-artwork"]?.front_default ||
    pokemon.sprites?.front_default;
  const types = pokemon.types.map((t) => t.type.name);
  const stats = Object.fromEntries(
    pokemon.stats.map((s) => [s.stat.name, s.base_stat])
  );
  return {
    pid: pokemon.id,
    name: pokemon.name,
    img,
    types,
    stats,
  };
}
