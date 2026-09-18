import { useEffect, useRef, useState } from 'react'

export function useCountdown(seconds) {
  const [left, setLeft] = useState(seconds ?? null)
  const onZero = useRef(null)

  useEffect(() => {
    if (seconds == null) return
    setLeft(seconds)
  }, [seconds])

  useEffect(() => {
    if (left <= 0) return

    const tick = setInterval(() => {
      setLeft((value) => (value <= 1 ? 0 : value - 1))
    }, 1000)

    return () => clearInterval(tick)
  }, [left > 0])

  useEffect(() => {
    if (left === 0 && onZero.current) {
      onZero.current()
    }
  }, [left])

  return {
    left,
    expired: left !== null && left <= 0,
    label: left === null ? '--:--' : formatClock(left),
    onExpire: (fn) => {
      onZero.current = fn
    },
  }
}

function formatClock(total) {
  if (total <= 0) return '00:00'
  const minutes = Math.floor(total / 60)
  const seconds = total % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}