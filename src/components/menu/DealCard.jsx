import { dishImage, formatPrice, onDishImageError } from '../../utils/format'
import { useUI } from '../../context/UIContext'

export default function DealCard({ deal }) {
  const { openProduct } = useUI()

  return (
    <article className="cd-deal">
      <button
        type="button"
        className="cd-deal__media"
        aria-label={`View ${deal.name}`}
        onClick={() => openProduct(deal)}
      >
        <img alt={deal.name} loading="lazy" src={dishImage(deal.image)} onError={onDishImageError} />
      </button>

      <div className="cd-deal__hd">
        <span className="cd-deal__badge">{deal.badge}</span>
        <span className="cd-deal__when">Limited time</span>
      </div>

      <div className="cd-deal__bd">
        <div>
          <h3 className="cd-deal__ttl">
            <button type="button" className="cd-deal__ttl-btn" onClick={() => openProduct(deal)}>
              {deal.name}
            </button>
          </h3>
          <ul className="cd-deal__items">
            {deal.contents.map((line, index) => (
              <li key={`${deal.id}-${index}`}>
                <b>{line.label}:</b> {line.value}
              </li>
            ))}
          </ul>
        </div>

        <div className="cd-deal__buy">
          <div className="cd-deal__price">
            {deal.wasPrice ? <span className="cd-deal__was">{formatPrice(deal.wasPrice)}</span> : null}
            <p className="cd-deal__now">{formatPrice(deal.price)}</p>
          </div>
          <button
            type="button"
            className="cd-add"
            aria-label={`Add ${deal.name}`}
            onClick={() => openProduct(deal)}
          >
            +
          </button>
        </div>
      </div>
    </article>
  )
}
