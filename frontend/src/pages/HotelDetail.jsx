import { useEffect, useState } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { Wifi, Waves, Coffee, Car, Star, ImageOff } from 'lucide-react'
import { getHotel, initBooking, readError } from '../lib/api'
import { useAuth } from '../lib/useAuth'
import { useToast } from '../lib/useToast'
import Button from '../components/Button'
import { Skeleton } from '../components/Skeleton'

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
  const [reserving, setReserving] = useState(false)
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

  async function reserve() {
    if (!signedIn) {
      const here = `/hotels/${hotelId}?${params}`
      navigate(`/login?next=${encodeURIComponent(here)}`)
      return
    }

    if (reserving) return
    if (!pickedRoom) return

    setReserving(true)
    try {
      const booking = await initBooking({
        hotelId: Number(hotelId),
        roomId: pickedRoom.id,
        checkInDate: from,
        checkOutDate: to,
        roomsCount: Number(guests),
      })
      navigate(`/checkout/${booking.id}`)
    } catch (err) {
      toast.error(readError(err, 'Could not hold this room. Please try again.'))
      setReserving(false)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6 sm:py-8">
        <Skeleton className="h-[220px] w-full sm:h-[320px]" />
        <Skeleton className="mt-6 h-8 w-1/3" />
        <Skeleton className="mt-3 h-4 w-1/4" />
        <Skeleton className="mt-8 h-24 w-full" />
        <Skeleton className="mt-3 h-24 w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-[1200px] px-4 py-16 text-center sm:px-6">
        <p className="m-0 text-[15px] text-[var(--ink-2)]">{error}</p>
        <div className="mt-4">
          <Button variant="secondary" onClick={() => window.location.reload()}>
            Try again
          </Button>
        </div>
      </div>
    )
  }

  const canReserve = Boolean(pickedRoom) && nights > 0

  return (
    <div className="mx-auto max-w-[1200px] px-4 pb-28 pt-6 sm:px-6 sm:pb-8 sm:pt-8">
      <div className="flex h-[220px] items-center justify-center overflow-hidden rounded-[var(--r-xl)] bg-[#1B3557] sm:h-[320px]">
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

      <div className="mt-6 flex flex-col gap-8 sm:mt-8 sm:gap-10 lg:flex-row">
        <div className="flex-1">
          <h1 className="m-0 text-2xl font-bold tracking-tight sm:text-3xl">
            {hotel?.name}
          </h1>
          <p className="mt-2 text-sm text-[var(--ink-2)]">
            <Star size={14} className="mr-1 inline text-[var(--accent)]" fill="currentColor" />
            <span className="font-semibold text-[var(--ink)]">{hotel?.rating || '4.5'}</span>
            {' · '}
            {hotel?.city}
          </p>

          {hotel?.amenities?.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-5 border-b border-[var(--line)] pb-5 sm:mt-6 sm:gap-6 sm:pb-6">
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

          <h2 className="mt-6 text-lg font-bold sm:mt-8 sm:text-xl">Choose your room</h2>

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

        {/* Desktop price box — hidden on mobile, replaced by the fixed bar below */}
        <aside className="hidden w-full lg:block lg:w-[320px]">
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
              disabled={!canReserve}
              loading={reserving}
              onClick={reserve}
            >
              {reserving ? 'Holding your room' : 'Reserve'}
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

      {/* Mobile fixed bottom bar — hidden on desktop */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--line)] bg-[var(--surface)] px-4 py-3 shadow-[var(--shadow-3)] lg:hidden">
        <div className="mx-auto flex max-w-[1200px] items-center gap-3">
          <div className="min-w-0 flex-1">
            {pickedRoom ? (
              <>
                <div className="nums text-lg font-bold leading-tight">
                  {rupees.format(pickedRoom.basePrice)}
                  <span className="text-xs font-normal text-[var(--muted)]"> / night</span>
                </div>
                <div className="truncate text-xs text-[var(--muted)]">
                  {nights > 0
                    ? `${nights} ${nights === 1 ? 'night' : 'nights'} · ${rupees.format(
                        pickedRoom.basePrice * nights
                      )} total`
                    : 'Add dates to continue'}
                </div>
              </>
            ) : (
              <div className="text-sm text-[var(--muted)]">Pick a room to continue</div>
            )}
          </div>
          <Button
            size="lg"
            className="shrink-0"
            disabled={!canReserve}
            loading={reserving}
            onClick={reserve}
          >
            {reserving ? 'Holding' : 'Reserve'}
          </Button>
        </div>
      </div>
    </div>
  )
}

function RoomRow({ room, picked, onPick }) {
  const [photoBroken, setPhotoBroken] = useState(false)
  const photo = room.photos?.[0]

  return (
    <button
      onClick={onPick}
      className={`flex w-full items-center gap-3 rounded-[var(--r-lg)] border p-3 text-left transition-colors duration-150 sm:gap-4 sm:p-4 ${
        picked
          ? 'border-[var(--brand)] bg-[var(--brand-soft)]'
          : 'border-[var(--line)] bg-[var(--surface)] hover:bg-[var(--surface-2)]'
      }`}
    >
      <div className="flex h-14 w-16 shrink-0 items-center justify-center overflow-hidden rounded-[var(--r-md)] bg-[#1B3557] sm:h-16 sm:w-20">
        {photo && !photoBroken ? (
          <img
            src={photo}
            alt={room.type}
            onError={() => setPhotoBroken(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          <ImageOff size={16} strokeWidth={1.5} className="text-[#5C7796]" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="truncate font-semibold">{room.type}</div>
        <div className="mt-0.5 truncate text-sm text-[var(--muted)]">
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