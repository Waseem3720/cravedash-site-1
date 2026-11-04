import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { CartProvider } from './context/CartContext'
import { AuthProvider } from './context/AuthContext'
import { DeliveryProvider } from './context/DeliveryContext'
import { FavouritesProvider } from './context/FavouritesContext'
import { AddressProvider } from './context/AddressContext'
import { StorefrontProvider } from './context/StorefrontContext'
import { ToastProvider } from './context/ToastContext'
import { UIProvider } from './context/UIContext'

import './styles/base.css'
import './styles/theme.css'
import './styles/booking.css'
import './styles/app.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <StorefrontProvider>
            <DeliveryProvider>
              <FavouritesProvider>
                <AddressProvider>
                  <CartProvider>
                    <UIProvider>
                      <App />
                    </UIProvider>
                  </CartProvider>
                </AddressProvider>
              </FavouritesProvider>
            </DeliveryProvider>
          </StorefrontProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  </React.StrictMode>
)
