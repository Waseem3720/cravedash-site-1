import AccountView from './AccountView'
import { useStorefront } from '../../context/StorefrontContext'

export default function SupportView({ onBack }) {
  const { profile } = useStorefront()
  return (
    <AccountView title="Help & Support" subtitle="We are happy to help" onBack={onBack} hero>
      <div className="support-list">
        <a className="card support-card" href={profile.phoneHref}>
          <strong>Call us</strong>
          <span>{profile.phone}</span>
        </a>
        <a className="card support-card" href={`mailto:${profile.email}`}>
          <strong>Email</strong>
          <span>{profile.email}</span>
        </a>
        <div className="card support-card">
          <strong>Visit</strong>
          <span>{profile.address.full}</span>
        </div>
      </div>
    </AccountView>
  )
}
