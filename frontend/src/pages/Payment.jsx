import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Loader2, ShieldCheck } from 'lucide-react'
import { getBooking, startPayment, readError } from '../lib/api'
import { loadRazorpay, openCheckout } from '../lib/razorpay'
import { useAuth } from '../lib/useAuth'
import Button from '../components/Button'

const rupees = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})

export default function Payment() {
  const { bookingId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [stage, setStage] = useState('opening')
  const [booking, setBooking] = useState(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    let cancelled = false

    async function begin() {
      try {
        const current = await getBooking(bookingId)
        if (cancelled) return
        setBooking(current)

        if (current.bookingStatus === 'CONFIRMED') {
          navigate(`/bookings/${bookingId}/done`, { replace: true })
          return
        }

        const ready = await loadRazorpay()
        if (cancelled) return
        if (!ready) {
          setStage('failed')
          setMessage('Could not load the payment window. Check your connection and try again.')
          return
        }

        const order = await startPayment(bookingId)
        if (cancelled) return

        openCheckout({
          order,
          name: user?.name || '',
          email: user?.email || '',
          onDone: () => {
            setStage('checking')
            pollStatus()
          },
          onDismiss: () => {
            setStage('cancelled')
          },
        })
      } catch (err) {
        if (cancelled) return
        setStage('failed')
        setMessage(readError(err, 'Could not start the payment. Please try again.'))
      }
    }

    async function pollStatus() {
      const startedAt = Date.now()

      while (Date.now() - startedAt < 30000) {
        await wait(2500)
        if (cancelled) return

        try {
          const current = await getBooking(bookingId)
          if (cancelled) return

          if (current.bookingStatus === 'CONFIRMED') {
            navigate(`/bookings/${bookingId}/done`, { replace: true })
            return
          }
        } catch {
          // keep polling — one failed check isn't an answer
        }
      }

      if (!cancelled) setStage('slow')
    }

    begin()
    return () => {
      cancelled = true
    }
  }, [bookingId])

  return (
    <div className="mx-auto flex min-h-[calc(100vh-64px)] max-w-[420px] flex-col items-center justify-center px-6 text-center">
      {(stage === 'opening' || stage === 'checking') && (
        <>
          <Loader2 size={32} className="animate-spin text-[var(--brand)]" />
          <h1 className="mt-6 text-xl font-bold">
            {stage === 'opening' ? 'Opening secure payment' : 'Confirming your booking'}
          </h1>
          <p className="mt-2 text-[15px] text-[var(--muted)]">
            {stage === 'opening'
              ? 'Please do not close this window.'
              : 'This usually takes a few seconds.'}
          </p>
        </>
      )}

      {stage === 'slow' && (
        <>
          <ShieldCheck size={32} className="text-[var(--warning)]" />
          <h1 className="mt-6 text-xl font-bold">Your payment is being processed</h1>
          <p className="mt-2 text-[15px] text-[var(--muted)]">
            This can take a few moments. Check My trips shortly to confirm your booking.
          </p>
          <Button className="mt-6" onClick={() => navigate('/trips')}>
            Go to My trips
          </Button>
        </>
      )}

      {stage === 'cancelled' && (
        <>
          <h1 className="m-0 text-xl font-bold">Payment was not completed</h1>
          <p className="mt-2 text-[15px] text-[var(--muted)]">
            You closed the payment window before finishing. This booking can't be paid
            for now, so you'll need to start a new one.
          </p>
          <Button className="mt-6" onClick={() => navigate('/')}>
            Search again
          </Button>
        </>
      )}

      {stage === 'failed' && (
        <>
          <h1 className="m-0 text-xl font-bold">Could not start the payment</h1>
          <p className="mt-2 text-[15px] text-[var(--muted)]">{message}</p>
          <Button className="mt-6" onClick={() => navigate('/')}>
            Back to home
          </Button>
        </>
      )}

      {booking && (
        <p className="mt-10 text-xs text-[var(--muted)]">
          <span className="mono">NST-{booking.id}</span>
          {' · '}
          <span className="nums">{rupees.format(booking.amount)}</span>
        </p>
      )}
    </div>
  )
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}