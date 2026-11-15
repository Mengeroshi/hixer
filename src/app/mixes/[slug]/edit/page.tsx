import { CreatedMixEdit, MixEdit } from "~/app/_components/mix-edit"
import { getRecipeBySlug } from "~/data/afterglow"

type MixEditPageProps = {
  params: Promise<{ slug: string }>
}

export default async function MixEditPage({ params }: MixEditPageProps) {
  const { slug } = await params
  const recipe = getRecipeBySlug(slug)

  if (
    !recipe?.slug ||
    !recipe.description ||
    !recipe.ingredients ||
    recipe.available === undefined
  ) {
    return <CreatedMixEdit slug={slug} />
  }

  return (
    <MixEdit
      recipe={{
        ...recipe,
        slug: recipe.slug,
        description: recipe.description,
        ingredients: recipe.ingredients,
        available: recipe.available,
      }}
    />
  )
}
