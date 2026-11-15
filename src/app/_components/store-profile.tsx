"use client"

import Link from "next/link"
import { useState } from "react"
import {
  Bookmark,
  LayoutGrid,
  LogOut,
  Plus,
  ReceiptText,
  UserRound,
} from "lucide-react"

import { AppBottomNav } from "~/app/_components/app-bottom-nav"
import { Button } from "~/components/ui/button"
import { formatMoney } from "~/lib/cart"
import { signOutAction } from "~/server/auth/actions"
import { api } from "~/trpc/react"

type MixTile = {
  slug: string
  name: string
  image: string
  house: boolean
  description: string
}

type StoreInfo = {
  id: string
  slug: string
  name: string
  handle: string
  bio: string
  followers: string
  following: number
  ownerId: string | null
}

type ProfileUser = {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
  isStore?: boolean
}

type ProfileTab = "mixes" | "saved" | "orders"

type OrderItem = {
  slug: string
  name: string
  price: string
  quantity: number
}

function asOrderItems(value: unknown): OrderItem[] {
  if (!Array.isArray(value)) {
    return []
  }
  return value.flatMap((entry) => {
    if (!entry || typeof entry !== "object") {
      return []
    }
    const item = entry as Partial<OrderItem>
    if (
      typeof item.slug !== "string" ||
      typeof item.name !== "string" ||
      typeof item.price !== "string" ||
      typeof item.quantity !== "number"
    ) {
      return []
    }
    return [
      {
        slug: item.slug,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      },
    ]
  })
}

function formatPaidAt(value: Date | string | null) {
  if (!value) {
    return null
  }
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
}

const tabs = [
  { id: "mixes" as const, label: "Mixes", icon: LayoutGrid },
  { id: "saved" as const, label: "Saved", icon: Bookmark },
  { id: "orders" as const, label: "Orders", icon: ReceiptText },
]

