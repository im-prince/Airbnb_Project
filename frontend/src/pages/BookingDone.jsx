import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
import { getBooking, readError } from '../lib/api'
import Button from '../components/Button'
import { Skeleton } from '../components/Skeleton'

const rupees = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})

export default function BookingDone() {
  const { bookingId } = useParams()
  const navigate = useNavigate()

  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const data = await getBooking(bookingId)
        if (cancelled) return

        if (data.bookingStatus !== 'CONFIRMED') {
          navigate(`/trips/${bookingId}`, { replace: true })
          return
        }

        setBooking(data)
      } catch (err) {
        if (cancelled) return
        setError(readError(err, 'Could not load this booking.'))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [bookingId, navigate])

  if (loading) {
    return (
      <div className="mx-auto max-w-[620px] px-6 py-16">
        <Skeleton className="mx-auto h-16 w-16 rounded-full" />
        <Skeleton className="mx-auto mt-6 h-8 w-2/3" />
        <Skeleton className="mt-8 h-64 w-full" />
      </div>
    )
  }

  if (error || !booking) {
    return (
      <div className="mx-auto max-w-[620px] px-6 py-16 text-center">
        <p className="m-0 text-[15px] text-[var(--ink-2)]">
          {error || 'Could not find this booking.'}
        </p>
        <div className="mt-4">
          <Button variant="secondary" onClick={() => navigate('/trips')}>
            Go to My trips
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[620px] px-6 py-16 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--brand-soft)]">
        <CheckCircle2 size={30} className="text-[var(--brand)]" />
      </div>

      <h1 className="mt-6 text-2xl font-bold tracking-tight">You are booked.</h1>
      <p className="mt-2 text-[15px] text-[var(--muted)]">
        A confirmation has been sent to your email.
      </p>

      <div className="mt-8 rounded-[var(--r-lg)] border border-[var(--line)] bg-[var(--surface)] p-6 text-left">
        <Row label="Check in" value={booking.checkInDate} />
        <Row label="Check out" value={booking.checkOutDate} />
        <Row label="Rooms" value={String(booking.roomsCount)} />
        <Row label="Guests" value={String(booking.guests?.length || 0)} />

        <div className="my-4 border-t border-[var(--line)]" />

        <Row label="Booking reference" value={`NST-${booking.id}`} mono copy />
        <Row label="Total paid" value={rupees.format(booking.amount)} bold />
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          to={`/trips/${booking.id}`}
          className="rounded-[var(--r-md)] bg-[var(--brand)] px-5 py-3 text-[15px] font-semibold text-[var(--on-brand)] no-underline transition-colors duration-150 hover:bg-[var(--brand-hover)]"
        >
          View trip
        </Link>
        <Link
          to="/"
          className="rounded-[var(--r-md)] border border-[var(--line)] px-5 py-3 text-[15px] font-semibold text-[var(--ink)] no-underline transition-colors duration-150 hover:bg-[var(--surface-2)]"
        >
          Back to home
        </Link>
      </div>
    </div>
  )
}

function Row({ label, value, mono = false, bold = false, copy = false }) {
  function handleCopy() {
    navigator.clipboard?.writeText(value)
  }

  return (
    <div className="flex items-center justify-between gap-3 py-1.5">
      <span className="text-sm text-[var(--muted)]">{label}</span>
      <span
        onClick={copy ? handleCopy : undefined}
        className={`${mono ? 'mono' : ''} ${bold ? 'text-base font-bold' : 'text-sm'} ${
          copy ? 'cursor-pointer text-[var(--brand)]' : 'text-[var(--ink)]'
        }`}
        title={copy ? 'Click to copy' : undefined}
      >
        {value}
      </span>
    </div>
  )
}