"use client"

import Link from "next/link"
import { useEffect, useMemo, type ReactNode } from "react"
import { ArrowLeft } from "lucide-react"

import { AppBottomNav } from "~/app/_components/app-bottom-nav"
import {
  ReceiptPrinter,
  type ReceiptAmount,
} from "~/components/ui/receipt-printer"
import { clearStoreCart, parsePrice } from "~/lib/cart"
import { api } from "~/trpc/react"

type TransactionPayload = {
  id?: string
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
  description?: string
  datePaid?: number
  dateCreated?: number
  metadata?: {
    trackingKey?: string
    clabe?: string
    bankCode?: number
    description?: string
  }
}

type StoredOrderItem = {
  slug: string
  name: string
  price: string
  quantity: number
}

function asTransaction(raw: unknown): TransactionPayload | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return null
  }
  return raw as TransactionPayload
}

function asOrderItems(value: unknown): StoredOrderItem[] {
  if (!Array.isArray(value)) {
    return []
  }
  return value.flatMap((entry) => {
    if (!entry || typeof entry !== "object") {
      return []
    }
    const item = entry as Partial<StoredOrderItem>
    if (
      typeof item.slug !== "string" ||
      typeof item.name !== "string" ||
      typeof item.price !== "string" ||
      typeof item.quantity !== "number"
    ) {
      return []
    }
    return [
      {
        slug: item.slug,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      },
    ]
  })
}

function formatUnix(seconds?: number) {
  if (!seconds) {
    return null
  }
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(seconds * 1000))
}

function formatDate(value?: Date | string | null) {
  if (!value) {
    return null
  }
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
}

