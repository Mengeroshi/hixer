import { signOut } from "~/server/auth"
import { db } from "~/server/db"

function slugify(value: string) {
  const base = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
  return base || "profile"
}

function profileLabel(user: {
  name?: string | null
  email?: string | null
}) {
  const name = user.name?.trim()
  if (name) {
    return name
  }

  const local = user.email?.split("@")[0]?.trim()
  if (local) {
    return local
  }

  return "Profile"
}

export async function ensureOwnedStore(user: {
  id: string
  name?: string | null
  email?: string | null
}) {
  const existing = await db.store.findUnique({
    where: { ownerId: user.id },
  })
  if (existing) {
    return existing
  }

  const owner = await db.user.findUnique({
    where: { id: user.id },
    select: { id: true },
  })
  if (!owner) {
    // Stale JWT after DB reset. Must clear cookie — login↔profile redirect loops otherwise
    await signOut({ redirectTo: "/login" })
  }

  const label = profileLabel(user)
  const taken = new Set(
    (await db.store.findMany({ select: { slug: true } })).map(
      (store) => store.slug,
    ),
  )
  const base = slugify(label)
  let slug = base
  let suffix = 2
  while (taken.has(slug)) {
    slug = `${base}-${suffix}`
    suffix += 1
  }

  return db.store.create({
    data: {
      slug,
      name: label,
      handle: `@${slug.replace(/-/g, ".")}`,
      bio: "",
      followers: "0",
      following: 0,
      ownerId: user.id,
    },
  })
}
