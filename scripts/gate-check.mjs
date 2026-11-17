// Deploy-time check: stops a deploy unless the commit's tree has a `local-gate` pass posted by the release manager.
//
// Run by the deploy workflow with GH_TOKEN, REPO, SHA and GATE_LOGIN in the environment. Every error path fails the
// job: an API problem must never look like a pass.
//
// This file is copied byte for byte into every repo that has a gate. Change it in one place, then copy it.
import { appendFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'

const word = (description, key) => new RegExp(`(?:^|\\s)${key}=(\\S+)`).exec(description)?.[1] ?? ''

/**
 * Finds a valid pass for the tree of `sha`. The pass may sit on `sha` itself or on the head of a pull request that
 * contains it (a merge commit has the same tree as the head it merged). Only the newest `local-gate` status of a
 * candidate counts, and the newest of those for this tree decides: a later failure revokes an earlier pass, also when
 * the two sit on different commits with the same tree (a pass on the PR head, then a failed run on the merge commit).
 */
export async function findPass({ get, repo, sha, login }) {
  const tree = (await get(`/repos/${repo}/git/commits/${sha}`)).tree.sha
  const pulls = await get(`/repos/${repo}/commits/${sha}/pulls`)
  const candidates = [sha, ...pulls.map((p) => p.head.sha)]
  const found = []
  for (const candidate of candidates) {
    const statuses = await get(`/repos/${repo}/commits/${candidate}/statuses?per_page=100`)
    const status = statuses.find((s) => s.context === 'local-gate')
    if (!status || word(status.description ?? '', 'tree') !== tree) continue
    const at = Date.parse(status.created_at)
    // Without a time the order of a pass and a failure is unknown, and that must not read as a pass.
    if (Number.isNaN(at)) throw new Error(`the local-gate status on ${candidate} has no readable time`)
    found.push({ candidate, status, at, ok: status.state === 'success' && status.creator?.login === login })
  }
  const pass = found.filter((f) => f.ok).sort((a, b) => b.at - a.at)[0]
  // `>=`: the times have one-second steps, so a tie is read as the failure being the later one.
  if (!pass || found.some((f) => !f.ok && f.at >= pass.at)) return null
  const { description } = pass.status
  return { sha: pass.candidate, description, mode: word(description, 'mode'), plan: word(description, 'plan') }
}

const REASON = 'Run node scripts/gate.mjs on this commit or its PR head, then re-run this workflow.'

/** The CLI body, with its inputs injected so tests need no network. Returns the exit code. */
export async function main({ env, get, log = console.log, error = console.error }) {
  const { GH_TOKEN: token, REPO: repo, SHA: sha, GATE_LOGIN: login } = env
  if (!token || !login) {
    error(`gate-check: GH_TOKEN and GATE_LOGIN must be set. ${REASON}`)
    return 1
  }
  if (!/^[\w.-]+\/[\w.-]+$/.test(repo ?? '')) {
    error(`gate-check: REPO is not owner/name. ${REASON}`)
    return 1
  }
  if (!/^[0-9a-f]{40}$/.test(sha ?? '')) {
    error(`gate-check: SHA is not a 40-character commit hash. ${REASON}`)
    return 1
  }
  let pass
  try {
    pass = await findPass({ get, repo, sha, login })
  } catch (e) {
    error(`gate-check: the GitHub API call failed (${e.message}). ${REASON}`)
    return 1
  }
  if (!pass) {
    error(`gate-check: no local-gate pass from ${login} for the tree of ${sha}. ${REASON}`)
    return 1
  }
  log(`gate-check: pass on ${pass.sha}: ${pass.description}`)
  if (pass.mode === 'urgent') log('::warning::gate-check: released from an urgent gate pass; run the full gate on this tree now')
  if (env.GITHUB_OUTPUT) appendFileSync(env.GITHUB_OUTPUT, `mode=${pass.mode}\nplan=${pass.plan}\n`)
  return 0
}

function githubGet(token) {
  return async (path) => {
    const response = await fetch(`https://api.github.com${path}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' },
      signal: AbortSignal.timeout(15_000),
    })
    if (!response.ok) throw new Error(`${path} returned ${response.status}`)
    return response.json()
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exit(await main({ env: process.env, get: githubGet(process.env.GH_TOKEN) }))
}
