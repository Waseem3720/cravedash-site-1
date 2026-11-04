import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import ToTop from '../components/layout/ToTop'
import Icon from '../components/ui/Icon'
import { categories } from '../data/categories'
import { products } from '../data/products'
import { formatPrice, productSlug } from '../utils/format'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import { useFavourites } from '../context/FavouritesContext'

export default function ProductPage() {
  const { slug } = useParams()
  const product = products.find((item) => productSlug(item) === slug)
  const { addItem } = useCart()
  const { toast } = useToast()
  const { isFavourite, toggle } = useFavourites()
  const [quantity, setQuantity] = useState(1)

  if (!product) {
    return (
      <>
        <Header />
        <div className="container pp-product">
          <p className="eyebrow">Not found</p>
          <h1 className="pp-product__name">We could not find that dish</h1>
          <Link className="btn btn--primary" to="/menu">
            Browse the menu
          </Link>
        </div>
        <Footer />
      </>
    )
  }

  const category = categories.find((item) => item.id === product.categoryId)
  const favourite = isFavourite(product.id)

  const add = () => {
    addItem(product, quantity)
    toast(`${quantity} × ${product.name} added to your cart`)
    setQuantity(1)
  }

  return (
    <>
      <Header />
      <div className="container pp-product">
        <Link className="pp-back" to="/menu">
          <Icon name="chevronLeft" size={16} /> Back to menu
        </Link>

        <div className="pp-product__grid">
          <div className="pp-product__media">
            <img alt={product.name} src={`/images/dishes/${product.image}`} />
            <button
              type="button"
              className="fav"
              aria-label={favourite ? 'Remove from favourites' : 'Add to favourites'}
              aria-pressed={favourite}
              onClick={() => toggle(product.id)}
            >
              <Icon name="heart" />
            </button>
          </div>

          <div className="pp-product__body">
            {category && <p className="eyebrow">{category.name}</p>}
            <h1 className="pp-product__name">{product.name}</h1>
            <p className="pp-product__price">{formatPrice(product.price)}</p>
            <p className="pp-product__desc">{product.description}</p>

            <div className="pp-product__actions">
              <span className="qty">
                <button type="button" aria-label="Decrease" onClick={() => setQuantity((q) => Math.max(1, q - 1))}>
                  −
                </button>
                <output>{quantity}</output>
                <button type="button" aria-label="Increase" onClick={() => setQuantity((q) => q + 1)}>
                  +
                </button>
              </span>
              <button type="button" className="btn btn--primary btn--lg" onClick={add}>
                Add to cart — {formatPrice(product.price * quantity)}
              </button>
            </div>

            <p className="pp-muted">
              Cooked to order · Collection in 20–25 min · Delivery 35–45 min
            </p>
          </div>
        </div>
      </div>
      <Footer />
      <ToTop />
    </>
  )
}
