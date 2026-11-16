// The local release gate. A repo's gate.mjs lists its steps and calls runGate.
//
// runGate refuses a dirty or unpushed tree, runs every step, and then records the result as a `local-gate` commit
// status on the pushed commit. The deploy workflow reads that status (see gate-check.mjs). There is no way to post a
// pass without running the steps. A failed run posts `failure`, which revokes an earlier pass on the same commit.
//
// This file is copied byte for byte into every repo that has a gate. Change it in one place, then copy it.
import { spawnSync } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const WIN = process.platform === 'win32'
const MAX_DESCRIPTION = 140

function quote(arg) {
  return /^[\w@%+=:,./\\-]+$/.test(arg) ? arg : `"${arg.replace(/"/g, '\\"')}"`
}

function spawn(cmd, args, { cwd, env } = {}, stdio) {
  const options = { cwd, env: env ? { ...process.env, ...env } : process.env, stdio, encoding: 'utf8', maxBuffer: 1 << 28 }
  // npm and pnpm are .cmd files on Windows, which Node starts only through a shell. The arguments are fixed strings.
  const cmdFile = WIN && (cmd === 'pnpm' || cmd === 'npm')
  const result = cmdFile
    ? spawnSync([`${cmd}.cmd`, ...args.map(quote)].join(' '), { ...options, shell: true })
    : spawnSync(cmd, args, { ...options, shell: false })
  if (result.error) throw result.error
  if (result.status !== 0) throw new Error(`${cmd} exited ${result.status}`)
  return result
}

/** Runs a command with its output shown. Throws when it exits non-zero. */
export function sh(cmd, args = [], opts = {}) {
  spawn(cmd, args, opts, 'inherit')
}

/** Runs a command and returns its trimmed stdout. Throws when it exits non-zero. */
export function capture(cmd, args = [], opts = {}) {
  return String(spawn(cmd, args, opts, ['ignore', 'pipe', 'inherit']).stdout).trim()
}

/** The `owner/name` of the origin remote, from an https or ssh URL. */
export function originRepo() {
  const url = capture('git', ['remote', 'get-url', 'origin'])
  const match = /github\.com[:/]([\w.-]+)\/([\w.-]+?)(?:\.git)?\/?$/.exec(url)
  if (!match) throw new Error(`origin is not a GitHub remote: ${url}`)
  return `${match[1]}/${match[2]}`
}

/** Files changed on this branch since it left `base`. */
export function changedFiles(base = 'origin/main') {
  const from = capture('git', ['merge-base', 'HEAD', base])
  const out = capture('git', ['diff', '--name-only', from, 'HEAD'])
  return out ? out.split(/\r?\n/) : []
}

/** `--urgent` and any other `--flag` from the command line (pass process.argv). */
export function parseArgs(argv) {
  const flags = new Set(argv.slice(2).filter((a) => a.startsWith('--')))
  return { urgent: flags.has('--urgent'), flags }
}

function ghPost({ repo, sha, state, description }) {
  sh('gh', ['api', '--silent', '-X', 'POST', `repos/${repo}/statuses/${sha}`, '-f', `state=${state}`, '-f', 'context=local-gate', '-f', `description=${description}`])
}

let poster = ghPost

/** Test hook: replaces the function that posts the status. */
export function _setPoster(fn) {
  poster = fn
}

function post(args) {
  if (args.description.length > MAX_DESCRIPTION) throw new Error(`status description is ${args.description.length} characters, the limit is ${MAX_DESCRIPTION}`)
  poster(args)
}

function treeIsClean() {
  return capture('git', ['status', '--porcelain', '--untracked-files=all']) === ''
}

function writeLast(record) {
  mkdirSync('.gate', { recursive: true })
  writeFileSync(join('.gate', 'last.json'), `${JSON.stringify(record, null, 2)}\n`)
}

async function execute({ steps, urgent, extra }) {
  const mode = urgent ? 'urgent' : 'full'
  if (!treeIsClean()) {
    console.error('gate: dirty tree, no pass')
    return 1
  }
  sh('git', ['fetch', 'origin', '--quiet'])
  if (capture('git', ['branch', '-r', '--contains', 'HEAD']) === '') {
    console.error('gate: HEAD is not pushed')
    return 1
  }
  const sha = capture('git', ['rev-parse', 'HEAD'])
  const tree = capture('git', ['rev-parse', 'HEAD^{tree}'])
  const repo = originRepo()
  const started = Date.now()
  const results = []

  const fail = (reason, description) => {
    console.error(`gate: ${reason}`)
    try {
      post({ repo, sha, state: 'failure', description })
    } catch (error) {
      console.error(`gate: could not post the failure status: ${error.message}`)
    }
    writeLast({ sha, tree, mode, extra: '', result: 'failure', steps: results, totalSeconds: Math.round((Date.now() - started) / 1000) })
    return 1
  }

  for (const step of steps) {
    console.log(`gate: ${step.name} ...`)
    const t = Date.now()
    try {
      await step.run()
    } catch (error) {
      results.push({ name: step.name, seconds: Math.round((Date.now() - t) / 1000), ok: false })
      return fail(`${step.name} failed: ${error.message}`, `v1 tree=${tree} mode=${mode} failed=${step.name.slice(0, 40)}`)
    }
    const seconds = Math.round((Date.now() - t) / 1000)
    results.push({ name: step.name, seconds, ok: true })
    console.log(`gate: ${step.name} ok in ${seconds}s`)
  }

  let extraWords = ''
  if (extra) {
    try {
      extraWords = await extra()
    } catch (error) {
      return fail(`extra failed: ${error.message}`, `v1 tree=${tree} mode=${mode} failed=extra`)
    }
  }

  if (!treeIsClean() || capture('git', ['rev-parse', 'HEAD']) !== sha || capture('git', ['rev-parse', 'HEAD^{tree}']) !== tree) {
    return fail('tree changed during the run', `v1 tree=${tree} mode=${mode} failed=tree changed`)
  }

  const description = `v1 tree=${tree} mode=${mode}${extraWords ? ` ${extraWords}` : ''}`
  try {
    post({ repo, sha, state: 'success', description })
  } catch (error) {
    console.error(`gate: could not post the pass: ${error.message}`)
    return 1
  }
  const totalSeconds = Math.round((Date.now() - started) / 1000)
  writeLast({ sha, tree, mode, extra: extraWords, result: 'success', steps: results, totalSeconds })
  console.log(`gate: pass posted for ${sha.slice(0, 7)} (${mode}) in ${(totalSeconds / 60).toFixed(1)} minutes`)
  return 0
}

/** Runs the steps and posts the result. Never returns: it exits the process. */
export async function runGate({ steps, urgent = false, extra } = {}) {
  process.exit(await execute({ steps, urgent, extra }))
}
