<script setup lang="ts">
// A word with a short explanation. Use in content as `:term[points]{id="point"}`: the text in [] is what the
// reader sees (so it can be in any case or form), `id` is the entry in app/utils/glossary.ts.
const props = defineProps<{ id: string }>()

const route = useRoute()
const lang = computed<GlossaryLang>(() => {
  const first = route.path.split('/')[1]
  return first === 'ru' || first === 'tg' ? first : 'en'
})
const text = computed(() => glossary[props.id]?.[lang.value])

const open = ref(false)
let closeTimer: ReturnType<typeof setTimeout> | undefined
let byMouse = false

function show() {
  clearTimeout(closeTimer)
  open.value = true
}
function hideSoon() {
  clearTimeout(closeTimer)
  closeTimer = setTimeout(() => (open.value = false), 150)
}
function onEnter(event: PointerEvent) {
  if (event.pointerType !== 'mouse') return
  byMouse = true
  show()
}
function onClick() {
  // With a mouse the hover has already opened it; on touch and keyboard a tap toggles.
  if (byMouse) {
    byMouse = false
    show()
    return
  }
  open.value = !open.value
}
function onUpdate(value: boolean) {
  // Reka also reports clicks on the trigger; only accept closing (outside tap, Escape).
  if (!value) open.value = false
}
</script>

<template>
  <UPopover
    v-if="text"
    :open="open"
    :content="{ side: 'top', sideOffset: 6 }"
    @update:open="onUpdate"
  >
    <button
      type="button"
      class="term"
      :aria-expanded="open"
      @pointerenter="onEnter"
      @pointerleave="hideSoon"
      @click="onClick"
    >
      <slot />
    </button>

    <template #content>
      <div class="max-w-72 p-3 text-sm" @pointerenter="show" @pointerleave="hideSoon">
        <p class="text-pretty">
          {{ text }}
        </p>
        <NuxtLink
          :to="`/${lang}/help/glossary#${id}`"
          class="mt-2 inline-block text-primary underline"
        >
          {{ glossaryLink[lang] }}
        </NuxtLink>
      </div>
    </template>
  </UPopover>
  <span v-else><slot /></span>
</template>

<style scoped>
.term {
  font: inherit;
  color: inherit;
  cursor: help;
  text-decoration: underline dotted;
  text-decoration-color: var(--ui-primary);
  text-decoration-thickness: 2px;
  text-underline-offset: 4px;
}
.term:hover,
.term:focus-visible {
  color: var(--ui-primary);
}
</style>
