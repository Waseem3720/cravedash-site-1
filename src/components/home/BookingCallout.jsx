import { Link } from 'react-router-dom'

export default function BookingCallout() {
  return (
    <section id="table-booking" className="section cd-booking-callout">
      <p className="eyebrow">Dine with us</p>
      <h2>Book a table</h2>
      <p>Choose your date, time and party size to see available tables.</p>
      <Link className="btn btn--primary" to="/booking">
        Check availability
      </Link>
    </section>
  )
}
