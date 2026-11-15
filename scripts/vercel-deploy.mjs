import { readFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { spawn } from "node:child_process"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")

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
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1)
      }
      process.env[key] = value
    }
  } catch {
    // optional file
  }
}

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: root,
      stdio: "inherit",
      env: process.env,
    })
    child.on("error", reject)
    child.on("exit", (code) => {
      if (code === 0) resolve()
      else reject(new Error(`${command} ${args.join(" ")} failed (${code})`))
    })
  })
}

function runCapture(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: root,
      stdio: ["ignore", "pipe", "pipe"],
      env: process.env,
    })
    let stdout = ""
    let stderr = ""
    child.stdout.on("data", (chunk) => {
      stdout += chunk
      process.stdout.write(chunk)
    })
    child.stderr.on("data", (chunk) => {
      stderr += chunk
      process.stderr.write(chunk)
    })
    child.on("error", reject)
    child.on("exit", (code) => {
      if (code === 0) resolve({ stdout, stderr })
      else reject(new Error(`${command} ${args.join(" ")} failed (${code})`))
    })
  })
}

async function addEnv(key, value, targets) {
  await run("npx", [
    "vercel",
    "env",
    "add",
    key,
    "--environment",
    targets.join(","),
    "--value",
    value,
    "--force",
    "--yes",
    "--sensitive",
  ])
}

// Local secrets first, then Neon/Vercel pulled vars overwrite DATABASE_URL.
await loadEnvFile(".env")
await loadEnvFile(".env.local")

process.env.AUTH_TRUST_HOST = "true"

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

if (!/^postgres(ql)?:\/\//i.test(process.env.DATABASE_URL ?? "")) {
  console.error(
    "DATABASE_URL must be PostgreSQL (from Neon). Run: npx vercel env pull .env.local",
  )
  process.exit(1)
}

console.log("Syncing app secrets to Vercel…")
const secrets = {
  AUTH_SECRET: process.env.AUTH_SECRET,
  PEY_API_KEY: process.env.PEY_API_KEY,
  UPLOADTHING_TOKEN: process.env.UPLOADTHING_TOKEN,
  AUTH_TRUST_HOST: "true",
}
if (process.env.PEY_BANK_ACCOUNT_ID) {
  secrets.PEY_BANK_ACCOUNT_ID = process.env.PEY_BANK_ACCOUNT_ID
}

for (const [key, value] of Object.entries(secrets)) {
  await addEnv(key, value, ["production", "preview", "development"])
}

console.log("Pushing schema + seeding Neon…")
await run("pnpm", ["exec", "prisma", "generate"])
await run("pnpm", ["exec", "prisma", "db", "push"])
await run("pnpm", ["exec", "prisma", "db", "seed"])

console.log("Deploying production…")
const deploy = await runCapture("npx", [
  "vercel",
  "deploy",
  "--prod",
  "--yes",
  "--logs",
])

const urls = [
  ...deploy.stdout.matchAll(/https:\/\/[a-z0-9.-]+\.vercel\.app/gi),
].map((match) => match[0])
const productionUrl =
  urls.find((url) => url.includes("hixer") && !url.includes("-git-")) ??
  urls[urls.length - 1]

if (productionUrl) {
  const authUrl = productionUrl.replace(/\/$/, "")
  console.log(`Setting AUTH_URL=${authUrl}`)
  await addEnv("AUTH_URL", authUrl, ["production", "preview"])
  console.log("Redeploying with AUTH_URL…")
  await run("npx", ["vercel", "deploy", "--prod", "--yes", "--logs"])
  console.log(`\nLive: ${authUrl}`)
} else {
  console.log("Deploy finished; set AUTH_URL to your production domain and redeploy.")
}
