import { useEffect, useState } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { Wifi, Waves, Coffee, Car, Star, ImageOff } from 'lucide-react'
import { getHotel, readError } from '../lib/api'
import { useAuth } from '../lib/useAuth'
import Button from '../components/Button'
import { Skeleton } from '../components/Skeleton'
import { useToast } from '../lib/useToast'

const rupees = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})

const amenityIcons = {
  'wi-fi': Wifi,
  wifi: Wifi,
  pool: Waves,
  breakfast: Coffee,
  parking: Car,
}

export default function HotelDetail() {
  const { hotelId } = useParams()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { signedIn } = useAuth()
  const { toast } = useToast()

  const [info, setInfo] = useState(null)
  const [pickedRoom, setPickedRoom] = useState(null)
  const [photoBroken, setPhotoBroken] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const from = params.get('from') || ''
  const to = params.get('to') || ''
  const guests = params.get('guests') || '1'

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError('')
      try {
        const data = await getHotel(hotelId)
        if (cancelled) return
        setInfo(data)
      } catch (err) {
        if (cancelled) return
        setError(readError(err, 'Could not load this stay.'))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [hotelId])

  const hotel = info?.hotel
  const rooms = info?.rooms || []
  const nights = countNights(from, to)

  function reserve() {
    if (!signedIn) {
      const here = `/hotels/${hotelId}?${params}`
      navigate(`/login?next=${encodeURIComponent(here)}`)
      return
    }
    toast.success('Room held. Booking flow comes next.')
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-[1200px] px-6 py-8">
        <Skeleton className="h-[320px] w-full" />
        <Skeleton className="mt-6 h-8 w-1/3" />
        <Skeleton className="mt-3 h-4 w-1/4" />
        <Skeleton className="mt-8 h-24 w-full" />
        <Skeleton className="mt-3 h-24 w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-[1200px] px-6 py-16 text-center">
        <p className="m-0 text-[15px] text-[var(--ink-2)]">{error}</p>
        <div className="mt-4">
          <Button variant="secondary" onClick={() => window.location.reload()}>
            Try again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-8">
      <div className="flex h-[320px] items-center justify-center overflow-hidden rounded-[var(--r-xl)] bg-[#1B3557]">
        {hotel?.photos?.[0] && !photoBroken ? (
          <img
            src={hotel.photos[0]}
            alt={`${hotel.name} in ${hotel.city}`}
            onError={() => setPhotoBroken(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-[#5C7796]">
            <ImageOff size={32} strokeWidth={1.5} />
            <span className="text-sm">No photo yet</span>
          </div>
        )}
      </div>

      <div className="mt-8 flex flex-col gap-10 lg:flex-row">
        <div className="flex-1">
          <h1 className="m-0 text-3xl font-bold tracking-tight">{hotel?.name}</h1>
          <p className="mt-2 text-sm text-[var(--ink-2)]">
            <Star size={14} className="mr-1 inline text-[var(--accent)]" fill="currentColor" />
            <span className="font-semibold text-[var(--ink)]">{hotel?.rating || '4.5'}</span>
            {' · '}
            {hotel?.city}
          </p>

          {hotel?.amenities?.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-6 border-b border-[var(--line)] pb-6">
              {hotel.amenities.slice(0, 6).map((item) => {
                const Icon = amenityIcons[String(item).toLowerCase()] || Star
                return (
                  <div key={item} className="text-center text-xs text-[var(--ink-2)]">
                    <Icon size={20} className="mx-auto text-[var(--brand)]" />
                    <div className="mt-1.5">{item}</div>
                  </div>
                )
              })}
            </div>
          )}

          <h2 className="mt-8 text-xl font-bold">Choose your room</h2>

          {rooms.length === 0 && (
            <p className="mt-3 text-[15px] text-[var(--muted)]">
              No rooms listed for this stay yet.
            </p>
          )}

          <div className="mt-4 flex flex-col gap-3">
            {rooms.map((room) => (
              <RoomRow
                key={room.id}
                room={room}
                picked={pickedRoom?.id === room.id}
                onPick={() => setPickedRoom(room)}
              />
            ))}
          </div>
        </div>

        <aside className="w-full lg:w-[320px]">
          <div className="sticky top-[88px] rounded-[var(--r-lg)] border border-[var(--line)] bg-[var(--surface)] p-5">
            <div className="flex items-baseline gap-1.5">
              <span className="nums text-2xl font-bold">
                {pickedRoom ? rupees.format(pickedRoom.basePrice) : '—'}
              </span>
              <span className="text-sm text-[var(--muted)]">per night</span>
            </div>

            <div className="mt-4 rounded-[var(--r-md)] border border-[var(--line)] text-sm">
              <div className="flex border-b border-[var(--line)]">
                <div className="flex-1 border-r border-[var(--line)] p-3">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
                    Check in
                  </div>
                  <div className="mt-0.5">{from || 'Add dates'}</div>
                </div>
                <div className="flex-1 p-3">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
                    Check out
                  </div>
                  <div className="mt-0.5">{to || 'Add dates'}</div>
                </div>
              </div>
              <div className="p-3">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
                  Guests
                </div>
                <div className="mt-0.5">{guests} guests</div>
              </div>
            </div>

            {pickedRoom && nights > 0 && (
              <div className="mt-4 flex justify-between border-t border-[var(--line)] pt-4 text-base font-bold">
                <span>Total</span>
                <span className="nums">{rupees.format(pickedRoom.basePrice * nights)}</span>
              </div>
            )}

            <Button
              size="lg"
              className="mt-4 w-full"
              disabled={!pickedRoom || nights < 1}
              onClick={reserve}
            >
              Reserve
            </Button>

            <p className="mt-3 text-center text-xs text-[var(--muted)]">
              {!pickedRoom
                ? 'Pick a room to continue'
                : nights < 1
                ? 'Add dates to continue'
                : "You won't be charged yet"}
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}

function RoomRow({ room, picked, onPick }) {
  return (
    <button
      onClick={onPick}
      className={`flex w-full items-center gap-4 rounded-[var(--r-lg)] border p-4 text-left transition-colors duration-150 ${
        picked
          ? 'border-[var(--brand)] bg-[var(--brand-soft)]'
          : 'border-[var(--line)] bg-[var(--surface)] hover:bg-[var(--surface-2)]'
      }`}
    >
      <div className="h-16 w-20 shrink-0 rounded-[var(--r-md)] bg-[#1B3557]" />

      <div className="min-w-0 flex-1">
        <div className="font-semibold">{room.type}</div>
        <div className="mt-0.5 text-sm text-[var(--muted)]">
          Sleeps {room.capacity} · {room.totalCount} rooms
        </div>

        {room.amenities?.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {room.amenities.map((item) => (
              <span
                key={item}
                className="rounded-[var(--r-sm)] bg-[var(--surface-2)] px-2 py-0.5 text-xs text-[var(--ink-2)]"
              >
                {item}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="shrink-0 text-right">
        <div className="nums font-bold">{rupees.format(room.basePrice)}</div>
        <div className="text-xs text-[var(--muted)]">per night</div>
      </div>
    </button>
  )
}

function countNights(from, to) {
  if (!from || !to) return 0
  const start = new Date(from)
  const end = new Date(to)
  const days = Math.round((end - start) / 86400000)
  return days > 0 ? days : 0
}