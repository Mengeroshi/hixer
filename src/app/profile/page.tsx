import { notFound, redirect } from "next/navigation"

import { StoreProfile } from "~/app/_components/store-profile"
import { auth } from "~/server/auth"
import { api } from "~/trpc/server"

export default async function ProfilePage() {
  const session = await auth()
  if (!session?.user) {
    redirect("/login?callbackUrl=/profile")
  }

  const mine = session.user.isStore ? await api.store.mine() : null
  if (!mine) {
    notFound()
  }

  const store = await api.store.bySlug({ slug: mine.slug })
  if (!store) {
    notFound()
  }

  return (
    <StoreProfile
      store={store}
      mixes={store.mixes}
      user={session.user}
    />
  )
}
