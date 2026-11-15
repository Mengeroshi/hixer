import { notFound } from "next/navigation"

import { StoreCart } from "~/app/_components/store-cart"
import { api } from "~/trpc/server"

type StoreCartPageProps = {
  params: Promise<{ slug: string }>
}

export default async function StoreCartPage({ params }: StoreCartPageProps) {
  const { slug } = await params
  const store = await api.store.bySlug({ slug })

  if (!store) {
    notFound()
  }

  return (
    <StoreCart
      storeSlug={store.slug}
      storeName={store.name}
      storeHandle={store.handle}
    />
  )
}
