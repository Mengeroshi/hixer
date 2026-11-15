import { MixCreate } from "~/app/_components/mix-edit"
import { requireSession } from "~/server/auth/guard"
import { api } from "~/trpc/server"

export default async function NewMixPage() {
  const session = await requireSession("/mixes/new")
  const shops = session.user.isStore ? [] : await api.store.listShops()

  return (
    <MixCreate
      isStore={session.user.isStore}
      shops={shops.map((shop) => ({ slug: shop.slug, name: shop.name }))}
    />
  )
}
