import { readChoice, saveChoice, updateConsent, type ConsentChoice } from '../utils/analytics'

// The reader's analytics choice, shared by the banner and the "Cookie settings" link in the footer. `ready` stays false on
// the server and until the browser has read its storage, so the banner is never part of the static page.
export function useAnalyticsConsent() {
  const gaId = String(useRuntimeConfig().public.gaId || '')
  const choice = useState<ConsentChoice | null>('analytics-choice', () => null)
  const ready = useState('analytics-ready', () => false)
  const reopened = useState('analytics-reopened', () => false)

  const enabled = computed(() => Boolean(gaId))
  const open = computed(() => enabled.value && ready.value && (choice.value === null || reopened.value))

  function load() {
    choice.value = readChoice(window.localStorage)
    ready.value = true
  }

  function choose(value: ConsentChoice) {
    saveChoice(window.localStorage, value)
    choice.value = value
    reopened.value = false
    updateConsent(value)
  }

  function reopen() {
    reopened.value = true
  }

  return { enabled, open, choice, load, choose, reopen }
}
