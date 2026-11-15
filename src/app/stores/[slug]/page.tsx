import { notFound } from "next/navigation"

import { StoreProfile } from "~/app/_components/store-profile"
import { auth } from "~/server/auth"
import { api } from "~/trpc/server"

type StorePageProps = {
  params: Promise<{ slug: string }>
}

export default async function StorePage({ params }: StorePageProps) {
  const { slug } = await params
  const [session, store] = await Promise.all([
    auth(),
    api.store.bySlug({ slug }),
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
