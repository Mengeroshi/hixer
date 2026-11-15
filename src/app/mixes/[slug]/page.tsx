import { notFound } from "next/navigation"

import { MixDetail } from "~/app/_components/mix-detail"
import { getRecipeBySlug } from "~/data/afterglow"

type MixPageProps = {
  params: Promise<{ slug: string }>
}

export default async function MixPage({ params }: MixPageProps) {
  const { slug } = await params
  const recipe = getRecipeBySlug(slug)

  if (
    !recipe?.description ||
    !recipe.ingredients ||
    recipe.available === undefined
  ) {
    notFound()
  }

  return (
    <MixDetail
      recipe={{
        ...recipe,
        description: recipe.description,
        ingredients: recipe.ingredients,
        available: recipe.available,
      }}
    />
  )
}
