import AccountView from './AccountView'
import FoodCard from '../menu/FoodCard'
import { products } from '../../data/products'
import { useFavourites } from '../../context/FavouritesContext'

export default function FavouritesView({ onBack }) {
  const { ids } = useFavourites()
  const favourites = products.filter((product) => ids.includes(product.id))

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
