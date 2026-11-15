"use client"

import Link from "next/link"
import { useActionState, useState } from "react"

import { Button } from "~/components/ui/button"
import {
  type AuthActionState,
  registerWithEmail,
  signInWithEmail,
} from "~/server/auth/actions"

const initialState: AuthActionState = {}

export function LoginForm({
  authError,
  callbackUrl = "/",
}: {
  authError?: string
  callbackUrl?: string
}) {
  const [mode, setMode] = useState<"signin" | "signup">("signin")
  const [isStore, setIsStore] = useState(false)
  const action = mode === "signin" ? signInWithEmail : registerWithEmail
  const [state, formAction, pending] = useActionState(action, initialState)
  const error = state.error ?? authError

  return (
    <div className="flex flex-1 flex-col gap-5">
      <form action={formAction} className="flex flex-col gap-3">
        <input type="hidden" name="callbackUrl" value={callbackUrl} />
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-heading">Email</span>
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            className="h-12 rounded-xl border-2 border-border bg-surface-5 px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-black"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-heading">Password</span>
          <input
            name="password"
            type="password"
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            required
            minLength={8}
            className="h-12 rounded-xl border-2 border-border bg-surface-5 px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-black"
          />
        </label>

        {mode === "signup" ? (
          <label className="flex items-center justify-between gap-3 py-1">
            <span className="text-sm font-heading">I&apos;m a store</span>
            <input type="hidden" name="isStore" value={isStore ? "on" : "off"} />
            <button
              type="button"
              role="switch"
              aria-checked={isStore}
              aria-label="I'm a store"
              onClick={() => setIsStore((current) => !current)}
              className={`relative h-8 w-14 shrink-0 rounded-full border-2 border-border shadow-shadow ${
                isStore ? "bg-surface-2" : "bg-background"
              }`}
            >
              <span
                aria-hidden
                className={`absolute top-0.5 left-0.5 size-6 rounded-full border-2 border-border bg-background transition-transform ${
                  isStore ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </label>
        ) : null}

        {error ? (
          <p className="rounded-xl border-2 border-border bg-main px-3 py-2 text-sm">
            {error}
          </p>
        ) : null}

        <Button
          type="submit"
          disabled={pending}
          className="mt-1 h-12 w-full rounded-xl"
        >
          {pending
            ? "Working…"
            : mode === "signin"
              ? "Sign in"
              : "Create account"}
        </Button>
      </form>

      <p className="text-center text-sm">
        {mode === "signin" ? (
          <>
            No account yet?{" "}
            <button
              type="button"
              className="font-heading underline underline-offset-2"
              onClick={() => setMode("signup")}
            >
              Create one
            </button>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <button
              type="button"
              className="font-heading underline underline-offset-2"
              onClick={() => setMode("signin")}
            >
              Sign in
            </button>
          </>
        )}
      </p>

      <p className="text-center text-sm">
        <Link href="/" className="font-heading underline underline-offset-2">
          Back to Hixy
        </Link>
      </p>
    </div>
  )
}
