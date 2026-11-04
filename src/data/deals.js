/**
 * Menu "Deals" — combo bundles shown above the regular categories.
 * `wasPrice` powers the struck-through price and `contents` the item list
 * ("Main: …", "Side: …") exactly like the reference design.
 */
export const DEALS_CATEGORY_ID = 'deals'

export const deals = [
  {
    id: 'deal-1',
    categoryId: DEALS_CATEGORY_ID,
    isDeal: true,
    name: 'Lunch Meal Deal',
    description: 'Can — 7-Up free 330ml',
    price: 8.99,
    wasPrice: 11.5,
    badge: 'Popular',
    image: 'mozzarella-sticks.jpg',
    contents: [
      { label: 'Main', value: 'Fried Mozzarella (v)' },
      { label: 'Main', value: 'Chicken Nuggets x 5' },
      { label: 'Main', value: 'Popcorn Chicken' },
      { label: 'Main', value: 'Mac & Cheese Bites (5) (V)' },
      { label: 'Drink', value: 'Can — 7-Up free 330ml' },
      { label: 'Side', value: 'Fried Mozzarella (v)' }
    ]
  },
  {
    id: 'deal-2',
    categoryId: DEALS_CATEGORY_ID,
    isDeal: true,
    name: 'Independence Day',
    description: 'Grilled skewers with naan and salad',
    price: 30.99,
    wasPrice: 50.0,
    badge: '19.01',
    image: 'seekh-kebab.jpg',
    contents: [
      { label: 'Burger', value: 'BBQ Burger' },
      { label: 'Fries', value: 'Fries' }
    ]
  },
  {
    id: 'deal-3',
    categoryId: DEALS_CATEGORY_ID,
    isDeal: true,
    name: 'Family Feast',
    description: 'Whole grilled chicken with sides to share',
    price: 24.99,
    wasPrice: 32.0,
    badge: 'Family',
    image: 'butter-chicken.jpg',
    contents: [
      { label: 'Chicken', value: 'Whole Grilled Chicken' },
      { label: 'Side', value: 'Peri Peri Chips' },
      { label: 'Side', value: 'Garlic Butter Naan x 2' },
      { label: 'Drink', value: '1.5L Bottle' }
    ]
  },
  {
    id: 'deal-4',
    categoryId: DEALS_CATEGORY_ID,
    isDeal: true,
    name: 'Wrap & Fries Combo',
    description: 'Lunch on the go, cooked to order',
    price: 6.99,
    wasPrice: 9.49,
    badge: 'Value',
    image: 'calzone.jpg',
    contents: [
      { label: 'Main', value: 'Chicken Wrap' },
      { label: 'Side', value: 'Fries' },
      { label: 'Drink', value: 'Can' }
    ]
  }
]

export default deals
