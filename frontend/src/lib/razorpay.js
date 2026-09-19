const SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js'

let loading = null

export function loadRazorpay() {
  if (window.Razorpay) {
    return Promise.resolve(true)
  }

  if (loading) {
    return loading
  }

    loading = new Promise((resolve) => {
    const script = document.createElement('script')
    script.src = SCRIPT_URL

    const giveUp = setTimeout(() => {
      loading = null
      resolve(false)
    }, 10000)

    script.onload = () => {
      clearTimeout(giveUp)
      resolve(true)
    }

    script.onerror = () => {
      clearTimeout(giveUp)
      loading = null
      resolve(false)
    }

    document.body.appendChild(script)
  })

  return loading
}

export function openCheckout({ order, name, email, onDone, onDismiss }) {
  const checkout = new window.Razorpay({
    key: order.razorpayKeyId,
    amount: order.amount,
    currency: order.currency,
    order_id: order.orderId,
    name: 'Nestay',
    description: 'Stay booking',
    prefill: { name, email },
    theme: { color: '#F0492B' },
    handler: onDone,
    modal: { ondismiss: onDismiss },
  })

  checkout.open()
}