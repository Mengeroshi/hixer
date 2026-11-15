import { hash } from "bcryptjs"
import { PrismaClient } from "../generated/prisma/index.js"
import { recipes, shop } from "../src/data/afterglow.ts"

const db = new PrismaClient()

function slugify(name: string) {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
  return base || "mix"
}

async function main() {
  const email = "afterglow@hixy.local"
  const passwordHash = await hash("afterglow1", 10)

  const owner = await db.user.upsert({
    where: { email },
    update: {
      name: shop.name,
      passwordHash,
      isStore: true,
    },
    create: {
      email,
      name: shop.name,
      passwordHash,
      isStore: true,
    },
  })

  const store = await db.store.upsert({
    where: { slug: "afterglow" },
    update: {
      name: shop.name,
      handle: shop.handle,
      bio: "Ice cream, smoothies, and a few coffees.",
      followers: shop.followers,
      following: shop.following,
      ownerId: owner.id,
    },
    create: {
      slug: "afterglow",
      name: shop.name,
      handle: shop.handle,
      bio: "Ice cream, smoothies, and a few coffees.",
      followers: shop.followers,
      following: shop.following,
      ownerId: owner.id,
    },
  })

  for (const [position, recipe] of recipes.entries()) {
    const slug = recipe.slug ?? slugify(recipe.name)
    const data = {
      name: recipe.name,
      kind: recipe.kind,
      price: recipe.price,
      image: recipe.image,
      description: recipe.description ?? "",
      ingredients: recipe.ingredients ?? [],
      preparation: recipe.preparation ?? [],
      tags: recipe.tags ?? [],
      available: recipe.available ?? true,
      house: recipe.house ?? false,
      position,
      storeId: store.id,
    }

    await db.mix.upsert({
      where: { slug },
      update: data,
      create: { slug, ...data },
    })
  }

  await db.mix.updateMany({
    where: { storeId: null },
    data: { storeId: store.id },
  })
}

main()
  .then(async () => {
    await db.$disconnect()
  })
  .catch(async (error: unknown) => {
    console.error(error)
    await db.$disconnect()
    process.exit(1)
  })
