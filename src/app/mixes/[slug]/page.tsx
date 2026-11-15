import { notFound } from "next/navigation"

import { MixDetail } from "~/app/_components/mix-detail"
import { auth } from "~/server/auth"
import { api } from "~/trpc/server"

type MixPageProps = {
  params: Promise<{ slug: string }>
}

export default async function MixPage({ params }: MixPageProps) {
  const { slug } = await params
  const [mix, session] = await Promise.all([
    api.mix.bySlug({ slug }),
    auth(),
  ])

  if (!mix) notFound()

  const canEdit = Boolean(
    session?.user?.id && mix.authorId === session.user.id,
  )

  return <MixDetail mix={mix} canEdit={canEdit} />
}
