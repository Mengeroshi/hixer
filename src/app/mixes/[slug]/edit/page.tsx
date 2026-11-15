import { notFound } from "next/navigation"

import { MixEdit } from "~/app/_components/mix-edit"
import { requireStoreOwner } from "~/server/auth/guard"
import { api } from "~/trpc/server"

type MixEditPageProps = {
  params: Promise<{ slug: string }>
}

export default async function MixEditPage({ params }: MixEditPageProps) {
  const { slug } = await params
  const { store } = await requireStoreOwner(`/mixes/${slug}/edit`)
  const mix = await api.mix.bySlug({ slug })

  if (!mix || mix.storeId !== store.id) {
    notFound()
  }

  return <MixEdit mix={mix} />
}
