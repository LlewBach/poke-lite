export async function getPokemon(pid) {
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${pid}`);
  if (!res.ok) throw new Error("Error finding poke");
  const data = await res.json();
  return data;
}

export async function getSpecies(pid) {
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${pid}`);
  if (!res.ok) throw new Error("Error finding species");
  const data = await res.json();
  return data;
}
