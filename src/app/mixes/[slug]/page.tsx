import { notFound } from "next/navigation"

import { MixDetail } from "~/app/_components/mix-detail"
import { canManageMix } from "~/server/auth/guard"
import { api } from "~/trpc/server"

type MixPageProps = {
  params: Promise<{ slug: string }>
}

export default async function MixPage({ params }: MixPageProps) {
  const { slug } = await params
  const mix = await api.mix.bySlug({ slug })

  if (!mix) notFound()

  const canEdit = await canManageMix(mix)

  return <MixDetail mix={mix} canEdit={canEdit} />
}
