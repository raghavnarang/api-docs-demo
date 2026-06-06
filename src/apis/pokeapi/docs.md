# Getting Started with PokéAPI

PokéAPI is a free, open RESTful API for Pokémon data — species, types, abilities,
moves and more. No authentication or API key is required.

## Base URL

```
https://pokeapi.co/api/v2
```

## Your first request

Fetch a single Pokémon by name or id:

```bash
curl https://pokeapi.co/api/v2/pokemon/pikachu
```

The response is JSON describing the Pokémon's stats, types, abilities and sprites.

## Pagination

List endpoints accept `limit` and `offset` query parameters:

```bash
curl "https://pokeapi.co/api/v2/pokemon?limit=20&offset=40"
```

Each list response includes `count`, `next`, and `previous` for traversal.

## Fair use

PokéAPI is a shared, free service. Please **cache responses locally** and avoid
hammering the API — the data is effectively static. There is a soft rate limit;
clients that exceed it receive `429 Too Many Requests`.
