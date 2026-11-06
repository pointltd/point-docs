// The picture shown when a docs link is shared in a messenger or social network: the Partha mark and name, in the
// language of the page. The pictures are made by scripts/og-images.mjs into public/og.
const languages = ['en', 'ru', 'tg']

export default defineNuxtPlugin(() => {
  const route = useRoute()
  const site = useSiteConfig()
  const image = computed(() => {
    const first = route.path.split('/')[1] ?? ''
    const language = languages.includes(first) ? first : 'en'
    return `${String(site.url).replace(/\/$/, '')}/og/${language}.png`
  })

  useSeoMeta({
    ogImage: () => image.value,
    ogImageType: 'image/png',
    ogImageWidth: 1200,
    ogImageHeight: 630,
    ogImageAlt: 'Partha',
    twitterCard: 'summary_large_image',
    twitterImage: () => image.value,
  })
})
