import { env } from "~/env"

const PEY_API_BASE = "https://api.pey.mx"

type CreateCodiQrInput = {
  amount: number
  concept: string
  numRef: string
  expiration?: number
  bankAccountId?: string
}

type CreateCodiPushInput = {
  amount: number
  phoneNumber: string
  concept: string
  numRef: string
  expiration?: number
  bankAccountId?: string
}

type CreatePaymentLinkInput = {
  amount: number
  successUrl: string
  backUrl: string
  hasTip?: boolean
  clientReferenceId?: string
}

export type CodiQrResult = {
  id: string
  numRef: string
  amount: number
  concept: string
  imageSrc: string | null
  qrString: string | null
  raw: unknown
}

export type CodiPushResult = {
  transactionId: string
  codiId: string
  numRef: string
  amount: number
  concept: string
  phoneNumber: string
  raw: unknown
}

export type PaymentLinkResult = {
  id: string
  url: string
  amount: number
  clientReferenceId: string | null
  raw: unknown
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null
  }
  return value as Record<string, unknown>
}

function pickString(record: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = record[key]
    if (typeof value === "string" && value.trim()) {
      return value
    }
  }
  return null
}

function toImageSrc(raw: string) {
  if (raw.startsWith("data:") || raw.startsWith("http")) {
    return raw
  }
  return `data:image/png;base64,${raw}`
}

function peyErrorMessage(payload: unknown, status: number, fallback: string) {
  const record = asRecord(payload)
  const nested = asRecord(record?.error)
  return (
    pickString(nested ?? {}, ["message"]) ??
    pickString(record ?? {}, ["message", "error", "detail"]) ??
    `${fallback} (${status})`
  )
}

