import Icon from '../ui/Icon'
import { useCart } from '../../context/CartContext'
import { useUI } from '../../context/UIContext'
import { formatPrice, pluralise } from '../../utils/format'

export default function CartDock() {
  const { count, total } = useCart()
  const { openCart, cartOpen } = useUI()

  if (count === 0 || cartOpen) return null

  return (
    <button
      type="button"
      className="cd-dock cart-bar"
      aria-label={`View basket, ${pluralise(count, 'item')}, ${formatPrice(total)}`}
      title={`Your basket · ${formatPrice(total)}`}
      onClick={openCart}
    >
      <span className="cd-dock__icon" aria-hidden="true">
        <Icon name="cart" />
      </span>
      <span className="cd-dock__ct">{count}</span>
      <span className="cd-dock__meta">
        <span className="cd-dock__l">Your basket</span>
        <span className="cd-dock__v">{formatPrice(total)}</span>
      </span>
    </button>
  )
}
