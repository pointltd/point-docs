import { defineNuxtModule, extendPages } from '@nuxt/kit'

// Docus draws the landing page on the route `/:lang?`. With the language in the address, @nuxtjs/i18n turns it into
// `/en/:lang?`, which also matches a section page such as `/en/business`: the reader gets the landing page and Google
// gets a copy of it. The language part may only be a real language, so a section page reaches the docs route.
export default defineNuxtModule({
  meta: { name: 'landing-route' },
  setup(_options, nuxt) {
    const locales = ((nuxt.options as { i18n?: { locales?: Array<string | { code: string }> } }).i18n?.locales ?? [])
      .map(locale => typeof locale === 'string' ? locale : locale.code)
    extendPages((pages) => {
      const landing = pages.find(page => page.name === 'lang-index')
      if (landing && locales.length) landing.path = `/:lang(${locales.join('|')})?`
    })
  },
})
