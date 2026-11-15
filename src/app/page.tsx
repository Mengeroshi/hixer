import { StoreProfile } from "~/app/_components/store-profile"
import { auth } from "~/server/auth"
import { api } from "~/trpc/server"

export default async function Home() {
  const [mixes, session] = await Promise.all([api.mix.list(), auth()])
  return <StoreProfile mixes={mixes} user={session?.user ?? null} />
}
