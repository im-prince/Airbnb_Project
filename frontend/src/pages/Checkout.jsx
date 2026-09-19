import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Plus, X, Clock } from 'lucide-react'
import { getBooking, addGuests, readError } from '../lib/api'
import { useCountdown } from '../lib/useCountdown'
import { useToast } from '../lib/useToast'
import Input from '../components/Input'
import Button from '../components/Button'
import Modal from '../components/Modal'
import { Skeleton } from '../components/Skeleton'

const rupees = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})

function blankGuest() {
  return { name: '', gender: 'MALE', age: '' }
}

export default function Checkout() {
  const { bookingId } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [booking, setBooking] = useState(null)
  const [guests, setGuests] = useState([blankGuest()])
  const [guestsSaved, setGuestsSaved] = useState(false)
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showExpired, setShowExpired] = useState(false)

  const timer = useCountdown(booking?.secondsUntilExpiry)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const data = await getBooking(bookingId)
        if (cancelled) return
        setBooking(data)
        if (data.guests?.length > 0) {
          setGuestsSaved(true)
        }
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
  }, [bookingId])

  useEffect(() => {
    if (timer.expired && booking && booking.bookingStatus === 'RESERVED') {
      setShowExpired(true)
    }
  }, [timer.expired, booking])

  function updateGuest(index, field, value) {
    setGuests((list) =>
      list.map((guest, i) => (i === index ? { ...guest, [field]: value } : guest))
    )
  }

  function addRow() {
    setGuests((list) => [...list, blankGuest()])
  }

  function removeRow(index) {
    setGuests((list) => list.filter((_, i) => i !== index))
  }

  async function submit(event) {
    event.preventDefault()
    if (busy) return

    const ready = guests.every((guest) => guest.name.trim() && guest.age)
    if (!ready) {
      toast.error('Please fill in every guest name and age.')
      return
    }

    setBusy(true)
    try {
      if (!guestsSaved) {
        const updated = await addGuests(
          bookingId,
          guests.map((guest) => ({
            name: guest.name.trim(),
            gender: guest.gender,
            age: Number(guest.age),
          }))
        )
        setBooking(updated)
        setGuestsSaved(true)
      }
      navigate(`/checkout/${bookingId}/pay`)
    } catch (err) {
      toast.error(readError(err, 'Could not save your guest details.'))
      setBusy(false)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-[1000px] px-4 py-6 sm:px-6 sm:py-8">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="mt-6 h-64 w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-[1000px] px-4 py-16 text-center sm:px-6">
        <p className="m-0 text-[15px] text-[var(--ink-2)]">{error}</p>
        <div className="mt-4">
          <Button variant="secondary" onClick={() => navigate('/')}>
            Back to home
          </Button>
        </div>
      </div>
    )
  }

  const nights = countNights(booking.checkInDate, booking.checkOutDate)
  const running = !timer.expired
  const lowTime = timer.left > 0 && timer.left < 120

  return (
    <div className="mx-auto max-w-[1000px] px-4 py-6 sm:px-6 sm:py-8">
      <div
        className={`flex items-center gap-2 rounded-[var(--r-md)] px-3 py-2.5 text-sm sm:px-4 sm:py-3 ${
          lowTime
            ? 'bg-[var(--danger-soft)] text-[var(--danger)]'
            : 'bg-[var(--accent-soft)] text-[var(--warning)]'
        }`}
      >
        <Clock size={16} className="shrink-0" />
        {running ? (
          <span>
            Your rooms are held for <span className="mono font-semibold">{timer.label}</span>
          </span>
        ) : (
          <span>This hold has expired.</span>
        )}
      </div>

      <div className="mt-6 flex flex-col gap-8 sm:mt-8 sm:gap-10 lg:flex-row">
        <form onSubmit={submit} className="flex-1">
          <h1 className="m-0 text-xl font-bold tracking-tight sm:text-2xl">
            Who is staying?
          </h1>
          <p className="mt-2 text-[15px] text-[var(--muted)]">
            Add the name and age of everyone on this booking.
          </p>

          <div className="mt-5 flex flex-col gap-4 sm:mt-6 sm:gap-5">
            {guests.map((guest, index) => (
              <div
                key={index}
                className="rounded-[var(--r-lg)] border border-[var(--line)] bg-[var(--surface)] p-3 sm:p-4"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                    Guest {index + 1}
                  </span>
                  {guests.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeRow(index)}
                      aria-label={`Remove guest ${index + 1}`}
                      className="flex h-8 w-8 items-center justify-center rounded-[var(--r-sm)] text-[var(--muted)] transition-colors duration-150 hover:bg-[var(--surface-2)] hover:text-[var(--danger)]"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>

                <div className="flex flex-col gap-3">
                  <Input
                    label="Full name"
                    value={guest.name}
                    onChange={(event) => updateGuest(index, 'name', event.target.value)}
                    placeholder="Prince Kumar"
                    disabled={guestsSaved || !running}
                  />

                  <div className="flex gap-3">
                    <div className="flex-1">
                      <div className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--ink-2)]">
                        Age
                      </div>
                      <input
                        type="number"
                        min={0}
                        max={120}
                        value={guest.age}
                        onChange={(event) => updateGuest(index, 'age', event.target.value)}
                        disabled={guestsSaved || !running}
                        className="h-12 w-full rounded-[var(--r-md)] border border-[var(--line)] bg-[var(--surface-2)] px-3.5 text-base text-[var(--ink)] outline-none focus:border-transparent focus:bg-[var(--surface)] focus:ring-2 focus:ring-[var(--brand)] disabled:cursor-not-allowed disabled:text-[var(--muted)] sm:text-[15px]"
                      />
                    </div>

                    <div className="flex-1">
                      <div className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--ink-2)]">
                        Gender
                      </div>
                      <select
                        value={guest.gender}
                        onChange={(event) => updateGuest(index, 'gender', event.target.value)}
                        disabled={guestsSaved || !running}
                        className="h-12 w-full rounded-[var(--r-md)] border border-[var(--line)] bg-[var(--surface-2)] px-3 text-base text-[var(--ink)] outline-none focus:border-transparent focus:bg-[var(--surface)] focus:ring-2 focus:ring-[var(--brand)] disabled:cursor-not-allowed disabled:text-[var(--muted)] sm:text-[15px]"
                      >
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {!guestsSaved && running && (
            <Button type="button" variant="ghost" onClick={addRow} className="mt-3">
              <Plus size={16} />
              Add another guest
            </Button>
          )}

          <Button
            type="submit"
            size="lg"
            className="mt-8 w-full"
            loading={busy}
            disabled={!running}
          >
            {busy ? 'Saving details' : 'Continue to payment'}
          </Button>
        </form>

        <aside className="w-full lg:w-[300px]">
          <div className="rounded-[var(--r-lg)] border border-[var(--line)] bg-[var(--surface)] p-4 sm:sticky sm:top-[88px] sm:p-5">
            <h2 className="m-0 text-base font-bold">Booking summary</h2>

            <div className="mt-4 flex flex-col gap-3 text-sm">
              <Row label="Check in" value={booking.checkInDate} />
              <Row label="Check out" value={booking.checkOutDate} />
              <Row label="Nights" value={String(nights)} />
              <Row label="Rooms" value={String(booking.roomsCount)} />
              <Row label="Reference" value={`NST-${booking.id}`} mono />
            </div>

            <div className="mt-4 flex items-baseline justify-between border-t border-[var(--line)] pt-4">
              <span className="font-bold">Total</span>
              <span className="nums text-lg font-bold">{rupees.format(booking.amount)}</span>
            </div>
          </div>
        </aside>
      </div>

      <Modal
        open={showExpired}
        onClose={() => navigate('/')}
        title="This hold has expired"
        footer={<Button onClick={() => navigate('/')}>Search again</Button>}
      >
        Your rooms were held for ten minutes and that window has closed. The rooms
        are back in the pool, so you'll need to start a new booking.
      </Modal>
    </div>
  )
}

function Row({ label, value, mono = false }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-[var(--muted)]">{label}</span>
      <span className={mono ? 'mono text-[var(--ink)]' : 'text-[var(--ink)]'}>{value}</span>
    </div>
  )
}

function countNights(from, to) {
  if (!from || !to) return 0
  const days = Math.round((new Date(to) - new Date(from)) / 86400000)
  return days > 0 ? days : 0
}