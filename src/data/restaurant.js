/**
 * Restaurant profile — the single source of truth for branding and contact
 * details (mirrors the `config` payload of the original static site).
 */
export const restaurant = {
  name: 'CraveDash',
  brandMark: 'C',
  phone: '03101773357',
  phoneHref: 'tel:03101773357',
  email: 'hello@portopiripiri.co.uk',
  address: {
    line1: 'Chota Jamra Sehri Behlol Takht Bhai',
    full: 'Chota Jamra Sehri Behlol Takht Bhai',
    city: 'Chota Jamra Sehri Behlol Takht Bhai',
    country: 'UK'
  },
  location: {
    latitude: 51.5074,
    longitude: -0.1278
  },
  currency: {
    symbol: '£',
    decimalPlaces: 2
  },
  ordering: {
    delivery: true,
    collection: true,
    deliveryCharge: 2.5,
    freeDeliveryOver: 20,
    minimumOrder: 10,
    serviceFee: 0.5,
    bagCharge: 0.2,
    opensAt: 17
  },
  // Social links are not part of the storefront API yet, so none are shown.
  social: [],
  openingHours: 'Open now'
}

export const navigation = [
  { label: 'Home', to: '/', section: 'home' },
  { label: 'Story', to: '/#our-story' },
  { label: 'Menu', to: '/menu' },
  { label: 'Book a table', to: '/booking' },
  { label: 'Contact', to: '/#contact' }
]

export const footerLinks = [
  { label: 'HOME', to: '/#home' },
  { label: 'OUR STORY', to: '/#our-story' },
  { label: 'MENU', to: '/menu' },
  { label: 'BOOK A TABLE', to: '/booking' },
  { label: 'CONTACT', to: '/#contact' }
]
