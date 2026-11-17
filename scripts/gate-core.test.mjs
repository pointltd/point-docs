import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { parseArgs, quote, repoFromUrl } from './gate-core.mjs'

const CORE = pathToFileURL(fileURLToPath(new URL('./gate-core.mjs', import.meta.url))).href

function git(cwd, ...args) {
  const r = spawnSync('git', args, { cwd, encoding: 'utf8' })
  assert.equal(r.status, 0, `git ${args.join(' ')}: ${r.stderr}`)
  return r.stdout.trim()
}

// A work repo whose origin is a bare repo in a local folder. The runner tells the gate which GitHub URL to take it for.
function makeRepo({ pushed = true } = {}) {
  const root = mkdtempSync(join(tmpdir(), 'gate-repo-')).replace(/\\/g, '/')
  const bare = `${root}/origin.git`
  mkdirSync(bare, { recursive: true })
  git(bare, 'init', '--bare', '--initial-branch=main')
  const work = `${root}/work`
  mkdirSync(work)
  git(work, 'init', '--initial-branch=main')
  git(work, 'config', 'user.email', 'gate@example.com')
  git(work, 'config', 'user.name', 'Gate Test')
  git(work, 'config', 'commit.gpgsign', 'false')
  git(work, 'remote', 'add', 'origin', bare)
  writeFileSync(join(work, '.gitignore'), '.gate/\n')
  writeFileSync(join(work, 'a.txt'), 'one\n')
  git(work, 'add', '.')
  git(work, 'commit', '-m', 'first')
  if (pushed) git(work, 'push', 'origin', 'main')
  return { root, work }
}

// Runs runGate in the repo with a recording poster; `scenario` picks the steps.
function run(work, scenario, args = []) {
  const posts = join(work, '..', 'posts.jsonl')
  const runner = join(work, '..', 'runner.mjs')
  writeFileSync(
    runner,
    `import { appendFileSync, writeFileSync } from 'node:fs'
import { runGate, _setOriginUrl, _setPoster, parseArgs } from ${JSON.stringify(CORE)}
_setOriginUrl(() => 'https://github.com/owner/name.git')
_setPoster((p) => appendFileSync(process.env.POSTS, JSON.stringify(p) + '\\n'))
const scenarios = {
  ok: [{ name: 'one', run() {} }, { name: 'two', run: async () => {} }],
  fail: [{ name: 'one', run() {} }, { name: 'a-very-long-step-name-that-goes-past-forty-characters', run() { throw new Error('nope') } }, { name: 'never', run() { throw new Error('should not run') } }],
  dirty: [{ name: 'writes a file', run() { writeFileSync('stray.txt', 'x') } }],
  extra: [{ name: 'one', run() {} }],
}
const { urgent } = parseArgs(process.argv)
await runGate({ steps: scenarios[process.env.SCENARIO], urgent, extra: process.env.SCENARIO === 'extra' ? async () => 'plan=' + 'f'.repeat(32) : undefined })
`,
  )
  const r = spawnSync(process.execPath, [runner, ...args], { cwd: work, env: { ...process.env, POSTS: posts, SCENARIO: scenario }, encoding: 'utf8' })
  const list = existsSync(posts) ? readFileSync(posts, 'utf8').trim().split('\n').filter(Boolean).map((l) => JSON.parse(l)) : []
  return { status: r.status, stdout: r.stdout, stderr: r.stderr, posts: list }
}

// Runs changedFiles('origin/main') in the repo and returns what it gave or the error it threw.
function changed(work) {
  const code = [
    `import { changedFiles } from ${JSON.stringify(CORE)}`,
    "try { console.log(JSON.stringify({ files: changedFiles('origin/main') })) } catch (e) { console.log(JSON.stringify({ error: e.message })) }",
  ].join('\n')
  const r = spawnSync(process.execPath, ['--input-type=module', '-e', code], { cwd: work, encoding: 'utf8' })
  assert.equal(r.status, 0, r.stderr)
  return JSON.parse(r.stdout)
}

test('changedFiles lists names with spaces and non-ASCII letters as they are', () => {
  const { work } = makeRepo()
  git(work, 'checkout', '-q', '-b', 'feature')
  writeFileSync(join(work, 'тест.txt'), 'x\n')
  writeFileSync(join(work, 'two words.txt'), 'x\n')
  git(work, 'add', '.')
  git(work, 'commit', '-m', 'second')
  assert.deepEqual(changed(work).files.sort(), ['two words.txt', 'тест.txt'])
})

test('changedFiles throws when HEAD is already on the base', () => {
  const { work } = makeRepo()
  assert.match(changed(work).error, /already in origin\/main/)
})

test('repoFromUrl reads https and ssh GitHub remotes', () => {
  assert.equal(repoFromUrl('https://github.com/owner/name.git'), 'owner/name')
  assert.equal(repoFromUrl('https://github.com/owner/name'), 'owner/name')
  assert.equal(repoFromUrl('https://github.com/owner/na.me/'), 'owner/na.me')
  assert.equal(repoFromUrl('git@github.com:owner/name.git'), 'owner/name')
  assert.equal(repoFromUrl('ssh://git@github.com/owner/name.git'), 'owner/name')
})

