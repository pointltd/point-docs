<script setup lang="ts">
// The cookie banner. Analytics runs only after the reader accepts; Accept and Decline look the same. It lives in the
// header (AppHeaderCTA), because the footer is hydrated only when it scrolls into view, and it is teleported to the
// page so the header's blur does not trap its fixed position.
import { consentWords, privacyPaths } from '../../utils/consent-words'

const { locale } = useDocusI18n()
const { open, load, choose } = useAnalyticsConsent()
const appUrl = String(useRuntimeConfig().public.appUrl || 'https://partha.co').replace(/\/+$/, '')

const t = computed(() => consentWords[locale.value] ?? consentWords.en!)
const policyUrl = computed(() => `${appUrl}${privacyPaths[locale.value] ?? privacyPaths.en}`)

onMounted(load)
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      role="region"
      :aria-label="t.label"
      class="fixed inset-x-0 bottom-0 z-50 p-3 sm:p-4"
      data-testid="consent-banner"
    >
      <div class="mx-auto flex max-w-3xl flex-col gap-3 rounded-lg border border-default bg-default p-4 shadow-lg sm:flex-row sm:items-center">
        <p class="min-w-0 flex-1 text-sm text-default">
          {{ t.text }}
          <ULink :to="policyUrl" target="_blank" class="text-primary underline">{{ t.policy }}</ULink>
        </p>
        <div class="flex shrink-0 gap-2">
          <UButton color="neutral" variant="outline" :label="t.decline" data-testid="consent-decline" @click="choose('denied')" />
          <UButton color="neutral" variant="outline" :label="t.accept" data-testid="consent-accept" @click="choose('granted')" />
        </div>
      </div>
    </div>
  </Teleport>
</template>
