import { TRPCError } from "@trpc/server"
import { z } from "zod"

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc"
import {
  createPendingOrder,
  parsePeyTransaction,
  upsertOrderFromPeyTransaction,
  type OrderCartItem,
} from "~/server/orders"
import {
  createCodiPush,
  createCodiQr,
  createPaymentLink,
  getCodiQrTransactions,
  getPaymentLink,
  getTransaction,
} from "~/server/pey"

function absoluteCartUrl(origin: string, storeSlug: string, query?: string) {
  let base: URL
  try {
    base = new URL(origin)
  } catch {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Invalid return origin",
    })
  }
  const path = `/stores/${storeSlug}/cart${query ? `?${query}` : ""}`
  return new URL(path, base).toString()
}

function buildNumRef() {
  const value = Date.now() % 10_000_000
  return String(value).padStart(7, "0").slice(-7)
}

function buildConcept(storeName: string, numRef: string) {
  const concept = `${storeName} ${numRef}`
    .replace(/[^a-zA-Z0-9 .#-]/g, "")
    .slice(0, 40)
  return concept || `Order ${numRef}`
}

async function requirePayoutStore(
  db: {
    store: {
      findUnique: (args: {
        where: { slug: string }
        select: {
          id: true
          slug: true
          name: true
          handle: true
          payoutName: true
          payoutClabe: true
        }
      }) => Promise<{
        id: string
        slug: string
        name: string
        handle: string
        payoutName: string
        payoutClabe: string
      } | null>
    }
  },
  storeSlug: string,
) {
  const store = await db.store.findUnique({
    where: { slug: storeSlug },
    select: {
      id: true,
      slug: true,
      name: true,
      handle: true,
      payoutName: true,
      payoutClabe: true,
    },
  })

  if (!store) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Store not found" })
  }

  if (!store.payoutClabe || !store.payoutName) {
    throw new TRPCError({
      code: "PRECONDITION_FAILED",
      message: "This store has no payout account yet",
    })
  }

  return store
}

const amountSchema = z.number().positive().max(100_000)

const cartItemSchema = z.object({
  slug: z.string().trim().min(1),
  name: z.string().trim().min(1),
  price: z.string().trim().min(1),
  quantity: z.number().int().positive().max(99),
})

/** Convert cart total to Pey MXN (÷100, 2 decimals) at charge time. */
function toPeyAmount(amount: number) {
  return Number((amount / 100).toFixed(2))
}

function numRefFromDescription(description?: string | null) {
  if (!description) {
    return null
  }
  const match = description.match(/(\d{1,7})\s*$/)
  return match?.[1] ?? null
}

export const checkoutRouter = createTRPCRouter({
  createQr: protectedProcedure
    .input(
      z.object({
        storeSlug: z.string().trim().min(1),
        amount: amountSchema,
        items: z.array(cartItemSchema).min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const store = await requirePayoutStore(ctx.db, input.storeSlug)
      const amount = toPeyAmount(input.amount)
      const numRef = buildNumRef()
      const description = buildConcept(store.name, numRef)

      try {
        const qr = await createCodiQr({
          amount,
          concept: description,
          numRef,
        })

        const order = await createPendingOrder(ctx.db, {
          userId: ctx.session.user.id,
          store: {
            id: store.id,
            slug: store.slug,
            name: store.name,
            handle: store.handle,
          },
          amount,
          numRef,
          description,
          items: input.items,
          payableType: "API_CODI_QR",
          payableId: qr.id,
        })

        return {
          ...qr,
          orderId: order.id,
          storeName: store.name,
          payoutName: store.payoutName,
        }
      } catch (error) {
        throw new TRPCError({
          code: "BAD_GATEWAY",
          message:
            error instanceof Error
              ? error.message
              : "Could not create CoDi QR",
        })
      }
    }),

  createPush: protectedProcedure
    .input(
      z.object({
        storeSlug: z.string().trim().min(1),
        amount: amountSchema,
        items: z.array(cartItemSchema).min(1),
        phoneNumber: z
          .string()
          .trim()
          .transform((value) => value.replace(/\D/g, ""))
          .pipe(z.string().regex(/^[0-9]{10}$/, "Enter a 10-digit phone number")),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const store = await requirePayoutStore(ctx.db, input.storeSlug)
      const amount = toPeyAmount(input.amount)
      const numRef = buildNumRef()
      const description = buildConcept(store.name, numRef)

      try {
        const push = await createCodiPush({
          amount,
          phoneNumber: input.phoneNumber,
          concept: description,
          numRef,
        })

        const order = await createPendingOrder(ctx.db, {
          userId: ctx.session.user.id,
          store: {
            id: store.id,
            slug: store.slug,
            name: store.name,
            handle: store.handle,
          },
          amount,
          numRef,
          description,
          items: input.items,
          payableType: "API_CODI_PN",
          peyTransactionId: push.transactionId,
          status: "PENDING",
        })

        return {
          ...push,
          orderId: order.id,
          storeName: store.name,
          payoutName: store.payoutName,
        }
      } catch (error) {
        throw new TRPCError({
          code: "BAD_GATEWAY",
          message:
            error instanceof Error
              ? error.message
              : "Could not send CoDi push",
        })
      }
    }),

  createPaymentLink: protectedProcedure
    .input(
      z.object({
        storeSlug: z.string().trim().min(1),
        amount: amountSchema,
        items: z.array(cartItemSchema).min(1),
        origin: z.string().url(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const store = await requirePayoutStore(ctx.db, input.storeSlug)
      const amount = toPeyAmount(input.amount)
      const numRef = buildNumRef()
      const clientReferenceId = `${store.slug}-${numRef}`
      const description = buildConcept(store.name, numRef)

      try {
        const link = await createPaymentLink({
          amount,
          successUrl: absoluteCartUrl(input.origin, store.slug, "paid=1"),
          backUrl: absoluteCartUrl(input.origin, store.slug),
          clientReferenceId,
        })

        const order = await createPendingOrder(ctx.db, {
          userId: ctx.session.user.id,
          store: {
            id: store.id,
            slug: store.slug,
            name: store.name,
            handle: store.handle,
          },
          amount,
          numRef,
          description,
          items: input.items,
          payableType: "PAYMENT_LINK",
          payableId: link.id,
        })

        return {
          ...link,
          orderId: order.id,
          numRef,
          storeName: store.name,
          payoutName: store.payoutName,
        }
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error
        }
        throw new TRPCError({
          code: "BAD_GATEWAY",
          message:
            error instanceof Error
              ? error.message
              : "Could not create payment link",
        })
      }
    }),

  getTransaction: protectedProcedure
    .input(
      z.object({
        id: z.string().trim().min(1),
        storeSlug: z.string().trim().min(1).optional(),
        items: z.array(cartItemSchema).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const result = await getTransaction(input.id)
        const transaction = parsePeyTransaction(result.raw)
        let order = null

        if (transaction && input.storeSlug) {
          const store = await requirePayoutStore(ctx.db, input.storeSlug)
          order = await upsertOrderFromPeyTransaction(ctx.db, {
            userId: ctx.session.user.id,
            store: {
              id: store.id,
              slug: store.slug,
              name: store.name,
              handle: store.handle,
            },
            transaction,
            raw: result.raw,
            items: input.items as OrderCartItem[] | undefined,
            numRef: numRefFromDescription(transaction.description),
          })
        } else if (transaction) {
          const existing = await ctx.db.order.findUnique({
            where: { peyTransactionId: transaction.id },
          })
          if (existing) {
            order = await upsertOrderFromPeyTransaction(ctx.db, {
              userId: existing.userId,
              store: {
                id: existing.storeId,
                slug: existing.storeSlug,
                name: existing.storeName,
                handle: existing.storeHandle,
              },
              transaction,
              raw: result.raw,
              items: input.items as OrderCartItem[] | undefined,
              numRef: existing.numRef,
            })
          }
        }

        return {
          ...result,
          order,
        }
      } catch (error) {
        throw new TRPCError({
          code: "BAD_GATEWAY",
          message:
            error instanceof Error
              ? error.message
              : "Could not get transaction",
        })
      }
    }),

  getOrderByTransaction: protectedProcedure
    .input(z.object({ peyTransactionId: z.string().trim().min(1) }))
    .query(async ({ ctx, input }) => {
      const order = await ctx.db.order.findUnique({
        where: { peyTransactionId: input.peyTransactionId },
        include: {
          store: {
            select: {
              id: true,
              slug: true,
              name: true,
              handle: true,
              ownerId: true,
            },
          },
        },
      })

      if (!order) {
        return null
      }

      const isBuyer = order.userId === ctx.session.user.id
      const isStoreOwner = order.store.ownerId === ctx.session.user.id
      if (!isBuyer && !isStoreOwner) {
        throw new TRPCError({ code: "FORBIDDEN" })
      }

      return order
    }),

  getCodiQrTransactions: protectedProcedure
    .input(z.object({ id: z.string().trim().min(1) }))
    .mutation(async ({ input }) => {
      try {
        return await getCodiQrTransactions(input.id)
      } catch (error) {
        throw new TRPCError({
          code: "BAD_GATEWAY",
          message:
            error instanceof Error
              ? error.message
              : "Could not get CoDi QR transactions",
        })
      }
    }),

  getPaymentLink: protectedProcedure
    .input(z.object({ id: z.string().trim().min(1) }))
    .mutation(async ({ input }) => {
      try {
        return await getPaymentLink(input.id)
      } catch (error) {
        throw new TRPCError({
          code: "BAD_GATEWAY",
          message:
            error instanceof Error
              ? error.message
              : "Could not get payment link",
        })
      }
    }),
})
