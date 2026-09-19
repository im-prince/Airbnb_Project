import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarX } from 'lucide-react'
import { getMyBookings, readError } from '../lib/api'
import EmptyState from '../components/EmptyState'
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

export default function MyTrips() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const data = await getMyBookings()
        if (cancelled) return
        setBookings(data || [])
      } catch (err) {
        if (cancelled) return
        setError(readError(err, 'Could not load your trips.'))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  const sorted = [...bookings].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  )

  return (
    <div className="mx-auto max-w-[880px] px-4 py-6 sm:px-6 sm:py-8">
      <h1 className="m-0 text-2xl font-bold tracking-tight">My trips</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">
        {loading ? 'Loading…' : `${sorted.length} ${sorted.length === 1 ? 'trip' : 'trips'}`}
      </p>

      <div className="mt-6 flex flex-col gap-3">
        {loading && (
          <>
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </>
        )}

        {!loading && error && (
          <p className="text-[15px] text-[var(--danger)]">{error}</p>
        )}

        {!loading && !error && sorted.length === 0 && (
          <EmptyState
            icon={CalendarX}
            title="No trips yet"
            message="When you book a stay it will show up here."
          />
        )}

        {!loading &&
          !error &&
          sorted.map((booking) => <TripRow key={booking.id} booking={booking} />)}
      </div>
    </div>
  )
}

function TripRow({ booking }) {
  const nights = countNights(booking.checkInDate, booking.checkOutDate)
  const badge = badgeLooks[booking.bookingStatus] || badgeLooks.CANCELLED

  return (
    <Link
      to={`/trips/${booking.id}`}
      className="flex flex-col gap-3 rounded-[var(--r-lg)] border border-[var(--line)] bg-[var(--surface)] p-4 no-underline transition-colors duration-150 hover:bg-[var(--surface-2)] sm:flex-row sm:items-center sm:gap-4"
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-[var(--ink)]">
            {booking.checkInDate} – {booking.checkOutDate}
          </span>
          <span
            className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${badge}`}
          >
            {formatStatus(booking.bookingStatus)}
          </span>
        </div>
        <p className="mt-1 text-sm text-[var(--muted)]">
          {nights} {nights === 1 ? 'night' : 'nights'} · {booking.roomsCount}{' '}
          {booking.roomsCount === 1 ? 'room' : 'rooms'} ·{' '}
          <span className="mono">NST-{booking.id}</span>
        </p>
      </div>

      <div className="nums shrink-0 text-left font-bold sm:text-right">
        {rupees.format(booking.amount)}
      </div>
    </Link>
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