import type { MixOverride } from "~/lib/mix-overrides"
import { recipes } from "~/data/afterglow"

export type CreatedMix = MixOverride & {
  slug: string
}

const listKey = "hixy:created-mixes"
const eventName = "hixy:created-mixes"

const emptyList: CreatedMix[] = []

let listCache: { raw: string | null; value: CreatedMix[] } = {
  raw: null,
  value: emptyList,
}

function slugify(name: string) {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
  return base || "mix"
}

export function readCreatedMixes(): CreatedMix[] {
  if (typeof window === "undefined") return emptyList
  try {
    const raw = sessionStorage.getItem(listKey)
    if (raw === listCache.raw) return listCache.value
    const value = raw ? (JSON.parse(raw) as CreatedMix[]) : emptyList
    listCache = { raw, value }
    return value
  } catch {
    return emptyList
  }
}

export function readCreatedMix(slug: string): CreatedMix | null {
  return readCreatedMixes().find((mix) => mix.slug === slug) ?? null
}

export function createMixSlug(name: string) {
  const taken = new Set<string>(["new"])
  for (const recipe of recipes) {
    if (recipe.slug) taken.add(recipe.slug)
  }
  for (const mix of readCreatedMixes()) taken.add(mix.slug)

  const base = slugify(name)
  if (!taken.has(base)) return base

  let suffix = 2
  while (taken.has(`${base}-${suffix}`)) suffix += 1
  return `${base}-${suffix}`
}

export function writeCreatedMix(mix: CreatedMix) {
  const next = readCreatedMixes().filter((item) => item.slug !== mix.slug)
  next.push(mix)
  const raw = JSON.stringify(next)
  sessionStorage.setItem(listKey, raw)
  listCache = { raw, value: next }
  window.dispatchEvent(new Event(eventName))
}

export function subscribeCreatedMixes(onStoreChange: () => void) {
  const onCustom = () => onStoreChange()
  const onStorage = (event: StorageEvent) => {
    if (event.key === listKey) onStoreChange()
  }
  window.addEventListener(eventName, onCustom)
  window.addEventListener("storage", onStorage)
  return () => {
    window.removeEventListener(eventName, onCustom)
    window.removeEventListener("storage", onStorage)
  }
}
