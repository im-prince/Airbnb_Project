import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { Search } from 'lucide-react'

const cities = [
  { name: 'Jaipur', tone: '#1B3557' },
  { name: 'Goa', tone: '#9A5240' },
  { name: 'Manali', tone: '#2C4A63' },
  { name: 'Udaipur', tone: '#7C4636' },
]
function addDays(days) {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString().slice(0, 10)
}

export default function Home() {
  const navigate = useNavigate()
  const [city, setCity] = useState('')
  const [checkIn, setCheckIn] = useState(addDays(1))
  const [checkOut, setCheckOut] = useState(addDays(3))
  const [guests, setGuests] = useState(2)

  function startSearch() {
    if (!city.trim()) return
    const query = new URLSearchParams({
      city: city.trim(),
      from: checkIn,
      to: checkOut,
      guests: String(guests),
    })
    navigate(`/search?${query}`)
  }

  return (
    <div className="mx-auto max-w-[1200px] px-6">
                  <section className="relative mt-6 overflow-hidden rounded-[var(--r-xl)] bg-[#0B1B33] px-8 py-14">
        <div className="absolute -right-16 -top-12 h-72 w-72 rounded-full bg-[#132844]" />
        <div className="absolute -bottom-20 right-24 h-48 w-48 rounded-full bg-[#F0492B] opacity-[0.18]" />

        <div className="relative max-w-[520px]">
          <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[#F0492B]">
            Stays across India
          </p>
          <h1 className="mt-4 text-[40px] font-extrabold leading-[1.1] tracking-tight text-white">
            Stay somewhere worth remembering
          </h1>
          <p className="mt-4 text-[17px] leading-relaxed text-[#B4C0D0]">
            Verified homes and hotels. Honest prices, no surprises at checkout.
          </p>
        </div>
      </section>

      <div className="relative z-10 -mt-8 flex flex-wrap items-end gap-4 rounded-[var(--r-lg)] border border-[var(--line)] bg-[var(--surface)] p-4 sm:mx-14">
        <Field label="Where">
          <input
            value={city}
            onChange={(event) => setCity(event.target.value)}
            onKeyDown={(event) => event.key === 'Enter' && startSearch()}
            placeholder="Jaipur"
            className="w-full bg-transparent text-[15px] text-[var(--ink)] outline-none placeholder:text-[var(--muted)]"
          />
        </Field>

        <Field label="Check in">
          <input
            type="date"
            value={checkIn}
            onChange={(event) => setCheckIn(event.target.value)}
            className="w-full bg-transparent text-[15px] text-[var(--ink)] outline-none"
          />
        </Field>

        <Field label="Check out">
          <input
            type="date"
            value={checkOut}
            min={checkIn}
            onChange={(event) => setCheckOut(event.target.value)}
            className="w-full bg-transparent text-[15px] text-[var(--ink)] outline-none"
          />
        </Field>

        <Field label="Guests">
          <input
            type="number"
            min={1}
            max={20}
            value={guests}
            onChange={(event) => setGuests(Number(event.target.value))}
            className="w-full bg-transparent text-[15px] text-[var(--ink)] outline-none"
          />
        </Field>

        <button
          onClick={startSearch}
          aria-label="Search stays"
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--brand)] text-[var(--on-brand)] transition-colors duration-150 hover:bg-[var(--brand-hover)]"
        >
          <Search size={20} />
        </button>
      </div>

      <section className="mt-16">
        <h2 className="mb-4 text-xl font-bold">Popular right now</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {cities.map((item) => (
            <button
              key={item.name}
              onClick={() => {
                setCity(item.name)
                navigate(`/search?city=${item.name}&from=${checkIn}&to=${checkOut}&guests=${guests}`)
              }}
              style={{ backgroundColor: item.tone }}
              className="relative flex h-32 items-end rounded-[var(--r-md)] p-3 text-left text-sm font-semibold text-white transition-transform duration-200 hover:-translate-y-0.5"
            >
              {item.name}
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div className="min-w-[130px] flex-1">
      <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
        {label}
      </div>
      {children}
    </div>
  )
}