export default defineNuxtConfig({
  extends: ['docus'],
  site: {
    name: 'Partha',
    url: process.env.NUXT_PUBLIC_SITE_URL || 'https://docs.partha.co',
  },
  // Always output plain static files, even on Cloudflare (which would pick a Worker preset)
  nitro: { preset: 'static' },
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
