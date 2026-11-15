import { PrismaClient } from "../generated/prisma/index.js"
import { recipes } from "../src/data/afterglow.ts"

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
    }

    await db.mix.upsert({
      where: { slug },
      update: data,
      create: { slug, ...data },
    })
  }
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
