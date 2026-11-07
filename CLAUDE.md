# Partha documentation

This repo is the public user documentation of Partha at https://docs.partha.co. It is built with
[Docus](https://docus.dev) (Nuxt Content + Nuxt UI). Build, deploy and setup notes are in `README.md`.

Partha is the public product name. "Point" is only the internal technical name: never use it in the docs, in any language.

## Who reads this

Our readers are small business owners, cashiers and store staff, mostly in Central Asia. Many have little experience
with software and no training in accounting or law. They usually open a page because they are stuck on one task right
now, often from a phone. Every rule below follows from that.

## Languages

- Three languages: English (`en`), Russian (`ru`) and Tajik (`tg`). The language is always the first part of the path:
  `/en/...`, `/ru/...`, `/tg/...`. The root `/` redirects to `/en`.
- English is the source. Write or change the English page first, then the Russian and Tajik pages in the same change.
  A page never exists in only one or two languages; if a translation is not ready, add the page with the English text
  and a `::note` that the translation is coming, rather than leaving a missing page or broken link.
- **Paths are the same in every language.** Folder and file names (slugs) are English and identical under `en`, `ru`
  and `tg`, for example `/ru/warehouse/receive-goods`. Only the titles and text are translated. The app builds links
  by swapping the language part, so a translated slug breaks those links.
- Tajik is written in Cyrillic with the Tajik letters (ғ, ӣ, қ, ӯ, ҳ, ҷ). Never replace them with Russian look-alikes
  (г, и, к, у, х, ч).
- Use the same words for the same things as the app's interface. Take button, menu and screen names from
  `partha-js/src/i18n/locales/{en,ru,tg}.json` and write them exactly as the app shows them in that language, in
  **bold**. If the app text is wrong or unclear, fix it in the app, not only in the docs.
- Translate the meaning, not word by word. Each language must read as if it was written in that language.

## Writing style

Write so that a person with no knowledge of software, accounting or law understands the page on the first read.

- Short sentences, everyday words, active voice. Talk to the reader as "you".
- One task per page, named by what the reader wants to do: "Receive goods from a supplier", not "Goods receipt notes".
- Start each page with one or two sentences: what this is and why the reader would care. Then the steps.
- Explain a term the first time it appears, in plain words, and link it to the glossary
  (`/<lang>/glossary`). Prefer the plain word over the term when both work ("stock value", not "inventory valuation").
- Number the steps. One action per step. Say where to click and what the reader will see after it.
- Say what can go wrong and how to fix it, right where it can happen, not in a separate page nobody finds.
- Never assume one country. Currency, taxes, receipts and legal rules differ per market. Write the shared behaviour on
  the main page and put country rules on their own pages under `markets/` (for example `/ru/markets/tajikistan/taxes`)
  or in `::tabs` with one tab per country. Use neutral examples ("100.00") or show the currency the reader chose.
- Money and accounting topics follow IFRS, like the product. Explain the idea in plain words first; name the standard
  only in a short note for accountants ("This follows IAS 2."). Posted documents are never edited or deleted in
  Partha; the docs show how to correct them with a reversal.
- **Name the product as a thing, not a person.** Partha is "the app" (ru: приложение, tg: барнома). In Russian it is
  neuter ("оно", "в нём"); never "она" or "система". Avoid the pronoun in headings and descriptions: repeat "Partha"
  or the noun. Tajik has no gender, but write "барнома" or "Partha" instead of a bare "он", which can also mean a
  person.
- **Not only shops.** A point can be a shop, a warehouse or a cafe, and a warehouse may never sell. Do not write as if
  every reader runs a shop: say "business" or "point", and give shop and warehouse examples. Cash desk steps are for
  points that sell; say so where it matters.
- **Say "point" for a place of business.** The app's word is **point** (ru: точка, tg: нуқта): a shop, a store, a
  warehouse or a cafe. Write it with the term component (below) in running text; do not call it "store" or "branch".
- No jargon from our code: no "endpoint", "module", "GRN", "point_id". Say "store" or the name the app uses.

## Research before writing

Before writing a new page or a new term, look at how similar apps describe the same feature, so our text uses the
words people already know and sounds natural in each language.

- Check several apps per language, for example Square, Shopify POS, Lightspeed, Loyverse and Zoho Inventory for
  English; МойСклад, Poster, iiko, Эвотор and 1С for Russian. Tajik has few such apps: look at Tajik-language apps and
  sites used by local businesses (banks, wallets, marketplaces), the tax authority's materials and Tajik news on
  business topics, and ask a native speaker when in doubt.
- Note how they name the feature, how they order the steps and which words they avoid. Pick the word most of them use
  and that a beginner understands; when they disagree, prefer the plainer one.
- Learn from them, never copy them. Write our own text, do not reuse their sentences, screenshots or structure, and
  never name other products in the docs.
- If the research shows that a word in the app sounds unnatural, propose changing it in the app's `i18n/locales` too,
  so the app and the docs keep using the same word. Add settled terms to the glossary.

## Structure

The sections are ordered the way a business sets itself up in Partha: create the business and its stores, add items
and stock, set prices, then sell.

```
content/<lang>/
  index.md                    landing page: what Partha is, "What do you do?" role cards
  1.getting-started/          what Partha is, set up your shop in 15 minutes (one guided path), install on phone
  2.business/                 create the business, add stores, business settings, plan and billing, your profile
  3.warehouse/                items and categories, suppliers, receive goods, move goods, write off, check stock
  4.prices/                   set and change prices
  5.cashier/                  open and close a shift, make a sale, take payment, receipts, refunds, sales history
  6.reports/                  money and reports: sales, profit, stock value, how Partha counts cost
  7.team/                     invite staff, roles and what each can do, remove someone
  8.markets/<country>/        country guides: taxes, receipts, legal requirements
  9.help/                     FAQ, troubleshooting, glossary, what's new, contact us
```

- Section titles use the app's menu words in each language. Pages for a screen sit in the section of that screen, so
  a reader finds the page where they found the screen. The exception is `reports`: it gathers the money questions
  (profit, stock value) that the app shows on several screens, and links both ways.
- Country rules live in `markets/`, or in tabs per country on the shared page. The shared pages describe what is the
  same everywhere.
- Two levels at most (section, then page). Number prefixes (`1.`, `2.`) set the order and do not appear in the URL.
  Each folder has a `.navigation.yml` with a translated `title` and an `icon`.
- **Getting started** has one guided path that follows the section order (business, store, items, receive goods,
  price, first sale, see your profit), linking to the full pages instead of repeating them.
- **Role paths.** The landing page asks "What do you do?" with three cards (owner, cashier, stock keeper). Each card
  opens a short list of 5–7 existing pages in a sensible order. Role paths only link to pages; there are no separate
  copies of the docs per role.

### Page types

Every section uses these page types:

1. **Overview** (the section's `index.md`): two sentences on what the section is for, then a `::card-group` of its
   tasks.
2. **Task pages**, most of the docs: one task, numbered steps, screenshots, what can go wrong, next steps.
3. **"How it works" pages**, only where people get confused: how stock value is counted, why a posted document cannot
   be edited and how a reversal fixes it, what a refund does to stock. Money explanations follow IFRS, in plain words.
4. **Reference**, only where a table beats text: the roles and permissions table, the fields of a complex form.
- Put a `description` in double quotes when it has a colon: an unquoted colon breaks the YAML, the page returns a 500
  and `pnpm generate` still finishes. After a build, check its output for `[500]`.
- Every page has front matter: `title`, `description` (one sentence, shown in search and link previews) and
  `navigation.icon` (a Lucide icon, `i-lucide-*`).
- Keep a section to about 10 pages. Split it when it grows past that.
- A page ends with "Next steps" or related links, so the reader never hits a dead end.

### Page template

```md
---
title: Receive goods from a supplier
description: Record the goods a supplier delivered so your stock and costs stay correct.
navigation:
  icon: i-lucide-package-plus
---

When a supplier brings goods, record them in Partha. Your stock goes up and Partha
remembers what each item cost you.

::note
You need the **Warehouse** access to do this. Ask the owner of the business if you don't see it.
::

## Steps

::steps{level="3"}
### Open the warehouse
...
### Add the items
...
::

## If something went wrong
...

## Next steps
::card-group
...
::
```

## Making pages look good

The docs must be pleasant to read and easy to scan. Use Docus and Nuxt UI components (MDC syntax) instead of walls of
text. Pick the component by what it is for:

| Need | Use |
| --- | --- |
| A sequence of actions | `::steps` with `###` headings |
| A helpful hint | `::tip` |
| Extra context | `::note` |
| Something that can cause a mistake | `::warning` |
| Something that loses data or money, or cannot be undone | `::caution` |
| The same task on phone and computer, or per country | `::tabs` / `::tabs-item` |
| Links to next pages, section overviews | `::card-group` with `::card` (icon, title, short text) |
| FAQ and rare details | `::accordion` / `::accordion-item`, `::collapsible` |
| Fields of a form and what to type | `::field-group` / `::field`, or a table |
| A keyboard key | `:kbd{value="Enter"}` |
| A status or plan label | `:badge` |
| Landing and section start pages | `::u-page-hero`, `::u-page-feature` |

Rules:

- Use components to help the reader, not to decorate. At most one callout in a row; never stack three warnings.
- Screenshots: one per important step, in the language of the page, taken from the demo business (see below), never
  from real customer data. Store them in `public/images/<lang>/<section>/<page>-<step>.{light,dark}.webp` and show
  them with `::screenshot{src="<section>/<page>-<step>" alt="…"}`, with a useful `alt` text in that language.
  Always use the desktop layout, the cash desk included, never the phone layout. Take them at twice the pixel
  density (a crop of 800 css px becomes a 1600 px image) and save them losslessly, cropped to the part that matters;
  the component never shows an image wider than half its pixels, so it stays sharp. Highlight the button to press
  with one consistent marker style. All of this is what the screenshot script does (below).
- Use short GIFs or videos only for moves a picture cannot show (drag and drop, scanning).
- Use diagrams (Mermaid) for flows such as "order → receipt → stock → report", with labels in the page's language.
- Tables for comparisons (roles and what they can do, plans). Keep them narrow enough for a phone.
- Check every new page in the dev server (`pnpm dev`) in light and dark mode and at phone width.

## Words that need an explanation

A word a beginner may not know gets a hoverable explanation: `:term[points]{id="point"}`. The text in `[]` is what the
reader sees, in any case or form; `id` is the entry in `app/utils/glossary.ts` (short text for en, ru and tg). Every
term also has a full entry on the glossary page of each language (`/<lang>/help/glossary`) under the same `id`, written
at the same time. Use the term component for each use of the word in running text; not in headings, in the sentence
that defines it, or in front-matter and component props (they cannot hold a component).

The page footer does not show "Edit this page", "Report an issue" or a GitHub link (`app/app.config.ts`).

## Links from the app

The app (`partha-js`) links to the docs wherever a user may need help: empty states ("You have no items yet. Learn how
to add them"), the first visit of a screen, complex forms, error messages, settings, and a help menu.

- Docs paths are a contract with the app. Once a page is linked from the app, never rename or move it without adding a
  redirect in `public/_redirects` and updating the app in the same change.
- Link to a section anchor (`#if-something-went-wrong`) only for headings that are stable. Write explicit anchors for
  them as an empty span on the line before the heading: `[]{#troubleshooting}` (the `## Title {#id}` form shows the
  `{#id}` as text in Docus). Skip it when the heading's own generated id is already the one you want, to avoid a
  duplicate id.
- The app opens `https://docs.partha.co/<app language>/<path>`, with `<app language>` from the user's current app
  language. Keep the list of app-linked paths in one place in the app (a single helper or constants file) so a check
  can verify that each one exists in all three languages.
- When you add a screen or flow to the app, add or update its docs page and the link to it. When you change a
  screen, update its docs page and screenshots.

## Docs features

These are agreed parts of the docs. Items marked *(planned)* are not built yet; do not assume they exist, and build
them as described when you work on them.

- **Glossary** (`/<lang>/help/glossary`) *(planned)*. One entry per term, in plain words, with a short example from a
  shop. Pages link a term to its entry the first time it appears. Add a term when you introduce it on any page.
- **FAQ** (`/<lang>/help/faq`) *(planned)*. Real questions from users, grouped by section, in `::accordion`. Each
  answer is short and links to the full page. When the same question comes up in support twice, add it.
- **What's new** (`/<lang>/help/whats-new`) *(planned)*. One entry per release, newest first, with a date, written
  for users: what they can do now and where, with a link and a screenshot. No internal changes, no ticket numbers.
  Every release that changes something users notice adds an entry in all three languages.
- **Feedback** *(planned)*. Each page ends with "Was this helpful?" (yes / no, plus an optional short comment). Use
  cheap, privacy-friendly analytics: no cookies, no personal data, no consent banner needed, data kept in our own
  market region. Use the results to find and rewrite pages that confuse people.
- **Search and AI.** Docus search covers all three languages. Docus generates `llms.txt` (a list of pages that AI
  assistants can read); keep it enabled and complete. A later "Ask AI" assistant *(planned)* must answer only from the
  docs, in the reader's language, and link the pages it used.
- **Automatic checks** *(built: `pnpm check`, see README)*. The build fails when a page exists in one language but not the others, when a link
  or image is broken, or when a path the app links to (from the app's docs-links helper) does not exist in all three
  languages. Run them in CI for every PR in `point-docs` and `partha-js`.
- **Screenshot automation** *(built: `partha-js/src/tests/docs-shots`, see its README)*. A Playwright script opens the
  sample businesses on the live app in each language and both themes, at desktop size, and saves the screenshots
  straight into `point-docs/public/images/<lang>/...` under the names the pages use. When a screen changes, rerun the
  script for that shot instead of taking screenshots by hand. Take one by hand only when the script cannot reach that
  state, and note it in the script.
- **Demo business** *(planned)*. A ready-made business with realistic but fake data (stores, items, suppliers,
  staff, sales over a few weeks), one per market so currency and taxes look right. It is the only source for
  screenshots, and new users can open it to try Partha without risk to their own data.

## Before you finish

- The page exists in `en`, `ru` and `tg` with the same slug, and `pnpm generate` builds without errors or broken links.
- New terms are in the glossary, and a user-visible release has a "What's new" entry.
- Button and screen names match the app in each language.
- A reader with no special knowledge could do the task using only this page.
- Screenshots match the current app.