test('repoFromUrl refuses a remote that only holds github.com in its path or host name', () => {
  assert.equal(repoFromUrl('C:/tmp/github.com/owner/name.git'), null)
  assert.equal(repoFromUrl('https://example.com/github.com/owner/name.git'), null)
  assert.equal(repoFromUrl('https://notgithub.com/owner/name.git'), null)
  assert.equal(repoFromUrl('https://github.com.example.com/owner/name.git'), null)
  assert.equal(repoFromUrl('http://github.com/owner/name.git'), null)
  assert.equal(repoFromUrl('https://github.com/owner/name/extra'), null)
})

test('quote leaves plain arguments alone and wraps the rest in double quotes', () => {
  assert.equal(quote('--frozen-lockfile'), '--frozen-lockfile')
  assert.equal(quote('app/utils/money.ts'), 'app/utils/money.ts')
  assert.equal(quote('app/pages/b/[organization_id]/a b.vue'), '"app/pages/b/[organization_id]/a b.vue"')
  assert.equal(quote('a&b'), '"a&b"')
})

test('quote refuses what cmd.exe would change inside double quotes', () => {
  assert.throws(() => quote('app/%PATH%.ts'), /cannot pass/)
  assert.throws(() => quote('100%.ts'), /cannot pass/)
  assert.throws(() => quote('a"b.ts'), /cannot pass/)
  assert.throws(() => quote('a\nb'), /cannot pass/)
})

test('parseArgs reads --urgent and other flags', () => {
  const a = parseArgs(['node', 'gate.mjs', '--urgent', '--x'])
  assert.equal(a.urgent, true)
  assert.ok(a.flags.has('--x'))
  assert.equal(parseArgs(['node', 'gate.mjs']).urgent, false)
})

test('a dirty tree exits 1 and posts nothing', () => {
  const { work } = makeRepo()
  writeFileSync(join(work, 'untracked.txt'), 'x')
  const r = run(work, 'ok')
  assert.equal(r.status, 1)
  assert.match(r.stderr, /gate: dirty tree, no pass/)
  assert.equal(r.posts.length, 0)
})

test('a modified tracked file counts as dirty', () => {
  const { work } = makeRepo()
  writeFileSync(join(work, 'a.txt'), 'changed\n')
  const r = run(work, 'ok')
  assert.equal(r.status, 1)
  assert.equal(r.posts.length, 0)
})

test('an unpushed HEAD exits 1 and posts nothing', () => {
  const { work } = makeRepo()
  writeFileSync(join(work, 'a.txt'), 'two\n')
  git(work, 'commit', '-am', 'local only')
  const r = run(work, 'ok')
  assert.equal(r.status, 1)
  assert.match(r.stderr, /gate: HEAD is not pushed/)
  assert.equal(r.posts.length, 0)
})

test('a failing step posts one failure and stops', () => {
  const { work } = makeRepo()
  const r = run(work, 'fail')
  assert.equal(r.status, 1)
  assert.equal(r.posts.length, 1)
  assert.equal(r.posts[0].state, 'failure')
  assert.equal(r.posts[0].repo, 'owner/name')
  assert.match(r.posts[0].description, /^v1 tree=[0-9a-f]{40} mode=full failed=a-very-long-step-name-that-goes-past-for$/)
  assert.ok(r.posts[0].description.length <= 140)
  assert.doesNotMatch(r.stdout, /never/)
  assert.equal(JSON.parse(readFileSync(join(work, '.gate', 'last.json'), 'utf8')).result, 'failure')
})

test('a step that leaves a stray file posts a failure about the tree changing', () => {
  const { work } = makeRepo()
  const r = run(work, 'dirty')
  assert.equal(r.status, 1)
  assert.equal(r.posts.length, 1)
  assert.equal(r.posts[0].state, 'failure')
  assert.match(r.posts[0].description, /failed=tree changed/)
})

test('all steps passing posts one success for the tree', () => {
  const { work } = makeRepo()
  const r = run(work, 'ok')
  assert.equal(r.status, 0, r.stderr)
  assert.equal(r.posts.length, 1)
  const post = r.posts[0]
  assert.equal(post.state, 'success')
  assert.equal(post.sha, git(work, 'rev-parse', 'HEAD'))
  assert.match(post.description, /^v1 tree=[0-9a-f]{40} mode=full$/)
  assert.equal(post.description, `v1 tree=${git(work, 'rev-parse', 'HEAD^{tree}')} mode=full`)
  const last = JSON.parse(readFileSync(join(work, '.gate', 'last.json'), 'utf8'))
  assert.equal(last.result, 'success')
  assert.equal(last.mode, 'full')
  assert.equal(last.steps.length, 2)
})

test('--urgent posts mode=urgent', () => {
  const { work } = makeRepo()
  const r = run(work, 'ok', ['--urgent'])
  assert.equal(r.status, 0, r.stderr)
  assert.match(r.posts[0].description, /^v1 tree=[0-9a-f]{40} mode=urgent$/)
})

test('extra words are appended to the description', () => {
  const { work } = makeRepo()
  const r = run(work, 'extra')
  assert.equal(r.status, 0, r.stderr)
  assert.match(r.posts[0].description, /^v1 tree=[0-9a-f]{40} mode=full plan=f{32}$/)
})
