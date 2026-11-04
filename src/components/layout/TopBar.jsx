import Icon from '../ui/Icon'
import { restaurant } from '../../data/restaurant'
import { formatPrice } from '../../utils/format'
import { useDelivery } from '../../context/DeliveryContext'
import { useStorefront } from '../../context/StorefrontContext'

export default function TopBar({ onBranch }) {
  const { profile } = useStorefront()
  const { openGate } = useDelivery()
  const { branches, selectedBranch, ordering } = useStorefront()

  return (
    <div className="topbar">
      <div className="container topbar__in">
        <a className="topbar__item" href={profile.phoneHref}>
          <Icon name="phone" />
          {profile.phone}
        </a>
        <a className="topbar__item" href={`mailto:${profile.email}`}>
          <Icon name="mail" />
          {profile.email}
        </a>
        {ordering?.freeDeliveryOver > 0 ? (
          <span className="topbar__promo">
            <Icon name="truck" />
            Free delivery on order above <b>{formatPrice(ordering.freeDeliveryOver)}</b>
          </span>
        ) : null}
        {branches.length > 0 ? (
          <button type="button" className="topbar__item topbar__postcode" onClick={onBranch}>
            Branch: {selectedBranch?.name || 'Select'}
          </button>
        ) : null}
        <button type="button" className="topbar__item topbar__postcode" onClick={openGate}>
          Check delivery postcode
        </button>
      </div>
    </div>
  )
}
