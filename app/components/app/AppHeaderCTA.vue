<script setup lang="ts">
// Replaces Docus's empty header slot with "Open Partha": back to partha.co in the reader's language. The homepage offers
// Log in and Start free to people who are not signed in, and "Open your business" to those who are, so one link works for
// everyone. partha.co serves Russian at /, English at /en and Tajik at /tg.
const { locale } = useDocusI18n()
const labels: Record<string, string> = { en: 'Open Partha', ru: 'Открыть Partha', tg: 'Кушодани Partha' }
const paths: Record<string, string> = { en: '/en', ru: '/', tg: '/tg' }

const appUrl = String(useRuntimeConfig().public.appUrl || 'https://partha.co').replace(/\/+$/, '')
const label = computed(() => labels[locale.value] ?? labels.en)
const href = computed(() => `${appUrl}${paths[locale.value] ?? paths.en}`)
</script>

<template>
  <!-- Full button from small tablets up; on a phone only the icon, so the header still fits. -->
  <UButton :to="href" :label="label" trailing-icon="i-lucide-arrow-up-right" color="neutral" variant="outline" size="sm" class="hidden sm:inline-flex" />
  <UButton :to="href" :aria-label="label" icon="i-lucide-arrow-up-right" color="neutral" variant="ghost" class="sm:hidden" />
</template>
