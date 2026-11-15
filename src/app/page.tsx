import { redirect } from "next/navigation"

import { HomeFeed } from "~/app/_components/home-feed"
import { auth } from "~/server/auth"
import { api } from "~/trpc/server"

export default async function Home() {
  const session = await auth()
  if (session?.user?.isStore) {
    redirect("/profile")
  }

  const mixes = await api.mix.feed()

  return <HomeFeed mixes={mixes} />
}
