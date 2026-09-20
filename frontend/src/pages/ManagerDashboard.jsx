import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Building2 } from 'lucide-react'
import { getMyHotels, activateHotel, readError } from '../lib/api'
import Button from '../components/Button'
import { Skeleton } from '../components/Skeleton'
import EmptyState from '../components/EmptyState'

export default function ManagerDashboard() {
  const [hotels, setHotels] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activatingId, setActivatingId] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const data = await getMyHotels()
        if (cancelled) return
        setHotels(data || [])
      } catch (err) {
        if (cancelled) return
        setError(readError(err, 'Could not load your hotels.'))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  async function handleActivate(hotelId) {
    setActivatingId(hotelId)
    try {
      await activateHotel(hotelId)
      setHotels((list) =>
        list.map((hotel) => (hotel.id === hotelId ? { ...hotel, active: true } : hotel))
      )
    } catch (err) {
      setError(readError(err, 'Could not activate this hotel.'))
    } finally {
      setActivatingId(null)
    }
  }

  return (
    <div className="mx-auto max-w-[880px] px-4 py-6 sm:px-6 sm:py-10">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="m-0 text-2xl font-bold tracking-tight">Your hotels</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Manage your listings, rooms, and pricing.
          </p>
        </div>
        <Link to="/manager/hotels/new">
          <Button className="shrink-0">
            <Plus size={16} className="mr-1 inline" /> Add hotel
          </Button>
        </Link>
      </div>

      <div className="mt-6 flex flex-col gap-3">
        {loading && (
          <>
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </>
        )}

        {!loading && error && <p className="text-[15px] text-[var(--danger)]">{error}</p>}

        {!loading && !error && hotels.length === 0 && (
          <EmptyState
            icon={Building2}
            title="No hotels yet"
            message="Add your first hotel to start accepting bookings."
          />
        )}

        {!loading &&
          !error &&
          hotels.map((hotel) => (
            <div
              key={hotel.id}
              className="flex flex-col gap-3 rounded-[var(--r-lg)] border border-[var(--line)] bg-[var(--surface)] p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-[var(--ink)]">{hotel.name}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                      hotel.active
                        ? 'bg-[var(--brand-soft)] text-[var(--brand)]'
                        : 'bg-[var(--surface-2)] text-[var(--muted)]'
                    }`}
                  >
                    {hotel.active ? 'Live' : 'Draft'}
                  </span>
                </div>
                <p className="mt-1 text-sm text-[var(--muted)]">{hotel.city}</p>
              </div>

              <div className="flex shrink-0 flex-wrap items-center gap-2">
                {!hotel.active && (
                  <Button
                    variant="secondary"
                    onClick={() => handleActivate(hotel.id)}
                    disabled={activatingId === hotel.id}
                  >
                    {activatingId === hotel.id ? 'Activating…' : 'Activate'}
                  </Button>
                )}
                <Link to={`/manager/hotels/${hotel.id}/rooms`}>
                  <Button variant="secondary">Rooms</Button>
                </Link>
                <Link to={`/manager/hotels/${hotel.id}/edit`}>
                  <Button variant="secondary">Edit</Button>
                </Link>
              </div>
            </div>
          ))}
      </div>
    </div>
  )
}