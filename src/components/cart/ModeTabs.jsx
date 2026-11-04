import Icon from '../ui/Icon'
import { restaurant } from '../../data/restaurant'

export default function ModeTabs({ mode, onChange }) {
  const options = [
    { id: 'delivery', label: 'Delivery', icon: 'truck', enabled: restaurant.ordering.delivery },
    { id: 'collection', label: 'Collection', icon: 'bag', enabled: restaurant.ordering.collection }
  ]

  return (
    <div className="mode-tabs">
      {options
        .filter((option) => option.enabled)
        .map((option) => (
          <button
            key={option.id}
            type="button"
            className={`mode-tab${mode === option.id ? ' is-active' : ''}`}
            aria-pressed={mode === option.id}
            onClick={() => onChange(option.id)}
          >
            <Icon name={option.icon} />
            <b>{option.label}</b>
            <small>{restaurant.openingHours}</small>
          </button>
        ))}
    </div>
  )
}
