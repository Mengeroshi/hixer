export type MixOverride = {
  name: string
  price: string
  description: string
  ingredients: string[]
  preparation: string[]
  tags: string[]
  available: boolean
}

function storageKey(slug: string) {
  return `hixy:mix:${slug}`
}

function eventName(slug: string) {
  return `hixy:mix-override:${slug}`
}

export function readMixOverride(slug: string): MixOverride | null {
  if (typeof window === "undefined") return null
  try {
    const raw = sessionStorage.getItem(storageKey(slug))
    if (!raw) return null
    return JSON.parse(raw) as MixOverride
  } catch {
    return null
  }
}

export function writeMixOverride(slug: string, data: MixOverride) {
  sessionStorage.setItem(storageKey(slug), JSON.stringify(data))
  window.dispatchEvent(new Event(eventName(slug)))
}

export function subscribeMixOverride(slug: string, onStoreChange: () => void) {
  const onCustom = () => onStoreChange()
  const onStorage = (event: StorageEvent) => {
    if (event.key === storageKey(slug)) onStoreChange()
  }
  window.addEventListener(eventName(slug), onCustom)
  window.addEventListener("storage", onStorage)
  return () => {
    window.removeEventListener(eventName(slug), onCustom)
    window.removeEventListener("storage", onStorage)
  }
}
