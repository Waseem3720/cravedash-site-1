import AccountView from './AccountView'
import FoodCard from '../menu/FoodCard'
import { products as demoProducts } from '../../data/products'
import { useFavourites } from '../../context/FavouritesContext'
import { useStorefront } from '../../context/StorefrontContext'

export default function FavouritesView({ onBack }) {
  const { ids } = useFavourites()
  const { products: liveProducts } = useStorefront()
  const sourceProducts = Array.isArray(liveProducts) && liveProducts.length ? liveProducts : demoProducts
  const favourites = sourceProducts.filter((product) => ids.some((id) => String(id) === String(product.id)))

  return (
    <AccountView title="Favourites" subtitle="Your saved dishes" onBack={onBack} hero>
      {favourites.length === 0 ? (
        <p className="account-muted">
          No favourites yet — tap the heart on any dish to save it here.
        </p>
      ) : (
        <div className="menu-grid">
          {favourites.map((product) => (
            <FoodCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </AccountView>
  )
}
