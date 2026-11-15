import { TRPCError } from "@trpc/server"
import { z } from "zod"

import { Prisma } from "../../../../generated/prisma"
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc"

const stringList = z.array(z.string())

const mixFields = z.object({
  name: z.string().trim().min(1),
  price: z.string().trim().min(1),
  description: z.string().trim().min(1),
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

function present(row: {
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
}) {
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
  }
}

export const mixRouter = createTRPCRouter({
  list: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.mix.findMany({
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
      const row = await ctx.db.mix.findUnique({ where: { slug: input.slug } })
      return row ? present(row) : null
    }),

  create: publicProcedure.input(mixFields).mutation(async ({ ctx, input }) => {
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

    const lowest = await ctx.db.mix.aggregate({ _min: { position: true } })
    const position = lowest._min.position == null ? 0 : lowest._min.position - 1

    const row = await ctx.db.mix.create({
      data: {
        slug,
        name: input.name,
        kind: "Mix",
        price: input.price,
        description: input.description,
        ingredients: input.ingredients,
        preparation: input.preparation,
        tags: input.tags,
        available: input.available,
        position,
      },
    })

    return present(row)
  }),

  update: publicProcedure
    .input(mixFields.extend({ slug: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.mix.findUnique({
        where: { slug: input.slug },
      })
      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND" })
      }

      const row = await ctx.db.mix.update({
        where: { slug: input.slug },
        data: {
          name: input.name,
          price: input.price,
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
