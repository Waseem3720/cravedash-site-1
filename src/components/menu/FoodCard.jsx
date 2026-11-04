import Icon from '../ui/Icon'
import { dishImage, formatPrice, onDishImageError } from '../../utils/format'
import { useFavourites } from '../../context/FavouritesContext'
import { useUI } from '../../context/UIContext'

export default function FoodCard({ product }) {
  const { isFavourite, toggle } = useFavourites()
  const { openProduct } = useUI()
  const favourite = isFavourite(product.id)

  return (
    <article className="food-card-wrap">
      <button
        type="button"
        className={favourite ? 'fav is-on' : 'fav'}
        aria-label={favourite ? 'Remove from favourites' : 'Add to favourites'}
        aria-pressed={favourite}
        onClick={() => toggle(product.id)}
      >
        <Icon name="heart" />
      </button>

      <div className="food-card">
        <button
          type="button"
          className="food-card__media"
          aria-label={`View ${product.name}`}
          onClick={() => openProduct(product)}
        >
          <img
            alt={product.name}
            loading="lazy"
            src={dishImage(product.image)}
            onError={onDishImageError}
          />
        </button>

        <div className="food-card__body">
          <h3 className="food-card__name">
            <button className="food-card__name-link" type="button" onClick={() => openProduct(product)}>
              {product.name}
            </button>
          </h3>
          <p className="food-card__desc">{product.description}</p>
          <div className="food-card__foot">
            <span className="food-card__price">{formatPrice(product.price)}</span>
            <button
              type="button"
              className="btn btn--primary btn--sm"
              aria-label={`View ${product.name}`}
              onClick={() => openProduct(product)}
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}
