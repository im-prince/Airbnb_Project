import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SearchX } from 'lucide-react'
import { searchHotels, readError } from '../lib/api'
import HotelCard from '../components/HotelCard'
import { HotelGridSkeleton } from '../components/Skeleton'
import EmptyState from '../components/EmptyState'
import Button from '../components/Button'

export default function SearchResults() {
  const [params, setParams] = useSearchParams()
  const [results, setResults] = useState([])
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const city = params.get('city') || ''
  const from = params.get('from') || ''
  const to = params.get('to') || ''
  const guests = params.get('guests') || '1'
  const page = Number(params.get('page') || 0)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError('')
      try {
        const data = await searchHotels({ city, from, to, guests, page })
        if (cancelled) return
        setResults(data.content || [])
        setTotal(data.totalElements || 0)
        setPages(data.totalPages || 0)
      } catch (err) {
        if (cancelled) return
        setError(readError(err, 'Could not load stays.'))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [city, from, to, guests, page])

  function goToPage(next) {
    params.set('page', String(next))
    setParams(params)
    window.scrollTo({ top: 0 })
  }

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-8">
      <h1 className="m-0 text-2xl font-bold" aria-live="polite">
        {loading ? 'Searching…' : `${total} ${total === 1 ? 'stay' : 'stays'} in ${city}`}
      </h1>
      <p className="mt-1 text-sm text-[var(--muted)]">
        {from} to {to} · {guests} {guests === '1' ? 'guest' : 'guests'}
      </p>

      <div className="mt-6">
        {loading && <HotelGridSkeleton />}

        {!loading && error && (
          <div className="rounded-[var(--r-lg)] border border-[var(--line)] bg-[var(--surface)] p-8 text-center">
            <p className="m-0 text-[15px] text-[var(--ink-2)]">{error}</p>
            <div className="mt-4">
              <Button variant="secondary" onClick={() => goToPage(page)}>
                Try again
              </Button>
            </div>
          </div>
        )}

        {!loading && !error && results.length === 0 && (
          <EmptyState
            icon={SearchX}
            title="No stays match"
            message="Try widening your dates or searching a different city."
          />
        )}

        {!loading && !error && results.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((item) => (
              <HotelCard
                key={item.hotel?.id ?? item.id}
                hotel={item.hotel ?? item}
                price={item.price}
                search={`?${params}`}
              />
            ))}
          </div>
        )}
      </div>

      {!loading && !error && pages > 1 && (
        <div className="mt-10 flex justify-center gap-2">
          {Array.from({ length: pages }, (_, index) => (
            <button
              key={index}
              onClick={() => goToPage(index)}
              aria-current={index === page ? 'page' : undefined}
              className={`h-10 w-10 rounded-[var(--r-md)] text-sm font-semibold transition-colors duration-150 ${
                index === page
                  ? 'bg-[var(--brand)] text-[var(--on-brand)]'
                  : 'border border-[var(--line)] text-[var(--ink-2)] hover:bg-[var(--surface-2)]'
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}