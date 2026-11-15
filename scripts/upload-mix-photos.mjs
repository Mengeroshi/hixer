import { readFile, readdir, writeFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { UTApi, UTFile } from "uploadthing/server"

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
    if (!(key in process.env)) {
      process.env[key] = value
    }
  }
}

await loadEnv()

const argToken = process.argv
  .find((arg) => arg.startsWith("--token="))
  ?.slice("--token=".length)

const token =
  argToken ||
  process.env.UPLOADTHING_TOKEN ||
  process.env.UPLOADTHING_SECRET ||
  process.env.UPLOADTHING_API_KEY
if (!token) {
  console.error(
    "Missing UploadThing token. Set UPLOADTHING_TOKEN in .env or pass --token=...",
  )
  process.exit(1)
}

const utapi = new UTApi({ token })
const mixesDir = path.join(root, "public/mixes")
const mapping = {}

const localFiles = (await readdir(mixesDir)).filter((name) =>
  /\.(jpe?g|png|webp|gif)$/i.test(name),
)

console.log(`Uploading ${localFiles.length} local mix photos…`)
for (const name of localFiles) {
  const bytes = await readFile(path.join(mixesDir, name))
  const file = new UTFile([bytes], name, {
    type: "image/jpeg",
    customId: `mix-${path.parse(name).name}`,
  })
  const result = await utapi.uploadFiles(file)
  if (result.error || !result.data) {
    throw new Error(
      `Failed ${name}: ${result.error?.message ?? "unknown error"}`,
    )
  }
  const url = result.data.ufsUrl ?? result.data.url
  mapping[`/mixes/${name}`] = url
  console.log(`✓ ${name} → ${url}`)
}

const remote = [
  {
    slug: "black-sesame-yuzu-honey",
    url: "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?auto=format&fit=crop&w=600&q=80",
  },
  {
    slug: "kurogoma",
    url: "https://images.unsplash.com/photo-1505252585461-04db1eb84625?auto=format&fit=crop&w=600&q=80",
  },
  {
    slug: "hojicha-black-sesame",
    url: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=600&q=80",
  },
  {
    slug: "hojicha-kuromitsu",
    url: "https://images.unsplash.com/photo-1488900128323-21503983a07e?auto=format&fit=crop&w=600&q=80",
  },
  {
    slug: "hojicha-cayenne",
    url: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=600&q=80",
  },
  {
    slug: "afterglow-malt",
    url: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=600&q=80",
  },
  {
    slug: "night-yuzu-float",
    url: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80",
  },
  {
    slug: "pink-pepper-cold-brew",
    url: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=600&q=80",
  },
  {
    slug: "sesame-cold-foam",
    url: "https://images.unsplash.com/photo-1501443762994-82bd5dace89a?auto=format&fit=crop&w=600&q=80",
  },
]

console.log(`Uploading ${remote.length} remote mix photos…`)
for (const entry of remote) {
  const result = await utapi.uploadFilesFromUrl({
    url: entry.url,
    name: `${entry.slug}.jpg`,
    customId: `mix-${entry.slug}`,
  })
  if (result.error || !result.data) {
    throw new Error(
      `Failed ${entry.slug}: ${result.error?.message ?? "unknown error"}`,
    )
  }
  const url = result.data.ufsUrl ?? result.data.url
  mapping[entry.url] = url
  mapping[`slug:${entry.slug}`] = url
  console.log(`✓ ${entry.slug} → ${url}`)
}

const outPath = path.join(root, "scripts/mix-photo-urls.json")
await writeFile(outPath, JSON.stringify(mapping, null, 2))
console.log(`Wrote ${outPath}`)
