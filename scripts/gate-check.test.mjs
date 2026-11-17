import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdtempSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'
import { findPass, main } from './gate-check.mjs'

const REPO = 'owner/name'
const SHA = 'a'.repeat(40)
const HEAD = 'b'.repeat(40)
const TREE = 'c'.repeat(40)
const LOGIN = 'release-manager'

// A fake GitHub: `statuses` maps a commit to its statuses (newest first), `pulls` lists the PR head commits.
function fakeGet({ statuses = {}, pulls = [], tree = TREE } = {}) {
  return async (path) => {
    if (path === `/repos/${REPO}/git/commits/${SHA}`) return { tree: { sha: tree } }
    if (path === `/repos/${REPO}/commits/${SHA}/pulls`) return pulls.map((sha) => ({ head: { sha } }))
    const match = /^\/repos\/owner\/name\/commits\/([0-9a-f]{40})\/statuses\?per_page=100$/.exec(path)
    if (match) return statuses[match[1]] ?? []
    throw new Error(`unexpected path ${path}`)
  }
}

const EARLIER = '2026-11-17T10:00:00Z'
const LATER = '2026-11-17T11:00:00Z'
const status = (over = {}) => ({ context: 'local-gate', state: 'success', creator: { login: LOGIN }, description: `v1 tree=${TREE} mode=full`, created_at: EARLIER, ...over })
const find = (get) => findPass({ get, repo: REPO, sha: SHA, login: LOGIN })

test('findPass accepts a matching pass on the pushed sha', async () => {
  const pass = await find(fakeGet({ statuses: { [SHA]: [status()] } }))
  assert.equal(pass.sha, SHA)
  assert.equal(pass.mode, 'full')
  assert.equal(pass.plan, '')
})

test('findPass accepts a pass on the PR head with the same tree', async () => {
  const pass = await find(fakeGet({ pulls: [HEAD], statuses: { [HEAD]: [status()] } }))
  assert.equal(pass.sha, HEAD)
})

test('findPass rejects a pass written by a workflow token', async () => {
  const get = fakeGet({ statuses: { [SHA]: [status({ creator: { login: 'github-actions[bot]' } })] } })
  assert.equal(await find(get), null)
})

test('findPass rejects a pass for a different tree', async () => {
  const get = fakeGet({ statuses: { [SHA]: [status({ description: `v1 tree=${'d'.repeat(40)} mode=full` })] } })
  assert.equal(await find(get), null)
})

test('findPass rejects a tree that only matches as a prefix', async () => {
  const get = fakeGet({ statuses: { [SHA]: [status({ description: `v1 tree=${TREE}x mode=full` })] } })
  assert.equal(await find(get), null)
})

test('findPass treats a newer failure as revoking an older pass', async () => {
  const get = fakeGet({ statuses: { [SHA]: [status({ state: 'failure' }), status()] } })
  assert.equal(await find(get), null)
})

test('findPass treats a newer failure on the merge commit as revoking a pass on the PR head', async () => {
  const get = fakeGet({ pulls: [HEAD], statuses: { [SHA]: [status({ state: 'failure', created_at: LATER })], [HEAD]: [status()] } })
  assert.equal(await find(get), null)
})

test('findPass accepts a pass on the merge commit that is newer than a failure on the PR head', async () => {
  const get = fakeGet({ pulls: [HEAD], statuses: { [SHA]: [status({ created_at: LATER })], [HEAD]: [status({ state: 'failure' })] } })
  assert.equal((await find(get)).sha, SHA)
})

test('findPass reads a failure at the same second as the pass as the later one', async () => {
  const get = fakeGet({ pulls: [HEAD], statuses: { [SHA]: [status({ state: 'failure' })], [HEAD]: [status()] } })
  assert.equal(await find(get), null)
})

