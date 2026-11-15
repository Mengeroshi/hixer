"use client"

import { BeautifulQRCode } from "@beautiful-qr-code/react"

export function CodiQr({
  data,
  label,
}: {
  data: string
  label: string
}) {
  return (
    <div
      role="img"
      aria-label={label}
      className="grid size-56 place-items-center overflow-hidden rounded-2xl border-2 border-border bg-white p-3 shadow-shadow"
    >
      <BeautifulQRCode
        data={data}
        type="svg"
        foregroundColor="#d7f3af"
        backgroundColor="#ffffff"
        radius={1}
        padding={1}
        className="size-full [&_svg]:block [&_svg]:size-full"
      />
    </div>
  )
}
