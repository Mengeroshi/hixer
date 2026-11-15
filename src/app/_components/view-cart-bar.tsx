"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { ShoppingCart } from "lucide-react"

import {
  getActiveStoreCart,
  listStoreCarts,
  subscribeCarts,
  type StoreCart,
} from "~/lib/cart"

function cartItemCount(cart: StoreCart) {
  return cart.items.reduce((total, item) => total + item.quantity, 0)
}

function hasBottomNav(pathname: string) {
  return (
    pathname === "/" ||
    pathname === "/profile" ||
    pathname.startsWith("/payment/") ||
    /^\/stores\/[^/]+$/.test(pathname)
  )
}

export function ViewCartBar() {
  const pathname = usePathname()
  const [cart, setCart] = useState<StoreCart | null>(null)
  const [cartCount, setCartCount] = useState(0)

  useEffect(() => {
    const sync = () => {
      setCart(getActiveStoreCart())
      setCartCount(listStoreCarts().length)
    }
    sync()
    return subscribeCarts(sync)
  }, [])

  if (!cart || cart.items.length === 0) {
    return null
  }

  const cartPath = `/stores/${cart.storeSlug}/cart`
  const onForm =
    pathname === "/mixes/new" ||
    /^\/mixes\/[^/]+\/edit$/.test(pathname)
  if (
    pathname === cartPath ||
    (pathname.startsWith("/stores/") && pathname.endsWith("/cart")) ||
    pathname === "/login" ||
    pathname.startsWith("/payment/") ||
    onForm
  ) {
    return null
  }

  const count = cartItemCount(cart)
  const bottomClass = hasBottomNav(pathname) ? "bottom-28" : "bottom-4"
  const label =
    cartCount > 1
      ? `View carts · ${cart.storeName}`
      : `View cart · ${cart.storeName}`

  return (
    <div
      className={`pointer-events-none fixed inset-x-0 z-40 flex justify-center px-4 ${bottomClass}`}
    >
      <div className="pointer-events-none flex w-full max-w-[430px] justify-center px-4">
        <Link
          href={cartPath}
          className="pointer-events-auto inline-flex h-12 items-center justify-center gap-2 rounded-full border-2 border-border bg-foreground px-5 text-sm font-heading text-background shadow-shadow"
        >
          <ShoppingCart className="size-4 shrink-0" />
          <span className="truncate">{label}</span>
          <span aria-hidden>·</span>
          <span className="shrink-0">
            {cartCount > 1 ? `${cartCount} stores` : count}
          </span>
        </Link>
      </div>
    </div>
  )
}