export function PaymentSuccess({
  transactionId,
}: {
  transactionId: string
}) {
  const orderQuery = api.checkout.getOrderByTransaction.useQuery({
    peyTransactionId: transactionId,
  })
  const getTransaction = api.checkout.getTransaction.useMutation({
    onSuccess: () => {
      void orderQuery.refetch()
    },
  })

  useEffect(() => {
    getTransaction.mutate({ id: transactionId })
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fetch once per id
  }, [transactionId])

  const tx = asTransaction(
    getTransaction.data?.raw ?? orderQuery.data?.raw ?? null,
  )
  const order = orderQuery.data
  const savedOrder = getTransaction.data?.order
  const orderItems = asOrderItems(order?.items ?? savedOrder?.items)
  const status = order?.status ?? savedOrder?.status ?? tx?.status
  const storeSlug =
    order?.storeSlug ?? order?.store.slug ?? savedOrder?.storeSlug ?? null

  useEffect(() => {
    if (status !== "PAID" || !storeSlug) {
      return
    }
    clearStoreCart(storeSlug)
  }, [status, storeSlug])

  const receipt = useMemo(() => {
    const record = order ?? savedOrder
    if (!tx && !record) {
      return null
    }

    const currency = record?.currency ?? tx?.currency ?? "MXN"
    const status = record?.status ?? tx?.status
    const description =
      record?.description ||
      tx?.description ||
      tx?.metadata?.description ||
      "Payment"
    const storeName =
      order?.storeName ?? order?.store.name ?? savedOrder?.storeName

    const items: ReceiptAmount[] =
      orderItems.length > 0
        ? orderItems.map((item) => ({
            label:
              item.quantity > 1
                ? `${item.name}  x${item.quantity}`
                : item.name,
            amount: Number(
              ((parsePrice(item.price) / 100) * item.quantity).toFixed(2),
            ),
          }))
        : [
            {
              label: description,
              amount:
                record?.amountBase ??
                record?.amount ??
                tx?.amountBreakdown?.base ??
                tx?.amount ??
                0,
            },
          ]

    const charges: ReceiptAmount[] = []
    const tip = record?.amountTip ?? tx?.amountBreakdown?.tip
    const fee = record?.amountFee ?? tx?.amountBreakdown?.fee
    if (tip) {
      charges.push({ label: "Tip", amount: tip })
    }
    if (fee) {
      charges.push({ label: "Fee", amount: fee })
    }

    const paidAt =
      formatDate(record?.paidAt) ??
      formatUnix(tx?.datePaid ?? tx?.dateCreated)
    const storeHandle =
      order?.storeHandle ||
      order?.store.handle ||
      savedOrder?.storeHandle ||
      null
    const details = [
      storeName,
      storeHandle,
      paidAt,
      status,
      record?.paymentMethod ?? tx?.paymentMethod,
      (record?.payableType ?? tx?.payableType)?.replaceAll("_", " "),
      record?.trackingKey
        ? `Track ${record.trackingKey}`
        : tx?.metadata?.trackingKey
          ? `Track ${tx.metadata.trackingKey}`
          : null,
      record?.numRef ? `Ref ${record.numRef}` : null,
    ].filter(Boolean) as ReactNode[]

    const idForBadge = record?.id ?? tx?.id ?? transactionId

    return {
      orderId: `#${idForBadge.slice(-6).toUpperCase()}`,
      merchant: storeName ?? "Hixy",
      details,
      items,
      charges,
      thankYou:
        status === "PAID" ? "Paid ✦ Gracias" : (status ?? "Thank you ✦"),
      currency,
    }
  }, [tx, order, savedOrder, orderItems, transactionId])

  const loading =
    !receipt &&
    (orderQuery.isLoading || getTransaction.isPending) &&
    !orderQuery.isError &&
    !getTransaction.isError

  return (
    <div className="min-h-dvh bg-neutral-200 text-foreground">
      <div className="relative mx-auto flex h-dvh w-full max-w-[430px] flex-col bg-background">
        <div className="flex-1 overflow-y-auto px-4 pb-28">
          <header className="flex items-center gap-3 py-4">
            <Link
              href="/"
              aria-label="Back home"
              className="grid size-10 place-items-center rounded-full border-2 border-border bg-surface-3 shadow-shadow"
            >
              <ArrowLeft className="size-4" />
            </Link>
            <div>
              <p className="font-heading text-lg">Payment</p>
              <p className="text-xs text-foreground/70">Transaction receipt</p>
            </div>
          </header>

          {loading ? (
            <div className="mt-10 rounded-2xl border-2 border-border bg-surface-5 p-6 text-center shadow-shadow">
              <p className="font-heading">Loading receipt…</p>
            </div>
          ) : null}

          {getTransaction.isError && !receipt ? (
            <div className="mt-10 rounded-2xl border-2 border-border bg-surface-5 p-6 text-center shadow-shadow">
              <p className="font-heading">Could not load transaction</p>
              <p className="mt-2 text-sm text-red-700">
                {getTransaction.error.message}
              </p>
              <button
                type="button"
                className="mt-4 inline-flex h-11 items-center rounded-xl border-2 border-border bg-main px-4 text-sm font-heading shadow-shadow"
                onClick={() => getTransaction.mutate({ id: transactionId })}
              >
                Try again
              </button>
            </div>
          ) : null}

          {receipt ? (
            <div className="mt-4 flex flex-col items-center pb-4">
              <ReceiptPrinter
                autoPrint
                title="Receipt"
                orderId={receipt.orderId}
                merchant={receipt.merchant}
                details={receipt.details}
                items={receipt.items}
                charges={receipt.charges}
                thankYou={receipt.thankYou}
                currency={receipt.currency}
                locale="es-MX"
              />
              <p className="mt-4 max-w-sm break-all text-center font-mono text-[10px] text-foreground/50">
                {order?.peyTransactionId ?? tx?.id ?? transactionId}
              </p>
            </div>
          ) : null}
        </div>

        <div className="relative z-30 mx-4 mb-4">
          <AppBottomNav />
        </div>
      </div>
    </div>
  )
}
