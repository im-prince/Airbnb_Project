import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { Search } from 'lucide-react'

const cities = [
  { name: 'Jaipur', tone: '#1B3557', photo: 'https://images.unsplash.com/photo-1545126178-862cdb469409?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fGphaXB1cnxlbnwwfHwwfHx8MA%3D%3D' },
  { name: 'Goa', tone: '#9A5240', photo: 'https://plus.unsplash.com/premium_photo-1697729701846-e34563b06d47?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8Z29hfGVufDB8fDB8fHww' },
  { name: 'Manali', tone: '#2C4A63', photo: 'https://images.unsplash.com/photo-1594102552386-793e5a27ad10?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { name: 'Udaipur', tone: '#7C4636', photo: 'https://images.unsplash.com/photo-1695956353120-54ce5e91632b?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8dWRhaXB1cnxlbnwwfHwwfHx8MA%3D%3D' },
  { name: 'Mumbai', tone: '#3E5C4A', photo: '' },
  { name: 'Rishikesh', tone: '#5A4A7C', photo: '' },
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
    <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
      <section className="relative mt-4 overflow-hidden rounded-[var(--r-xl)] bg-[#0B1B33] px-5 py-10 sm:mt-6 sm:px-8 sm:py-14">
        <div className="absolute -right-16 -top-12 h-72 w-72 rounded-full bg-[#132844]" />
        <div className="absolute -bottom-20 right-24 h-48 w-48 rounded-full bg-[#F0492B] opacity-[0.18]" />

        <div className="relative max-w-[520px]">
          <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#F0492B] sm:text-xs">
            Stays across India
          </p>
          <h1 className="mt-3 text-[28px] font-extrabold leading-[1.15] tracking-tight text-white sm:mt-4 sm:text-[40px] sm:leading-[1.1]">
            Stay somewhere worth remembering
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-[#B4C0D0] sm:mt-4 sm:text-[17px]">
            Verified homes and hotels. Honest prices, no surprises at checkout.
          </p>
        </div>
      </section>

      <div className="relative z-10 -mt-6 flex flex-col gap-3 rounded-[var(--r-lg)] border border-[var(--line)] bg-[var(--surface)] p-4 sm:-mt-8 sm:mx-14 sm:flex-row sm:flex-wrap sm:items-end sm:gap-4">
        <Field label="Where">
          <input
            value={city}
            onChange={(event) => setCity(event.target.value)}
            onKeyDown={(event) => event.key === 'Enter' && startSearch()}
            placeholder="Jaipur"
            className="h-11 w-full bg-transparent text-base text-[var(--ink)] outline-none placeholder:text-[var(--muted)] sm:h-auto sm:text-[15px]"
          />
        </Field>

        <div className="flex gap-3 sm:contents">
          <Field label="Check in">
            <input
              type="date"
              value={checkIn}
              onChange={(event) => setCheckIn(event.target.value)}
              className="h-11 w-full bg-transparent text-base text-[var(--ink)] outline-none sm:h-auto sm:text-[15px]"
            />
          </Field>

          <Field label="Check out">
            <input
              type="date"
              value={checkOut}
              min={checkIn}
              onChange={(event) => setCheckOut(event.target.value)}
              className="h-11 w-full bg-transparent text-base text-[var(--ink)] outline-none sm:h-auto sm:text-[15px]"
            />
          </Field>
        </div>

        <div className="flex items-end gap-3 sm:contents">
          <Field label="Guests">
            <input
              type="number"
              min={1}
              max={20}
              value={guests}
              onChange={(event) => setGuests(Number(event.target.value))}
              className="h-11 w-full bg-transparent text-base text-[var(--ink)] outline-none sm:h-auto sm:text-[15px]"
            />
          </Field>

          <button
            onClick={startSearch}
            aria-label="Search stays"
            className="flex h-11 shrink-0 items-center justify-center gap-2 rounded-[var(--r-md)] bg-[var(--brand)] px-5 text-sm font-semibold text-[var(--on-brand)] transition-colors duration-150 hover:bg-[var(--brand-hover)] sm:h-12 sm:w-12 sm:rounded-full sm:px-0"
          >
            <Search size={18} />
            <span className="sm:hidden">Search</span>
          </button>
        </div>
      </div>

      <section className="mt-10 sm:mt-16">
        <h2 className="mb-4 text-lg font-bold sm:text-xl">Popular right now</h2>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-4">
          {cities.map((item) => (
  <button
    key={item.name}
    onClick={() => {
      setCity(item.name)
      navigate(`/search?city=${item.name}&from=${checkIn}&to=${checkOut}&guests=${guests}`)
    }}
    style={{
      backgroundColor: item.tone,
      backgroundImage: item.photo ? `url(${item.photo})` : undefined,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }}
    className="relative flex h-24 items-end overflow-hidden rounded-[var(--r-md)] p-3 text-left text-sm font-semibold text-white transition-transform duration-200 hover:-translate-y-0.5 sm:h-32"
  >
    {item.photo && (
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
    )}
    <span className="relative">{item.name}</span>
  </button>
    ))}
        </div>
      </section>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div className="min-w-0 flex-1">
      <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
        {label}
      </div>
      {children}
    </div>
  )
}