<script setup lang="ts">
// A screenshot of the app that follows the site's light/dark toggle. Use in content as
// `::screenshot{src="warehouse/add-items-1" alt="…"}`: it shows /images/<lang>/<src>.light.webp in light mode and
// .dark.webp in dark mode. Both files must exist (`pnpm check` checks them). The images are taken at twice the pixel
// density (partha-js tests/docs-shots), so the figure is never shown wider than half the image: it stays sharp and the
// app's text keeps its real size.
const props = defineProps<{ src: string, alt: string }>()

const route = useRoute()
const lang = computed(() => {
  const first = route.path.split('/')[1]
  return first === 'ru' || first === 'tg' ? first : 'en'
})
const base = computed(() => `/images/${lang.value}/${props.src}`)
const width = ref<number>()
function measure(event: Event) {
  width.value = (event.target as HTMLImageElement).naturalWidth / 2
}
</script>

<template>
  <figure class="my-6" :style="width ? { maxWidth: `${width}px` } : undefined">
    <!-- The `dark` class on <html> decides, not prefers-color-scheme, so the site's toggle switches it.
         Lazy loading means the hidden one (display: none) is never fetched. -->
    <img
      :src="`${base}.light.webp`"
      :alt="alt"
      loading="lazy"
      decoding="async"
      class="w-full rounded-lg border border-default dark:hidden"
      @load="measure"
    >
    <img
      :src="`${base}.dark.webp`"
      :alt="alt"
      loading="lazy"
      decoding="async"
      class="hidden w-full rounded-lg border border-default dark:block"
      @load="measure"
    >
  </figure>
</template>
