/** Wallet / loyalty / promotions data for the account area. */

export const loyaltySettings = {
  minimumPoints: 100,
  /** points needed for 1 currency unit */
  exchangeRate: 100
}

export const coupons = [
  {
    id: 'cp-1',
    code: 'WELCOME10',
    title: 'Welcome offer',
    discount: '10% off',
    minSpend: 15
  },
  {
    id: 'cp-2',
    code: 'PIRI5',
    title: 'Weekday piri piri treat',
    discount: '£5 off',
    minSpend: 25
  },
  {
    id: 'cp-3',
    code: 'FAMILY20',
    title: 'Family feast',
    discount: '20% off',
    minSpend: 40
  }
]

export const notifications = [
  {
    id: 'nt-1',
    title: 'Your order is confirmed',
    body: 'We have received your order and the kitchen is firing up the grill.',
    date: 'Just now',
    tone: 'prep'
  },
  {
    id: 'nt-2',
    title: 'Free delivery on orders above £20',
    body: 'Spend £20 or more and delivery is on the house.',
    date: 'Today',
    tone: 'promo'
  },
  {
    id: 'nt-3',
    title: 'New on the menu',
    body: 'Porto Gold Burger has landed — flame-grilled chicken thigh with Porto Gold glaze.',
    date: 'This week',
    tone: 'promo'
  }
]