export function StoreProfile({
  store,
  mixes,
  user,
}: {
  store: StoreInfo
  mixes: MixTile[]
  user: ProfileUser | null
}) {
  const [tab, setTab] = useState<ProfileTab>("mixes")
  const canManage = Boolean(user && store.ownerId === user.id)
  const ordersQuery = api.checkout.myOrders.useQuery(undefined, {
    enabled: Boolean(user) && tab === "orders",
  })

  const initials =
    store.name
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "?"
  const stats = [
    { label: "Mixes", value: String(mixes.length) },
    { label: "Followers", value: store.followers },
    { label: "Following", value: String(store.following) },
  ]

  return (
    <div className="min-h-dvh bg-neutral-200 text-foreground">
      <div className="relative mx-auto flex h-dvh w-full max-w-[430px] flex-col bg-background">
        <div className="flex-1 overflow-y-auto px-4 pb-28">
          <header className="grid grid-cols-[1fr_auto_1fr] items-center py-4">
            <span />
            <h1 className="text-base font-heading">{store.handle}</h1>
            <div className="flex justify-end">
              {user ? (
                <form action={signOutAction}>
                  <button
                    type="submit"
                    aria-label="Sign out"
                    className="grid size-10 place-items-center rounded-full border-2 border-border bg-surface-3 shadow-shadow"
                  >
                    <LogOut className="size-4" />
                  </button>
                </form>
              ) : (
                <Link
                  href="/login"
                  aria-label="Sign in"
                  className="grid size-10 place-items-center rounded-full border-2 border-border bg-surface-3 shadow-shadow"
                >
                  <UserRound className="size-4" />
                </Link>
              )}
            </div>
          </header>

          <section className="flex items-center gap-4">
            <div className="grid size-20 shrink-0 place-items-center rounded-full border-2 border-border bg-main text-xl font-heading">
              {initials}
            </div>
            <dl className="grid flex-1 grid-cols-3 text-center">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <dd className="text-sm font-heading">{stat.value}</dd>
                  <dt className="text-xs">{stat.label}</dt>
                </div>
              ))}
            </dl>
          </section>

          <div className="mt-4">
            <p className="font-heading">{store.name}</p>
            <p className="text-sm">{store.bio}</p>
          </div>

          <div className="mt-4 flex gap-2">
            {canManage ? (
              <Button
                type="button"
                variant="noShadow"
                className="h-11 flex-1 rounded-xl bg-surface-2 text-foreground"
              >
                Edit profile
              </Button>
            ) : null}
            <Button
              type="button"
              variant="noShadow"
              className="h-11 flex-1 rounded-xl bg-surface-2 text-foreground"
            >
              Share profile
            </Button>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            {tabs.map((entry) => {
              const Icon = entry.icon
              const current = tab === entry.id
              return (
                <button
                  key={entry.id}
                  type="button"
                  aria-current={current ? "page" : undefined}
                  onClick={() => setTab(entry.id)}
                  className={
                    current
                      ? "grid h-11 place-items-center rounded-xl border-2 border-border bg-main shadow-shadow"
                      : "grid h-11 place-items-center rounded-xl border-2 border-border bg-surface-5 shadow-shadow"
                  }
                >
                  <Icon className="size-5" />
                  <span className="sr-only">{entry.label}</span>
                </button>
              )
            })}
          </div>

          {tab === "mixes" ? (
            <ul className="mt-3 grid grid-cols-3 gap-1 overflow-hidden rounded-2xl border-2 border-border bg-surface-5 shadow-shadow">
              {mixes.map((mix) => {
                const tile = mix.image ? (
                  <figure className="relative aspect-square overflow-hidden">
                    <img
                      src={mix.image}
                      alt={mix.name}
                      className="size-full object-cover grayscale-[0.4] sepia-[0.35] saturate-50 contrast-95"
                    />
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-0 bg-[#f0e2d3]/55 mix-blend-multiply"
                    />
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-0 bg-[#ecd3f5]/25 mix-blend-soft-light"
                    />
                    <figcaption className="sr-only">
                      {mix.name}
                      {mix.house ? ", house" : ""}
                    </figcaption>
                  </figure>
                ) : (
                  <figure className="grid aspect-square place-items-center bg-surface-5 p-2">
                    <figcaption className="text-center text-xs font-heading">
                      {mix.name}
                    </figcaption>
                  </figure>
                )

                return (
                  <li key={mix.slug}>
                    {mix.description ? (
                      <Link href={`/mixes/${mix.slug}`} className="block">
                        {tile}
                      </Link>
                    ) : (
                      tile
                    )}
                  </li>
                )
              })}
            </ul>
          ) : null}

          {tab === "saved" ? (
            <div className="mt-3 rounded-2xl border-2 border-border bg-surface-5 p-6 text-center shadow-shadow">
              <p className="font-heading">No saved mixes yet</p>
            </div>
          ) : null}

          {tab === "orders" ? (
            <div className="mt-3 space-y-3">
              {!user ? (
                <div className="rounded-2xl border-2 border-border bg-surface-5 p-6 text-center shadow-shadow">
                  <p className="font-heading">Sign in to see your orders</p>
                  <Link
                    href="/login"
                    className="mt-4 inline-flex h-11 items-center rounded-xl border-2 border-border bg-main px-4 text-sm font-heading shadow-shadow"
                  >
                    Sign in
                  </Link>
                </div>
              ) : null}

              {user && ordersQuery.isLoading ? (
                <div className="rounded-2xl border-2 border-border bg-surface-5 p-6 text-center shadow-shadow">
                  <p className="font-heading">Loading orders…</p>
                </div>
              ) : null}

              {user && ordersQuery.isError ? (
                <div className="rounded-2xl border-2 border-border bg-surface-5 p-6 text-center shadow-shadow">
                  <p className="font-heading">Could not load orders</p>
                  <p className="mt-2 text-sm text-red-700">
                    {ordersQuery.error.message}
                  </p>
                </div>
              ) : null}

              {user &&
              ordersQuery.data &&
              ordersQuery.data.length === 0 ? (
                <div className="rounded-2xl border-2 border-border bg-surface-5 p-6 text-center shadow-shadow">
                  <p className="font-heading">No orders yet</p>
                </div>
              ) : null}

              {user && ordersQuery.data && ordersQuery.data.length > 0 ? (
                <ul className="space-y-3">
                  {ordersQuery.data.map((order) => {
                    const items = asOrderItems(order.items)
                    const itemCount = items.reduce(
                      (total, item) => total + item.quantity,
                      0,
                    )
                    const preview = items
                      .slice(0, 2)
                      .map((item) => item.name)
                      .join(" · ")
                    const href = order.peyTransactionId
                      ? `/payment/${order.peyTransactionId}`
                      : null
                    const paidLabel = formatPaidAt(order.paidAt)
                    const body = (
                      <>
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate font-heading">
                              {order.storeName}
                            </p>
                            <p className="mt-1 text-xs text-foreground/70">
                              {order.storeHandle}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-heading">
                              {formatMoney(order.amount)}
                            </p>
                            <p className="mt-1 text-xs font-heading uppercase">
                              {order.status}
                            </p>
                          </div>
                        </div>
                        <p className="mt-3 text-sm text-foreground/80">
                          {preview || order.description || "Order"}
                          {items.length > 2 ? "…" : ""}
                        </p>
                        <p className="mt-2 text-xs text-foreground/60">
                          {itemCount > 0 ? `${itemCount} items` : null}
                          {itemCount > 0 && paidLabel ? " · " : null}
                          {paidLabel}
                          {!paidLabel && order.numRef
                            ? `Ref ${order.numRef}`
                            : null}
                        </p>
                      </>
                    )

                    return (
                      <li key={order.id}>
                        {href ? (
                          <Link
                            href={href}
                            className="block rounded-2xl border-2 border-border bg-surface-5 p-4 shadow-shadow"
                          >
                            {body}
                          </Link>
                        ) : (
                          <div className="rounded-2xl border-2 border-border bg-surface-5 p-4 shadow-shadow">
                            {body}
                          </div>
                        )}
                      </li>
                    )
                  })}
                </ul>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="relative z-30 mx-4 mb-4 flex flex-col items-end gap-3">
          {canManage ? (
            <Link
              href="/mixes/new"
              aria-label="New"
              className="grid size-12 place-items-center rounded-full border-2 border-border bg-surface-3 shadow-shadow"
            >
              <Plus className="size-5" />
            </Link>
          ) : null}
          <AppBottomNav />
        </div>
      </div>
    </div>
  )
}
