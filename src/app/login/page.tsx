import { redirect } from "next/navigation"

import { LoginForm } from "~/app/_components/login-form"
import { auth } from "~/server/auth"

const authErrors: Record<string, string> = {
  CredentialsSignin: "Invalid email or password",
  AccessDenied: "Access denied",
  Configuration: "Auth is not configured yet. Set AUTH_SECRET.",
  Default: "Something went wrong while signing in",
}

function safeCallbackUrl(value: string | undefined) {
  if (value?.startsWith("/") && !value.startsWith("//")) {
    return value
  }
  return "/"
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; callbackUrl?: string }>
}) {
  const params = await searchParams
  const callbackUrl = safeCallbackUrl(params.callbackUrl)
  const session = await auth()
  if (session?.user) {
    redirect(callbackUrl)
  }

  const authError = params.error
    ? (authErrors[params.error] ?? authErrors.Default)
    : undefined

  return (
    <div className="min-h-dvh bg-neutral-200 text-foreground">
      <div className="mx-auto flex h-dvh w-full max-w-[430px] flex-col bg-background px-4 pb-6 pt-8">
        <header className="mb-8">
          <h1 className="text-3xl font-heading">Hixy</h1>
          <p className="mt-2 text-sm">
            Sign in to follow stores, save mixes, or run your own shop.
          </p>
        </header>

        <LoginForm authError={authError} callbackUrl={callbackUrl} />
      </div>
    </div>
  )
}
