# heypi website

Static Astro site for `heypi.dev`.

Docs are committed in `docs/`. Pull a fresh copy from the heypi package manually when needed:

```bash
pnpm install
pnpm sync:docs
```

Then check the site locally:

```bash
pnpm dev
```

By default the sync script uses `../biots` when it exists. For a local checkout elsewhere:

```bash
HEYPI_DOCS_PATH=/path/to/heypi pnpm sync:docs
```

## Rebuilding docs

Cloudflare builds only the committed site. It does not import docs from the heypi repo.

Manual docs update flow:

```bash
pnpm sync:docs
pnpm dev
git add docs
git commit -m "Update heypi docs"
git push
```

If site code changed too, use `git add .` before committing.
