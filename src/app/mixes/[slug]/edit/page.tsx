import { notFound } from "next/navigation"

import { MixEdit } from "~/app/_components/mix-edit"
import { api } from "~/trpc/server"

type MixEditPageProps = {
  params: Promise<{ slug: string }>
}

export default async function MixEditPage({ params }: MixEditPageProps) {
  const { slug } = await params
  const mix = await api.mix.bySlug({ slug })

  if (!mix) notFound()

  return <MixEdit mix={mix} />
}
