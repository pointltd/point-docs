// The words of the cookie banner and the "Cookie settings" link, in the three languages of the docs.
export type ConsentWords = { label: string, text: string, policy: string, accept: string, decline: string, settings: string }

export const consentWords: Record<string, ConsentWords> = {
  en: {
    label: 'Cookies',
    text: 'Partha uses Google Analytics to count visits and see which pages help. It sets cookies only if you accept.',
    policy: 'Privacy policy',
    accept: 'Accept',
    decline: 'Decline',
    settings: 'Cookie settings',
  },
  ru: {
    label: 'Cookie',
    text: 'Partha использует Google Analytics, чтобы считать посещения и видеть, какие страницы помогают. Cookie устанавливаются, только если вы согласны.',
    policy: 'Политика конфиденциальности',
    accept: 'Принять',
    decline: 'Отклонить',
    settings: 'Настройки cookie',
  },
  tg: {
    label: 'Куки',
    text: 'Partha Google Analytics-ро барои ҳисоб кардани боздидҳо ва дидани саҳифаҳои муфид истифода мебарад. Куки танҳо дар сурати розигии шумо сохта мешавад.',
    policy: 'Сиёсати махфият',
    accept: 'Қабул кардан',
    decline: 'Рад кардан',
    settings: 'Танзимоти куки',
  },
}

// partha.co serves Russian at /, English at /en and Tajik at /tg.
export const privacyPaths: Record<string, string> = { en: '/en/privacy', ru: '/privacy', tg: '/tg/privacy' }
