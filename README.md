# heypi website

Static Astro site for `heypi.dev`.

Docs are sourced from the heypi package at build time:

```bash
pnpm install
pnpm dev
```

By default the sync script uses `../biots` when it exists. In CI, set `HEYPI_DOCS_REPO` and `HEYPI_DOCS_REF`, or rely on the defaults:

```bash
HEYPI_DOCS_REPO=https://github.com/hunvreus/heypi.git HEYPI_DOCS_REF=main pnpm build
```

For a local checkout elsewhere:

```bash
HEYPI_DOCS_PATH=/path/to/heypi pnpm build
```

## Rebuilding docs

The build always runs `scripts/sync-docs.mjs` before Astro. That means:

- Local development uses `../biots` automatically when that checkout exists.
- CI or Cloudflare builds clone `https://github.com/hunvreus/heypi.git` by default and import `packages/heypi/docs`.
- To pin a docs revision, set `HEYPI_DOCS_REF`.
- To import docs manually and commit the generated `docs/` folder, run `pnpm sync:docs`.

Automatic rebuilds from heypi doc changes still need an external trigger. The usual options are:

- Add a GitHub Action in `hunvreus/heypi` that triggers a deploy/rebuild for this site after docs changes.
- Add a manual release step: run `pnpm sync:docs`, commit the changed `docs/` files here, then push.
