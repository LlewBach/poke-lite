# Poké Lite

By Gareth Llewelyn

[View deployed site](https://llewbach.github.io/poke-lite/)

## Overview

Poké Lite was inspired by Maximiliano Firtman's course "Vanilla JS: You Might Not Need That Framework". This is a framework-free, reactive Single Page Application.

Poké Lite features a Pokédex and battle sandbox built with vanilla web components and the public PokéAPI.

## Features

### Dashboard

- For managing a 6-slot Team and a Caught collection
- Drag cards between Caught ↔ Team (Team max = 6)
- Reorder your Team by dragging within the 6 slots

### Encounter and battle

- “Explore/Encounter” picks a random wild Pokémon (stores in app state)
- Battle view shows “far” (enemy) and “near” (your active) sprites
- Simple damage loop (attack vs. HP), basic turn switching
- Catch button uses species capture_rate + current HP for a success chance

### Pokédex listing

- Paginated list using PokéAPI (limit/offset)
- Page forward/backward and jump ±10 pages
- Global search by name or #id (client index of up to 1025 Pokémon)

### Pokemon details

- Official artwork image, base stats, types, English flavor text
- Evolution chain flattened to a simple list with stage numbers
- Evolution nodes show accurate sprites fetched per species

### State persistence

- Proxy-backed store emits an appstatechange event and writes to localStorage
- Survives refreshes with a STORAGE_KEY namespaced snapshot

## Tech stack

- Vanilla JS web components (customElements, connectedCallback, etc.)
- Hash router (#/route?params)
- PokéAPI: /pokemon/:id|name, /pokemon-species/:id, evolution chain URL
- CSS Grid/Flexbox for layout; drag & drop via native HTML5 DnD

## Credits

Type icons: <https://github.com/partywhale/pokemon-type-icons/tree/main>
