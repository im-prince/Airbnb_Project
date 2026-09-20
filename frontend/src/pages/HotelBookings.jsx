import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getHotelAdmin, getHotelBookings, readError } from '../lib/api'
import { Skeleton } from '../components/Skeleton'
import EmptyState from '../components/EmptyState'
import { ClipboardList } from 'lucide-react'

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

export default function HotelBookings() {
  const { hotelId } = useParams()

  const [hotel, setHotel] = useState(null)
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const [hotelData, bookingsData] = await Promise.all([
          getHotelAdmin(hotelId),
          getHotelBookings(hotelId),
        ])
        if (cancelled) return
        setHotel(hotelData)
        setBookings(bookingsData || [])
      } catch (err) {
        if (cancelled) return
        setError(readError(err, 'Could not load bookings.'))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [hotelId])

  if (loading) {
    return (
      <div className="mx-auto max-w-[900px] px-4 py-6 sm:px-6 sm:py-10">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="mt-6 h-64 w-full" />
      </div>
    )
  }

  const sorted = [...bookings].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  )

  return (
    <div className="mx-auto max-w-[900px] px-4 py-6 sm:px-6 sm:py-10">
      <Link to="/manager" className="text-sm text-[var(--muted)] no-underline hover:text-[var(--ink)]">
        ← Back to your hotels
      </Link>

      <h1 className="mt-4 text-2xl font-bold tracking-tight">
        {hotel ? `${hotel.name} — Bookings` : 'Bookings'}
      </h1>
      <p className="mt-1 text-sm text-[var(--muted)]">
        {sorted.length} {sorted.length === 1 ? 'booking' : 'bookings'} total
      </p>

      <div className="mt-6">
        {error && <p className="text-[15px] text-[var(--danger)]">{error}</p>}

        {!error && sorted.length === 0 && (
          <EmptyState
            icon={ClipboardList}
            title="No bookings yet"
            message="Bookings for this hotel will show up here once guests start reserving rooms."
          />
        )}

        {!error && sorted.length > 0 && (
          <div className="overflow-x-auto rounded-[var(--r-lg)] border border-[var(--line)]">
            <table className="w-full min-w-[640px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-[var(--line)] bg-[var(--surface-2)] text-left">
                  <th className="px-3 py-2 font-semibold text-[var(--ink-2)]">Reference</th>
                  <th className="px-3 py-2 font-semibold text-[var(--ink-2)]">Room type</th>
                  <th className="px-3 py-2 font-semibold text-[var(--ink-2)]">Check in</th>
                  <th className="px-3 py-2 font-semibold text-[var(--ink-2)]">Check out</th>
                  <th className="px-3 py-2 font-semibold text-[var(--ink-2)]">Rooms</th>
                  <th className="px-3 py-2 font-semibold text-[var(--ink-2)]">Status</th>
                  <th className="px-3 py-2 font-semibold text-[var(--ink-2)]">Amount</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((booking) => (
                  <tr key={booking.id} className="border-b border-[var(--line)] last:border-0">
                    <td className="mono px-3 py-2 text-[var(--ink)]">NST-{booking.id}</td>
                    <td className="px-3 py-2 text-[var(--ink)]">{booking.roomType || '—'}</td>
                    <td className="px-3 py-2 text-[var(--ink)]">{booking.checkInDate}</td>
                    <td className="px-3 py-2 text-[var(--ink)]">{booking.checkOutDate}</td>
                    <td className="nums px-3 py-2 text-[var(--muted)]">{booking.roomsCount}</td>
                    <td className="px-3 py-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                          badgeLooks[booking.bookingStatus] || badgeLooks.CANCELLED
                        }`}
                      >
                        {formatStatus(booking.bookingStatus)}
                      </span>
                    </td>
                    <td className="nums px-3 py-2 font-semibold text-[var(--ink)]">
                      {rupees.format(booking.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function formatStatus(status) {
  return status.replace(/_/g, ' ').toLowerCase().replace(/^\w/, (c) => c.toUpperCase())
}