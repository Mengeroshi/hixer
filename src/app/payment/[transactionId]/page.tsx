import { PaymentSuccess } from "~/app/_components/payment-success"

export default async function PaymentSuccessPage({
  params,
}: {
  params: Promise<{ transactionId: string }>
}) {
  const { transactionId } = await params
  return <PaymentSuccess transactionId={transactionId} />
}
