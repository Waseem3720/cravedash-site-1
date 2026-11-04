import { useEffect, useState } from 'react'

/**
 * useState that is persisted to localStorage (and survives reloads).
 * Reads are wrapped in try/catch so private-mode browsers never crash the app.
 */
export default function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const raw = window.localStorage.getItem(key)
      if (raw !== null) return JSON.parse(raw)
    } catch {
      /* ignore malformed / blocked storage */
    }
    return typeof initialValue === 'function' ? initialValue() : initialValue
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      /* ignore quota errors */
    }
  }, [key, value])

  return [value, setValue]
}
