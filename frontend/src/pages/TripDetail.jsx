import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getBooking, readError } from '../lib/api'
import Button from '../components/Button'
import { Skeleton } from '../components/Skeleton'

const rupees = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})

const badgeLooks = {
  RESERVED: 'bg-[var(--accent-soft)] text-[var(--warning)]',
  GUESTS_ADDED: 'bg-[var(--accent-soft)] text-[var(--warning)]',
  PAYMENTS_PENDING: 'bg-[var(--accent-soft)] text-[var(--warning)]',
  CONFIRMED: 'bg-[var(--brand-soft)] text-[var(--brand)]',
  CANCELLED: 'bg-[var(--surface-2)] text-[var(--muted)]',
  EXPIRED: 'bg-[var(--surface-2)] text-[var(--muted)]',
}

const statusNote = {
  RESERVED: 'This hold has expired. Bookings must be paid within 10 minutes.',
  GUESTS_ADDED: 'Guest details were saved, but payment was never completed.',
  PAYMENTS_PENDING: 'Payment did not go through. This booking cannot be recovered yet.',
  CONFIRMED: 'Your stay is confirmed.',
  CANCELLED: 'This booking was cancelled.',
  EXPIRED: 'This hold expired before payment was completed.',
}

export default function TripDetail() {
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
        setBooking(data)
      } catch (err) {
        if (cancelled) return
        setError(readError(err, 'Could not load this trip.'))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [bookingId])

  if (loading) {
    return (
      <div className="mx-auto max-w-[760px] px-4 py-6 sm:px-6 sm:py-8">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="mt-6 h-48 w-full" />
      </div>
    )
  }

  if (error || !booking) {
    return (
      <div className="mx-auto max-w-[760px] px-4 py-16 text-center sm:px-6">
        <p className="m-0 text-[15px] text-[var(--ink-2)]">
          {error || 'Could not find this trip.'}
        </p>
        <div className="mt-4">
          <Button variant="secondary" onClick={() => navigate('/trips')}>
            Back to my trips
          </Button>
        </div>
      </div>
    )
  }

  const nights = countNights(booking.checkInDate, booking.checkOutDate)
  const badge = badgeLooks[booking.bookingStatus] || badgeLooks.CANCELLED
  const canCancel = booking.bookingStatus === 'CONFIRMED'

  return (
    <div className="mx-auto max-w-[760px] px-4 py-6 sm:px-6 sm:py-8">
      <Link
        to="/trips"
        className="text-sm text-[var(--muted)] no-underline hover:text-[var(--ink)]"
      >
        ← Back to my trips
      </Link>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="m-0 text-xl font-bold tracking-tight sm:text-2xl">
          {booking.checkInDate} – {booking.checkOutDate}
        </h1>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badge}`}>
          {formatStatus(booking.bookingStatus)}
        </span>
      </div>

      <p className="mt-2 text-[15px] text-[var(--muted)]">
        {statusNote[booking.bookingStatus] || ''}
      </p>

      <div className="mt-6 rounded-[var(--r-lg)] border border-[var(--line)] bg-[var(--surface)] p-4 sm:p-6">
        <h2 className="m-0 text-base font-bold">Stay</h2>
        <div className="mt-3 flex flex-col gap-2 text-sm">
          <Row label="Check in" value={booking.checkInDate} />
          <Row label="Check out" value={booking.checkOutDate} />
          <Row label="Nights" value={String(nights)} />
          <Row label="Rooms" value={String(booking.roomsCount)} />
        </div>

        <h2 className="mt-6 text-base font-bold">Guests</h2>
        {booking.guests?.length > 0 ? (
          <div className="mt-3 flex flex-col gap-2 text-sm">
            {[...booking.guests].map((guest) => (
              <div key={guest.id} className="flex items-start justify-between gap-3">
                <span className="min-w-0 truncate text-[var(--ink)]" title={guest.name}>
                  {guest.name}
                </span>
                <span className="shrink-0 text-[var(--muted)]">
                  {guest.age} · {formatStatus(guest.gender)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-sm text-[var(--muted)]">No guest details on this booking.</p>
        )}

        <h2 className="mt-6 text-base font-bold">Payment</h2>
        <div className="mt-3 flex flex-col gap-2 text-sm">
          <Row label="Booking reference" value={`NST-${booking.id}`} mono />
          <Row label="Total" value={rupees.format(booking.amount)} bold />
          {booking.payment && (
            <Row
              label="Transaction"
              value={booking.payment.transactionId || '—'}
              mono
            />
          )}
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <Button variant="danger" disabled={!canCancel} title="Cancellation is coming soon">
          Cancel booking
        </Button>
      </div>
    </div>
  )
}

function Row({ label, value, mono = false, bold = false }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="shrink-0 text-[var(--muted)]">{label}</span>
      <span
        className={`min-w-0 truncate text-right ${mono ? 'mono' : ''} ${bold ? 'font-bold text-[var(--ink)]' : 'text-[var(--ink)]'}`}
        title={typeof value === 'string' ? value : undefined}
      >
        {value}
      </span>
    </div>
  )
}

function formatStatus(status) {
  return status.replace(/_/g, ' ').toLowerCase().replace(/^\w/, (c) => c.toUpperCase())
}

function countNights(from, to) {
  if (!from || !to) return 0
  const days = Math.round((new Date(to) - new Date(from)) / 86400000)
  return days > 0 ? days : 0
}