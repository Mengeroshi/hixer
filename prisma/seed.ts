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

const defaultPayout = {
  payoutName: "Ramón Orraca",
  payoutClabe: "012180015826225713",
} as const

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
    ...defaultPayout,
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
    ...defaultPayout,
    recipes: [
      {
        name: "Hojicha cloud",
        kind: "Soft serve",
        slug: "moonbeam-hojicha-cloud",
        price: "$5.50",
        image: "/mixes/moonbeam-hojicha-cloud.jpg",
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
        image: "/mixes/moonbeam-yuzu-night-float.jpg",
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
    ...defaultPayout,
    recipes: [
      {
        name: "Black sesame cone",
        kind: "Ice cream",
        slug: "velvet-black-sesame-cone",
        price: "$6.50",
        image: "/mixes/velvet-black-sesame-cone.jpg",
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
        image: "/mixes/velvet-warm-pistachio-drizzle.jpg",
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
      payoutName: entry.payoutName,
      payoutClabe: entry.payoutClabe,
      ownerId: owner.id,
    },
    create: {
      slug: entry.slug,
      name: entry.name,
      handle: entry.handle,
      bio: entry.bio,
      followers: entry.followers,
      following: entry.following,
      payoutName: entry.payoutName,
      payoutClabe: entry.payoutClabe,
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
      authorId: owner.id,
    }

    await db.mix.upsert({
      where: { slug },
      update: data,
      create: { slug, ...data },
    })
  }

  return {
    store: entry.name,
    storeId: store.id,
    email: entry.email,
    password: entry.password,
  }
}

const customers = [
  {
    slug: "mina",
    email: "mina@hixy.local",
    password: "mina12345",
    name: "Mina",
    handle: "@mina",
    bio: "Home mixes and weekend floats.",
  },
  {
    slug: "joel",
    email: "joel@hixy.local",
    password: "joel12345",
    name: "Joel",
    handle: "@joel",
    bio: "Coffee first, then soft serve.",
  },
  {
    slug: "rio",
    email: "rio@hixy.local",
    password: "rio12345",
    name: "Rio",
    handle: "@rio",
    bio: "Trying every cone in town.",
  },
] as const

async function seedCustomer(entry: (typeof customers)[number]) {
  const passwordHash = await hash(entry.password, 10)

  const owner = await db.user.upsert({
    where: { email: entry.email },
    update: {
      name: entry.name,
      passwordHash,
      isStore: false,
    },
    create: {
      email: entry.email,
      name: entry.name,
      passwordHash,
      isStore: false,
    },
  })

  await db.store.upsert({
    where: { slug: entry.slug },
    update: {
      name: entry.name,
      handle: entry.handle,
      bio: entry.bio,
      followers: "0",
      following: 0,
      ownerId: owner.id,
    },
    create: {
      slug: entry.slug,
      name: entry.name,
      handle: entry.handle,
      bio: entry.bio,
      followers: "0",
      following: 0,
      ownerId: owner.id,
    },
  })

  return {
    id: owner.id,
    name: entry.name,
    email: entry.email,
    password: entry.password,
  }
}

const guestMixes = [
  {
    slug: "mina-lavender-cream-float",
    name: "Lavender cream float",
    kind: "Float",
    price: "$6.25",
    image: "/mixes/mina-lavender-cream-float.jpg",
    description: "Lavender soda over vanilla soft serve, finished with cream.",
    ingredients: ["Lavender soda", "Vanilla soft serve", "Cream"],
    preparation: ["Scoop soft serve", "Pour lavender soda", "Float cream"],
    tags: ["Float", "Lavender"],
    available: true,
    house: false,
  },
  {
    slug: "mina-honey-cardamom-shake",
    name: "Honey cardamom shake",
    kind: "Shake",
    price: "$6.75",
    image: "/mixes/mina-honey-cardamom-shake.jpg",
    description: "Soft serve blended with honey and warm cardamom.",
    ingredients: ["Vanilla soft serve", "Honey", "Cardamom", "Milk"],
    preparation: ["Blend soft serve and milk", "Add honey and cardamom", "Serve cold"],
    tags: ["Shake", "Honey"],
    available: true,
    house: false,
  },
] as const

async function seedGuestMixes(authorId: string, storeId: string) {
  const lowest = await db.mix.aggregate({
    where: { storeId },
    _min: { position: true },
  })
  let position =
    lowest._min.position == null ? -1 : lowest._min.position - 1

  const created = []
  for (const mix of guestMixes) {
    const data = {
      name: mix.name,
      kind: mix.kind,
      price: mix.price,
      image: mix.image,
      description: mix.description,
      ingredients: [...mix.ingredients],
      preparation: [...mix.preparation],
      tags: [...mix.tags],
      available: mix.available,
      house: mix.house,
      position,
      storeId,
      authorId,
    }
    position -= 1

    await db.mix.upsert({
      where: { slug: mix.slug },
      update: data,
      create: { slug: mix.slug, ...data },
    })
    created.push({ slug: mix.slug, name: mix.name })
  }

  return created
}

async function main() {
  const createdStores = []
  for (const entry of stores) {
    createdStores.push(await seedStore(entry))
  }

  const createdCustomers = []
  for (const entry of customers) {
    createdCustomers.push(await seedCustomer(entry))
  }

  const afterglow = createdStores.find((store) => store.store === "Afterglow")
  const mina = createdCustomers.find((customer) => customer.name === "Mina")
  const guestAuthored =
    afterglow && mina
      ? await seedGuestMixes(mina.id, afterglow.storeId)
      : []

  console.log(
    JSON.stringify(
      {
        stores: createdStores,
        customers: createdCustomers,
        guestAuthored,
      },
      null,
      2,
    ),
  )
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
