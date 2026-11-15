"use client"

import Link from "next/link"
import {
  Bookmark,
  House,
  LayoutGrid,
  LogOut,
  Plus,
  Search,
  UserRound,
} from "lucide-react"

import { Button } from "~/components/ui/button"
import { signOutAction } from "~/server/auth/actions"

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

export function StoreProfile({
  store,
  mixes,
  user,
}: {
  store: StoreInfo
  mixes: MixTile[]
  user: ProfileUser | null
}) {
  const canManage = Boolean(user && store.ownerId === user.id)
  const stats = [
    { label: "Mixes", value: String(mixes.length) },
    { label: "Followers", value: store.followers },
    { label: "Following", value: String(store.following) },
  ]

  return (
    <div className="min-h-dvh bg-neutral-200 text-foreground">
      <div className="mx-auto flex h-dvh w-full max-w-[430px] flex-col bg-background">
        <div className="flex-1 overflow-y-auto px-4 pb-4">
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
            <p className="font-heading">{store.name}</p>
            <p className="text-sm">{store.bio}</p>
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
        </div>

        <div className="mx-4 mb-4 flex flex-col items-end gap-3">
          {canManage ? (
            <Link
              href="/mixes/new"
              aria-label="New"
              className="grid size-12 place-items-center rounded-full border-2 border-border bg-surface-3 shadow-shadow"
            >
              <Plus className="size-5" />
            </Link>
          ) : null}
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
