# Partha documentation

The public documentation of Partha at https://docs.partha.co, built with [Docus](https://docus.dev) (Nuxt).
English is the source language; Russian (`ru`) and Tajik (`tg`) sit next to it in `content/`.

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm generate   # static site in .output/public
```

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
