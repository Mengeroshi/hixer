const CART_KEY = "hixy:carts:v1"
const ACTIVE_KEY = "hixy:carts:active"
const CART_EVENT = "hixy:carts"

export type CartItem = {
  slug: string
  name: string
  price: string
  image: string
  quantity: number
}

export type StoreCart = {
  storeSlug: string
  storeName: string
  storeHandle: string
  items: CartItem[]
}

type CartsState = Record<string, StoreCart>

function readCarts(): CartsState {
  if (typeof window === "undefined") {
    return {}
  }

  try {
    const raw = localStorage.getItem(CART_KEY)
    if (!raw) {
      return {}
    }
    const parsed = JSON.parse(raw) as CartsState
    return parsed && typeof parsed === "object" ? parsed : {}
  } catch {
    return {}
  }
}

function writeCarts(carts: CartsState) {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(carts))
    window.dispatchEvent(new Event(CART_EVENT))
  } catch {
    // ignore quota / private mode
  }
}

function setActiveStoreSlug(storeSlug: string | null) {
  try {
    if (storeSlug) {
      localStorage.setItem(ACTIVE_KEY, storeSlug)
    } else {
      localStorage.removeItem(ACTIVE_KEY)
    }
  } catch {
    // ignore
  }
}

function readActiveStoreSlug(): string | null {
  if (typeof window === "undefined") {
    return null
  }
  try {
    return localStorage.getItem(ACTIVE_KEY)
  } catch {
    return null
  }
}

function firstNonEmptyStoreSlug(carts: CartsState): string | null {
  for (const [slug, cart] of Object.entries(carts)) {
    if (cart.items.length > 0) {
      return slug
    }
  }
  return null
}

export function getStoreCart(storeSlug: string): StoreCart | null {
  return readCarts()[storeSlug] ?? null
}

export function getStoreItemCount(storeSlug: string): number {
  const cart = getStoreCart(storeSlug)
  if (!cart) {
    return 0
  }
  return cart.items.reduce((total, item) => total + item.quantity, 0)
}

export function getActiveStoreCart(): StoreCart | null {
  const carts = readCarts()
  const active = readActiveStoreSlug()
  if (active && carts[active]?.items.length) {
    return carts[active] ?? null
  }

  const fallback = firstNonEmptyStoreSlug(carts)
  if (!fallback) {
    return null
  }
  setActiveStoreSlug(fallback)
  return carts[fallback] ?? null
}

export function addToStoreCart(
  store: { slug: string; name: string; handle: string },
  item: Omit<CartItem, "quantity">,
  quantity: number,
) {
  const carts = readCarts()
  const existing = carts[store.slug] ?? {
    storeSlug: store.slug,
    storeName: store.name,
    storeHandle: store.handle,
    items: [],
  }

  const match = existing.items.find((entry) => entry.slug === item.slug)
  if (match) {
    match.quantity += quantity
  } else {
    existing.items.push({ ...item, quantity })
  }

  carts[store.slug] = existing
  setActiveStoreSlug(store.slug)
  writeCarts(carts)
  return existing
}

export function setStoreCartItemQuantity(
  storeSlug: string,
  mixSlug: string,
  quantity: number,
) {
  const carts = readCarts()
  const cart = carts[storeSlug]
  if (!cart) {
    return null
  }

  if (quantity <= 0) {
    cart.items = cart.items.filter((item) => item.slug !== mixSlug)
  } else {
    const item = cart.items.find((entry) => entry.slug === mixSlug)
    if (item) {
      item.quantity = quantity
    }
  }

  if (cart.items.length === 0) {
    delete carts[storeSlug]
    const nextActive = firstNonEmptyStoreSlug(carts)
    setActiveStoreSlug(nextActive)
    writeCarts(carts)
    return null
  }

  carts[storeSlug] = cart
  setActiveStoreSlug(storeSlug)
  writeCarts(carts)
  return cart
}

export function parsePrice(price: string): number {
  const match = price.replace(/,/g, "").match(/(\d+(?:\.\d+)?)/)
  return match ? Number(match[1]) : 0
}

export function formatMoney(amount: number): string {
  return `$${amount.toFixed(2)}`
}

export function subscribeCarts(onChange: () => void) {
  const handler = () => onChange()
  window.addEventListener(CART_EVENT, handler)
  window.addEventListener("storage", handler)
  return () => {
    window.removeEventListener(CART_EVENT, handler)
    window.removeEventListener("storage", handler)
  }
}
