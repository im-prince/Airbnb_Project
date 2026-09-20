import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getHotelAdmin, getHotelReport, readError } from '../lib/api'
import Input from '../components/Input'
import Button from '../components/Button'
import { Skeleton } from '../components/Skeleton'
import { managerRoutes } from '../lib/managerRoutes'

const rupees = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})

export default function RevenueReport() {
  const { hotelId } = useParams()

  const [hotel, setHotel] = useState(null)
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const [hotelData, reportData] = await Promise.all([
          getHotelAdmin(hotelId),
          getHotelReport(hotelId),
        ])
        if (cancelled) return
        setHotel(hotelData)
        setReport(reportData)
      } catch (err) {
        if (cancelled) return
        setError(readError(err, 'Could not load the report.'))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [hotelId])

  async function handleFilter(event) {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      const data = await getHotelReport(hotelId, {
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      })
      setReport(data)
    } catch (err) {
      setError(readError(err, 'Could not load the report.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-[760px] px-4 py-6 sm:px-6 sm:py-10">
      <Link to={managerRoutes.dashboard} className="text-sm text-[var(--muted)] no-underline hover:text-[var(--ink)]">
        ← Back to your hotels
      </Link>

      <h1 className="mt-4 text-xl font-bold tracking-tight sm:text-2xl">
        {hotel ? `${hotel.name} — Revenue` : 'Revenue'}
      </h1>
      <p className="mt-1 text-sm text-[var(--muted)]">
        Leave dates empty to see the last month by default.
      </p>

      <form
        onSubmit={handleFilter}
        className="mt-6 flex flex-col gap-4 rounded-[var(--r-lg)] border border-[var(--line)] bg-[var(--surface)] p-4 sm:flex-row sm:items-end sm:p-5"
      >
        <Input
          label="Start date"
          type="date"
          value={startDate}
          onChange={(event) => setStartDate(event.target.value)}
          className="sm:w-[200px]"
        />
        <Input
          label="End date"
          type="date"
          min={startDate}
          value={endDate}
          onChange={(event) => setEndDate(event.target.value)}
          className="sm:w-[200px]"
        />
        <Button type="submit" disabled={loading} className="w-full sm:w-auto">
          {loading ? 'Loading…' : 'Apply'}
        </Button>
      </form>

      <div className="mt-6">
        {error && <p className="text-[15px] text-[var(--danger)]">{error}</p>}

        {loading && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        )}

        {!loading && !error && report && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard label="Confirmed bookings" value={String(report.bookingCount)} />
            <StatCard label="Total revenue" value={rupees.format(report.totalRevenue)} />
            <StatCard label="Average per booking" value={rupees.format(report.avgRevenue)} />
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-[var(--r-lg)] border border-[var(--line)] bg-[var(--surface)] p-4">
      <p className="m-0 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
        {label}
      </p>
      <p className="nums mt-2 text-2xl font-bold text-[var(--ink)]">{value}</p>
    </div>
  )
}