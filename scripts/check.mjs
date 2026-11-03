#!/usr/bin/env node
// Checks that keep broken docs from reaching the live site. See README ("Checks").
//
//   node scripts/check.mjs                       content checks (fast, no build)
//   node scripts/check.mjs --app-links FILE      also check the paths the app links to (JSON list or map)
//   node scripts/check.mjs --build               also run `pnpm generate` and check what it prerendered
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { join, relative } from 'node:path'

const ROOT = new URL('..', import.meta.url).pathname
const CONTENT = join(ROOT, 'content')
const PUBLIC = join(ROOT, 'public')
const LANGS = ['en', 'ru', 'tg']

const args = process.argv.slice(2)
const flag = name => args.includes(name)
const option = (name) => {
  const i = args.indexOf(name)
  if (i === -1) return undefined
  if (!args[i + 1] || args[i + 1].startsWith('--')) fail(`${name} needs a value`)
  return args[i + 1]
}
function fail(message) {
  console.error(message)
  process.exit(2)
}

const errors = []
const report = (where, message) => errors.push(`${where}: ${message}`)

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    return statSync(path).isDirectory() ? walk(path) : [path]
  })
}

// "3.warehouse/1.add-items.md" -> "warehouse/add-items"; "x/index.md" -> "x"; "index.md" -> ""
const stripOrder = segment => segment.replace(/^\d+\./, '')
function routeOf(relPath) {
  const parts = relPath.replace(/\.md$/, '').split('/').map(stripOrder)
  if (parts.at(-1) === 'index') parts.pop()
  return parts.join('/')
}

// ---- 1. Same files in every language ----

const files = {} // lang -> Set of paths relative to content/<lang>
for (const lang of LANGS) {
  files[lang] = new Set(
    existsSync(join(CONTENT, lang)) ? walk(join(CONTENT, lang)).map(p => relative(join(CONTENT, lang), p)) : [],
  )
}
for (const lang of LANGS) {
  for (const file of files[lang]) {
    const missing = LANGS.filter(l => !files[l].has(file))
    if (missing.length) report(`content/${lang}/${file}`, `missing in ${missing.join(', ')}`)
  }
}

// ---- 3. Front matter (and page index for the link check) ----

function frontMatter(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/)
  if (!m) return null
  const data = {}
  let parent = null
  for (const line of m[1].split(/\r?\n/)) {
    const top = line.match(/^([A-Za-z_][\w-]*):\s*(.*)$/)
    const nested = line.match(/^\s+([A-Za-z_][\w-]*):\s*(.*)$/)
    if (top) {
      parent = top[1]
      data[parent] = top[2] === '' ? {} : top[2]
    } else if (nested && parent && typeof data[parent] === 'object') {
      data[parent][nested[1]] = nested[2]
    }
  }
  return { data, body: text.slice(m[0].length) }
}

const pages = {} // lang -> Map route -> { file, anchors }
for (const lang of LANGS) {
  pages[lang] = new Map()
  for (const file of files[lang]) {
    if (!file.endsWith('.md')) continue
    const where = `content/${lang}/${file}`
    const text = readFileSync(join(CONTENT, lang, file), 'utf8')
    const fm = frontMatter(text)
    if (!fm) {
      report(where, 'no front matter')
      continue
    }
    // The landing page (content/<lang>/index.md) is a hero, not a nav entry: it keeps its text under `seo`.
    const landing = file === 'index.md'
    for (const key of ['title', 'description']) {
      const value = landing ? fm.data.seo?.[key] ?? fm.data[key] : fm.data[key]
      if (typeof value !== 'string' || !value.trim()) report(where, `front matter has no ${landing ? `seo.${key}` : key}`)
    }
    if (!landing) {
      const icon = fm.data.navigation?.icon
      if (!icon || !icon.trim()) report(where, 'front matter has no navigation.icon')
      else if (!/^i-lucide-[a-z0-9-]+$/.test(icon.trim())) report(where, `navigation.icon "${icon}" is not an i-lucide-* icon`)
    }
    pages[lang].set(routeOf(file), { file, text })
  }
  for (const file of files[lang]) {
    if (!file.endsWith('.navigation.yml')) continue
    const text = readFileSync(join(CONTENT, lang, file), 'utf8')
    for (const key of ['title', 'icon']) {
      if (!new RegExp(`^${key}:\\s*\\S`, 'm').test(text)) report(`content/${lang}/${file}`, `no ${key}`)
    }
  }
}

// ---- 2. Links and images ----

