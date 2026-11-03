<script setup lang="ts">
// A screenshot of the app that follows the site's light/dark toggle. Use in content as
// `::screenshot{src="warehouse/add-items-1" alt="…"}`: it shows /images/<lang>/<src>.light.webp in light mode and
// .dark.webp in dark mode. Both files must exist (`pnpm check` checks them). `phone` makes it narrow, for 375 px shots.
const props = defineProps<{ src: string, alt: string, phone?: boolean }>()

const route = useRoute()
const lang = computed(() => {
  const first = route.path.split('/')[1]
  return first === 'ru' || first === 'tg' ? first : 'en'
})
const base = computed(() => `/images/${lang.value}/${props.src}`)
</script>

<template>
  <figure class="my-6" :class="phone ? 'max-w-xs' : ''">
    <!-- The `dark` class on <html> decides, not prefers-color-scheme, so the site's toggle switches it.
         Lazy loading means the hidden one (display: none) is never fetched. -->
    <img
      :src="`${base}.light.webp`"
      :alt="alt"
      loading="lazy"
      decoding="async"
      class="w-full rounded-lg border border-default dark:hidden"
    >
    <img
      :src="`${base}.dark.webp`"
      :alt="alt"
      loading="lazy"
      decoding="async"
      class="hidden w-full rounded-lg border border-default dark:block"
    >
  </figure>
</template>
