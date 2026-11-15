"use client"

import Link from "next/link"
import { useState } from "react"
import { Minus, Pencil, Plus, Share2, ShoppingCart, X } from "lucide-react"

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

const fabClass =
  "grid size-12 place-items-center rounded-full border-2 border-border bg-surface-3 shadow-shadow transition-transform"

const actionClass =
  "grid size-11 place-items-center rounded-full border-2 border-border bg-surface-5 shadow-shadow"

type MixActionsProps = {
  slug: string
  name: string
  price: string
  image: string
  available: boolean
  canEdit: boolean
  store: {
    slug: string
    name: string
    handle: string
  }
}

export function MixActions({
  slug,
  name,
  price,
  image,
  available,
  canEdit,
  store,
}: MixActionsProps) {
  const [open, setOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [quantity, setQuantity] = useState(1)

  async function handleShare() {
    const url = window.location.href
    setOpen(false)
    try {
      if (navigator.share) {
        await navigator.share({ title: name, text: name, url })
        return
      }
      await navigator.clipboard.writeText(url)
    } catch {
      // user cancelled share
    }
  }

  function openCartSheet() {
    if (!available) {
      return
    }
    setOpen(false)
    setQuantity(1)
    setCartOpen(true)
  }

  function confirmCart() {
    if (!available) {
      setCartOpen(false)
      return
    }
    addToStoreCart(store, { slug, name, price, image }, quantity)
    setCartOpen(false)
  }

  return (
    <>
      <div className="absolute right-4 bottom-20 z-10 flex flex-col items-center gap-3">
        {open ? (
          <div className="flex flex-col items-center gap-3">
            <button
              type="button"
              aria-label="Share mix"
              onClick={() => void handleShare()}
              className={actionClass}
            >
              <Share2 className="size-5" />
            </button>
            {canEdit ? (
              <Link
                href={`/mixes/${slug}/edit`}
                aria-label="Edit mix"
                className={actionClass}
                onClick={() => setOpen(false)}
              >
                <Pencil className="size-5" />
              </Link>
            ) : null}
            {available ? (
              <button
                type="button"
                aria-label="Add to cart"
                onClick={openCartSheet}
                className={actionClass}
              >
                <ShoppingCart className="size-5" />
              </button>
            ) : null}
          </div>
        ) : null}

        <button
          type="button"
          aria-label={open ? "Close actions" : "Open actions"}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
          className={fabClass}
        >
          {open ? <X className="size-5" /> : <Plus className="size-5" />}
        </button>
      </div>

      <Sheet open={cartOpen} onOpenChange={setCartOpen}>
        <SheetContent
          side="bottom"
          className="mx-auto max-w-[430px] rounded-t-2xl border-x-2 shadow-shadow"
        >
          <SheetHeader>
            <SheetTitle>Add to cart</SheetTitle>
            <SheetDescription>
              How many {name} do you want from {store.name}?
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
              Add {quantity} to cart · {price}
            </Button>
            <SheetClose render={<Button variant="neutral" />}>
              Cancel
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  )
}
