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
  /** Display price, e.g. "$6.50". Required on every mix. */
  price: string
  /** Set when this mix has a detail page. */
  slug?: string
  description?: string
  ingredients?: string[]
  preparation?: string[]
  tags?: string[]
  available?: boolean
  /** Set when this is Afterglow's own batch, not a cited recipe. */
  house?: boolean
  source?: string
}

export const recipes: Recipe[] = [
  {
    name: "Black sesame yuzu honey",
    kind: "Ice cream",
    slug: "black-sesame-yuzu-honey",
    price: "$6.50",
    image:
      "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?auto=format&fit=crop&w=600&q=80",
    description:
      "Toasted black sesame ice cream with pockets of bright yuzu honey. Savory, sweet, and a little sour in the same scoop.",
    ingredients: [
      "Black sesame seeds",
      "Sweet cream",
      "Organic cane sugar",
      "Yuzu juice",
      "Local honey",
    ],
    preparation: [
      "Toast the sesame seeds in a pan, then grind them fine.",
      "Steep the ground sesame in a sweet cream and cane sugar base.",
      "Churn the cream, then swirl the yuzu honey through at the end.",
    ],
    tags: ["Ice cream", "Sesame", "Yuzu", "Honey"],
    available: true,
    source: "https://www.frozbroz.com/2014/04/03/black-sesame-w-yuzu-honey/",
  },
  {
    name: "Kurogoma",
    kind: "Smoothie",
    price: "$7.00",
    image:
      "https://images.unsplash.com/photo-1505252585461-04db1eb84625?auto=format&fit=crop&w=600&q=80",
    source: "http://www.tadaimatte.com/2012/09/kurogoma-smoothie.html",
  },
  {
    name: "Hojicha black sesame",
    kind: "Smoothie",
    price: "$7.50",
    image:
      "https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=600&q=80",
    source:
      "https://reneevoltaire.se/en/blogs/cook/hojichasmoothie-med-svarta-sesamfron",
  },
  {
    name: "Hojicha kuromitsu",
    kind: "Ice cream",
    price: "$6.50",
    image:
      "https://images.unsplash.com/photo-1488900128323-21503983a07e?auto=format&fit=crop&w=600&q=80",
    source:
      "https://gigazine.net/gsc_news/en/20240827-haagen-dazs-greencraft-houjicha-kuromitsu/",
  },
  {
    name: "Hojicha cayenne",
    kind: "Smoothie",
    price: "$7.50",
    image:
      "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=600&q=80",
    source: "https://www.yutea.com/blogs/recipes/hojicha-smoothie",
  },
  {
    name: "Afterglow malt",
    kind: "Ice cream",
    price: "$6.00",
    house: true,
    image:
      "https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Night yuzu float",
    kind: "Ice cream",
    price: "$8.00",
    house: true,
    image:
      "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Pink pepper cold brew",
    kind: "Coffee",
    price: "$5.50",
    house: true,
    image:
      "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Sesame cold foam",
    kind: "Coffee",
    price: "$5.50",
    house: true,
    image:
      "https://images.unsplash.com/photo-1501443762994-82bd5dace89a?auto=format&fit=crop&w=600&q=80",
  },
]

export function getRecipeBySlug(slug: string) {
  return recipes.find((recipe) => recipe.slug === slug)
}
