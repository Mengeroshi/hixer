"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { House, Plus, Search, UserRound } from "lucide-react"

const nav = [
  { label: "Home", icon: House, tone: "text-surface-1", href: "/" },
  { label: "Search", icon: Search, tone: "text-surface-3" },
  { label: "Add", icon: Plus, tone: "text-surface-2" },
  { label: "Profile", icon: UserRound, href: "/profile" },
] as const

export function AppBottomNav() {
  const pathname = usePathname()

  return (
    <nav className="grid w-full shrink-0 grid-cols-4 rounded-full border-2 border-border bg-foreground">
      {nav.map((item) => {
        const Icon = item.icon
        const current =
          ("href" in item && item.href === "/" && pathname === "/") ||
          ("href" in item &&
            item.href === "/profile" &&
            (pathname === "/profile" || pathname.startsWith("/profile/"))) ||
          ("href" in item &&
            item.href === "/" &&
            pathname.startsWith("/payment/"))
        const className = "grid h-14 place-items-center"
        const content = (
          <>
            {current ? (
              <span className="grid size-10 place-items-center rounded-full bg-surface-5 text-foreground">
                <Icon className="size-5" />
              </span>
            ) : (
              <Icon
                className={`size-6 stroke-[2.5] ${"tone" in item ? item.tone : ""}`}
              />
            )}
            <span className="sr-only">{item.label}</span>
          </>
        )

        if ("href" in item && item.href) {
          return (
            <Link
              key={item.label}
              href={item.href}
              aria-current={current ? "page" : undefined}
              className={className}
            >
              {content}
            </Link>
          )
        }

        return (
          <button
            key={item.label}
            type="button"
            aria-current={current ? "page" : undefined}
            className={className}
          >
            {content}
          </button>
        )
      })}
    </nav>
  )
}
