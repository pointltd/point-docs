// Short explanations shown when a reader hovers or taps a term (`:term[...]{id="..."}` in the content).
// Keep each text to one or two plain sentences. The full entry lives on the glossary page of each language,
// under the same `id` (`/<lang>/help/glossary#<id>`), so write both together.
export type GlossaryLang = 'en' | 'ru' | 'tg'

export const glossary: Record<string, Record<GlossaryLang, string>> = {
  point: {
    en: 'A point is one place where you work: a shop, a store, a warehouse or a cafe. Each point has its own stock, cash desk and sales.',
    ru: 'Точка — это одно место, где вы работаете: магазин, склад или кафе. У каждой точки свой склад, своя касса и свои продажи.',
    tg: 'Нуқта — як ҷоест, ки шумо дар он кор мекунед: мағоза, анбор ё қаҳвахона. Ҳар нуқта анбор, касса ва фурӯшҳои худро дорад.',
  },
}

export const glossaryLink: Record<GlossaryLang, string> = {
  en: 'More in the glossary',
  ru: 'Подробнее в глоссарии',
  tg: 'Бештар дар луғат',
}