async function peyRequest(
  method: "GET" | "POST",
  path: string,
  body?: Record<string, unknown>,
) {
  const response = await fetch(`${PEY_API_BASE}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${env.PEY_API_KEY}`,
      Accept: "application/json",
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  const payload: unknown = await response.json().catch(() => null)
  return { response, payload }
}

async function peyPost(path: string, body: Record<string, unknown>) {
  return peyRequest("POST", path, body)
}

async function peyGet(path: string) {
  return peyRequest("GET", path)
}

export type PeyLookupResult = {
  raw: unknown
}

export async function getTransaction(id: string): Promise<PeyLookupResult> {
  const trimmed = id.trim()
  if (!trimmed) {
    throw new Error("transaction id is required")
  }

  const { response, payload } = await peyGet(
    `/transaction/${encodeURIComponent(trimmed)}`,
  )

  if (!response.ok) {
    throw new Error(
      peyErrorMessage(payload, response.status, "Pey Get Transaction failed"),
    )
  }

  return { raw: payload }
}

export async function getCodiQrTransactions(
  id: string,
): Promise<PeyLookupResult> {
  const trimmed = id.trim()
  if (!trimmed) {
    throw new Error("CoDi QR id is required")
  }

  const { response, payload } = await peyGet(
    `/transaction/codi/qr/${encodeURIComponent(trimmed)}`,
  )

  if (!response.ok) {
    throw new Error(
      peyErrorMessage(
        payload,
        response.status,
        "Pey Get CoDi QR Transactions failed",
      ),
    )
  }

  return { raw: payload }
}

export async function getPaymentLink(id: string): Promise<PeyLookupResult> {
  const trimmed = id.trim()
  if (!trimmed) {
    throw new Error("payment link id is required")
  }

  const { response, payload } = await peyGet(
    `/payment-link/${encodeURIComponent(trimmed)}`,
  )

  if (!response.ok) {
    throw new Error(
      peyErrorMessage(payload, response.status, "Pey Get Payment Link failed"),
    )
  }

  return { raw: payload }
}

export async function createCodiQr(
  input: CreateCodiQrInput,
): Promise<CodiQrResult> {
  if (!/^[0-9]{1,7}$/.test(input.numRef)) {
    throw new Error("numRef must be 1 to 7 digits")
  }

  const bankAccountId = input.bankAccountId ?? env.PEY_BANK_ACCOUNT_ID
  const expiration = input.expiration ?? 600
  if (expiration !== 0 && expiration < 360) {
    throw new Error("expiration must be 0 or at least 360 seconds")
  }

  const body: Record<string, string | number | boolean> = {
    amount: input.amount,
    concept: input.concept,
    expiration,
    numRef: input.numRef,
    generateImage: true,
  }
  if (bankAccountId) {
    body.bankAccountId = bankAccountId
  }

  const { response, payload } = await peyPost("/codi/qr", body)

  if (!response.ok) {
    throw new Error(peyErrorMessage(payload, response.status, "Pey Create QR failed"))
  }

  const nested = asRecord(asRecord(payload)?.data) ?? asRecord(payload)
  if (!nested) {
    throw new Error("Pey Create QR returned an empty body")
  }

  const qrImage = pickString(nested, ["qrImage", "imageBase64", "image"])
  const qrString = pickString(nested, ["qrString"])
  const id = pickString(nested, ["id", "codiQrId"]) ?? input.numRef

  if (!qrImage && !qrString) {
    throw new Error("Pey Create QR response did not include qrImage or qrString")
  }

  return {
    id,
    numRef: input.numRef,
    amount: input.amount,
    concept: input.concept,
    imageSrc: qrImage ? toImageSrc(qrImage) : null,
    qrString,
    raw: payload,
  }
}

export async function createCodiPush(
  input: CreateCodiPushInput,
): Promise<CodiPushResult> {
  if (!/^[0-9]{10}$/.test(input.phoneNumber)) {
    throw new Error("phoneNumber must be a 10-digit string")
  }
  if (!/^[0-9]{1,7}$/.test(input.numRef)) {
    throw new Error("numRef must be 1 to 7 digits")
  }
  if (!(input.amount > 0)) {
    throw new Error("amount must be greater than 0")
  }

  const bankAccountId = input.bankAccountId ?? env.PEY_BANK_ACCOUNT_ID
  const expiration = input.expiration ?? 360
  if (expiration < 360) {
    throw new Error("expiration must be at least 360 seconds")
  }

  const body: Record<string, string | number> = {
    amount: input.amount,
    phoneNumber: input.phoneNumber,
    concept: input.concept,
    expiration,
    numRef: input.numRef,
  }
  if (bankAccountId) {
    body.bankAccountId = bankAccountId
  }

  const { response, payload } = await peyPost("/codi/pn", body)

  if (!response.ok) {
    throw new Error(
      peyErrorMessage(payload, response.status, "Pey Create Push failed"),
    )
  }

  const nested = asRecord(asRecord(payload)?.data) ?? asRecord(payload)
  if (!nested) {
    throw new Error("Pey Create Push returned an empty body")
  }

  const transactionId = pickString(nested, ["transactionId", "id"])
  const codiId = pickString(nested, ["codiId", "folio"])

  if (!transactionId || !codiId) {
    throw new Error("Pey Create Push response was incomplete")
  }

  return {
    transactionId,
    codiId,
    numRef: input.numRef,
    amount: input.amount,
    concept: input.concept,
    phoneNumber: input.phoneNumber,
    raw: payload,
  }
}

function requireHttpsUrl(value: string, label: string) {
  let url: URL
  try {
    url = new URL(value)
  } catch {
    throw new Error(`${label} must be a valid URL`)
  }
  if (url.protocol === "http:") {
    url.protocol = "https:"
  }
  if (url.protocol !== "https:") {
    throw new Error(`${label} must use HTTPS`)
  }
  return url.toString()
}

export async function createPaymentLink(
  input: CreatePaymentLinkInput,
): Promise<PaymentLinkResult> {
  if (!(input.amount > 0)) {
    throw new Error("amount must be greater than 0")
  }

  const successUrl = requireHttpsUrl(input.successUrl, "successUrl")
  const backUrl = requireHttpsUrl(input.backUrl, "backUrl")

  const body: Record<string, string | number | boolean> = {
    amount: input.amount,
    successUrl,
    backUrl,
    hasTip: input.hasTip ?? false,
  }
  if (input.clientReferenceId) {
    body.clientReferenceId = input.clientReferenceId.slice(0, 255)
  }

  const { response, payload } = await peyPost("/payment-link/create", body)

  if (!response.ok) {
    throw new Error(
      peyErrorMessage(payload, response.status, "Pey Create Payment Link failed"),
    )
  }

  const nested = asRecord(asRecord(payload)?.data) ?? asRecord(payload)
  if (!nested) {
    throw new Error("Pey Create Payment Link returned an empty body")
  }

  const id = pickString(nested, ["id"])
  const url = pickString(nested, ["url"])

  if (!id || !url) {
    throw new Error("Pey Create Payment Link response was incomplete")
  }

  return {
    id,
    url,
    amount: input.amount,
    clientReferenceId: input.clientReferenceId ?? null,
    raw: payload,
  }
}
