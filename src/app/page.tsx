import { StoreProfile } from "~/app/_components/store-profile"
import { api } from "~/trpc/server"

export default async function Home() {
  const mixes = await api.mix.list()
  return <StoreProfile mixes={mixes} />
}