test('findPass ignores a failure on a PR head with a different tree', async () => {
  const other = status({ state: 'failure', created_at: LATER, description: `v1 tree=${'d'.repeat(40)} mode=full failed=x` })
  const get = fakeGet({ pulls: [HEAD], statuses: { [SHA]: [status()], [HEAD]: [other] } })
  assert.equal((await find(get)).sha, SHA)
})

test('findPass fails closed on a status with no readable time', async () => {
  const get = fakeGet({ statuses: { [SHA]: [status({ created_at: undefined })] } })
  await assert.rejects(find(get), /no readable time/)
})

test('findPass ignores other contexts', async () => {
  const get = fakeGet({ statuses: { [SHA]: [status({ context: 'ci/other', state: 'failure' }), status()] } })
  assert.equal((await find(get)).sha, SHA)
})

test('findPass reads mode and plan words', async () => {
  const get = fakeGet({ statuses: { [SHA]: [status({ description: `v1 tree=${TREE} mode=urgent plan=${'e'.repeat(32)}` })] } })
  const pass = await find(get)
  assert.equal(pass.mode, 'urgent')
  assert.equal(pass.plan, 'e'.repeat(32))
})

test('findPass returns null when there is no status at all', async () => {
  assert.equal(await find(fakeGet()), null)
})

const env = { GH_TOKEN: 'secret-token', REPO, SHA, GATE_LOGIN: LOGIN }
const quiet = () => {
  const out = { log: [], error: [] }
  return { out, log: (m) => out.log.push(m), error: (m) => out.error.push(m) }
}

test('main fails closed when the API call throws', async () => {
  const { out, log, error } = quiet()
  const code = await main({ env, get: async () => { throw new Error('boom') }, log, error })
  assert.equal(code, 1)
  assert.match(out.error[0], /gate-check:/)
  assert.doesNotMatch(out.error.join('\n'), /secret-token/)
})

test('main fails when there is no pass', async () => {
  const { out, log, error } = quiet()
  assert.equal(await main({ env, get: fakeGet(), log, error }), 1)
  assert.match(out.error[0], /node scripts\/gate\.mjs/)
})

test('main passes and warns on an urgent pass', async () => {
  const { out, log, error } = quiet()
  const get = fakeGet({ statuses: { [SHA]: [status({ description: `v1 tree=${TREE} mode=urgent` })] } })
  assert.equal(await main({ env, get, log, error }), 0)
  assert.ok(out.log.some((m) => m.startsWith('::warning::gate-check: released from an urgent gate pass')))
})

test('main rejects a bad SHA without calling the network', async () => {
  const { log, error } = quiet()
  let calls = 0
  const code = await main({ env: { ...env, SHA: 'not-a-sha' }, get: async () => { calls++; return {} }, log, error })
  assert.equal(code, 1)
  assert.equal(calls, 0)
})

test('main rejects a bad REPO without calling the network', async () => {
  const { log, error } = quiet()
  let calls = 0
  const code = await main({ env: { ...env, REPO: 'a/b; rm -rf' }, get: async () => { calls++; return {} }, log, error })
  assert.equal(code, 1)
  assert.equal(calls, 0)
})

test('the CLI exits 1 on a bad SHA', () => {
  const script = fileURLToPath(new URL('./gate-check.mjs', import.meta.url))
  const result = spawnSync(process.execPath, [script], { env: { ...process.env, GH_TOKEN: 'x', REPO, SHA: 'zzz', GATE_LOGIN: LOGIN }, encoding: 'utf8' })
  assert.equal(result.status, 1)
  assert.match(result.stderr, /gate-check:/)
})

test('main writes mode and plan to GITHUB_OUTPUT', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'gate-out-'))
  const file = join(dir, 'output')
  const get = fakeGet({ statuses: { [SHA]: [status()] } })
  const { log, error } = quiet()
  assert.equal(await main({ env: { ...env, GITHUB_OUTPUT: file }, get, log, error }), 0)
  assert.equal(readFileSync(file, 'utf8'), 'mode=full\nplan=\n')
})
