"use client"

import Link from "next/link"
import { useState } from "react"
import { Minus, Plus, ShoppingCart, Store } from "lucide-react"

import type { FeedMix } from "~/app/_components/home-feed"
import { Button } from "~/components/ui/button"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "~/components/ui/sheet"
import { addToStoreCart } from "~/lib/cart"

function storeInitials(name: string) {
  return (
    name
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "?"
  )
}

export function FeedPost({ mix }: { mix: FeedMix }) {
  const [cartOpen, setCartOpen] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const href = `/mixes/${mix.slug}`

  function openCartSheet() {
    if (!mix.available) {
      return
    }
    setQuantity(1)
    setCartOpen(true)
  }

  function confirmCart() {
    if (!mix.available) {
      setCartOpen(false)
      return
    }
    addToStoreCart(
      mix.store,
      {
        slug: mix.slug,
        name: mix.name,
        price: mix.price,
        image: mix.image,
      },
      quantity,
    )
    setCartOpen(false)
  }

  return (
    <li className="bg-background">
      <div className="flex items-center gap-3 px-4 py-3">
        <Link
          href={`/stores/${mix.store.slug}`}
          className="grid size-10 shrink-0 place-items-center rounded-full border-2 border-border bg-main text-xs font-heading shadow-shadow"
          aria-label={mix.store.name}
        >
          {storeInitials(mix.store.name)}
        </Link>
        <Link href={`/stores/${mix.store.slug}`} className="min-w-0 flex-1">
          <p className="truncate text-sm font-heading">{mix.store.name}</p>
          <p className="truncate text-xs text-foreground/70">
            {mix.store.handle}
          </p>
        </Link>
        <span className="shrink-0 text-xs font-heading text-foreground/60">
          {mix.kind}
        </span>
      </div>

      <Link href={href} className="block">
        <figure className="relative overflow-hidden border-y-2 border-border">
          {mix.image ? (
            <img
              src={mix.image}
              alt={mix.name}
              className="aspect-[4/3] w-full object-cover grayscale-[0.4] sepia-[0.35] saturate-50 contrast-95"
            />
          ) : (
            <div className="grid aspect-[4/3] place-items-center bg-surface-5 p-6">
              <Store className="size-10 text-foreground/40" />
            </div>
          )}
          {mix.image ? (
            <>
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-[#f0e2d3]/55 mix-blend-multiply"
              />
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-[#ecd3f5]/25 mix-blend-soft-light"
              />
            </>
          ) : null}
        </figure>
      </Link>

      <div className="px-4 py-4">
        <div className="flex items-start justify-between gap-3">
          <Link href={href} className="min-w-0">
            <p className="truncate font-heading">{mix.name}</p>
            {mix.description ? (
              <p className="mt-1 line-clamp-2 text-sm text-foreground/80">
                {mix.description}
              </p>
            ) : null}
          </Link>
          <p className="shrink-0 font-heading">{mix.price}</p>
        </div>

        <div className="mt-3 flex items-center justify-between gap-3">
          {mix.available ? (
            <button
              type="button"
              onClick={openCartSheet}
              className="inline-flex items-center gap-1.5 text-sm text-foreground/70 underline-offset-2 transition-colors hover:text-foreground hover:underline"
            >
              <ShoppingCart className="size-3.5" />
              Add to cart
            </button>
          ) : (
            <p className="text-xs font-heading text-foreground/50">Sold out</p>
          )}
        </div>
      </div>

      <Sheet open={cartOpen} onOpenChange={setCartOpen}>
        <SheetContent
          side="bottom"
          className="mx-auto max-w-[430px] rounded-t-2xl border-x-2 shadow-shadow"
        >
          <SheetHeader>
            <SheetTitle>Add to cart</SheetTitle>
            <SheetDescription>
              How many {mix.name} do you want from {mix.store.name}?
            </SheetDescription>
          </SheetHeader>

          <div className="flex items-center justify-center gap-4 px-4 py-2">
            <button
              type="button"
              aria-label="Decrease quantity"
              disabled={quantity <= 1}
              onClick={() => setQuantity((value) => Math.max(1, value - 1))}
              className="grid size-11 place-items-center rounded-full border-2 border-border bg-surface-5 shadow-shadow disabled:opacity-40"
            >
              <Minus className="size-4" />
            </button>
            <span className="min-w-10 text-center text-2xl font-heading">
              {quantity}
            </span>
            <button
              type="button"
              aria-label="Increase quantity"
              onClick={() => setQuantity((value) => value + 1)}
              className="grid size-11 place-items-center rounded-full border-2 border-border bg-surface-5 shadow-shadow"
            >
              <Plus className="size-4" />
            </button>
          </div>

          <SheetFooter>
            <Button type="button" onClick={confirmCart}>
              Add {quantity} to cart · {mix.price}
            </Button>
            <SheetClose render={<Button variant="neutral" />}>
              Cancel
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </li>
  )
}
