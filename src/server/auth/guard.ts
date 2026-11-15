import { redirect } from "next/navigation"

import { auth } from "~/server/auth"
import { db } from "~/server/db"

function loginPath(callbackUrl: string) {
  return `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`
}

export async function requireStoreOwner(callbackUrl: string) {
  const session = await auth()

  if (!session?.user) {
    redirect(loginPath(callbackUrl))
  }

  if (!session.user.isStore) {
    redirect("/")
  }

  const store = await db.store.findUnique({
    where: { ownerId: session.user.id },
  })

  if (!store) {
    redirect("/")
  }

  return { session, store }
}

export async function canManageStore(storeId: string | null | undefined) {
  if (!storeId) {
    return false
  }

  const session = await auth()
  if (!session?.user?.isStore) {
    return false
  }

  const store = await db.store.findUnique({
    where: { ownerId: session.user.id },
    select: { id: true },
  })

  return store?.id === storeId
}
