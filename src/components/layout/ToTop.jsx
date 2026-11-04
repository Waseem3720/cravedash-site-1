import Icon from '../ui/Icon'
import { useCart } from '../../context/CartContext'
import { useScrolled } from '../../hooks/useUiEffects'

export default function ToTop() {
  const scrolled = useScrolled(420)
  const { count } = useCart()

  const lift = count > 0

  return (
    <button
      type="button"
      className={`to-top${scrolled ? ' is-visible' : ''}${lift ? ' lifted' : ''}`}
      aria-label="Back to top"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
    >
      <Icon name="arrowUp" />
    </button>
  )
}
