// Visit counting with Google Analytics 4 and Google Consent Mode v2 (the same rules as partha.co). The measurement id comes
// from NUXT_PUBLIC_GA_ID at build time; when it is empty nothing is loaded and no banner is shown. Every docs page is counted.

export type ConsentChoice = 'granted' | 'denied'

/** Where the visitor's choice is kept in this browser. */
export const consentStorageKey = 'partha-analytics-consent'

/** Before the visitor chooses, everything is denied: Google receives only cookieless signals. */
export const defaultConsent = {
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  analytics_storage: 'denied',
  wait_for_update: 500,
} as const

/** What a choice means for Google. Advertising is always denied: we do not use it. */
export function consentFor(choice: ConsentChoice) {
  return {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: choice,
  } as const
}

/** A stored value that is not one of the two choices counts as no choice. */
export function parseChoice(value: string | null | undefined): ConsentChoice | null {
  return value === 'granted' || value === 'denied' ? value : null
}

export function readChoice(storage: Pick<Storage, 'getItem'> | undefined): ConsentChoice | null {
  try {
    return parseChoice(storage?.getItem(consentStorageKey))
  } catch {
    return null // storage blocked by the browser: ask again next time
  }
}

export function saveChoice(storage: Pick<Storage, 'setItem'> | undefined, choice: ConsentChoice): void {
  try {
    storage?.setItem(consentStorageKey, choice)
  } catch {
    // storage blocked: the choice lasts until the page is closed
  }
}

type Gtag = (...args: unknown[]) => void
type AnalyticsWindow = Window & { dataLayer?: unknown[], gtag?: Gtag }

let loaded = false

/** Sets up the data layer and Consent Mode, then loads gtag.js once. Safe to call again. */
export function loadAnalytics(gaId: string, choice: ConsentChoice | null): void {
  if (loaded || !gaId) return
  loaded = true
  const win = window as AnalyticsWindow
  win.dataLayer = win.dataLayer || []
  win.gtag = function gtag() {
    // Google reads the `arguments` object of the call, not an array.
    // eslint-disable-next-line prefer-rest-params
    win.dataLayer!.push(arguments)
  }
  win.gtag('consent', 'default', defaultConsent)
  if (choice) win.gtag('consent', 'update', consentFor(choice))
  win.gtag('js', new Date())
  // Pages are counted by sendPageView, because the site changes pages without reloading.
  win.gtag('config', gaId, { send_page_view: false, allow_google_signals: false, allow_ad_personalization_signals: false })
  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`
  document.head.appendChild(script)
}

export function updateConsent(choice: ConsentChoice): void {
  const win = window as AnalyticsWindow
  win.gtag?.('consent', 'update', consentFor(choice))
}

export function sendPageView(path: string, title: string): void {
  const win = window as AnalyticsWindow
  win.gtag?.('event', 'page_view', { page_path: path, page_location: location.origin + path, page_title: title })
}
