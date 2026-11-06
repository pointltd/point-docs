# Partha documentation

The public documentation of Partha at https://docs.partha.co, built with [Docus](https://docus.dev) (Nuxt).
English is the source language; Russian (`ru`) and Tajik (`tg`) sit next to it in `content/`.

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm generate   # static site in .output/public
```

## Checks

`pnpm check` finds the mistakes that would put a broken page on the live site. It needs no build and takes about a second.
It fails when:

- a page or `.navigation.yml` exists in one language folder but not in the other two (same path under `content/en`,
  `content/ru` and `content/tg`);
- an internal link or image is broken: the page does not exist, the language prefix is missing or from another
  language, an `#anchor` is not on the page, or the file is not in `public/`;
- a page has no `title`, `description` or `navigation.icon` in its front matter (the landing page keeps its text
  under `seo`).

```bash
pnpm check                                          # content checks
pnpm check --build                                  # also run pnpm generate and fail on routes that did not prerender
pnpm check --app-links path/to/docs-links.json      # also check the paths the app links to
```

`--app-links` takes a JSON list of paths without the language prefix, for example
`["warehouse/add-items", "business/add-point#apps"]`, or a map of names to such paths (the app's
`docs-links.json`), and checks each one (and its anchor) in all three languages.

CI runs `pnpm check --build` on every pull request (`.github/workflows/checks.yaml`). It also downloads the app's
list of docs links (`src/layers/base/app/docs-links.json` on `main` in `pointltd/partha-js`) and checks it, so a PR
here cannot rename or remove a page the app links to. `partha-js` is private, so this needs the repository secret
`PARTHA_JS_READ_TOKEN`: a fine-grained token with read-only **Contents** access to `pointltd/partha-js` only. Without
the secret (for example on a PR from a fork) the step prints a warning and skips this one check. The other direction
is checked in `partha-js`: its unit tests check every linked path against a checkout of this repo.

## Deployment

The site is a static build served by nginx on Cloud Run (Google Cloud, project `point-prod`).
A push to `main` builds the image, pushes it to Artifact Registry and applies `infrastructure/terraform/gcp/prod`
(the Cloud Run service and the `docs.partha.co` domain mapping). See `.github/workflows/deploy.yaml`.

The platform pieces it needs (runtime service account, deploy rights, DNS zone) live in `partha-global-ops`.
The `prod` environment of this repo needs the variables `GCP_PROJECT_ID`, `GCP_REGION`, `GCP_WIF_PROVIDER` and
`GCP_DEPLOY_SA`.

Run the production image locally:

```bash
docker build -t partha-docs .
docker run --rm -p 8080:8080 partha-docs   # http://localhost:8080
```

## Notes

- `nitro.preset` is forced to `static` in `nuxt.config.ts` so a host never switches the build to a server bundle.
- Docus has no Tajik interface strings; `patches/docus.patch` adds them, and `app/components/LanguageSelect.vue`
  maps `tg` to the Tajikistan flag.
- Keep `pnpm-lock.yaml` in sync with the `packageManager` pin; the image installs with `--frozen-lockfile`.
