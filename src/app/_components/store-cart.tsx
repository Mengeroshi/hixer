"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Minus, Plus, Trash2, X } from "lucide-react"

import { Button } from "~/components/ui/button"
import {
  formatMoney,
  getStoreCart,
  parsePrice,
  setStoreCartItemQuantity,
  subscribeCarts,
  type StoreCart as StoreCartData,
} from "~/lib/cart"

export function StoreCart({
  storeSlug,
  storeName,
  storeHandle,
}: {
  storeSlug: string
  storeName: string
  storeHandle: string
}) {
  const [cart, setCart] = useState<StoreCartData | null>(null)

  useEffect(() => {
    const sync = () => setCart(getStoreCart(storeSlug))
    sync()
    return subscribeCarts(sync)
  }, [storeSlug])

  const items = cart?.items ?? []
  const subtotal = items.reduce(
    (total, item) => total + parsePrice(item.price) * item.quantity,
    0,
  )

  return (
    <div className="min-h-dvh bg-neutral-200 text-foreground">
      <div className="relative mx-auto flex h-dvh w-full max-w-[430px] flex-col bg-background">
        <div className="flex-1 overflow-y-auto px-4 pb-28">
          <header className="flex items-center gap-3 py-4">
            <Link
              href={`/stores/${storeSlug}`}
              aria-label="Close cart"
              className="grid size-10 place-items-center rounded-full border-2 border-border bg-surface-3 shadow-shadow"
            >
              <X className="size-4" />
            </Link>
          </header>

          <Link href={`/stores/${storeSlug}`} className="block">
            <h1 className="text-2xl font-heading tracking-tight underline-offset-4 hover:underline">
              {cart?.storeName ?? storeName}
            </h1>
            <p className="mt-1 text-sm text-foreground/70">
              {cart?.storeHandle ?? storeHandle}
            </p>
          </Link>

          {items.length === 0 ? (
            <div className="mt-10 rounded-2xl border-2 border-border bg-surface-5 p-6 text-center shadow-shadow">
              <p className="font-heading">Your cart is empty</p>
              <Link
                href={`/stores/${storeSlug}`}
                className="mt-4 inline-flex h-11 items-center rounded-xl border-2 border-border bg-main px-4 text-sm font-heading shadow-shadow"
              >
                Browse mixes
              </Link>
            </div>
          ) : (
            <ul className="mt-6 space-y-3">
              {items.map((item) => (
                <li
                  key={item.slug}
                  className="flex gap-3 rounded-2xl border-2 border-border bg-surface-5 p-3 shadow-shadow"
                >
                  <Link
                    href={`/mixes/${item.slug}`}
                    className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-xl border-2 border-border bg-background"
                  >
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="size-full object-cover"
                      />
                    ) : (
                      <span className="px-1 text-center text-[10px] font-heading leading-tight">
                        {item.name}
                      </span>
                    )}
                  </Link>

                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/mixes/${item.slug}`}
                      className="block truncate text-sm font-heading"
                    >
                      {item.name}
                    </Link>
                    <p className="mt-1 text-sm font-heading">{item.price}</p>

                    <div className="mt-3 inline-flex items-center gap-1 rounded-full border-2 border-border bg-background px-1 py-1 shadow-shadow">
                      <button
                        type="button"
                        aria-label={
                          item.quantity <= 1
                            ? "Remove from cart"
                            : "Decrease quantity"
                        }
                        onClick={() =>
                          setStoreCartItemQuantity(
                            storeSlug,
                            item.slug,
                            item.quantity - 1,
                          )
                        }
                        className="grid size-8 place-items-center rounded-full"
                      >
                        {item.quantity <= 1 ? (
                          <Trash2 className="size-3.5" />
                        ) : (
                          <Minus className="size-3.5" />
                        )}
                      </button>
                      <span className="min-w-6 text-center text-sm font-heading">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        aria-label="Increase quantity"
                        onClick={() =>
                          setStoreCartItemQuantity(
                            storeSlug,
                            item.slug,
                            item.quantity + 1,
                          )
                        }
                        className="grid size-8 place-items-center rounded-full"
                      >
                        <Plus className="size-3.5" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {items.length > 0 ? (
            <div className="mt-6 flex items-center justify-between border-t-2 border-border pt-4">
              <span className="font-heading">Subtotal</span>
              <span className="font-heading">{formatMoney(subtotal)}</span>
            </div>
          ) : null}
        </div>

        {items.length > 0 ? (
          <div className="absolute inset-x-0 bottom-0 border-t-2 border-border bg-background p-4">
            <Button type="button" className="h-12 w-full">
              Checkout · {formatMoney(subtotal)}
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  )
}
