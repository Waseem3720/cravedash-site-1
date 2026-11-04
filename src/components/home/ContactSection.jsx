import { restaurant } from '../../data/restaurant'
import { useStorefront } from '../../context/StorefrontContext'

export default function ContactSection() {
  const { profile } = useStorefront()
  const { latitude, longitude } = profile.location || {}
  const mapSrc = `https://www.google.com/maps?q=${latitude},${longitude}&output=embed`

  return (
    <section className="contact" id="contact">
      <div className="container contact__grid">
        <div className="contact__map">
          <iframe
            title={`${restaurant.name} location`}
            loading="lazy"
            width="100%"
            height="250"
            src={mapSrc}
            style={{ border: 0, display: 'block' }}
          />
        </div>
        <dl>
          <div className="contact__row">
            <dt>Address</dt>
            <dd>{profile.address.full}</dd>
          </div>
          <div className="contact__row">
            <dt>Phone</dt>
            <dd>
              <a href={profile.phoneHref}>{profile.phone}</a>
            </dd>
          </div>
          <div className="contact__row">
            <dt>Email</dt>
            <dd>
              <a href={`mailto:${profile.email}`}>{profile.email}</a>
            </dd>
          </div>
        </dl>
      </div>
    </section>
  )
}
