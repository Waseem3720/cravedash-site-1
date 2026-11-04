/**
 * Option groups + add-ons used by the product detail popup.
 *
 * `priceMode` tells the pricing helper how a value affects the line price:
 *  - "replace": the chosen value is the whole unit price (the base price is
 *    only used for the "from £x" teaser until something is picked).
 *  - "add": the value is a delta on top of the unit price.
 */

const SAUCE_FLAVOURS = [
  { id: 'naked', name: 'Naked', optionPrice: 0 },
  { id: 'mango-lime', name: 'Mango & Lime', optionPrice: 0 },
  { id: 'lemon-herb', name: 'Lemon & Herb', optionPrice: 0 }
]

const SPICE_LEVELS = [
  { id: 'mild', name: 'Mild', optionPrice: 0 },
  { id: 'hot', name: 'Hot', optionPrice: 0 },
  { id: 'extra-hot', name: 'Extra Hot', optionPrice: 0 }
]

const ADD_ONS = [
  { id: 'halloumi', name: 'Add Halloumi', price: 2.25 },
  { id: 'chips', name: 'Peri Peri Chips', price: 2.95 },
  { id: 'extra-sauce', name: 'Extra Peri Peri Sauce', price: 0.5 },
  { id: 'dips', name: 'Garlic Mayo Dip', price: 0.75 },
  { id: 'cheese', name: 'Extra Cheese', price: 1.25 },
  { id: 'grilled-onion', name: 'Grilled Onions', price: 0.95 }
]

const MEAL_UPGRADE = 3.5

/** Meal deal upgrade where a real meal deal makes sense. */
const MEAL_CATEGORIES = [1, 2, 3]

export function optionGroupsFor(product) {
  if (!product) return []
  // Deals are fixed bundles — only the add-ons apply to them.
  if (product.isDeal) return []

  const groups = [
    {
      id: 'portion',
      name: 'Choose your option',
      type: 'single',
      priceMode: 'replace',
      required: true,
      values: [
        { id: 'regular', name: 'Regular', optionPrice: product.price },
        { id: 'meal-deal', name: 'Meal Deal', optionPrice: Number((product.price + MEAL_UPGRADE).toFixed(2)) }
      ]
    },
    {
      id: 'sauce',
      name: 'Sauce Flavours',
      type: 'single',
      priceMode: 'add',
      required: true,
      values: SAUCE_FLAVOURS
    }
  ]

  if (!MEAL_CATEGORIES.includes(product.categoryId)) {
    groups.push({
      id: 'spice',
      name: 'Spice Level',
      type: 'single',
      priceMode: 'add',
      required: false,
      values: SPICE_LEVELS
    })
  }

  return groups
}

export function addOnsFor() {
  return ADD_ONS
}

/**
 * Option groups from the restaurant's own product variations (API mode). Each option's price is added to the product
 * price, as the server prices it. Nothing is invented here: a product with no variations has no options.
 */
export function variationGroupsFor(product) {
  const variations = Array.isArray(product?.variations) ? product.variations : []
  return variations
    .map((group, index) => ({
      id: String(group.id ?? group.name ?? index),
      name: group.name || 'Choose your option',
      type: 'single',
      priceMode: 'add',
      required: Boolean(group.required),
      values: (Array.isArray(group.values) ? group.values : []).map((value) => ({
        id: String(value.id ?? value.label),
        name: value.label || value.name || '',
        optionPrice: Number(value.price) || 0
      }))
    }))
    .filter((group) => group.values.length > 0)
}
