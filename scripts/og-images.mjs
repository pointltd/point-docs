// Makes the share pictures of the docs (public/og/en.png, ru.png, tg.png, 1200x630): the Partha mark, the name and a
// line about the docs in each language. They look like the pictures of the app (partha-js/src/scripts/brand/og-images.mjs).
// Run with `node scripts/og-images.mjs` (needs `sharp`) and commit the result.
// The text is drawn with the fonts of the computer that runs this script, so check the pictures before committing
// (the Tajik letters ғ ӣ қ ӯ ҳ ҷ must all show).
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const out = join(root, 'public', 'og')
mkdirSync(out, { recursive: true })

const pictures = {
  en: { title: ['How to use Partha', 'step by step'], line: 'Guides for stock, prices, the till and profit', size: 78 },
  ru: { title: ['Как работать в Partha', 'шаг за шагом'], line: 'Инструкции по складу, ценам, кассе и прибыли', size: 78 },
  tg: { title: ['Чӣ тавр дар Partha кор кунед', 'қадам ба қадам'], line: 'Дастурҳо оид ба анбор, нархҳо, касса ва фоида', size: 66 },
}

const font = "'Segoe UI', 'Helvetica Neue', Arial, 'DejaVu Sans', sans-serif"
const escape = text => text.replace(/&/g, '&amp;').replace(/</g, '&lt;')
const address = 'docs.partha.co'

for (const [code, { title, line, size }] of Object.entries(pictures)) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#f7f6fb"/>
  <rect x="0" y="0" width="1200" height="14" fill="#5756e4"/>
  <g transform="translate(80 70) scale(3)" fill="none" stroke="#5756e4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="1"/>
  </g>
  <text x="170" y="128" font-family="${font}" font-size="56" font-weight="700" fill="#1b1a2e">Partha</text>
  <text x="80" y="300" font-family="${font}" font-size="${size}" font-weight="700" fill="#1b1a2e">${escape(title[0])}</text>
  <text x="80" y="392" font-family="${font}" font-size="${size}" font-weight="700" fill="#5756e4">${escape(title[1])}</text>
  <text x="80" y="480" font-family="${font}" font-size="34" fill="#4a4960">${escape(line)}</text>
  <rect x="80" y="528" width="${address.length * 17 + 56}" height="52" rx="26" fill="#e9e8fb"/>
  <text x="108" y="564" font-family="${font}" font-size="26" font-weight="600" fill="#3d3cb8">${address}</text>
</svg>`
  const png = await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toBuffer()
  writeFileSync(join(out, `${code}.png`), png)
  console.log(`public/og/${code}.png`, png.length, 'bytes')
}
