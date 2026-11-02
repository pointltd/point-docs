export default defineNuxtConfig({
  extends: ['docus'],
  site: { url: process.env.NUXT_PUBLIC_SITE_URL || 'https://docs.partha.co' },
  modules: ['@nuxtjs/i18n'],
  i18n: {
    defaultLocale: 'en',
    locales: [
      { code: 'en', name: 'English' },
      { code: 'ru', name: 'Русский' },
      { code: 'tg', name: 'Тоҷикӣ' },
    ],
  },
})