// Plain-text anchors the page defines: "[]{#id}" spans and explicit {#id} marks.
function explicitAnchors(text) {
  return new Set([...text.matchAll(/\{#([\w-]+)\}/g)].map(m => m[1]))
}
function slug(heading) {
  return heading.toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, '').trim().replace(/\s+/g, '-')
}
function anchorsOf(text) {
  const anchors = explicitAnchors(text)
  for (const m of text.matchAll(/^#{1,6}\s+(.+?)\s*$/gm)) anchors.add(slug(m[1].replace(/[`*_]|\{#[\w-]+\}/g, '')))
  return anchors
}

// Targets in markdown links/images, MDC props (to, href, src, image, icon-less) and front matter (to:, src:).
const REFERENCE = /\]\(\s*<?([^)\s>]+)|\b(?:to|href|src|image)\s*[:=]\s*["']?(\/[^\s"')}]*)/g

function checkTarget(lang, where, target) {
  if (/^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(target)) {
    if (target.startsWith('#')) return
    return // external (http:, mailto:, tel:)
  }
  if (!target.startsWith('/')) return report(where, `relative link "${target}": use a full path like /${lang}/...`)
  const [pathAndQuery, hash] = target.split('#')
  const path = pathAndQuery.split('?')[0].replace(/\/+$/, '')
  const seg = path.split('/')[1]
  if (LANGS.includes(seg)) {
    if (seg !== lang) return report(where, `link "${target}" goes to ${seg} from a ${lang} page`)
    const route = path.split('/').slice(2).join('/')
    const page = pages[lang].get(route)
    if (!page) return report(where, `link "${target}" points to a page that does not exist`)
    if (hash && !anchorsOf(page.text).has(hash)) report(where, `link "${target}": no heading or {#${hash}} anchor on that page`)
    return
  }
  if (path === '') return report(where, `link "${target}" has no language prefix`)
  // Anything else must be a file in public/ (images, downloads), or a page link that lost its language.
  if (existsSync(join(PUBLIC, path)) && statSync(join(PUBLIC, path)).isFile()) return
  if (pages[lang].has(path.slice(1))) return report(where, `link "${target}" has no language prefix (use /${lang}${path})`)
  report(where, `"${target}" is not a page and there is no such file in public/`)
}

// `::screenshot{src="warehouse/add-items-1"}` needs both themes: public/images/<lang>/<src>.{light,dark}.webp.
const SCREENSHOT = /::screenshot\{([^}]*)\}/g

for (const lang of LANGS) {
  for (const [, { file, text }] of pages[lang]) {
    const where = `content/${lang}/${file}`
    const body = text.replace(/```[\s\S]*?```/g, '').replace(/`[^`\n]*`/g, '')
    for (const m of body.matchAll(SCREENSHOT)) {
      const src = m[1].match(/\bsrc="([^"]+)"/)?.[1]
      const alt = m[1].match(/\balt="([^"]*)"/)?.[1]
      if (!src) {
        report(where, `::screenshot without src`)
        continue
      }
      if (!alt?.trim()) report(where, `::screenshot "${src}" has no alt text`)
      for (const theme of ['light', 'dark']) {
        const path = join(PUBLIC, 'images', lang, `${src}.${theme}.webp`)
        if (!existsSync(path)) report(where, `::screenshot "${src}": missing public/images/${lang}/${src}.${theme}.webp`)
      }
    }
    for (const m of body.replace(SCREENSHOT, '').matchAll(REFERENCE)) checkTarget(lang, where, m[1] ?? m[2])
  }
}

// ---- 4. Paths the app links to ----

const appLinks = option('--app-links')
if (appLinks) {
  let list
  try {
    list = JSON.parse(readFileSync(appLinks, 'utf8'))
  } catch (e) {
    fail(`cannot read ${appLinks}: ${e.message}`)
  }
  // The app's docs-links.json maps a page name to its path; a plain list of paths works too.
  if (list && typeof list === 'object' && !Array.isArray(list)) list = Object.values(list)
  if (!Array.isArray(list) || list.some(p => typeof p !== 'string')) fail(`${appLinks} must be a JSON list or map of paths`)
  for (const entry of list) {
    const [pathPart, hash] = entry.split('#')
    const route = pathPart.replace(/^\/+|\/+$/g, '')
    for (const lang of LANGS) {
      const page = pages[lang].get(route)
      if (!page) report(`app link "${entry}"`, `no page in ${lang}`)
      else if (hash && !anchorsOf(page.text).has(hash)) report(`app link "${entry}"`, `no anchor #${hash} in ${lang}`)
    }
  }
}

// ---- 5. Build: every page must prerender ----

if (flag('--build')) {
  const build = spawnSync('pnpm', ['generate'], { cwd: ROOT, encoding: 'utf8', maxBuffer: 1 << 28 })
  const log = `${build.stdout}\n${build.stderr}`
  if (build.status !== 0) {
    console.error(log.split('\n').slice(-40).join('\n'))
    report('pnpm generate', `failed with exit code ${build.status}`)
  }
  // Nuxt keeps going when a page fails to render: the route is logged with its status, and the exit code stays 0.
  for (const line of log.split('\n')) {
    if (/\[[45]\d\d\]|\(\s*[45]\d\d\s*\)|Error prerendering|Errors prerendering/i.test(line)) report('pnpm generate', line.trim())
  }
  for (const lang of LANGS) {
    for (const route of pages[lang].keys()) {
      const base = join(ROOT, '.output/public', lang, route)
      // Nitro writes either <route>.html or <route>/index.html.
      if (!existsSync(`${base}.html`) && !existsSync(join(base, 'index.html'))) report('pnpm generate', `no page was built for /${lang}/${route}`)
    }
  }
}

if (errors.length) {
  console.error(`\n${errors.length} problem${errors.length === 1 ? '' : 's'} found:\n`)
  for (const e of errors) console.error(`  ✗ ${e}`)
  process.exit(1)
}
console.log(`✓ docs checks passed (${LANGS.map(l => `${l}: ${pages[l].size} pages`).join(', ')})`)
