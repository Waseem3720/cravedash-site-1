import { useLocation, useNavigate } from 'react-router-dom'
import Icon from '../ui/Icon'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import { useUI } from '../../context/UIContext'

export default function AppTabBar() {
  const { count } = useCart()
  const { isSignedIn, displayName } = useAuth()
  const { openAuth, toggleCart, cartOpen, openAccount, accountView } = useUI()
  const location = useLocation()
  const navigate = useNavigate()

  const isHome = location.pathname === '/'
  const isMenu = location.pathname === '/menu'

  return (
    <nav className="app-tabbar" aria-label="App navigation" data-mq="(max-width: 720px)">
      <button
        type="button"
        className={`app-tabbar__tab${isHome ? ' is-active' : ''}`}
        onClick={() => navigate('/')}
      >
        <Icon name="home" />
        <span className="app-tabbar__label">Home</span>
      </button>

      <button
        type="button"
        className={`app-tabbar__tab${isMenu ? ' is-active' : ''}`}
        onClick={() => navigate('/menu')}
      >
        <Icon name="menuLines" />
        <span className="app-tabbar__label">Menu</span>
      </button>

      <button
        type="button"
        className={`app-tabbar__tab${cartOpen ? ' is-active' : ''}`}
        aria-label={count > 0 ? `Cart, ${count} items` : 'Cart'}
        onClick={toggleCart}
      >
        <span className="app-tabbar__icon-wrap">
          <Icon name="basket" />
          {count > 0 && <span className="app-tabbar__badge">{count}</span>}
        </span>
        <span className="app-tabbar__label">Cart</span>
      </button>

      <button
        type="button"
        className={`app-tabbar__tab${accountView ? ' is-active' : ''}`}
        aria-label={isSignedIn ? 'My Account' : 'Sign in'}
        onClick={() => (isSignedIn ? openAccount('hub') : openAuth('login'))}
      >
        <Icon name="profile" />
        <span className="app-tabbar__label">{isSignedIn ? displayName : 'Profile'}</span>
      </button>
    </nav>
  )
}
