import { redirect } from "next/navigation"

import { auth } from "~/server/auth"
import { db } from "~/server/db"
import { ensureOwnedStore } from "~/server/owned-store"

function loginPath(callbackUrl: string) {
  return `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`
}

export async function requireSession(callbackUrl: string) {
  const session = await auth()

  if (!session?.user) {
    redirect(loginPath(callbackUrl))
  }

  return session
}

export async function requireStoreOwner(callbackUrl: string) {
  const session = await requireSession(callbackUrl)
  const store = await ensureOwnedStore(session.user)

  return { session, store }
}

export async function canManageStore(storeId: string | null | undefined) {
  if (!storeId) {
    return false
  }

  const session = await auth()
  if (!session?.user) {
    return false
  }

  const store = await db.store.findUnique({
    where: { id: storeId },
    select: { ownerId: true },
  })

  return store?.ownerId === session.user.id
}

export async function canManageMix(mix: {
  authorId: string | null
  storeId: string | null
}) {
  const session = await auth()
  if (!session?.user) {
    return false
  }

  if (mix.authorId === session.user.id) {
    return true
  }

  return canManageStore(mix.storeId)
}

export async function requireMixEditor(slug: string, callbackUrl: string) {
  const session = await requireSession(callbackUrl)
  const mix = await db.mix.findUnique({
    where: { slug },
    include: { store: { select: { ownerId: true } } },
  })

  if (!mix) {
    return { session, mix: null }
  }

  const isAuthor = mix.authorId === session.user.id
  const isStoreOwner = mix.store.ownerId === session.user.id
  if (!isAuthor && !isStoreOwner) {
    redirect("/profile")
  }

  return { session, mix }
}
