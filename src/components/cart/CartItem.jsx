import { dishImage, formatPrice, onDishImageError } from '../../utils/format'

export default function CartItem({ item, onIncrease, onDecrease, onRemove }) {
  const key = item.lineId || item.productId

  return (
    <div className="cart-item">
      <img alt="" loading="lazy" src={dishImage(item.image)} onError={onDishImageError} />
      <div style={{ flex: '1 1 0%' }}>
        <p className="cart-item__name">{item.name}</p>
        {item.optionPath ? <p className="cart-item__opt">{item.optionPath}</p> : null}
        <p className="cart-item__price">{formatPrice(item.price * item.quantity)}</p>
        <div className="cart-item__foot">
          <span className="qty">
            <button type="button" aria-label="Decrease" onClick={() => onDecrease(key)}>
              −
            </button>
            <output>{item.quantity}</output>
            <button type="button" aria-label="Increase" onClick={() => onIncrease(key)}>
              +
            </button>
          </span>
          <a
            className="link-muted"
            href="#remove"
            onClick={(event) => {
              event.preventDefault()
              onRemove(key)
            }}
          >
            Remove
          </a>
        </div>
      </div>
    </div>
  )
}
