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
  // Who publishes these pages. Adds an Organization to the structured data of every page (Google and AI assistants link
  // the docs to the product). Another market sets its own address with NUXT_PUBLIC_APP_URL.
  schemaOrg: {
    identity: {
      type: 'Organization',
      name: 'Partha',
      url: process.env.NUXT_PUBLIC_APP_URL || 'https://partha.co',
      logo: `${process.env.NUXT_PUBLIC_APP_URL || 'https://partha.co'}/apple-touch-icon.png`,
    },
  },
  // The first lines of llms.txt and llms-full.txt, which AI assistants read to learn what this site is. The page lists
  // come from the content, in the three languages.
  llms: {
    description: 'User documentation of Partha, a back-office app for small businesses with shops, warehouses and cafes: stock, prices, the cash desk (till), profit reports and team roles. Free while in beta. Every page exists in English (/en), Russian (/ru) and Tajik (/tg) under the same path. The product site is https://partha.co.',
    full: {
      description: 'The full text of the Partha user documentation, in English, Russian and Tajik.',
    },
  },
  i18n: {
    defaultLocale: 'en',
    locales: [
      { code: 'en', name: 'English' },
      { code: 'ru', name: 'Русский' },
      { code: 'tg', name: 'Тоҷикӣ' },
    ],
  },
})
