export function getImage(pokemon) {
  return (
    pokemon.sprites?.other?.["official-artwork"]?.front_default ||
    pokemon.sprites?.front_default
  );
}

export function getCardInfo(pokemon) {
  const img = getImage(pokemon);
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
