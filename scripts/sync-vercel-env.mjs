import { readFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { spawn } from "node:child_process"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const vercelBin = path.join(root, "node_modules", ".bin", "vercel")

async function loadEnvFile(fileName) {
  try {
    const raw = await readFile(path.join(root, fileName), "utf8")
    for (const line of raw.split("\n")) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith("#")) continue
      const eq = trimmed.indexOf("=")
      if (eq < 0) continue
      const key = trimmed.slice(0, eq).trim()
      let value = trimmed.slice(eq + 1).trim()
      if (value.startsWith('"')) {
        const end = value.indexOf('"', 1)
        value = end >= 0 ? value.slice(1, end) : value.slice(1)
      } else if (value.startsWith("'")) {
        const end = value.indexOf("'", 1)
        value = end >= 0 ? value.slice(1, end) : value.slice(1)
      } else {
        const hash = value.indexOf(" #")
        if (hash >= 0) value = value.slice(0, hash).trim()
      }
      process.env[key] = value
    }
    console.log(`Loaded ${fileName}`)
  } catch {
    console.log(`Skipped ${fileName} (missing)`)
  }
}

function run(args) {
  return new Promise((resolve, reject) => {
    const child = spawn(vercelBin, args, {
      cwd: root,
      stdio: "inherit",
      env: process.env,
    })
    child.on("error", reject)
    child.on("exit", (code) =>
      code === 0 ? resolve() : reject(new Error(`vercel ${args[0]} ${args[1] ?? ""} failed`)),
    )
  })
}

// .env then .env.local (Neon URL overrides local sqlite)
await loadEnvFile(".env")
await loadEnvFile(".env.local")

process.env.AUTH_TRUST_HOST ??= "true"
process.env.AUTH_URL ??= "https://hixer.vercel.app"

const keys = [
  "AUTH_SECRET",
  "AUTH_TRUST_HOST",
  "AUTH_URL",
  "DATABASE_URL",
  "PEY_API_KEY",
  "PEY_BANK_ACCOUNT_ID",
  "UPLOADTHING_TOKEN",
]

const optional = new Set(["PEY_BANK_ACCOUNT_ID"])
const missing = []
const synced = []

for (const key of keys) {
  const value = process.env[key]
  if (!value) {
    if (optional.has(key)) continue
    missing.push(key)
    continue
  }
  if (key === "DATABASE_URL" && value.startsWith("file:")) {
    console.error("DATABASE_URL is still sqlite. Put Neon URL in .env.local and retry.")
    process.exit(1)
  }
  console.log(`Syncing ${key}…`)
  await run([
    "env",
    "add",
    key,
    "--environment",
    "production,preview,development",
    "--value",
    value,
    "--force",
    "--yes",
    "--sensitive",
  ])
  synced.push(key)
}

if (missing.length) {
  console.error(`Missing keys: ${missing.join(", ")}`)
  process.exit(1)
}

console.log(`Synced: ${synced.join(", ")}`)
console.log("Redeploying production…")
await run(["deploy", "--prod", "--yes"])
console.log("Done. Live: https://hixer.vercel.app")
