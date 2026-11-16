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

CI runs `pnpm check --build` on every pull request, on hosted runners (free, this repo is public;
`.github/workflows/checks.yaml`). It also downloads the app's
list of docs links (`src/layers/base/app/docs-links.json` on `main` in `pointltd/partha-js`) and checks it, so a PR
here cannot rename or remove a page the app links to. `partha-js` is private, so this needs the repository secret
`PARTHA_JS_READ_TOKEN`: a fine-grained token with read-only **Contents** access to `pointltd/partha-js` only. Without
the secret (for example on a PR from a fork) the step prints a warning and skips this one check. The other direction
is checked in `partha-js`: its unit tests check every linked path against a checkout of this repo.

## Deployment

The site is a static build served by nginx on Cloud Run (Google Cloud, project `point-prod`).
A push to `main` builds the image, pushes it to Artifact Registry and applies `infrastructure/terraform/gcp/prod`
(the Cloud Run service and the `docs.partha.co` domain mapping). See `.github/workflows/deploy.yaml`.

### Release gate

Before a merge to `main`, run the local gate on the pull request head (a clean, pushed tree):

```bash
node scripts/gate.mjs            # or: pnpm gate
```

It installs, runs `pnpm check --build --app-links` against the app's link list in `../partha-js`, the script tests and
the Terraform format and validate checks. If all pass it posts a `local-gate` commit status on the pushed commit,
keyed by the tree hash. The deploy workflow has a first job, `gate-check`, that stops the release unless that pass
exists for the tree it is about to deploy, and the hosted `check` job must pass too. A later failed gate run on the
same commit posts `failure`, which revokes the earlier pass. If `main` moved after the pull request was checked,
run the gate again on `main` and re-run the workflow. `--urgent` runs a shorter list and is only for an urgent fix
(see `CLAUDE.md`).

When the script cannot run (for example the very first gate-enabled merge, when the check itself is what is being
introduced), post the status by hand from the account that owns the gate login:

```bash
gh api -X POST repos/pointltd/point-docs/statuses/<sha> -f state=success -f context=local-gate -f description="v1 tree=<tree> mode=full"
```

`<tree>` is `git rev-parse <sha>^{tree}`. Post it only for a tree on which you ran the checks yourself; the status
is a record of that, not a way around it.

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
