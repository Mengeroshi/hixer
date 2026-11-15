import { MixCreate } from "~/app/_components/mix-edit"
import { requireStoreOwner } from "~/server/auth/guard"

export default async function NewMixPage() {
  await requireStoreOwner("/mixes/new")
  return <MixCreate />
}
