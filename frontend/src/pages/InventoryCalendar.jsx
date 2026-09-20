import { useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { getInventory, updateInventory, readError } from '../lib/api'
import Input from '../components/Input'
import Button from '../components/Button'
import { managerRoutes } from '../lib/managerRoutes'
import { Skeleton } from '../components/Skeleton'

const rupees = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})

function todayPlus(days) {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString().slice(0, 10)
}

function emptyBulkForm() {
  return { startDate: todayPlus(0), endDate: todayPlus(6), surgeFactor: '1', closed: false }
}

export default function InventoryCalendar() {
  const { hotelId, roomId } = useParams()

  const [inventory, setInventory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [monthIndex, setMonthIndex] = useState(0)

  const [form, setForm] = useState(emptyBulkForm())
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    loadInventory()
  }, [roomId])

  async function loadInventory() {
    setLoading(true)
    setError('')
    try {
      const data = await getInventory(roomId)
      setInventory(data || [])
    } catch (err) {
      setError(readError(err, 'Could not load inventory.'))
    } finally {
      setLoading(false)
    }
  }

  const months = useMemo(() => {
    const seen = new Map()
    for (const day of inventory) {
      const key = day.date.slice(0, 7)
      if (!seen.has(key)) seen.set(key, [])
      seen.get(key).push(day)
    }
    return Array.from(seen.entries()).map(([key, days]) => ({ key, days }))
  }, [inventory])

  const currentMonth = months[monthIndex]

  async function handleBulkSubmit(event) {
    event.preventDefault()

    if (!form.startDate || !form.endDate || form.endDate < form.startDate) {
      setSaveError('Pick a valid date range.')
      return
    }

    setSaving(true)
    setSaveError('')
    setSaved(false)

    try {
      await updateInventory(roomId, {
        startDate: form.startDate,
        endDate: form.endDate,
        surgeFactor: Number(form.surgeFactor) || 1,
        closed: form.closed,
      })
      await loadInventory()
      setSaved(true)
    } catch (err) {
      setSaveError(readError(err, 'Could not update inventory.'))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-[900px] px-4 py-6 sm:px-6 sm:py-10">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="mt-6 h-64 w-full" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[900px] px-4 py-6 sm:px-6 sm:py-10">
      <Link
        to={managerRoutes.rooms(hotelId)}
        className="text-sm text-[var(--muted)] no-underline hover:text-[var(--ink)]"
      >
        ← Back to rooms
      </Link>

      <h1 className="mt-4 text-xl font-bold tracking-tight sm:text-2xl">Pricing & availability</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">
        Update surge pricing or close a date range across this room type.
      </p>

      <form
        onSubmit={handleBulkSubmit}
        className="mt-6 rounded-[var(--r-lg)] border border-[var(--line)] bg-[var(--surface)] p-4 sm:p-6"
      >
        <h2 className="m-0 text-base font-bold">Bulk update</h2>

        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
          <Input
            label="Start date"
            type="date"
            value={form.startDate}
            onChange={(event) => setForm((f) => ({ ...f, startDate: event.target.value }))}
            className="sm:w-[180px]"
          />
          <Input
            label="End date"
            type="date"
            min={form.startDate}
            value={form.endDate}
            onChange={(event) => setForm((f) => ({ ...f, endDate: event.target.value }))}
            className="sm:w-[180px]"
          />
          <Input
            label="Surge factor"
            type="number"
            min={0.1}
            step={0.1}
            value={form.surgeFactor}
            onChange={(event) => setForm((f) => ({ ...f, surgeFactor: event.target.value }))}
            hint="1 = normal price, 1.2 = +20%"
            className="sm:w-[160px]"
          />

          <div className="flex items-end pb-1">
            <label className="flex items-center gap-2 text-sm text-[var(--ink)]">
              <input
                type="checkbox"
                checked={form.closed}
                onChange={(event) => setForm((f) => ({ ...f, closed: event.target.checked }))}
                className="h-4 w-4"
              />
              Mark these dates as closed
            </label>
          </div>
        </div>

        {saveError && <p className="mt-3 text-[15px] text-[var(--danger)]">{saveError}</p>}
        {saved && !saveError && (
          <p className="mt-3 text-[15px] text-[var(--brand)]">Updated.</p>
        )}

          <div className="mt-4 flex justify-end">
          <Button type="submit" disabled={saving} className="w-full sm:w-auto">
            {saving ? 'Updating…' : 'Apply to range'}
          </Button>
        </div>
      </form>

      <div className="mt-8">
        {error && <p className="text-[15px] text-[var(--danger)]">{error}</p>}

        {!error && months.length === 0 && (
          <p className="text-[15px] text-[var(--muted)]">
            No inventory found for this room yet.
          </p>
        )}

        {!error && currentMonth && (
          <>
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setMonthIndex((i) => Math.max(0, i - 1))}
                disabled={monthIndex === 0}
                aria-label="Previous month"
                className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--ink-2)] transition-colors duration-150 hover:bg-[var(--surface-2)] disabled:opacity-30"
              >
                <ChevronLeft size={18} />
              </button>

              <h2 className="m-0 text-base font-bold">{formatMonth(currentMonth.key)}</h2>

              <button
                type="button"
                onClick={() => setMonthIndex((i) => Math.min(months.length - 1, i + 1))}
                disabled={monthIndex === months.length - 1}
                aria-label="Next month"
                className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--ink-2)] transition-colors duration-150 hover:bg-[var(--surface-2)] disabled:opacity-30"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            <div className="mt-4 overflow-x-auto rounded-[var(--r-lg)] border border-[var(--line)]">
              <table className="w-full min-w-[560px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[var(--line)] bg-[var(--surface-2)] text-left">
                    <th className="px-3 py-2 font-semibold text-[var(--ink-2)]">Date</th>
                    <th className="px-3 py-2 font-semibold text-[var(--ink-2)]">Price</th>
                    <th className="px-3 py-2 font-semibold text-[var(--ink-2)]">Surge</th>
                    <th className="px-3 py-2 font-semibold text-[var(--ink-2)]">Booked</th>
                    <th className="px-3 py-2 font-semibold text-[var(--ink-2)]">Reserved</th>
                    <th className="px-3 py-2 font-semibold text-[var(--ink-2)]">Total</th>
                    <th className="px-3 py-2 font-semibold text-[var(--ink-2)]">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {currentMonth.days.map((day) => (
                    <tr key={day.id} className="border-b border-[var(--line)] last:border-0">
                      <td className="px-3 py-2 text-[var(--ink)]">{day.date}</td>
                      <td className="nums px-3 py-2 text-[var(--ink)]">
                        {rupees.format(day.price)}
                      </td>
                      <td className="nums px-3 py-2 text-[var(--muted)]">{day.surgeFactor}×</td>
                      <td className="nums px-3 py-2 text-[var(--muted)]">{day.bookedCount}</td>
                      <td className="nums px-3 py-2 text-[var(--muted)]">{day.reservedCount}</td>
                      <td className="nums px-3 py-2 text-[var(--muted)]">{day.totalCount}</td>
                      <td className="px-3 py-2">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                            day.closed
                              ? 'bg-[var(--danger-soft)] text-[var(--danger)]'
                              : 'bg-[var(--brand-soft)] text-[var(--brand)]'
                          }`}
                        >
                          {day.closed ? 'Closed' : 'Open'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function formatMonth(key) {
  const [year, month] = key.split('-')
  const date = new Date(Number(year), Number(month) - 1, 1)
  return date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
}