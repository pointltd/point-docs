<script setup lang="ts">
// Replaces Docus's footer text: the copyright and, when analytics is on, a "Cookie settings" link that opens the cookie
// banner again (the banner itself is AppConsentBanner, in the header).
import { consentWords } from '../../utils/consent-words'

const { locale } = useDocusI18n()
const { enabled, reopen } = useAnalyticsConsent()
const t = computed(() => consentWords[locale.value] ?? consentWords.en!)
</script>

<template>
  <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
    <span>Copyright © {{ new Date().getFullYear() }}</span>
    <button v-if="enabled" type="button" class="underline hover:text-default" data-testid="cookie-settings" @click="reopen()">
      {{ t.settings }}
    </button>
  </div>
</template>
