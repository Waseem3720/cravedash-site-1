import { Link } from 'react-router-dom'

/** `live` is a booking the restaurant's server accepted; otherwise it is a demo preview. */
export default function BookingConfirmation({ booking, table, live = false, onAnother }) {
  return (
    <section id="confirmation" className="card confirmation" tabIndex={-1} ref={(node) => node && node.focus()}>
      <h2 id="confirmationTitle">{live ? 'Your table is booked' : 'Preview booking saved'}</h2>
      <p id="confirmationDetail">
        {booking.guests} guests · {booking.date} at {booking.time}
        {table ? ` · Table ${table.number}` : ''}
      </p>
      <p id="reference">Reference: {booking.id}</p>
      {live ? null : (
        <p id="confirmationContact">
          This is a browser preview; no real reservation or notification has been sent.
        </p>
      )}
      <button id="another" className="secondary" type="button" onClick={onAnother}>
        Make another booking
      </button>
      <Link to="/menu">Explore the menu</Link>
    </section>
  )
}
