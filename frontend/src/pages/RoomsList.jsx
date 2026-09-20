import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Plus, BedDouble, Pencil, Trash2 } from 'lucide-react'
import { getHotelAdmin, getRooms, deleteRoom, readError } from '../lib/api'
import Button from '../components/Button'
import { Skeleton } from '../components/Skeleton'
import EmptyState from '../components/EmptyState'

const rupees = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})

export default function RoomsList() {
  const { hotelId } = useParams()

  const [hotel, setHotel] = useState(null)
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const [hotelData, roomsData] = await Promise.all([
          getHotelAdmin(hotelId),
          getRooms(hotelId),
        ])
        if (cancelled) return
        setHotel(hotelData)
        setRooms(roomsData || [])
      } catch (err) {
        if (cancelled) return
        setError(readError(err, 'Could not load rooms.'))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [hotelId])

  async function handleDelete(roomId) {
    if (!window.confirm('Delete this room type? This cannot be undone.')) return

    setDeletingId(roomId)
    try {
      await deleteRoom(hotelId, roomId)
      setRooms((list) => list.filter((room) => room.id !== roomId))
    } catch (err) {
      setError(readError(err, 'Could not delete this room.'))
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-[880px] px-4 py-6 sm:px-6 sm:py-10">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="mt-6 h-40 w-full" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[880px] px-4 py-6 sm:px-6 sm:py-10">
      <Link to="/manager" className="text-sm text-[var(--muted)] no-underline hover:text-[var(--ink)]">
        ← Back to your hotels
      </Link>

      <div className="mt-4 flex items-center justify-between gap-3">
        <div>
          <h1 className="m-0 text-2xl font-bold tracking-tight">
            {hotel ? `${hotel.name} — Rooms` : 'Rooms'}
          </h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Manage room types, pricing, and capacity.
          </p>
        </div>
        <Link to={`/manager/hotels/${hotelId}/rooms/new`}>
          <Button className="shrink-0">
            <Plus size={16} className="mr-1 inline" /> Add room
          </Button>
        </Link>
      </div>

      <div className="mt-6 flex flex-col gap-3">
        {error && <p className="text-[15px] text-[var(--danger)]">{error}</p>}

        {!error && rooms.length === 0 && (
          <EmptyState
            icon={BedDouble}
            title="No rooms yet"
            message="Add a room type to start accepting bookings for this hotel."
          />
        )}

        {!error &&
          rooms.map((room) => (
            <div
              key={room.id}
              className="flex flex-col gap-3 rounded-[var(--r-lg)] border border-[var(--line)] bg-[var(--surface)] p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="m-0 font-semibold text-[var(--ink)]">{room.type}</p>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  {rupees.format(room.basePrice)} / night · {room.capacity}{' '}
                  {room.capacity === 1 ? 'guest' : 'guests'} · {room.totalCount}{' '}
                  {room.totalCount === 1 ? 'room' : 'rooms'}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <Link to={`/manager/hotels/${hotelId}/rooms/${room.id}/inventory`}>
                  <Button variant="secondary">Pricing</Button>
                </Link>
                <Link to={`/manager/hotels/${hotelId}/rooms/${room.id}/edit`}>
                  <Button variant="secondary">
                    <Pencil size={14} className="mr-1 inline" /> Edit
                  </Button>
                </Link>
                <button
                  onClick={() => handleDelete(room.id)}
                  disabled={deletingId === room.id}
                  aria-label={`Delete ${room.type}`}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[var(--danger)] transition-colors duration-150 hover:bg-[var(--danger-soft)] disabled:opacity-50"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
      </div>
    </div>
  )
}