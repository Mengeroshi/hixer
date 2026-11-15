import type { Prisma, PrismaClient } from "../../generated/prisma"

export type OrderCartItem = {
  slug: string
  name: string
  price: string
  quantity: number
}

export type PeyTransactionSnapshot = {
  id: string
  status?: string
  amount?: number
  amountBreakdown?: {
    base?: number
    tip?: number
    fee?: number
  }
  currency?: string
  paymentMethod?: string
  payableType?: string
  payableId?: string
  description?: string
  datePaid?: number
  dateCreated?: number
  metadata?: Record<string, unknown> | null
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null
  }
  return value as Record<string, unknown>
}

export function parsePeyTransaction(raw: unknown): PeyTransactionSnapshot | null {
  const top = asRecord(raw)
  const nested = asRecord(top?.data)
  const record =
    top && typeof top.id === "string" && top.id
      ? top
      : nested && typeof nested.id === "string" && nested.id
        ? nested
        : null
  if (!record || typeof record.id !== "string") {
    return null
  }
  const id = record.id

  const breakdown = asRecord(record.amountBreakdown)
  const metadata = asRecord(record.metadata)

  return {
    id,
    status: typeof record.status === "string" ? record.status : undefined,
    amount: typeof record.amount === "number" ? record.amount : undefined,
    amountBreakdown: breakdown
      ? {
          base: typeof breakdown.base === "number" ? breakdown.base : undefined,
          tip: typeof breakdown.tip === "number" ? breakdown.tip : undefined,
          fee: typeof breakdown.fee === "number" ? breakdown.fee : undefined,
        }
      : undefined,
    currency: typeof record.currency === "string" ? record.currency : undefined,
    paymentMethod:
      typeof record.paymentMethod === "string"
        ? record.paymentMethod
        : undefined,
    payableType:
      typeof record.payableType === "string" ? record.payableType : undefined,
    payableId:
      typeof record.payableId === "string" ? record.payableId : undefined,
    description:
      typeof record.description === "string" ? record.description : undefined,
    datePaid: typeof record.datePaid === "number" ? record.datePaid : undefined,
    dateCreated:
      typeof record.dateCreated === "number" ? record.dateCreated : undefined,
    metadata,
  }
}

function fromUnix(seconds?: number) {
  if (!seconds) {
    return null
  }
  return new Date(seconds * 1000)
}

function trackingKeyFromMetadata(metadata: Record<string, unknown> | null | undefined) {
  if (!metadata) {
    return null
  }
  return typeof metadata.trackingKey === "string" ? metadata.trackingKey : null
}

type Db = PrismaClient

export type OrderStoreSnapshot = {
  id: string
  slug: string
  name: string
  handle: string
}

export async function createPendingOrder(
  db: Db,
  input: {
    userId: string
    store: OrderStoreSnapshot
    amount: number
    currency?: string
    numRef: string
    description: string
    items: OrderCartItem[]
    payableType?: string
    payableId?: string
    peyTransactionId?: string
    status?: string
  },
) {
  return db.order.create({
    data: {
      userId: input.userId,
      storeId: input.store.id,
      storeSlug: input.store.slug,
      storeName: input.store.name,
      storeHandle: input.store.handle,
      amount: input.amount,
      amountBase: input.amount,
      currency: input.currency ?? "MXN",
      numRef: input.numRef,
      description: input.description,
      items: input.items,
      payableType: input.payableType,
      payableId: input.payableId,
      peyTransactionId: input.peyTransactionId,
      status: input.status ?? "PENDING",
    },
  })
}

export async function upsertOrderFromPeyTransaction(
  db: Db,
  input: {
    userId: string
    store: OrderStoreSnapshot
    transaction: PeyTransactionSnapshot
    raw: unknown
    items?: OrderCartItem[]
    numRef?: string | null
  },
) {
  const trackingKey = trackingKeyFromMetadata(input.transaction.metadata)
  const amount =
    input.transaction.amount ??
    input.transaction.amountBreakdown?.base ??
    0
  const status = input.transaction.status ?? "PENDING"
  const paidAt = fromUnix(input.transaction.datePaid)
  const peyCreatedAt = fromUnix(input.transaction.dateCreated)

  const existing = await db.order.findUnique({
    where: { peyTransactionId: input.transaction.id },
  })

  const storeFields = {
    storeId: input.store.id,
    storeSlug: input.store.slug,
    storeName: input.store.name,
    storeHandle: input.store.handle,
  }

  const metadata =
    input.transaction.metadata == null
      ? undefined
      : (input.transaction.metadata as Prisma.InputJsonValue)
  const raw = input.raw as Prisma.InputJsonValue
  const items = (input.items ?? []) as Prisma.InputJsonValue

  const data = {
    ...storeFields,
    status,
    amount,
    amountBase: input.transaction.amountBreakdown?.base ?? amount,
    amountTip: input.transaction.amountBreakdown?.tip ?? null,
    amountFee: input.transaction.amountBreakdown?.fee ?? null,
    currency: input.transaction.currency ?? "MXN",
    paymentMethod: input.transaction.paymentMethod ?? null,
    payableType: input.transaction.payableType ?? null,
    payableId: input.transaction.payableId ?? null,
    description: input.transaction.description ?? "",
    trackingKey,
    numRef: input.numRef ?? existing?.numRef ?? null,
    metadata,
    raw,
    paidAt,
    peyCreatedAt,
    ...(input.items
      ? { items }
      : existing
        ? {}
        : { items }),
  }

  if (existing) {
    return db.order.update({
      where: { id: existing.id },
      data,
    })
  }

  const matchers: Prisma.OrderWhereInput[] = []
  if (input.numRef) {
    matchers.push({ numRef: input.numRef })
  }
  if (input.transaction.payableId) {
    matchers.push({ payableId: input.transaction.payableId })
  }

  const pending =
    matchers.length > 0
      ? await db.order.findFirst({
          where: {
            userId: input.userId,
            storeId: input.store.id,
            peyTransactionId: null,
            status: "PENDING",
            OR: matchers,
          },
          orderBy: { createdAt: "desc" },
        })
      : null

  if (pending) {
    return db.order.update({
      where: { id: pending.id },
      data: {
        ...data,
        peyTransactionId: input.transaction.id,
        items: (input.items ??
          pending.items) as Prisma.InputJsonValue,
      },
    })
  }

  return db.order.create({
    data: {
      userId: input.userId,
      peyTransactionId: input.transaction.id,
      ...data,
      items,
    },
  })
}
