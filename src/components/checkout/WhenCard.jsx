import { useEffect } from 'react'
import { useCart } from '../../context/CartContext'
import { restaurant } from '../../data/restaurant'
import { closingNotice, isRestaurantOpen } from '../../utils/serviceHours'

const OPENING_TIME = `${String(restaurant.ordering.opensAt).padStart(2, '0')}:00`

export default function WhenCard() {
  const { schedule, setSchedule } = useCart()
  const open = isRestaurantOpen()
  const minDate = new Date().toISOString().slice(0, 10)

  // While the kitchen is closed a scheduled time is mandatory, so prefill the
  // next opening time instead of leaving the customer stuck on the first step.
  useEffect(() => {
    if (!open && !schedule.time) setSchedule({ time: OPENING_TIME })
  }, [open, schedule.time, setSchedule])

  return (
    <section className="card" id="checkout-when">
      <h2 className="card__title">When</h2>

      <p className="pp-muted" style={{ marginTop: 12 }}>
        {open
          ? 'Restaurant is open now. Choose a time or schedule your order for later.'
          : `${closingNotice()} We set it to ${OPENING_TIME} for you — change it any time.`}
      </p>

      <div className="field-row" style={{ marginTop: 14 }}>
        <div className="field">
          <label htmlFor="co-date">Date</label>
          <input
            id="co-date"
            type="date"
            min={minDate}
            value={schedule.date}
            onChange={(event) => setSchedule({ date: event.target.value })}
          />
        </div>
        <div className="field">
          <label htmlFor="co-time">Time</label>
          <input
            id="co-time"
            type="time"
            value={schedule.time}
            onChange={(event) => setSchedule({ time: event.target.value })}
          />
        </div>
      </div>
    </section>
  )
}
