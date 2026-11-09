import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/layout/Header'
import SlotPicker from '../components/booking/SlotPicker'
import TablePicker from '../components/booking/TablePicker'
import BookingConfirmation from '../components/booking/BookingConfirmation'
import useLocalStorage from '../hooks/useLocalStorage'
import { bookingConfig, demoTables } from '../data/bookingConfig'
import { defaults, normalize, parts, tableFor, slots as buildSlots } from '../utils/bookingRules'
import { isApiConfigured } from '../api/client'
import {
  createReservation,
  getReservationAvailability,
  getReservationSettings,
  getReservationTables
} from '../api/reservations'
import { useAuth } from '../context/AuthContext'
import { useUI } from '../context/UIContext'

const PHONE_RE = /^\+?[\d\s()-]{7,25}$/

const initialStore = {
  reservation_settings: defaults,
  tables: demoTables,
  bookings: []
}

function addDays(dateString, days) {
  return new Date(Date.parse(`${dateString}T12:00Z`) + days * 864e5).toISOString().slice(0, 10)
}

export default function BookingPage() {
  const [store, setStore] = useLocalStorage(bookingConfig.storageKey, initialStore)
  const [date, setDate] = useState('')
  const [guests, setGuests] = useState(2)
  const [selectedTime, setSelectedTime] = useState('')
  const [selectedTableId, setSelectedTableId] = useState(null)
  const [details, setDetails] = useState({ name: '', phone: '', email: '', notes: '', consent: false })
  const [error, setError] = useState('')
  const [confirmation, setConfirmation] = useState(null)

  // With the API on, the restaurant's rules, free times and bookings come from the server.
  const apiMode = isApiConfigured()
  const { isSignedIn } = useAuth()
  const { openAuth } = useUI()
  const [liveSettings, setLiveSettings] = useState(null)
  const [liveSlots, setLiveSlots] = useState([])
  const [liveTables, setLiveTables] = useState([])
  const [loadingTables, setLoadingTables] = useState(false)
  const [slotsError, setSlotsError] = useState(false)
  const [slotsVersion, setSlotsVersion] = useState(0)
  const [busy, setBusy] = useState(false)
  const [checkingTime, setCheckingTime] = useState('')
  const [unavailableSlots, setUnavailableSlots] = useState([])
  const [slotStatusInfo, setSlotStatusInfo] = useState('')

  const settings = useMemo(() => {
    if (apiMode) return liveSettings || normalize(defaults)
    try {
      return normalize(store.reservation_settings || defaults)
    } catch {
      return normalize(defaults)
    }
  }, [store, apiMode, liveSettings])

  useEffect(() => {
    if (!apiMode) return undefined
    let cancelled = false
    getReservationSettings()
      .then((payload) => {
        if (!cancelled) setLiveSettings(normalize(payload?.reservation_settings || payload || defaults))
      })
      .catch((loadError) => {
        if (!cancelled) setError(loadError.message || 'Booking settings could not be loaded.')
      })
    return () => {
      cancelled = true
    }
  }, [apiMode])

  useEffect(() => {
    if (!apiMode || !date) return undefined
    let cancelled = false
    setSlotsError(false)
    getReservationAvailability({ date, guests })
      .then((payload) => {
        if (cancelled) return
        const raw = Array.isArray(payload?.slots) ? payload.slots : []
        const available = raw
          .filter((slot) => typeof slot === 'string' || slot.available !== false)
          .map((slot) => (typeof slot === 'string' ? slot : slot.time))
          .filter(Boolean)
          .sort()
        if (available.length > 0) {
          setLiveSlots(available)
        }
      })
      .catch(() => {
        if (cancelled) return
        // Do not zero out slots; schedule slots remain available for selection
      })
    return () => {
      cancelled = true
    }
  }, [apiMode, date, guests, slotsVersion])

  const tables = Array.isArray(store.tables) ? store.tables : demoTables
  const bookings = Array.isArray(store.bookings) ? store.bookings : []

  const today = parts(new Date(), 'Europe/London').date
  const maxDate = addDays(today, settings.advance_days)
  const defaultDate = addDays(today, Math.min(1, settings.advance_days))

  useEffect(() => {
    if (!date) setDate(defaultDate)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    setGuests((current) => Math.min(Math.max(1, current), settings.max_guests))
  }, [settings.max_guests])

  useEffect(() => {
    document.title = `Book a table · ${bookingConfig.restaurantName}`
    return () => {
      document.title = 'TKR'
    }
  }, [])

  const availableTimes = useMemo(() => {
    if (!date) return []
    const scheduleSlots = buildSlots(date, guests, settings)
    if (apiMode) {
      if (liveSlots && liveSlots.length > 0) return liveSlots
      return scheduleSlots
    }
    return scheduleSlots
      .filter((time) => tableFor(date, time, guests, settings, tables, bookings))
      .sort()
  }, [apiMode, liveSlots, date, guests, settings, tables, bookings])

  const availableTables = useMemo(() => {
    if (!date || !selectedTime) return []
    return tables.filter((table) => tableFor(date, selectedTime, guests, settings, [table], bookings))
  }, [date, selectedTime, guests, settings, tables, bookings])

  const displayTables = apiMode ? liveTables : tables
  const displayAvailableIds = useMemo(() => {
    if (apiMode) {
      return liveTables.filter((t) => t.free && t.fits).map((t) => t.id)
    }
    return availableTables.map((t) => t.id)
  }, [apiMode, liveTables, availableTables])

  useEffect(() => {
    setSelectedTime('')
    setSelectedTableId(null)
    setLiveTables([])
    setUnavailableSlots([])
    setSlotStatusInfo('')
  }, [date, guests])

  useEffect(() => {
    if (!selectedTime) {
      setSelectedTableId(null)
      return
    }
    if (!apiMode) {
      const stillAvailable = availableTables.some((table) => table.id === selectedTableId)
      if (!stillAvailable) setSelectedTableId(availableTables[0]?.id || null)
    }
  }, [apiMode, selectedTime, availableTables, selectedTableId])

  const chooseTime = async (time) => {
    setError('')
    setSlotStatusInfo('')
    setSelectedTime(time)
    setSelectedTableId(null)

    if (apiMode) {
      setCheckingTime(time)
      setLoadingTables(true)
      try {
        const payload = await getReservationTables({ date, time, guests })
        const rawTables = Array.isArray(payload?.tables) ? payload.tables : []
        setLiveTables(rawTables)
        const freeTables = rawTables.filter((t) => t.free && t.fits)
        if (freeTables.length > 0) {
          setSelectedTableId(freeTables[0].id)
          setSlotStatusInfo(`Table ${freeTables[0].number} (${freeTables[0].seats} seats) is selected. Pick another table below if preferred.`)
        } else {
          setError(`No table is available at ${time} for ${guests} ${guests === 1 ? 'guest' : 'guests'}. Please choose another time.`)
          setUnavailableSlots((prev) => [...new Set([...prev, time])])
          setSelectedTime('')
        }
      } catch {
        // Fallback to availability endpoint if tables call experienced a glitch
        try {
          const res = await getReservationAvailability({ date, time, guests })
          if (res?.available && res?.table) {
            setSlotStatusInfo(`Table ready: Table ${res.table.number} (${res.table.seats} seats).`)
            setSelectedTableId(res.table.id)
          } else if (res?.available === false) {
            setError(`No table is available at ${time} for ${guests} ${guests === 1 ? 'guest' : 'guests'}. Please choose another time.`)
            setUnavailableSlots((prev) => [...new Set([...prev, time])])
            setSelectedTime('')
          }
        } catch {
          /* keep selectedTime */
        }
      } finally {
        setCheckingTime('')
        setLoadingTables(false)
      }
      return
    }

    setSelectedTime(time)
  }

  const update = (key) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value
    setDetails((current) => ({ ...current, [key]: value }))
  }

  const onSubmit = (event) => {
    event.preventDefault()
    setError('')

    if (!details.name.trim()) return setError('Enter your full name and a valid phone number.')
    if (!PHONE_RE.test(details.phone.trim()) || details.phone.replace(/\D/g, '').length < 7) {
      return setError('Enter your full name and a valid phone number.')
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(details.email.trim())) {
      return setError('Enter a valid e-mail address.')
    }
    if (!details.consent) return setError('Please agree to the booking consent.')
    if (!selectedTime || !availableTimes.includes(selectedTime)) {
      return setError('Choose an available time.')
    }

    if (apiMode) {
      if (!isSignedIn) {
        setError('Please sign in to book your table.')
        openAuth('login')
        return
      }
      setBusy(true)
      createReservation({
        date,
        time: selectedTime,
        guests,
        preferred_table_id: selectedTableId || undefined,
        name: details.name.trim(),
        phone: details.phone.trim(),
        email: details.email.trim().toLowerCase(),
        notes: details.notes.trim(),
        consent: true,
        source: 'website'
      })
        .then((booking) => {
          setConfirmation({
            ...booking,
            date,
            time: selectedTime,
            guests,
            table: booking.table || displayTables.find((t) => t.id === selectedTableId),
            live: true
          })
          window.scrollTo({ top: 0, behavior: 'smooth' })
        })
        .catch((submitError) => {
          setError(submitError.message || 'The booking could not be saved. Please try again.')
          if (submitError.status === 409) {
            // The slot was taken meanwhile: mark as unavailable and ask to pick another
            setUnavailableSlots((prev) => [...new Set([...prev, selectedTime])])
            setSelectedTime('')
            setSlotsVersion((version) => version + 1)
          }
        })
        .finally(() => setBusy(false))
      return
    }

    const chosen = tables.find((table) => table.id === selectedTableId)
    const table = chosen
      ? tableFor(date, selectedTime, guests, settings, [chosen], bookings)
      : null

    if (!table) {
      setError('That time is no longer available. Please choose another time.')
      return
    }

    const id = `bk-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    const booking = {
      id,
      table_id: table.id,
      date,
      time: selectedTime,
      duration: settings.duration,
      guests,
      name: details.name.trim(),
      phone: details.phone.trim(),
      email: details.email.trim().toLowerCase(),
      notes: details.notes.trim(),
      status: 'booked',
      source: 'website',
      demo: true,
      created_at: new Date().toISOString()
    }

    setStore((current) => ({ ...current, bookings: [...(current.bookings || []), booking] }))
    setConfirmation(booking)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const resetForm = () => {
    setConfirmation(null)
    setSelectedTime('')
    setSelectedTableId(null)
    setLiveTables([])
    setUnavailableSlots([])
    setSlotStatusInfo('')
    setDetails({ name: '', phone: '', email: '', notes: '', consent: false })
    setDate(defaultDate)
  }

  const currentStep = confirmation ? 3 : (selectedTime && selectedTableId) ? 3 : selectedTime ? 2 : 1
  const availabilityMessage = checkingTime
    ? `Checking table availability for ${checkingTime}...`
    : slotStatusInfo
      ? slotStatusInfo
      : availableTimes.length
        ? 'Select a time below.'
        : 'No available tables for this date and party size. Try another date or fewer guests.'

  return (
    <div className="booking-page">
      <Header />

      <main>
        <div className="booking-hero">
          <p className="eyebrow">Good food. Great company.</p>
          <h1>Book a table</h1>
          <p className="intro">
            Choose your date, time and party size. Available times follow the restaurant&apos;s booking
            settings.
          </p>
        </div>

        <ol className="booking-steps">
          <li className={currentStep >= 1 ? 'active' : ''}>
            <span>1</span> Plan your visit
          </li>
          <li className={currentStep >= 2 ? 'active' : ''}>
            <span>2</span> Pick your table
          </li>
          <li className={currentStep >= 3 ? 'active' : ''}>
            <span>3</span> Your details
          </li>
        </ol>

        {apiMode ? null : (
          <div id="modeNotice" className="notice">
            Demo booking · Choose a time and table, then try the complete form. No real reservation or
            payment will be made.
          </div>
        )}

        {error && (
          <div id="error" role="alert">
            {error}
          </div>
        )}

        {confirmation ? (
          <BookingConfirmation
            booking={confirmation}
            live={Boolean(confirmation.live)}
            table={confirmation.table || tables.find((table) => table.id === confirmation.table_id)}
            onAnother={resetForm}
          />
        ) : (
          <form id="bookingForm" onSubmit={onSubmit}>
            <div className="booking-grid">
              <section className="card">
                <div className="card-heading">
                  <span className="step-badge">01</span>
                  <div>
                    <h2>Your visit</h2>
                    <p className="small">Find the perfect time for your meal</p>
                  </div>
                </div>

                <div className="fields">
                  <label>
                    Date
                    <input
                      id="date"
                      type="date"
                      required
                      min={today}
                      max={maxDate}
                      value={date}
                      onChange={(event) => setDate(event.target.value)}
                    />
                  </label>
                  <label>
                    Guests
                    <select
                      id="guests"
                      required
                      value={guests}
                      onChange={(event) => setGuests(Number(event.target.value))}
                    >
                      {Array.from({ length: settings.max_guests }, (_, index) => index + 1).map((count) => (
                        <option key={count} value={count}>
                          {count} {count === 1 ? 'guest' : 'guests'}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div id="rulesSummary" className="small">
                  Up to {settings.max_guests} guests · {settings.duration} minute visit · Book up to{' '}
                  {settings.advance_days} days ahead.
                </div>

                <h3>Available times</h3>
                <SlotPicker
                  slots={availableTimes}
                  selected={selectedTime}
                  onSelect={chooseTime}
                  message={availabilityMessage}
                  unavailableSlots={unavailableSlots}
                  checkingTime={checkingTime}
                />

                {selectedTime ? (
                  loadingTables ? (
                    <div className="small" style={{ margin: '14px 0', padding: '12px', background: 'var(--orange-soft, #fff3e4)', borderRadius: '9px' }}>
                      Finding tables for {selectedTime}...
                    </div>
                  ) : (
                    <TablePicker
                      tables={displayTables}
                      availableIds={displayAvailableIds}
                      selectedId={selectedTableId}
                      guests={guests}
                      time={selectedTime}
                      onSelect={setSelectedTableId}
                    />
                  )
                ) : null}

                <div className="selection" id="selection">
                  {selectedTime
                    ? `${date} at ${selectedTime} · ${guests} ${guests === 1 ? 'guest' : 'guests'}${
                        displayTables.find((table) => table.id === selectedTableId)
                          ? ` · Table ${displayTables.find((table) => table.id === selectedTableId).number}`
                          : ''
                      }`
                    : 'Choose a time to continue.'}
                </div>
              </section>

              <section className="card">
                <div className="card-heading">
                  <span className="step-badge">03</span>
                  <div>
                    <h2>Your details</h2>
                    <p className="small">Let us know who we&apos;re welcoming</p>
                  </div>
                </div>

                <label>
                  Full name
                  <input
                    id="name"
                    autoComplete="name"
                    maxLength={100}
                    placeholder="e.g. Waseem Hanif"
                    required
                    value={details.name}
                    onChange={update('name')}
                  />
                </label>
                <label>
                  Phone number
                  <input
                    id="phone"
                    type="tel"
                    autoComplete="tel"
                    maxLength={25}
                    placeholder="e.g. 07700 900123"
                    required
                    value={details.phone}
                    onChange={update('phone')}
                  />
                </label>
                <label>
                  Email
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    maxLength={254}
                    placeholder="you@example.com"
                    required
                    value={details.email}
                    onChange={update('email')}
                  />
                </label>
                <label>
                  Special requests <span className="small">(optional)</span>
                  <textarea
                    id="notes"
                    rows={3}
                    maxLength={1000}
                    placeholder="High chair, accessibility or special occasion"
                    value={details.notes}
                    onChange={update('notes')}
                  />
                </label>
                <label className="consent">
                  <input id="consent" type="checkbox" required checked={details.consent} onChange={update('consent')} />
                  <span>I agree that the restaurant may use these details to manage this booking.</span>
                </label>
                <p className="small">
                  Special requests are subject to availability. We will only confirm a booking after
                  availability is checked again.
                </p>
                <button id="submit" className="primary" type="submit" disabled={!selectedTime || busy}>
                  Confirm my table →
                </button>
                <div className="booking-assurance">
                  ✓ No payment required &nbsp; · &nbsp; 90-minute table booking
                </div>
              </section>
            </div>
          </form>
        )}
      </main>

      <footer>
        <Link to="/">Back to restaurant</Link> · <Link to="/menu">Order online</Link>
      </footer>
    </div>
  )
}
