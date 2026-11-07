import { loadAnalytics, readChoice, sendPageView } from '../utils/analytics'

// Counts every docs page. The tag is loaded with analytics storage denied until the reader says yes (see the banner).
export default defineNuxtPlugin((nuxtApp) => {
  const gaId = String(useRuntimeConfig().public.gaId || '')
  if (!gaId) return

  nuxtApp.hook('page:finish', () => {
    loadAnalytics(gaId, readChoice(window.localStorage))
    // The page title is set after the navigation ends.
    nextTick(() => sendPageView(useRoute().path, document.title))
  })
})
