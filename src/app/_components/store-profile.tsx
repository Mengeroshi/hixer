"use client"

import Link from "next/link"
import { useSyncExternalStore } from "react"
import {
  Bookmark,
  House,
  LayoutGrid,
  Menu,
  Plus,
  Search,
  UserRound,
} from "lucide-react"

import { Button } from "~/components/ui/button"
import { recipes, shop } from "~/data/afterglow"
import { readCreatedMixes, subscribeCreatedMixes } from "~/lib/created-mixes"

const noCreatedMixes: ReturnType<typeof readCreatedMixes> = []

const tabs = [
  { label: "Mixes", icon: LayoutGrid, current: true },
  { label: "Saved", icon: Bookmark },
  { label: "Tagged", icon: UserRound },
] as const

const nav = [
  { label: "Home", icon: House, tone: "text-surface-1" },
  { label: "Search", icon: Search, tone: "text-surface-3" },
  { label: "Add", icon: Plus, tone: "text-surface-2" },
  { label: "Profile", icon: UserRound, current: true },
] as const

export function StoreProfile() {
  const created = useSyncExternalStore(
    subscribeCreatedMixes,
    readCreatedMixes,
    () => noCreatedMixes,
  )
  const stats = [
    { label: "Mixes", value: String(recipes.length + created.length) },
    { label: "Followers", value: shop.followers },
    { label: "Following", value: String(shop.following) },
  ]

  return (
    <div className="min-h-dvh bg-neutral-200 text-foreground">
      <div className="mx-auto flex h-dvh w-full max-w-[430px] flex-col bg-background">
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          <header className="grid grid-cols-[1fr_auto_1fr] items-center py-4">
            <span />
            <h1 className="text-base font-heading">{shop.handle}</h1>
            <div className="flex justify-end">
              <button
                type="button"
                aria-label="Menu"
                className="grid size-10 place-items-center rounded-full border-2 border-border bg-surface-3 shadow-shadow"
              >
                <Menu className="size-4" />
              </button>
            </div>
          </header>

          <section className="flex items-center gap-4">
            <div className="grid size-20 shrink-0 place-items-center rounded-full border-2 border-border bg-main text-xl font-heading">
              AG
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
            <p className="font-heading">{shop.name}</p>
            <p className="text-sm">Ice cream, smoothies, and a few coffees.</p>
          </div>

          <div className="mt-4 flex gap-2">
            <Button
              type="button"
              variant="noShadow"
              className="h-11 flex-1 rounded-xl bg-surface-2 text-foreground"
            >
              Edit profile
            </Button>
            <Button
              type="button"
              variant="noShadow"
              className="h-11 flex-1 rounded-xl bg-surface-2 text-foreground"
            >
              Share profile
            </Button>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const current = "current" in tab
              return (
                <button
                  key={tab.label}
                  type="button"
                  aria-current={current ? "page" : undefined}
                  className={
                    current
                      ? "grid h-11 place-items-center rounded-xl border-2 border-border bg-main shadow-shadow"
                      : "grid h-11 place-items-center rounded-xl border-2 border-border bg-surface-5 shadow-shadow"
                  }
                >
                  <Icon className="size-5" />
                  <span className="sr-only">{tab.label}</span>
                </button>
              )
            })}
          </div>

          <ul className="mt-3 grid grid-cols-3 gap-1 overflow-hidden rounded-2xl border-2 border-border bg-surface-5 shadow-shadow">
            {created.toReversed().map((mix) => (
              <li key={mix.slug}>
                <Link href={`/mixes/${mix.slug}`} className="block">
                  <figure className="grid aspect-square place-items-center bg-surface-5 p-2">
                    <figcaption className="text-center text-xs font-heading">
                      {mix.name}
                    </figcaption>
                  </figure>
                </Link>
              </li>
            ))}
            {recipes.map((recipe) => {
              const tile = (
                <figure className="relative aspect-square overflow-hidden">
                  <img
                    src={recipe.image}
                    alt={recipe.name}
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
                    {recipe.name}
                    {recipe.house ? ", house" : ""}
                  </figcaption>
                </figure>
              )

              return (
                <li key={recipe.name}>
                  {recipe.slug ? (
                    <Link href={`/mixes/${recipe.slug}`} className="block">
                      {tile}
                    </Link>
                  ) : (
                    tile
                  )}
                </li>
              )
            })}
          </ul>
        </div>

        <div className="mx-4 mb-4 flex flex-col items-end gap-3">
          <Link
            href="/mixes/new"
            aria-label="New"
            className="grid size-12 place-items-center rounded-full border-2 border-border bg-surface-3 shadow-shadow"
          >
            <Plus className="size-5" />
          </Link>
          <nav className="grid w-full shrink-0 grid-cols-4 rounded-full border-2 border-border bg-foreground">
          {nav.map((item) => {
            const Icon = item.icon
            const current = "current" in item
            return (
              <button
                key={item.label}
                type="button"
                aria-current={current ? "page" : undefined}
                className="grid h-14 place-items-center"
              >
                {current ? (
                  <span className="grid size-10 place-items-center rounded-full bg-surface-5 text-foreground">
                    <Icon className="size-5" />
                  </span>
                ) : (
                  <Icon className={`size-6 stroke-[2.5] ${"tone" in item ? item.tone : ""}`} />
                )}
                <span className="sr-only">{item.label}</span>
              </button>
            )
          })}
          </nav>
        </div>
      </div>
    </div>
  )
}
