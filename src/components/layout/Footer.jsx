import { Link } from 'react-router-dom'
import Icon from '../ui/Icon'
import { footerLinks, restaurant } from '../../data/restaurant'
import { useStorefront } from '../../context/StorefrontContext'

export default function Footer() {
  const { profile } = useStorefront()
  return (
    <footer className="cd-ftr">
      <div className="container">
        <div className="cd-ftr__grid">
          <div>
            <Link className="cd-brand cd-brand--ftr" to="/#home" aria-label={`${restaurant.name} home`}>
              <img className="cd-brand__img" src="/images/porto-logo.png" alt={restaurant.name} />
            </Link>
          </div>

          <div>
            <h4>Quick Links</h4>
            <ul>
              {footerLinks.map((link) => (
                <li key={link.label}>
                  <Link to={link.to}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4>Contact</h4>
            <p>{profile.phone}</p>
            <p>{profile.email}</p>
            <p>{profile.address.full}</p>
          </div>

          <div>
            <h4>Follow us on</h4>
            <div className="socials">
              {restaurant.social.map((social) => (
                <a
                  key={social.name}
                  href={social.link}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={social.label}
                >
                  <Icon name={social.name} />
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="cd-ftr__bar">© Powered by Cravedash. All rights reserved.</div>
      </div>
    </footer>
  )
}
