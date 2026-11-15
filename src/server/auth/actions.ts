"use server";

import { hash } from "bcryptjs";
import { AuthError } from "next-auth";
import { z } from "zod";

import { signIn, signOut } from "~/server/auth";
import { db } from "~/server/db";

const emailAuthSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  isStore: z.boolean(),
});

export type AuthActionState = {
  error?: string;
};

function formString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function formValues(formData: FormData) {
  return {
    email: formString(formData, "email"),
    password: formString(formData, "password"),
    isStore: formData.get("isStore") === "on",
  };
}

function safeRedirectTo(formData: FormData) {
  const value = formString(formData, "callbackUrl");
  if (value.startsWith("/") && !value.startsWith("//")) {
    return value;
  }
  return "/profile";
}

export async function registerWithEmail(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = emailAuthSchema.safeParse(formValues(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid details" };
  }

  const email = parsed.data.email.toLowerCase();
  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "An account with this email already exists" };
  }

  const passwordHash = await hash(parsed.data.password, 10);
  await db.user.create({
    data: {
      email,
      passwordHash,
      isStore: parsed.data.isStore,
    },
  });

  const redirectTo = safeRedirectTo(formData);

  try {
    await signIn("credentials", {
      email,
      password: parsed.data.password,
      redirectTo,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Could not sign you in after creating the account" };
    }
    throw error;
  }

  return {};
}

export async function signInWithEmail(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = emailAuthSchema.safeParse(formValues(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid details" };
  }

  const redirectTo = safeRedirectTo(formData);

  try {
    await signIn("credentials", {
      email: parsed.data.email.toLowerCase(),
      password: parsed.data.password,
      redirectTo,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Invalid email or password" };
    }
    throw error;
  }

  return {};
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}
