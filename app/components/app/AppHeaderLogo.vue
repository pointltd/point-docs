<script setup lang="ts">
// Replaces Docus's header logo. The top left of every page reads "Partha Docs", so it is clear that it leads to the start
// of the documentation (Docus wraps it in a link to the docs home). The way to the app itself is "Open Partha" at the
// top right (AppHeaderCTA.vue).
const { locale } = useDocusI18n()
const docs: Record<string, string> = { en: 'Docs', ru: 'Документация', tg: 'Ҳуҷҷатҳо' }
const label = computed(() => docs[locale.value] ?? docs.en)
</script>

<template>
  <span class="flex items-center gap-2 font-semibold text-highlighted">
    <!-- The Partha mark in the brand colour, as in the app and the favicon. -->
    <UIcon name="i-lucide-circle-dot" class="size-5 shrink-0 text-[#5756e4]" aria-hidden="true" />
    <span>Partha</span>
    <span class="font-normal text-muted">{{ label }}</span>
  </span>
</template>
