export const shop = {
  name: "Afterglow",
  handle: "@afterglow.scoop",
  followers: "1.2k",
  following: 86,
}

export const highlights = ["New", "Hojicha", "Yuzu", "Sesame", "House"] as const

export type Recipe = {
  name: string
  kind: string
  image: string
  /** Set when this is Afterglow's own batch, not a cited recipe. */
  house?: boolean
  source?: string
}

export const recipes: Recipe[] = [
  {
    name: "Black sesame yuzu honey",
    kind: "Ice cream",
    image:
      "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?auto=format&fit=crop&w=600&q=80",
    source: "https://www.frozbroz.com/2014/04/03/black-sesame-w-yuzu-honey/",
  },
  {
    name: "Kurogoma",
    kind: "Smoothie",
    image:
      "https://images.unsplash.com/photo-1505252585461-04db1eb84625?auto=format&fit=crop&w=600&q=80",
    source: "http://www.tadaimatte.com/2012/09/kurogoma-smoothie.html",
  },
  {
    name: "Hojicha black sesame",
    kind: "Smoothie",
    image:
      "https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=600&q=80",
    source:
      "https://reneevoltaire.se/en/blogs/cook/hojichasmoothie-med-svarta-sesamfron",
  },
  {
    name: "Hojicha kuromitsu",
    kind: "Ice cream",
    image:
      "https://images.unsplash.com/photo-1488900128323-21503983a07e?auto=format&fit=crop&w=600&q=80",
    source:
      "https://gigazine.net/gsc_news/en/20240827-haagen-dazs-greencraft-houjicha-kuromitsu/",
  },
  {
    name: "Hojicha cayenne",
    kind: "Smoothie",
    image:
      "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=600&q=80",
    source: "https://www.yutea.com/blogs/recipes/hojicha-smoothie",
  },
  {
    name: "Afterglow malt",
    kind: "Ice cream",
    house: true,
    image:
      "https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Night yuzu float",
    kind: "Ice cream",
    house: true,
    image:
      "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Pink pepper cold brew",
    kind: "Coffee",
    house: true,
    image:
      "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Sesame cold foam",
    kind: "Coffee",
    house: true,
    image:
      "https://images.unsplash.com/photo-1501443762994-82bd5dace89a?auto=format&fit=crop&w=600&q=80",
  },
]
