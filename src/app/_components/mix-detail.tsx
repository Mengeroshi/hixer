"use client"

import Link from "next/link"
import { useSyncExternalStore } from "react"
import { ArrowLeft, Pencil } from "lucide-react"

import type { Recipe } from "~/data/afterglow"
import { readCreatedMix, subscribeCreatedMixes } from "~/lib/created-mixes"
import {
  readMixOverride,
  subscribeMixOverride,
} from "~/lib/mix-overrides"

type MixDetailProps = {
  recipe: Recipe & {
    slug: string
    description: string
    ingredients: string[]
    available: boolean
    price: string
  }
}

export function MixDetail({ recipe }: MixDetailProps) {
  const override = useSyncExternalStore(
    (onStoreChange) => subscribeMixOverride(recipe.slug, onStoreChange),
    () => readMixOverride(recipe.slug),
    () => null,
  )

  const mix = override
    ? {
        ...recipe,
        name: override.name,
        price: override.price,
        description: override.description,
        ingredients: override.ingredients,
        preparation: override.preparation,
        tags: override.tags,
        available: override.available,
      }
    : recipe

  return (
    <div className="min-h-dvh bg-neutral-200 text-foreground">
      <div className="relative mx-auto flex h-dvh w-full max-w-[430px] flex-col bg-background">
        <div className="flex-1 overflow-y-auto px-4 pb-24">
          <header className="flex items-center gap-3 py-4">
            <Link
              href="/"
              aria-label="Back to profile"
              className="grid size-10 place-items-center rounded-full border-2 border-border bg-surface-3 shadow-shadow"
            >
              <ArrowLeft className="size-4" />
            </Link>
            <p className="text-sm font-heading">{mix.kind}</p>
          </header>

          <figure className="relative overflow-hidden rounded-2xl border-2 border-border shadow-shadow">
            {mix.image ? (
              <img
                src={mix.image}
                alt={mix.name}
                className="aspect-square w-full object-cover grayscale-[0.4] sepia-[0.35] saturate-50 contrast-95"
              />
            ) : (
              <div className="grid aspect-square place-items-center bg-surface-5 p-4">
                <span className="text-center text-sm font-heading">{mix.name}</span>
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

          <div className="mt-4 flex items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-heading tracking-tight">{mix.name}</h1>
              <p className="mt-1 text-lg font-heading">{mix.price}</p>
            </div>
            <span
              className={
                mix.available
                  ? "shrink-0 rounded-xl border-2 border-border bg-surface-2 px-3 py-1 text-xs font-heading"
                  : "shrink-0 rounded-xl border-2 border-border bg-surface-3 px-3 py-1 text-xs font-heading text-foreground/50"
              }
            >
              {mix.available ? "Available" : "Sold out"}
            </span>
          </div>

          <p className="mt-3 text-sm">{mix.description}</p>

          <section className="mt-6">
            <h2 className="text-sm font-heading">Ingredients</h2>
            <ul className="mt-2 grid grid-cols-[repeat(auto-fit,minmax(9.5rem,1fr))] gap-2">
              {mix.ingredients.map((ingredient) => (
                <li
                  key={ingredient}
                  className="rounded-xl border-2 border-border bg-surface-3 px-3 py-2 text-sm"
                >
                  {ingredient}
                </li>
              ))}
            </ul>
          </section>

          {mix.preparation && mix.preparation.length > 0 ? (
            <section className="mt-6">
              <h2 className="text-sm font-heading">Preparation</h2>
              <ol className="mt-2 space-y-2">
                {mix.preparation.map((step, index) => (
                  <li
                    key={`${index}-${step}`}
                    className="rounded-xl border-2 border-border bg-main px-3 py-2 text-sm"
                  >
                    <span className="font-heading">{index + 1}.</span> {step}
                  </li>
                ))}
              </ol>
            </section>
          ) : null}

          {mix.tags && mix.tags.length > 0 ? (
            <section className="mt-6">
              <h2 className="text-sm font-heading">Tags</h2>
              <ul className="mt-2 flex flex-wrap gap-2">
                {mix.tags.map((tag) => (
                  <li
                    key={tag}
                    className="rounded-full border-2 border-border bg-surface-5 px-3 py-1 text-xs font-heading"
                  >
                    {tag}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>

        <Link
          href={`/mixes/${mix.slug}/edit`}
          aria-label="Edit mix"
          className="absolute right-4 bottom-4 z-10 grid size-12 place-items-center rounded-full border-2 border-border bg-surface-3 shadow-shadow"
        >
          <Pencil className="size-5" />
        </Link>
      </div>
    </div>
  )
}

export function CreatedMixDetail({ slug }: { slug: string }) {
  const mix = useSyncExternalStore(
    subscribeCreatedMixes,
    () => readCreatedMix(slug),
    () => null,
  )

  if (!mix) {
    return (
      <div className="min-h-dvh bg-neutral-200 text-foreground">
        <div className="mx-auto flex h-dvh w-full max-w-[430px] flex-col bg-background px-4">
          <header className="flex items-center gap-3 py-4">
            <Link
              href="/"
              aria-label="Back to profile"
              className="grid size-10 place-items-center rounded-full border-2 border-border bg-surface-3 shadow-shadow"
            >
              <ArrowLeft className="size-4" />
            </Link>
            <p className="text-sm font-heading">Mix</p>
          </header>
          <p className="text-sm">This mix is not saved in this browser session.</p>
        </div>
      </div>
    )
  }

  return (
    <MixDetail
      recipe={{
        name: mix.name,
        kind: "Mix",
        image: "",
        price: mix.price,
        slug: mix.slug,
        description: mix.description,
        ingredients: mix.ingredients,
        preparation: mix.preparation,
        tags: mix.tags,
        available: mix.available,
      }}
    />
  )
}
