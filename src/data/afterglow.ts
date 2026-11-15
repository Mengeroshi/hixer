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
      "https://n1p5950t7g.ufs.sh/f/36t4cSJfbUkVtgyN2fjhPC1jWT5JZxHasNlGuXi0cI27rnYM",
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
      "https://n1p5950t7g.ufs.sh/f/36t4cSJfbUkVghxNua1vtm53EkAsJ9p7ZTexMcWzihDfCOQ4",
    source: "http://www.tadaimatte.com/2012/09/kurogoma-smoothie.html",
  },
  {
    name: "Hojicha black sesame",
    kind: "Smoothie",
    price: "$7.50",
    image:
      "https://n1p5950t7g.ufs.sh/f/36t4cSJfbUkVN83SQ5BHIE1UGt6vXVouYQjscyk0znMhgqLD",
    source:
      "https://reneevoltaire.se/en/blogs/cook/hojichasmoothie-med-svarta-sesamfron",
  },
  {
    name: "Hojicha kuromitsu",
    kind: "Ice cream",
    price: "$6.50",
    image:
      "https://n1p5950t7g.ufs.sh/f/36t4cSJfbUkV4ofm3uGN97C6bd510slMQyJ2zxEOPFfWckDm",
    source:
      "https://gigazine.net/gsc_news/en/20240827-haagen-dazs-greencraft-houjicha-kuromitsu/",
  },
  {
    name: "Hojicha cayenne",
    kind: "Smoothie",
    price: "$7.50",
    image:
      "https://n1p5950t7g.ufs.sh/f/36t4cSJfbUkVIccKTDvOPHphkWnQsTc5vMaerGgBzlwtjKq8",
    source: "https://www.yutea.com/blogs/recipes/hojicha-smoothie",
  },
  {
    name: "Afterglow malt",
    kind: "Ice cream",
    price: "$6.00",
    house: true,
    image:
      "https://n1p5950t7g.ufs.sh/f/36t4cSJfbUkVvNFNcVxhRAXQtbra1qf9Ipc4NUJoOsdlV7m3",
  },
  {
    name: "Night yuzu float",
    kind: "Ice cream",
    price: "$8.00",
    house: true,
    image:
      "https://n1p5950t7g.ufs.sh/f/36t4cSJfbUkVFWUplU93LwOMtnY0bdrBzSmP7UIGpajHqxh6",
  },
  {
    name: "Pink pepper cold brew",
    kind: "Coffee",
    price: "$5.50",
    house: true,
    image:
      "https://n1p5950t7g.ufs.sh/f/36t4cSJfbUkVHcckDajo8pNMQySsK73wGkPZX1O4r6FcHjmU",
  },
  {
    name: "Sesame cold foam",
    kind: "Coffee",
    price: "$5.50",
    house: true,
    image:
      "https://n1p5950t7g.ufs.sh/f/36t4cSJfbUkVSBEq1T0eiQ4VhvbBL7Rq12ty5JA8OUMkWmKT",
  },
]
