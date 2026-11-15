import { TRPCError } from "@trpc/server"
import { z } from "zod"

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc"

const storeFields = z.object({
  name: z.string().trim().min(1),
  handle: z.string().trim().min(1),
  bio: z.string().trim(),
  followers: z.string().trim().min(1),
  following: z.number().int().nonnegative(),
})

function slugify(name: string) {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
  return base || "store"
}

function presentStore(row: {
  id: string
  slug: string
  name: string
  handle: string
  bio: string
  followers: string
  following: number
  ownerId: string | null
}) {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    handle: row.handle,
    bio: row.bio,
    followers: row.followers,
    following: row.following,
    ownerId: row.ownerId,
  }
}

export const storeRouter = createTRPCRouter({
  list: publicProcedure.query(async ({ ctx }) => {
    const rows = await ctx.db.store.findMany({
      orderBy: { name: "asc" },
    })
    return rows.map(presentStore)
  }),

  listShops: publicProcedure.query(async ({ ctx }) => {
    const rows = await ctx.db.store.findMany({
      where: { owner: { isStore: true } },
      orderBy: { name: "asc" },
    })
    return rows.map(presentStore)
  }),

  bySlug: publicProcedure
    .input(z.object({ slug: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const row = await ctx.db.store.findUnique({
        where: { slug: input.slug },
        include: {
          mixes: {
            orderBy: { position: "asc" },
            select: {
              slug: true,
              name: true,
              image: true,
              house: true,
              description: true,
            },
          },
        },
      })

      if (!row) {
        return null
      }

      return {
        ...presentStore(row),
        mixes: row.mixes,
      }
    }),

  mine: protectedProcedure.query(async ({ ctx }) => {
    const row = await ctx.db.store.findUnique({
      where: { ownerId: ctx.session.user.id },
    })
    return row ? presentStore(row) : null
  }),

  create: protectedProcedure
    .input(storeFields)
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.store.findUnique({
        where: { ownerId: ctx.session.user.id },
      })
      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "You already have a store",
        })
      }

      const taken = new Set(
        (await ctx.db.store.findMany({ select: { slug: true } })).map(
          (store) => store.slug,
        ),
      )
      const base = slugify(input.name)
      let slug = base
      let suffix = 2
      while (taken.has(slug)) {
        slug = `${base}-${suffix}`
        suffix += 1
      }

      const row = await ctx.db.store.create({
        data: {
          slug,
          name: input.name,
          handle: input.handle,
          bio: input.bio,
          followers: input.followers,
          following: input.following,
          ownerId: ctx.session.user.id,
        },
      })

      return presentStore(row)
    }),

  update: protectedProcedure
    .input(storeFields.extend({ slug: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.store.findUnique({
        where: { slug: input.slug },
      })
      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND" })
      }
      if (existing.ownerId !== ctx.session.user.id) {
        throw new TRPCError({ code: "FORBIDDEN" })
      }

      const row = await ctx.db.store.update({
        where: { slug: input.slug },
        data: {
          name: input.name,
          handle: input.handle,
          bio: input.bio,
          followers: input.followers,
          following: input.following,
        },
      })

      return presentStore(row)
    }),
})
