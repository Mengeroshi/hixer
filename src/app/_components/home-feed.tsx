import { AppBottomNav } from "~/app/_components/app-bottom-nav"
import { FeedPost } from "~/app/_components/feed-post"

export type FeedMix = {
  slug: string
  name: string
  kind: string
  price: string
  image: string
  description: string
  available: boolean
  store: {
    slug: string
    name: string
    handle: string
  }
}

export function HomeFeed({ mixes }: { mixes: FeedMix[] }) {
  return (
    <div className="min-h-dvh bg-neutral-200 text-foreground">
      <div className="relative mx-auto flex h-dvh w-full max-w-[430px] flex-col bg-background">
        <div className="flex-1 overflow-y-auto pb-28">
          <header className="sticky top-0 z-10 border-b-2 border-border bg-background/95 px-4 py-4 backdrop-blur-sm">
            <h1 className="text-center text-xl font-heading tracking-tight">
              Hixy
            </h1>
          </header>

          {mixes.length === 0 ? (
            <div className="mx-4 mt-6 rounded-2xl border-2 border-border bg-surface-5 p-6 text-center shadow-shadow">
              <p className="font-heading">No mixes yet</p>
              <p className="mt-2 text-sm text-foreground/70">
                When stores upload products, they show up here.
              </p>
            </div>
          ) : (
            <ul className="divide-y-2 divide-border">
              {mixes.map((mix) => (
                <FeedPost key={mix.slug} mix={mix} />
              ))}
            </ul>
          )}
        </div>

        <div className="relative z-30 mx-4 mb-4">
          <AppBottomNav />
        </div>
      </div>
    </div>
  )
}
