import { notFound, redirect } from "next/navigation"

import { StoreProfile } from "~/app/_components/store-profile"
import { auth } from "~/server/auth"
import { ensureOwnedStore } from "~/server/owned-store"
import { api } from "~/trpc/server"

export default async function ProfilePage() {
  const session = await auth()
  if (!session?.user) {
    redirect("/login?callbackUrl=/profile")
  }

  const mine = await ensureOwnedStore(session.user)
  const store = await api.store.bySlug({ slug: mine.slug })
  if (!store) {
    notFound()
  }

  const mixes = await api.mix.mine()

  return (
    <StoreProfile
      store={store}
      mixes={mixes}
      user={session.user}
    />
  )
}
