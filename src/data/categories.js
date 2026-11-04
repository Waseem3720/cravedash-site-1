/**
 * Menu categories. `icon` maps to the SVG set in components/ui/Icon.jsx and
 * `tint` reproduces the coloured icon chip used by the original design.
 */
export const categories = [
  {
    id: 1,
    name: 'Starters & Wings',
    icon: 'list',
    tint: { background: 'var(--surface-2)', color: 'var(--ink-2)' }
  },
  {
    id: 2,
    name: 'Main Grills & Curries',
    icon: 'grill',
    tint: { background: 'var(--brand-wash)', color: 'var(--brand)' }
  },
  {
    id: 3,
    name: 'Vegetarian & Vegan',
    icon: 'list',
    tint: { background: 'var(--surface-2)', color: 'var(--ink-2)' }
  },
  {
    id: 4,
    name: 'Sides & Fresh Breads',
    icon: 'list',
    tint: { background: 'var(--surface-2)', color: 'var(--ink-2)' }
  },
  {
    id: 5,
    name: 'Specialties',
    icon: 'list',
    tint: { background: 'var(--surface-2)', color: 'var(--ink-2)' }
  }
]

export default categories
