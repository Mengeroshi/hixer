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

const stores = [
  {
    slug: "afterglow",
    email: "afterglow@hixy.local",
    password: "afterglow1",
    name: shop.name,
    handle: shop.handle,
    bio: "Ice cream, smoothies, and a few coffees.",
    followers: shop.followers,
    following: shop.following,
    recipes,
  },
  {
    slug: "moonbeam",
    email: "moonbeam@hixy.local",
    password: "moonbeam1",
    name: "Moonbeam",
    handle: "@moonbeam.cup",
    bio: "Matcha, oat foam, and late-night soft serve.",
    followers: "840",
    following: 42,
    recipes: [
      {
        name: "Hojicha cloud",
        kind: "Soft serve",
        slug: "moonbeam-hojicha-cloud",
        price: "$5.50",
        image: "",
        description: "Toasted hojicha soft serve with oat foam.",
        ingredients: ["Hojicha", "Oat milk", "Sugar"],
        preparation: ["Churn soft serve", "Top with oat foam"],
        tags: ["Matcha", "Soft serve"],
        available: true,
        house: true,
      },
      {
        name: "Yuzu night float",
        kind: "Float",
        slug: "moonbeam-yuzu-night-float",
        price: "$6.00",
        image: "",
        description: "Yuzu soda over vanilla soft serve.",
        ingredients: ["Yuzu soda", "Vanilla soft serve"],
        preparation: ["Scoop soft serve", "Pour yuzu soda"],
        tags: ["Float", "Yuzu"],
        available: true,
        house: true,
      },
    ],
  },
  {
    slug: "velvet-cone",
    email: "velvetcone@hixy.local",
    password: "velvetcone1",
    name: "Velvet Cone",
    handle: "@velvet.cone",
    bio: "Small-batch cones, roasted nuts, and warm toppings.",
    followers: "2.1k",
    following: 63,
    recipes: [
      {
        name: "Black sesame cone",
        kind: "Ice cream",
        slug: "velvet-black-sesame-cone",
        price: "$6.50",
        image: "",
        description: "Black sesame ice cream in a charcoal cone.",
        ingredients: ["Black sesame", "Cream", "Charcoal cone"],
        preparation: ["Scoop into cone", "Dust with sesame"],
        tags: ["Cone", "Sesame"],
        available: true,
        house: true,
      },
      {
        name: "Warm pistachio drizzle",
        kind: "Ice cream",
        slug: "velvet-warm-pistachio-drizzle",
        price: "$7.00",
        image: "",
        description: "Pistachio ice cream finished with warm honey.",
        ingredients: ["Pistachio ice cream", "Honey", "Salt"],
        preparation: ["Scoop", "Warm honey", "Drizzle"],
        tags: ["Pistachio", "House"],
        available: true,
        house: true,
      },
    ],
  },
] as const

async function seedStore(entry: (typeof stores)[number]) {
  const passwordHash = await hash(entry.password, 10)

  const owner = await db.user.upsert({
    where: { email: entry.email },
    update: {
      name: entry.name,
      passwordHash,
      isStore: true,
    },
    create: {
      email: entry.email,
      name: entry.name,
      passwordHash,
      isStore: true,
    },
  })

  const store = await db.store.upsert({
    where: { slug: entry.slug },
    update: {
      name: entry.name,
      handle: entry.handle,
      bio: entry.bio,
      followers: entry.followers,
      following: entry.following,
      ownerId: owner.id,
    },
    create: {
      slug: entry.slug,
      name: entry.name,
      handle: entry.handle,
      bio: entry.bio,
      followers: entry.followers,
      following: entry.following,
      ownerId: owner.id,
    },
  })

  for (const [position, recipe] of entry.recipes.entries()) {
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

  return {
    store: entry.name,
    email: entry.email,
    password: entry.password,
  }
}

async function main() {
  const created = []
  for (const entry of stores) {
    created.push(await seedStore(entry))
  }

  console.log(JSON.stringify(created, null, 2))
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
