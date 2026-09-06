import { Link } from 'react-router-dom'
import { Star } from 'lucide-react'

const rupees = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})

export default function HotelCard({ hotel, price, search = '' }) {
  const photo = hotel.photos?.[0]
  const amenities = hotel.amenities?.slice(0, 3).join(', ')
  const extra = hotel.amenities?.length > 3 ? ` +${hotel.amenities.length - 3}` : ''

  return (
    <Link
      to={`/hotels/${hotel.id}${search}`}
      className="group block overflow-hidden rounded-[var(--r-lg)] border border-[var(--line)] bg-[var(--surface)] no-underline transition-transform duration-200 hover:-translate-y-0.5"
    >
      <div className="h-[180px] overflow-hidden bg-[var(--surface-2)]">
        {photo ? (
          <img
            src={photo}
            alt={`${hotel.name} in ${hotel.city}`}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-[var(--muted)]">
            No photo
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="m-0 truncate text-[17px] font-semibold text-[var(--ink)]">
            {hotel.name}
          </h3>
          {hotel.rating && (
            <span className="flex shrink-0 items-center gap-1 text-sm font-semibold text-[var(--ink)]">
              <Star size={14} className="text-[var(--accent)]" fill="currentColor" />
              {hotel.rating}
            </span>
          )}
        </div>

        <p className="mt-1 truncate text-sm text-[var(--muted)]">
          {hotel.city}
          {amenities ? ` · ${amenities}${extra}` : ''}
        </p>

        <div className="mt-3 flex items-baseline gap-1.5">
          <span className="nums text-xl font-bold text-[var(--ink)]">
            {price != null ? rupees.format(price) : '—'}
          </span>
          <span className="text-sm text-[var(--muted)]">per night</span>
        </div>
      </div>
    </Link>
  )
}