export default defineNuxtConfig({
  extends: ['docus'],
  site: {
    name: 'Partha',
    url: process.env.NUXT_PUBLIC_SITE_URL || 'https://docs.partha.co',
  },
  // Always output plain static files, even on Cloudflare (which would pick a Worker preset)
  nitro: { preset: 'static' },
  // The Partha mark (the same circle with a dot as in the app). Made from partha-js/src/brand/logo.svg.
  app: {
    head: {
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico', sizes: '48x48' },
      ],
    },
  },
  css: ['~/assets/css/main.css'],
  // Where "Open Partha" in the header leads (app/components/app/AppHeaderCTA.vue). Set NUXT_PUBLIC_APP_URL for another
  // market's app.
  runtimeConfig: {
    public: {
      appUrl: process.env.NUXT_PUBLIC_APP_URL || 'https://partha.co',
    },
  },
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
