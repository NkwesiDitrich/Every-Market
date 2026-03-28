export const getPaymentStatusLabel = (status, paymentMode) => {
  switch (status) {
    case "PAID":
      return { label: "Paid", color: "success", message: "Payment confirmed." }
    case "PENDING":
      if (paymentMode === "MOBILE_MONEY" || paymentMode === "ORANGE_MONEY") {
        return {
          label: "Awaiting confirmation",
          color: "warning",
          message: "Complete the payment on your phone. We'll confirm once received.",
        }
      }
      return {
        label: "Processing",
        color: "warning",
        message: "Your payment is being processed. We'll confirm shortly.",
      }
    case "FAILED":
      return {
        label: "Failed",
        color: "error",
        message: "Payment could not be completed. Please try again or use another method.",
      }
    case "UNPAID":
      return {
        label: "Cash on delivery",
        color: "info",
        message: "Pay when your order arrives.",
      }
    case "REFUNDED":
      return { label: "Refunded", color: "info", message: "This order has been refunded." }
    default:
      return { label: status || "Unknown", color: "default", message: "" }
  }
}
