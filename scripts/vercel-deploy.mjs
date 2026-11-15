import { readFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { spawn } from "node:child_process"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")

async function loadEnv() {
  const raw = await readFile(path.join(root, ".env"), "utf8")
  for (const line of raw.split("\n")) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue
    const eq = trimmed.indexOf("=")
    if (eq < 0) continue
    const key = trimmed.slice(0, eq).trim()
    let value = trimmed.slice(eq + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    if (!(key in process.env)) process.env[key] = value
  }
}

await loadEnv()

const required = [
  "AUTH_SECRET",
  "DATABASE_URL",
  "PEY_API_KEY",
  "UPLOADTHING_TOKEN",
]
const missing = required.filter((key) => !process.env[key])
if (missing.length) {
  console.error(`Missing env: ${missing.join(", ")}`)
  process.exit(1)
}

const envPairs = [
  "AUTH_SECRET",
  "DATABASE_URL",
  "PEY_API_KEY",
  "PEY_BANK_ACCOUNT_ID",
  "UPLOADTHING_TOKEN",
  "AUTH_URL",
  "AUTH_TRUST_HOST",
].flatMap((key) => {
  const value = process.env[key]
  if (!value) return []
  return ["--env", `${key}=${value}`, "--build-env", `${key}=${value}`]
})

const args = [
  "--yes",
  "vercel",
  "deploy",
  "--temporary",
  "--yes",
  "--logs",
  ...envPairs,
]

console.log("Deploying temporary Vercel project…")
const child = spawn("npx", args, {
  cwd: root,
  stdio: "inherit",
  env: process.env,
})

child.on("exit", (code) => process.exit(code ?? 1))
