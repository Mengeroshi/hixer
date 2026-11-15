import { notFound } from "next/navigation"

import { StoreProfile } from "~/app/_components/store-profile"
import { auth } from "~/server/auth"
import { api } from "~/trpc/server"

export default async function Home() {
  const [store, session] = await Promise.all([
    api.store.bySlug({ slug: "afterglow" }),
    auth(),
  ])

  if (!store) {
    notFound()
  }

  return (
    <StoreProfile
      store={store}
      mixes={store.mixes}
      user={session?.user ?? null}
    />
  )
}
