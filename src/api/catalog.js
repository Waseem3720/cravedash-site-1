import { api } from './client'

/**
 * Everything the menu needs: categories, products, addons, deals.
 * The local gateway has no combined `/catalog` for guests, so the four public
 * lists are fetched together.
 */
export async function getCatalog(branchId = '') {
  // Products and add-ons follow the chosen branch's own menu and prices; categories and deals are shared.
  const query = branchId ? { branch_id: branchId } : undefined
  const [categories, products, deals, addons] = await Promise.all([
    api.get('/public/categories'),
    api.get('/public/products', { query }),
    api.get('/public/deals'),
    api.get('/public/addons', { query })
  ])
  return { categories, products, deals, addons }
}

export function getCategories() {
  return api.get('/public/categories')
}

export function getProducts() {
  return api.get('/public/products')
}

export function getProduct(id) {
  return api.get(`/public/products/${id}`)
}

export function getAddons() {
  return api.get('/public/addons')
}

export function getDeals() {
  return api.get('/public/deals')
}

/** The public deals route lists every deal, so one deal is picked out of that list. */
export async function getDeal(id) {
  const deals = await api.get('/public/deals')
  return (Array.isArray(deals) ? deals : []).find((deal) => String(deal.id) === String(id)) || null
}

/** Product with its linked add-ons (`addons` + `addon_details`). */
export function getProductDetails(id, branchId = '') {
  return api.get(`/public/products/${id}`, { query: branchId ? { branch_id: branchId } : undefined })
}

/** The ids of the products on one branch's menu, so a basket can be checked against another branch. */
export async function getBranchProductIds(branchId) {
  const rows = await api.get('/public/products', { query: { branch_id: branchId } })
  return new Set((Array.isArray(rows) ? rows : []).map((product) => String(product.id)))
}
