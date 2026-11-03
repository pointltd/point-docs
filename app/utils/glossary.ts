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
  vat: {
    en: 'VAT (value added tax) is a tax that is part of the price of goods. If your business charges VAT, Partha shows it on receipts.',
    ru: 'НДС (налог на добавленную стоимость) — налог, который входит в цену товара. Если ваш бизнес платит НДС, Partha показывает его на чеках.',
    tg: 'ААИ (андоз аз арзиши иловашуда) — андозест, ки ба нархи мол дохил мешавад. Агар тиҷорати шумо ААИ мепардозад, Partha онро дар чекҳо нишон медиҳад.',
  },
  draft: {
    en: 'A draft is a document you have started but not finished. It changes nothing in your stock until you complete it.',
    ru: 'Черновик — это документ, который вы начали, но не закончили. Пока вы его не проведёте, остатки не меняются.',
    tg: 'Пешнавис ҳуҷҷатест, ки шумо оғоз кардаед, вале ба охир нарасондаед. То анҷом додани он бақияи мол тағйир намеёбад.',
  },
  stock: {
    en: 'Stock is the goods you have on hand, counted for each point.',
    ru: 'Остатки — это товар, который у вас есть в наличии, отдельно по каждой точке.',
    tg: 'Бақияи мол — молест, ки шумо дар даст доред, барои ҳар нуқта алоҳида ҳисоб карда мешавад.',
  },
  cost: {
    en: 'Cost is what a product cost you to get, for example the price you paid the supplier. Partha uses it to show your profit.',
    ru: 'Себестоимость — это сколько товар обошёлся вам, например цена, которую вы заплатили поставщику. По ней Partha показывает вашу прибыль.',
    tg: 'Таннарх — ин ҳамон аст, ки мол ба шумо чанд пул афтод, масалан нархе, ки ба таъминкунанда додаед. Partha аз рӯи он фоидаи шуморо нишон медиҳад.',
  },
}

export const glossaryLink: Record<GlossaryLang, string> = {
  en: 'More in the glossary',
  ru: 'Подробнее в глоссарии',
  tg: 'Бештар дар луғат',
}
