# Getting Started with TCGdex

TCGdex is an open-source, multilingual Pokémon Trading Card Game database —
cards, sets and series. The REST API is free and requires no authentication.

## Base URL

The API is language-scoped. Replace `en` with any supported language code:

```
https://api.tcgdex.net/v2/en
```

## Your first request

Fetch a single card by its id:

```bash
curl https://api.tcgdex.net/v2/en/cards/base1-4
```

## Browsing sets and series

```bash
# All sets
curl https://api.tcgdex.net/v2/en/sets

# A single set (with its cards)
curl https://api.tcgdex.net/v2/en/sets/base1
```

## Notes

- Card ids follow the `{set}-{localId}` convention (e.g. `base1-4` is Charizard).
- Many fields are optional and vary by card type; always null-check before use.
