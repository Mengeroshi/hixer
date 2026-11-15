import { TRPCError } from "@trpc/server"
import { z } from "zod"

import type { Prisma } from "../../../../generated/prisma"
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc"
import { ensureOwnedStore } from "~/server/owned-store"

const stringList = z.array(z.string())

const mixFields = z.object({
  name: z.string().trim().min(1),
  price: z.string().trim().min(1),
  description: z.string().trim().min(1),
  image: z.string().trim().url().or(z.literal("")).optional(),
  ingredients: z.array(z.string().trim().min(1)).min(1),
  preparation: z.array(z.string().trim().min(1)),
  tags: z.array(z.string().trim().min(1)),
  available: z.boolean(),
})

function asStringList(value: Prisma.JsonValue): string[] {
  const parsed = stringList.safeParse(value)
  return parsed.success ? parsed.data : []
}

function slugify(name: string) {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
  return base || "mix"
}

function present(
  row: {
    slug: string
    name: string
    kind: string
    price: string
    image: string
    description: string
    ingredients: Prisma.JsonValue
    preparation: Prisma.JsonValue
    tags: Prisma.JsonValue
    available: boolean
    house: boolean
    storeId: string | null
    authorId: string | null
  },
  store?: { slug: string; name: string; handle: string } | null,
) {
  return {
    slug: row.slug,
    name: row.name,
    kind: row.kind,
    price: row.price,
    image: row.image,
    description: row.description,
    ingredients: asStringList(row.ingredients),
    preparation: asStringList(row.preparation),
    tags: asStringList(row.tags),
    available: row.available,
    house: row.house,
    storeId: row.storeId,
    authorId: row.authorId,
    store: store
      ? { slug: store.slug, name: store.name, handle: store.handle }
      : null,
  }
}

async function resolveCreateStore(
  user: { id: string; name?: string | null; email?: string | null; isStore: boolean },
  storeSlug: string | undefined,
  findShop: (slug: string) => Promise<{ id: string; isShop: boolean } | null>,
) {
  if (user.isStore) {
    return ensureOwnedStore(user)
  }

  if (!storeSlug) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Pick a store for this mix",
    })
  }

  const store = await findShop(storeSlug)
  if (!store?.isShop) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Store not found",
    })
  }

  return store
}

export const mixRouter = createTRPCRouter({
  list: publicProcedure
    .input(z.object({ storeSlug: z.string().min(1) }).optional())
    .query(async ({ ctx, input }) => {
      return ctx.db.mix.findMany({
        where: input?.storeSlug
          ? { store: { slug: input.storeSlug } }
          : undefined,
        orderBy: { position: "asc" },
        select: {
          slug: true,
          name: true,
          image: true,
          house: true,
          description: true,
        },
      })
    }),

  feed: publicProcedure.query(async ({ ctx }) => {
    const rows = await ctx.db.mix.findMany({
      orderBy: [{ createdAt: "desc" }, { position: "asc" }],
      select: {
        slug: true,
        name: true,
        kind: true,
        price: true,
        image: true,
        description: true,
        available: true,
        createdAt: true,
        store: {
          select: {
            slug: true,
            name: true,
            handle: true,
          },
        },
      },
    })

    return rows.map((row) => ({
      slug: row.slug,
      name: row.name,
      kind: row.kind,
      price: row.price,
      image: row.image,
      description: row.description,
      available: row.available,
      createdAt: row.createdAt,
      store: row.store,
    }))
  }),

  mine: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.mix.findMany({
      where: { authorId: ctx.session.user.id },
      orderBy: { position: "asc" },
      select: {
        slug: true,
        name: true,
        image: true,
        house: true,
        description: true,
      },
    })
  }),

  bySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const row = await ctx.db.mix.findUnique({
        where: { slug: input.slug },
        include: {
          store: {
            select: { slug: true, name: true, handle: true },
          },
        },
      })
      return row ? present(row, row.store) : null
    }),

  create: protectedProcedure
    .input(mixFields.extend({ storeSlug: z.string().trim().min(1).optional() }))
    .mutation(async ({ ctx, input }) => {
      const store = await resolveCreateStore(
        ctx.session.user,
        input.storeSlug,
        async (slug) => {
          const row = await ctx.db.store.findUnique({
            where: { slug },
            select: {
              id: true,
              owner: { select: { isStore: true } },
            },
          })
          if (!row) {
            return null
          }
          return { id: row.id, isShop: Boolean(row.owner?.isStore) }
        },
      )

      const existing = await ctx.db.mix.findMany({ select: { slug: true } })
      const taken = new Set(existing.map((mix) => mix.slug))
      taken.add("new")
      const base = slugify(input.name)
      let slug = base
      let suffix = 2
      while (taken.has(slug)) {
        slug = `${base}-${suffix}`
        suffix += 1
      }

      const lowest = await ctx.db.mix.aggregate({
        where: { storeId: store.id },
        _min: { position: true },
      })
      const position =
        lowest._min.position == null ? 0 : lowest._min.position - 1

      const row = await ctx.db.mix.create({
        data: {
          slug,
          name: input.name,
          kind: "Mix",
          price: input.price,
          image: input.image ?? "",
          description: input.description,
          ingredients: input.ingredients,
          preparation: input.preparation,
          tags: input.tags,
          available: input.available,
          position,
          storeId: store.id,
          authorId: ctx.session.user.id,
        },
      })

      return present(row)
    }),

  update: protectedProcedure
    .input(mixFields.extend({ slug: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.mix.findUnique({
        where: { slug: input.slug },
        include: { store: { select: { ownerId: true } } },
      })
      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND" })
      }

      const isAuthor = existing.authorId === ctx.session.user.id
      const isStoreOwner = existing.store.ownerId === ctx.session.user.id
      if (!isAuthor && !isStoreOwner) {
        throw new TRPCError({ code: "FORBIDDEN" })
      }

      const row = await ctx.db.mix.update({
        where: { slug: input.slug },
        data: {
          name: input.name,
          price: input.price,
          image: input.image ?? existing.image,
          description: input.description,
          ingredients: input.ingredients,
          preparation: input.preparation,
          tags: input.tags,
          available: input.available,
        },
      })

      return present(row)
    }),
})
