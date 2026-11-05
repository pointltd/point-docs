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
  shift: {
    en: 'A shift is your working time at the till: you open it with the cash in the drawer and close it with the cash counted.',
    ru: 'Смена — это ваше рабочее время на кассе: вы открываете её с наличными в кассе и закрываете, пересчитав наличные.',
    tg: 'Навбати корӣ — вақти кори шумо дар касса: шумо онро бо пули дар қуттӣ буда мекушоед ва бо шумурдани пул мебандед.',
  },
  'stock-count': {
    en: 'A stock count is when you count the goods that are really at a point and compare them with what Partha has.',
    ru: 'Инвентаризация — это когда вы пересчитываете товар, который на самом деле есть в точке, и сравниваете с тем, что записано в Partha.',
    tg: 'Баҳисобгирии мол ин аст, ки шумо моли воқеан дар нуқта бударо ҳисоб мекунед ва бо он чи дар Partha навишта шудааст, муқоиса мекунед.',
  },
  difference: {
    en: 'A difference is how much a count differs from Partha: fewer goods is a shortage, more goods is a surplus.',
    ru: 'Расхождение — это насколько подсчёт отличается от Partha: если товара меньше, это недостача, если больше — излишек.',
    tg: 'Фарқият ин аст, ки ҳисоб аз Partha чӣ қадар фарқ мекунад: моли камтар камомад аст, моли бештар барзиёдӣ.',
  },
  'blind-count': {
    en: 'In a blind count, the person who counts does not see how many goods Partha expects, so they write what they really see.',
    ru: 'При слепом подсчёте тот, кто считает, не видит, сколько товара ожидает Partha, и записывает то, что видит на самом деле.',
    tg: 'Дар ҳисоби пӯшида касе, ки ҳисоб мекунад, намебинад, ки Partha чӣ қадар интизор аст, ва он чиро менависад, ки воқеан мебинад.',
  },
  recount: {
    en: 'A recount is counting a product again, by another person, when the first number looks wrong.',
    ru: 'Пересчёт — это когда другой человек заново считает товар, потому что первое число вызывает сомнения.',
    tg: 'Ҳисоби такрорӣ ин аст, ки шахси дигар молро аз нав ҳисоб мекунад, вақте рақами аввал шубҳанок менамояд.',
  },
}

export const glossaryLink: Record<GlossaryLang, string> = {
  en: 'More in the glossary',
  ru: 'Подробнее в глоссарии',
  tg: 'Бештар дар луғат',
}
