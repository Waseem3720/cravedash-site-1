import { Link } from 'react-router-dom'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'

export default function NotFoundPage() {
  return (
    <>
      <Header />
      <section className="pp-404">
        <div className="container">
          <p className="eyebrow">404</p>
          <h1>This page could not be found.</h1>
          <p className="pp-muted">
            The link may be out of date — the kitchen is still open though.
          </p>
          <div className="pp-404__actions">
            <Link className="btn btn--primary" to="/">
              Back to home
            </Link>
            <Link className="btn btn--outline" to="/menu">
              Browse the menu
            </Link>
          </div>
        </div>
      </section>
      <Footer />
    </>
  )
}
