"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Link2, Minus, Plus, QrCode, Smartphone, Trash2, X } from "lucide-react"

import { CodiQr } from "~/app/_components/codi-qr"
import { Button, buttonVariants } from "~/components/ui/button"
import { cn } from "~/lib/utils"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "~/components/ui/sheet"
import {
  formatMoney,
  getStoreCart,
  parsePrice,
  setStoreCartItemQuantity,
  subscribeCarts,
  type StoreCart as StoreCartData,
} from "~/lib/cart"
import { api } from "~/trpc/react"

type CheckoutStep = "choose" | "qr" | "push" | "link"

function truncateForStudy(value: unknown): unknown {
  if (typeof value === "string" && value.length > 120) {
    return `${value.slice(0, 80)}…(${value.length} chars)`
  }
  if (Array.isArray(value)) {
    return value.map(truncateForStudy)
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [key, truncateForStudy(entry)]),
    )
  }
  return value
}

function PeyRawJson({
  raw,
  title = "Pey response",
}: {
  raw: unknown
  title?: string
}) {
  const [copied, setCopied] = useState(false)

  async function copyRaw() {
    try {
      await navigator.clipboard.writeText(JSON.stringify(raw, null, 2))
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="w-full text-left">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-xs font-heading text-foreground/70">{title}</p>
        <Button type="button" size="xs" variant="neutral" onClick={copyRaw}>
          {copied ? "Copied" : "Copy JSON"}
        </Button>
      </div>
      <pre className="max-h-48 w-full overflow-auto rounded-2xl border-2 border-border bg-surface-5 p-3 text-[10px] leading-relaxed break-all whitespace-pre-wrap shadow-shadow">
        {JSON.stringify(truncateForStudy(raw), null, 2)}
      </pre>
    </div>
  )
}

export function StoreCart({
  storeSlug,
  storeName,
  storeHandle,
}: {
  storeSlug: string
  storeName: string
  storeHandle: string
}) {
  const router = useRouter()
  const [cart, setCart] = useState<StoreCartData | null>(null)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [step, setStep] = useState<CheckoutStep>("choose")
  const [checkoutError, setCheckoutError] = useState<string | null>(null)
  const [phoneNumber, setPhoneNumber] = useState("")
  const [copied, setCopied] = useState(false)
  const [statusRaw, setStatusRaw] = useState<unknown>(null)
  const [qr, setQr] = useState<{
    id: string
    imageSrc: string | null
    qrString: string | null
    amount: number
    concept: string
    numRef: string
    storeName: string
    payoutName: string
    raw: unknown
  } | null>(null)
  const [push, setPush] = useState<{
    transactionId: string
    amount: number
    phoneNumber: string
    numRef: string
    storeName: string
    payoutName: string
    codiId: string
    raw: unknown
  } | null>(null)
  const [link, setLink] = useState<{
    id: string
    url: string
    amount: number
    numRef: string
    storeName: string
    payoutName: string
    raw: unknown
  } | null>(null)

  const createQr = api.checkout.createQr.useMutation({
    onSuccess: (data) => {
      console.log("[pey] createQr", data.raw)
      setQr(data)
      setPush(null)
      setLink(null)
      setStatusRaw(null)
      setCheckoutError(null)
      setStep("qr")
    },
    onError: (error) => {
      setCheckoutError(error.message)
      setQr(null)
    },
  })

  const createPush = api.checkout.createPush.useMutation({
    onSuccess: (data) => {
      console.log("[pey] createPush", data.raw)
      setPush(data)
      setQr(null)
      setLink(null)
      setStatusRaw(null)
      setCheckoutError(null)
      setStep("push")
    },
    onError: (error) => {
      setCheckoutError(error.message)
      setPush(null)
    },
  })

  const createPaymentLink = api.checkout.createPaymentLink.useMutation({
    onSuccess: (data) => {
      console.log("[pey] createPaymentLink", data.raw)
      setLink(data)
      setQr(null)
      setPush(null)
      setStatusRaw(null)
      setCheckoutError(null)
      setCopied(false)
      setStep("link")
    },
    onError: (error) => {
      setCheckoutError(error.message)
      setLink(null)
    },
  })

  const getTransaction = api.checkout.getTransaction.useMutation({
    onSuccess: (data) => {
      console.log("[pey] getTransaction", data.raw)
      setStatusRaw(data.raw)
      setCheckoutError(null)

      const status =
        data.raw &&
        typeof data.raw === "object" &&
        !Array.isArray(data.raw) &&
        "status" in data.raw
          ? String((data.raw as { status?: unknown }).status ?? "")
          : ""
      const id =
        data.raw &&
        typeof data.raw === "object" &&
        !Array.isArray(data.raw) &&
        "id" in data.raw &&
        typeof (data.raw as { id?: unknown }).id === "string"
          ? (data.raw as { id: string }).id
          : null

      if (status === "PAID" && id) {
        router.push(`/payment/${id}`)
      }
    },
    onError: (error) => {
      setCheckoutError(error.message)
    },
  })

  const getCodiQrTransactions = api.checkout.getCodiQrTransactions.useMutation({
    onSuccess: (data) => {
      console.log("[pey] getCodiQrTransactions", data.raw)
      setStatusRaw(data.raw)
      setCheckoutError(null)

      const items = Array.isArray(
        (data.raw as { items?: unknown } | null)?.items,
      )
        ? ((data.raw as { items: Array<{ id?: string }> }).items ?? [])
        : []
      const paidId = items.find((item) => typeof item.id === "string")?.id
      if (paidId) {
        getTransaction.mutate({
          id: paidId,
          storeSlug,
          items: getStoreCart(storeSlug)?.items.map((item) => ({
            slug: item.slug,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
          })),
        })
      }
    },
    onError: (error) => {
      setCheckoutError(error.message)
    },
  })

  const getPaymentLinkStatus = api.checkout.getPaymentLink.useMutation({
    onSuccess: (data) => {
      console.log("[pey] getPaymentLink", data.raw)
      setStatusRaw(data.raw)
      setCheckoutError(null)

      const transactions = Array.isArray(
        (data.raw as { transactions?: unknown } | null)?.transactions,
      )
        ? ((
            data.raw as {
              transactions: Array<{ transactionId?: string }>
            }
          ).transactions ?? [])
        : []
      const paidId = transactions.find(
        (item) => typeof item.transactionId === "string",
      )?.transactionId
      if (paidId) {
        getTransaction.mutate({
          id: paidId,
          storeSlug,
          items: getStoreCart(storeSlug)?.items.map((item) => ({
            slug: item.slug,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
          })),
        })
      }
    },
    onError: (error) => {
      setCheckoutError(error.message)
    },
  })

  useEffect(() => {
    const sync = () => setCart(getStoreCart(storeSlug))
    sync()
    return subscribeCarts(sync)
  }, [storeSlug])

  const items = cart?.items ?? []
  const orderItems = items.map((item) => ({
    slug: item.slug,
    name: item.name,
    price: item.price,
    quantity: item.quantity,
  }))
  const subtotal = items.reduce(
    (total, item) => total + parsePrice(item.price) * item.quantity,
    0,
  )
  const statusBusy =
    getTransaction.isPending ||
    getCodiQrTransactions.isPending ||
    getPaymentLinkStatus.isPending
  const busy =
    createQr.isPending ||
    createPush.isPending ||
    createPaymentLink.isPending ||
    statusBusy

  function openCheckout() {
    if (subtotal <= 0) {
      return
    }
    setCheckoutError(null)
    setQr(null)
    setPush(null)
    setLink(null)
    setStatusRaw(null)
    setPhoneNumber("")
    setCopied(false)
    setStep("choose")
    setCheckoutOpen(true)
  }

  function checkQrPayment() {
    if (!qr?.id) {
      return
    }
    setCheckoutError(null)
    getCodiQrTransactions.mutate({ id: qr.id })
  }

  function checkPushPayment() {
    if (!push?.transactionId) {
      return
    }
    setCheckoutError(null)
    getTransaction.mutate({
      id: push.transactionId,
      storeSlug,
      items: orderItems,
    })
  }

  function checkLinkPayment() {
    if (!link?.id) {
      return
    }
    setCheckoutError(null)
    getPaymentLinkStatus.mutate({ id: link.id })
  }

  function payWithQr() {
    setCheckoutError(null)
    setQr(null)
    setPush(null)
    setLink(null)
    createQr.mutate({ storeSlug, amount: subtotal, items: orderItems })
  }

  function payWithPush() {
    setCheckoutError(null)
    setPush(null)
    createPush.mutate({
      storeSlug,
      amount: subtotal,
      items: orderItems,
      phoneNumber,
    })
  }

  function payWithLink() {
    setCheckoutError(null)
    setLink(null)
    createPaymentLink.mutate({
      storeSlug,
      amount: subtotal,
      items: orderItems,
      origin: window.location.origin,
    })
  }

  async function copyLink() {
    if (!link?.url) {
      return
    }
    try {
      await navigator.clipboard.writeText(link.url)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="min-h-dvh bg-neutral-200 text-foreground">
      <div className="relative mx-auto flex h-dvh w-full max-w-[430px] flex-col bg-background">
        <div className="flex-1 overflow-y-auto px-4 pb-28">
          <header className="flex items-center gap-3 py-4">
            <Link
              href={`/stores/${storeSlug}`}
              aria-label="Close cart"
              className="grid size-10 place-items-center rounded-full border-2 border-border bg-surface-3 shadow-shadow"
            >
              <X className="size-4" />
            </Link>
          </header>

          <Link href={`/stores/${storeSlug}`} className="block">
            <h1 className="text-2xl font-heading tracking-tight underline-offset-4 hover:underline">
              {cart?.storeName ?? storeName}
            </h1>
            <p className="mt-1 text-sm text-foreground/70">
              {cart?.storeHandle ?? storeHandle}
            </p>
          </Link>

          {items.length === 0 ? (
            <div className="mt-10 rounded-2xl border-2 border-border bg-surface-5 p-6 text-center shadow-shadow">
              <p className="font-heading">Your cart is empty</p>
              <Link
                href={`/stores/${storeSlug}`}
                className="mt-4 inline-flex h-11 items-center rounded-xl border-2 border-border bg-main px-4 text-sm font-heading shadow-shadow"
              >
                Browse mixes
              </Link>
            </div>
          ) : (
            <ul className="mt-6 space-y-3">
              {items.map((item) => (
                <li
                  key={item.slug}
                  className="flex gap-3 rounded-2xl border-2 border-border bg-surface-5 p-3 shadow-shadow"
                >
                  <Link
                    href={`/mixes/${item.slug}`}
                    className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-xl border-2 border-border bg-background"
                  >
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="size-full object-cover"
                      />
                    ) : (
                      <span className="px-1 text-center text-[10px] font-heading leading-tight">
                        {item.name}
                      </span>
                    )}
                  </Link>

                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/mixes/${item.slug}`}
                      className="block truncate text-sm font-heading"
                    >
                      {item.name}
                    </Link>
                    <p className="mt-1 text-sm font-heading">{item.price}</p>

                    <div className="mt-3 inline-flex items-center gap-1 rounded-full border-2 border-border bg-background px-1 py-1 shadow-shadow">
                      <button
                        type="button"
                        aria-label={
                          item.quantity <= 1
                            ? "Remove from cart"
                            : "Decrease quantity"
                        }
                        onClick={() =>
                          setStoreCartItemQuantity(
                            storeSlug,
                            item.slug,
                            item.quantity - 1,
                          )
                        }
                        className="grid size-8 place-items-center rounded-full"
                      >
                        {item.quantity <= 1 ? (
                          <Trash2 className="size-3.5" />
                        ) : (
                          <Minus className="size-3.5" />
                        )}
                      </button>
                      <span className="min-w-6 text-center text-sm font-heading">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        aria-label="Increase quantity"
                        onClick={() =>
                          setStoreCartItemQuantity(
                            storeSlug,
                            item.slug,
                            item.quantity + 1,
                          )
                        }
                        className="grid size-8 place-items-center rounded-full"
                      >
                        <Plus className="size-3.5" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {items.length > 0 ? (
            <div className="mt-6 flex items-center justify-between border-t-2 border-border pt-4">
              <span className="font-heading">Subtotal</span>
              <span className="font-heading">{formatMoney(subtotal)}</span>
            </div>
          ) : null}
        </div>

        {items.length > 0 ? (
          <div className="absolute inset-x-0 bottom-0 border-t-2 border-border bg-background p-4">
            <Button
              type="button"
              className="h-12 w-full"
              disabled={subtotal <= 0}
              onClick={openCheckout}
            >
              Checkout · {formatMoney(subtotal)}
            </Button>
          </div>
        ) : null}
      </div>

      <Sheet open={checkoutOpen} onOpenChange={setCheckoutOpen}>
        <SheetContent
          side="bottom"
          className="mx-auto max-w-[430px] rounded-t-2xl border-x-2 shadow-shadow"
        >
          <SheetHeader>
            <SheetTitle>Checkout</SheetTitle>
            <SheetDescription>
              {step === "choose"
                ? `Pay ${formatMoney(subtotal)}`
                : step === "qr" && qr
                  ? `Scan to pay ${formatMoney(qr.amount)}`
                  : step === "push" && push
                    ? `Push sent for ${formatMoney(push.amount)}`
                    : step === "link" && link
                      ? `Link ready for ${formatMoney(link.amount)}`
                      : "Choose how to pay"}
            </SheetDescription>
          </SheetHeader>

          {checkoutError ? (
            <p className="px-4 text-sm text-red-700">{checkoutError}</p>
          ) : null}

          {step === "choose" ? (
            <div className="grid gap-3 px-4">
              <button
                type="button"
                disabled={busy}
                onClick={payWithQr}
                className="flex items-center gap-3 rounded-2xl border-2 border-border bg-surface-5 px-4 py-3 text-left shadow-shadow disabled:opacity-50"
              >
                <span className="grid size-10 place-items-center rounded-full border-2 border-border bg-main">
                  <QrCode className="size-5" />
                </span>
                <span>
                  <span className="block text-sm font-heading">
                    {createQr.isPending ? "Creating QR…" : "Pay with QR"}
                  </span>
                  <span className="block text-xs text-foreground/70">
                    Show a CoDi code to scan
                  </span>
                </span>
              </button>

              <button
                type="button"
                disabled={busy}
                onClick={payWithLink}
                className="flex items-center gap-3 rounded-2xl border-2 border-border bg-surface-5 px-4 py-3 text-left shadow-shadow disabled:opacity-50"
              >
                <span className="grid size-10 place-items-center rounded-full border-2 border-border bg-surface-3">
                  <Link2 className="size-5" />
                </span>
                <span>
                  <span className="block text-sm font-heading">
                    {createPaymentLink.isPending
                      ? "Creating link…"
                      : "Pay with link"}
                  </span>
                  <span className="block text-xs text-foreground/70">
                    Open Pey checkout (card or CoDi)
                  </span>
                </span>
              </button>

              <div className="rounded-2xl border-2 border-border bg-surface-5 p-4 shadow-shadow">
                <div className="flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-full border-2 border-border bg-surface-3">
                    <Smartphone className="size-5" />
                  </span>
                  <div>
                    <p className="text-sm font-heading">Send CoDi push</p>
                    <p className="text-xs text-foreground/70">
                      10-digit Mexican phone number
                    </p>
                  </div>
                </div>
                <label className="mt-3 block">
                  <span className="sr-only">Phone number</span>
                  <input
                    inputMode="numeric"
                    autoComplete="tel"
                    placeholder="5512345678"
                    value={phoneNumber}
                    onChange={(event) =>
                      setPhoneNumber(
                        event.target.value.replace(/\D/g, "").slice(0, 10),
                      )
                    }
                    className="h-11 w-full rounded-xl border-2 border-border bg-background px-3 text-sm font-heading"
                  />
                </label>
                <Button
                  type="button"
                  className="mt-3 h-11 w-full"
                  disabled={busy || phoneNumber.length !== 10}
                  onClick={payWithPush}
                >
                  {createPush.isPending ? "Sending…" : "Send push"}
                </Button>
              </div>
            </div>
          ) : null}

          {step === "qr" && qr ? (
            <div className="flex flex-col items-center gap-3 px-4 pb-2">
              {qr.qrString ? (
                <CodiQr
                  data={qr.qrString}
                  label={`CoDi QR for ${qr.concept}`}
                />
              ) : qr.imageSrc ? (
                <img
                  src={qr.imageSrc}
                  alt={`CoDi QR for ${qr.concept}`}
                  className="size-56 rounded-2xl border-2 border-border bg-white p-2 shadow-shadow"
                />
              ) : (
                <p className="rounded-2xl border-2 border-border bg-surface-5 p-4 text-center text-xs break-all">
                  QR created, but no payload was returned.
                </p>
              )}
              <p className="text-center text-sm font-heading">
                {formatMoney(qr.amount)}
              </p>
              <p className="text-center text-xs text-foreground/70">
                {qr.payoutName} · ref {qr.numRef}
              </p>
              <Button
                type="button"
                className="w-full"
                disabled={statusBusy}
                onClick={checkQrPayment}
              >
                {statusBusy ? "Checking…" : "Check payment"}
              </Button>
              <PeyRawJson raw={qr.raw} title="Create QR" />
              {statusRaw ? (
                <PeyRawJson raw={statusRaw} title="Get Transaction" />
              ) : null}
            </div>
          ) : null}

          {step === "push" && push ? (
            <div className="grid gap-3 px-4 pb-2 text-center">
              <p className="text-sm font-heading">
                Push sent to {push.phoneNumber}
              </p>
              <p className="text-lg font-heading">
                {formatMoney(push.amount)}
              </p>
              <p className="text-xs text-foreground/70">
                {push.payoutName} · ref {push.numRef}
              </p>
              <p className="text-xs text-foreground/70">
                CoDi folio {push.codiId}
              </p>
              <Button
                type="button"
                className="w-full"
                disabled={statusBusy}
                onClick={checkPushPayment}
              >
                {statusBusy ? "Checking…" : "Check payment"}
              </Button>
              <PeyRawJson raw={push.raw} title="Create Push" />
              {statusRaw ? (
                <PeyRawJson raw={statusRaw} title="Get Transaction" />
              ) : null}
            </div>
          ) : null}

          {step === "link" && link ? (
            <div className="grid gap-3 px-4 pb-2">
              <p className="text-center text-lg font-heading">
                {formatMoney(link.amount)}
              </p>
              <p className="text-center text-xs text-foreground/70">
                {link.payoutName} · ref {link.numRef}
              </p>
              <a
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className="break-all rounded-2xl border-2 border-border bg-surface-5 px-3 py-3 text-center text-xs underline-offset-2 hover:underline"
              >
                {link.url}
              </a>
              <div className="grid grid-cols-2 gap-2">
                <Button type="button" variant="neutral" onClick={copyLink}>
                  {copied ? "Copied" : "Copy link"}
                </Button>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className={cn(buttonVariants(), "inline-flex")}
                >
                  Open
                </a>
              </div>
              <Button
                type="button"
                className="w-full"
                disabled={statusBusy}
                onClick={checkLinkPayment}
              >
                {statusBusy ? "Checking…" : "Check payment"}
              </Button>
              <PeyRawJson raw={link.raw} title="Create Payment Link" />
              {statusRaw ? (
                <PeyRawJson raw={statusRaw} title="Get Transaction" />
              ) : null}
            </div>
          ) : null}

          <SheetFooter>
            {step !== "choose" ? (
              <Button
                type="button"
                variant="neutral"
                onClick={() => {
                  setCheckoutError(null)
                  setStep("choose")
                }}
              >
                Back
              </Button>
            ) : null}
            <Button
              type="button"
              variant="neutral"
              onClick={() => setCheckoutOpen(false)}
            >
              Close
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}
