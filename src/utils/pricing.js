import { formatPrice } from './format'

/**
 * "from £9.45" teaser shown in the popup while no option is picked yet.
 */
export function fromPrice(product, groups) {
  const priced = groups
    .filter((group) => group.priceMode === 'replace')
    .flatMap((group) => group.values.map((value) => Number(value.optionPrice || 0)))

  if (!priced.length) return Number(product.price || 0)
  return Math.min(...priced)
}

/**
 * Unit price for the current selection.
 * Replace groups own the price, add groups and add-ons add on top.
 */
export function computeUnitPrice({ product, groups, addOns, selected, addOnActive }) {
  let unit = Number(product.price || 0)

  groups.forEach((group, groupIndex) => {
    if (group.priceMode !== 'replace') return
    const chosen = (selected[groupIndex] || []).findIndex(Boolean)
    unit = chosen === -1 ? 0 : Number(group.values[chosen].optionPrice || 0)
  })

  groups.forEach((group, groupIndex) => {
    if (group.priceMode === 'replace') return
    ;(selected[groupIndex] || []).forEach((isOn, valueIndex) => {
      if (isOn) unit += Number(group.values[valueIndex].optionPrice || 0)
    })
  })

  addOns.forEach((addOn, index) => {
    if (addOnActive[index]) unit += Number(addOn.price || 0)
  })

  return Number(unit.toFixed(2))
}

/** "Meal Deal, Mango & Lime, Add Halloumi" — stored on the cart line. */
export function optionPathLabel({ groups, selected, addOns, addOnActive }) {
  const parts = []

  groups.forEach((group, groupIndex) => {
    ;(selected[groupIndex] || []).forEach((isOn, valueIndex) => {
      if (isOn) parts.push(group.values[valueIndex].name)
    })
  })

  addOns.forEach((addOn, index) => {
    if (addOnActive[index]) parts.push(addOn.name)
  })

  return parts.join(', ')
}

/** "+£2.25" or "Free" for an option row. */
export function optionDeltaLabel(price) {
  const amount = Number(price || 0)
  return amount > 0 ? `+${formatPrice(amount)}` : 'Free'
}
