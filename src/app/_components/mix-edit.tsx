"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, type FormEvent } from "react"
import { ArrowLeft, Plus, X } from "lucide-react"

import { Button } from "~/components/ui/button"
import type { MixDetailData } from "~/app/_components/mix-detail"
import { api } from "~/trpc/react"

type MixDraft = {
  name: string
  price: string
  description: string
  ingredients: string[]
  preparation: string[]
  tags: string[]
  available: boolean
}

function updateItem(items: string[], index: number, value: string) {
  return items.map((item, itemIndex) => (itemIndex === index ? value : item))
}

function removeItem(items: string[], index: number) {
  return items.filter((_, itemIndex) => itemIndex !== index)
}

const emptyDraft: MixDraft = {
  name: "",
  price: "",
  description: "",
  ingredients: [],
  preparation: [],
  tags: [],
  available: true,
}

type ShopOption = {
  slug: string
  name: string
}

type MixFormProps = {
  title: string
  backHref: string
  backLabel: string
  image?: string
  initial: MixDraft
  saving?: boolean
  shops?: ShopOption[]
  onSave: (draft: MixDraft & { storeSlug?: string }) => void
}

function MixForm({
  title,
  backHref,
  backLabel,
  image,
  initial,
  saving = false,
  shops,
  onSave,
}: MixFormProps) {
  const [draft, setDraft] = useState(initial)
  const [storeSlug, setStoreSlug] = useState(shops?.[0]?.slug ?? "")

  function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const next = {
      name: draft.name.trim(),
      price: draft.price.trim(),
      description: draft.description.trim(),
      ingredients: draft.ingredients.map((item) => item.trim()).filter(Boolean),
      preparation: draft.preparation.map((item) => item.trim()).filter(Boolean),
      tags: draft.tags.map((item) => item.trim()).filter(Boolean),
      available: draft.available,
    }

    if (!next.name || !next.price || !next.description || next.ingredients.length === 0) {
      return
    }

    if (shops && shops.length > 0 && !storeSlug) {
      return
    }

    onSave(shops ? { ...next, storeSlug } : next)
  }

  return (
    <div className="min-h-dvh bg-neutral-200 text-foreground">
      <div className="relative mx-auto flex h-dvh w-full max-w-[430px] flex-col bg-background">
        <form onSubmit={handleSave} className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 overflow-y-auto px-4 pb-4">
            <header className="flex items-center gap-3 py-4">
              <Link
                href={backHref}
                aria-label={backLabel}
                className="grid size-10 place-items-center rounded-full border-2 border-border bg-surface-3 shadow-shadow"
              >
                <ArrowLeft className="size-4" />
              </Link>
              <p className="text-sm font-heading">{title}</p>
            </header>

            <figure className="relative overflow-hidden rounded-2xl border-2 border-border shadow-shadow">
              {image ? (
                <img
                  src={image}
                  alt={draft.name || title}
                  className="aspect-square w-full object-cover grayscale-[0.4] sepia-[0.35] saturate-50 contrast-95"
                />
              ) : (
                <div className="aspect-square bg-surface-5" />
              )}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-[#f0e2d3]/55 mix-blend-multiply"
              />
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-[#ecd3f5]/25 mix-blend-soft-light"
              />
            </figure>

            {shops && shops.length > 0 ? (
              <label className="mt-4 block">
                <span className="mb-1 block text-xs font-heading">Store</span>
                <select
                  required
                  value={storeSlug}
                  onChange={(event) => setStoreSlug(event.target.value)}
                  className="h-12 w-full rounded-xl border-2 border-border bg-background px-3 text-sm font-heading"
                >
                  {shops.map((shop) => (
                    <option key={shop.slug} value={shop.slug}>
                      {shop.name}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}

            <label className="mt-4 block">
              <span className="sr-only">Name</span>
              <input
                required
                value={draft.name}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                className="w-full rounded-xl border-2 border-border bg-surface-5 px-3 py-2 text-2xl font-heading tracking-tight outline-none"
              />
            </label>
            <div className="mt-2 grid grid-cols-2 items-center gap-3">
              <label className="block">
                <span className="sr-only">Price</span>
                <input
                  required
                  value={draft.price}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      price: event.target.value,
                    }))
                  }
                  className="w-full rounded-xl border-2 border-border bg-surface-5 px-3 py-2 text-lg font-heading outline-none"
                />
              </label>
              <label className="flex items-center justify-between gap-2">
                <span className="text-xs font-heading">Available</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={draft.available}
                  onClick={() =>
                    setDraft((current) => ({
                      ...current,
                      available: !current.available,
                    }))
                  }
                  className={`relative h-8 w-14 rounded-full border-2 border-border shadow-shadow ${
                    draft.available ? "bg-surface-2" : "bg-surface-5"
                  }`}
                >
                  <span
                    aria-hidden
                    className={`absolute top-0.5 left-0.5 size-6 rounded-full border-2 border-border bg-background transition-transform ${
                      draft.available ? "translate-x-6" : "translate-x-0"
                    }`}
                  />
                </button>
              </label>
            </div>

            <label className="mt-4 block">
              <span className="text-sm font-heading">Description</span>
              <textarea
                required
                rows={3}
                value={draft.description}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                className="mt-2 w-full resize-none rounded-xl border-2 border-border bg-surface-5 px-3 py-2 text-sm outline-none"
              />
            </label>

            <section className="mt-6">
              <h2 className="text-sm font-heading">Ingredients</h2>
              <ul className="mt-2 grid grid-cols-[repeat(auto-fit,minmax(9.5rem,1fr))] gap-2">
                {draft.ingredients.map((ingredient, index) => (
                  <li key={`ingredient-${index}`} className="relative">
                    <input
                      value={ingredient}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          ingredients: updateItem(
                            current.ingredients,
                            index,
                            event.target.value,
                          ),
                        }))
                      }
                      className="w-full rounded-xl border-2 border-border bg-surface-3 px-3 py-2 pr-9 text-sm outline-none"
                    />
                    <button
                      type="button"
                      aria-label={`Remove ingredient ${index + 1}`}
                      onClick={() =>
                        setDraft((current) => ({
                          ...current,
                          ingredients: removeItem(current.ingredients, index),
                        }))
                      }
                      className="absolute top-1/2 right-2 -translate-y-1/2"
                    >
                      <X className="size-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                aria-label="Add ingredient"
                onClick={() =>
                  setDraft((current) => ({
                    ...current,
                    ingredients: [...current.ingredients, ""],
                  }))
                }
                className="mt-2 ml-auto grid size-8 place-items-center rounded-full border-2 border-border bg-surface-3 shadow-shadow"
              >
                <Plus className="size-4" />
              </button>
            </section>

            <section className="mt-6">
              <h2 className="text-sm font-heading">Preparation</h2>
              <ol className="mt-2 space-y-2">
                {draft.preparation.map((step, index) => (
                  <li key={`step-${index}`} className="relative">
                    <span className="pointer-events-none absolute top-2.5 left-3 text-sm font-heading">
                      {index + 1}.
                    </span>
                    <textarea
                      rows={2}
                      value={step}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          preparation: updateItem(
                            current.preparation,
                            index,
                            event.target.value,
                          ),
                        }))
                      }
                      className="w-full resize-none rounded-xl border-2 border-border bg-main px-3 py-2 pl-8 pr-9 text-sm outline-none"
                    />
                    <button
                      type="button"
                      aria-label={`Remove step ${index + 1}`}
                      onClick={() =>
                        setDraft((current) => ({
                          ...current,
                          preparation: removeItem(current.preparation, index),
                        }))
                      }
                      className="absolute top-2.5 right-2"
                    >
                      <X className="size-3.5" />
                    </button>
                  </li>
                ))}
              </ol>
              <button
                type="button"
                aria-label="Add preparation step"
                onClick={() =>
                  setDraft((current) => ({
                    ...current,
                    preparation: [...current.preparation, ""],
                  }))
                }
                className="mt-2 ml-auto grid size-8 place-items-center rounded-full border-2 border-border bg-main shadow-shadow"
              >
                <Plus className="size-4" />
              </button>
            </section>

            <section className="mt-6">
              <h2 className="text-sm font-heading">Tags</h2>
              <ul className="mt-2 grid grid-cols-3 gap-2">
                {draft.tags.map((tag, index) => (
                  <li key={`tag-${index}`} className="relative">
                    <input
                      value={tag}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          tags: updateItem(
                            current.tags,
                            index,
                            event.target.value,
                          ),
                        }))
                      }
                      className="w-full rounded-full border-2 border-border bg-surface-5 px-3 py-1 pr-7 text-xs font-heading outline-none"
                    />
                    <button
                      type="button"
                      aria-label={`Remove tag ${index + 1}`}
                      onClick={() =>
                        setDraft((current) => ({
                          ...current,
                          tags: removeItem(current.tags, index),
                        }))
                      }
                      className="absolute top-1/2 right-2 -translate-y-1/2"
                    >
                      <X className="size-3" />
                    </button>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                aria-label="Add tag"
                onClick={() =>
                  setDraft((current) => ({
                    ...current,
                    tags: [...current.tags, ""],
                  }))
                }
                className="mt-2 ml-auto grid size-8 place-items-center rounded-full border-2 border-border bg-surface-5 shadow-shadow"
              >
                <Plus className="size-4" />
              </button>
            </section>
          </div>

          <div className="px-4 pb-4">
            <Button
              type="submit"
              disabled={saving}
              className="h-12 w-full rounded-xl bg-surface-2 text-foreground"
            >
              Save
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export function MixEdit({ mix }: { mix: MixDetailData }) {
  const router = useRouter()
  const update = api.mix.update.useMutation({
    onSuccess: () => router.push(`/mixes/${mix.slug}`),
  })

  return (
    <MixForm
      title="Edit mix"
      backHref={`/mixes/${mix.slug}`}
      backLabel="Back to mix"
      image={mix.image || undefined}
      initial={mix}
      saving={update.isPending}
      onSave={(draft) => update.mutate({ slug: mix.slug, ...draft })}
    />
  )
}

export function MixCreate({
  isStore,
  shops = [],
}: {
  isStore: boolean
  shops?: ShopOption[]
}) {
  const router = useRouter()
  const create = api.mix.create.useMutation({
    onSuccess: (mix) => router.push(`/mixes/${mix.slug}`),
  })

  return (
    <MixForm
      title="New mix"
      backHref="/profile"
      backLabel="Back to profile"
      initial={emptyDraft}
      saving={create.isPending}
      shops={isStore ? undefined : shops}
      onSave={(draft) => create.mutate(draft)}
    />
  )
}
