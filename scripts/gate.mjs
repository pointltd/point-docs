// The release gate for this repo. Run it on a clean, pushed tree before a merge to main:
//
//   node scripts/gate.mjs            the full list
//   node scripts/gate.mjs --urgent   the short list, only when the owner says "urgent"
//
// It posts a `local-gate` commit status; the deploy workflow refuses to run without it.
import { existsSync } from 'node:fs'
import { parseArgs, runGate, sh } from './gate-core.mjs'

const APP_LINKS = '../partha-js/src/layers/base/app/docs-links.json'
const TF_ROOT = 'infrastructure/terraform'
const TF_PROD = 'infrastructure/terraform/gcp/prod'

const { urgent } = parseArgs(process.argv)

const steps = [
  { name: 'install', run: () => sh('pnpm', ['install', '--frozen-lockfile']) },
  urgent
    ? { name: 'check', run: () => sh('pnpm', ['check']) }
    : {
        name: 'check --build --app-links',
        run: () => {
          // The app's link list is part of the check; a missing file is a failure, never a skip.
          if (!existsSync(APP_LINKS)) throw new Error(`${APP_LINKS} not found; clone partha-js next to this repo`)
          sh('pnpm', ['check', '--build', '--app-links', APP_LINKS])
        },
      },
  { name: 'script tests', run: () => sh('node', ['--test', 'scripts/']) },
  { name: 'terraform fmt', run: () => sh('terraform', ['fmt', '-check', '-recursive', TF_ROOT]) },
]

if (!urgent) {
  steps.push(
    { name: 'terraform init', run: () => sh('terraform', [`-chdir=${TF_PROD}`, 'init', '-backend=false', '-input=false', '-lockfile=readonly']) },
    { name: 'terraform validate', run: () => sh('terraform', [`-chdir=${TF_PROD}`, 'validate']) },
  )
}

await runGate({ steps, urgent })
