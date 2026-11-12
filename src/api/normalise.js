/**
 * Maps CraveDash API payloads onto the shapes the UI already uses.
 * Everything is defensive: a missing field falls back to the demo value so a
 * half-configured backend never blanks out the page.
 */

const num = (value, fallback = 0) => {
  const amount = Number(value)
  return Number.isFinite(amount) ? amount : fallback
}

/**
 * `/config` hands out `base_urls.*` — media from the catalogue arrives as a
 * bare filename (`burger.jpg`) and needs that base prefixed to render.
 */
let API_BASE_URLS = {}

export function imageBaseUrl(kind) {
  return API_BASE_URLS[kind] || ''
}

/** Turn a bare filename into an absolute URL once `/config` has answered. */
export function resolveMedia(filename, kind = 'product_image_url') {
  const value = String(filename || '').trim()
  if (!value) return ''
  if (/^(https?:)?\/\//i.test(value)) return value
  const base = API_BASE_URLS[kind] || API_BASE_URLS.product_image_url || ''
  if (!base) return value
  return `${String(base).replace(/\/+$/, '')}/${value.replace(/^\/+/, '')}`
}

/** The image lives at `image` or inside `data`, depending on the endpoint. */
function pickImage(item) {
  return item?.image || item?.data?.image || item?.image_url || ''
}

export function mapCategory(category) {
  return {
    id: category?.id ?? category?.category_id ?? category?.name,
    name: category?.name || 'Menu',
    icon: 'list',
    tint: { background: 'var(--surface-2)', color: 'var(--ink-2)' }
  }
}

export function mapProduct(product) {
  const categoryId = product?.category_id ?? product?.categoryId ?? product?.category
  return {
    id: product?.id ?? product?.product_id,
    categoryId,
    name: product?.name || 'Dish',
    description: product?.description || '',
    price: num(product?.price ?? product?.from_price),
    wasPrice: num(product?.data?.compare_price ?? product?.compare_price, 0) || undefined,
    image: resolveMedia(pickImage(product), 'product_image_url'),
    status: product?.status,
    visible: product?.visible,
    addons: product?.addons || product?.addon_details || [],
    variations: Array.isArray(product?.data?.variations) ? product.data.variations : []
  }
}

export function mapDeal(deal) {
  return {
    id: deal?.id ?? deal?.deal_id,
    categoryId: 'deals',
    isDeal: true,
    name: deal?.name || 'Deal',
    description: deal?.description || '',
    price: num(deal?.price),
    wasPrice: num(deal?.was_price ?? deal?.compare_price, 0) || undefined,
    badge: deal?.badge || 'Deal',
    image: resolveMedia(pickImage(deal), 'product_image_url'),
    contents: Array.isArray(deal?.contents)
      ? deal.contents.map((line) => ({ label: line.label || 'Item', value: line.value || line.name || '' }))
      : [],
    slots: deal?.slots || []
  }
}

export function mapCatalog(payload) {
  if (!payload || typeof payload !== 'object') return null
  const categories = Array.isArray(payload.categories) ? payload.categories.map(mapCategory) : []
  const products = Array.isArray(payload.products) ? payload.products.map(mapProduct) : []
  const deals = Array.isArray(payload.deals) ? payload.deals.map(mapDeal) : []
  const addons = Array.isArray(payload.addons) ? payload.addons : []
  if (!categories.length && !products.length && !deals.length) return null
  return { categories, products, deals, addons }
}

/** Storefront settings: fees, minimum order, opening hours. */
export function mapConfig(payload) {
  if (!payload || typeof payload !== 'object') return null
  // Keep the media bases the mapper needs; grab them before the catalog maps.
  API_BASE_URLS = payload.base_urls || {}
  // The public config keeps the dashboard's order settings under `order_settings`.
  const ordering = payload.ordering || payload.delivery || payload.order_settings || payload
  const value = (keys, fallback) => {
    for (const key of keys) {
      const found = ordering?.[key]
      if (found !== undefined && found !== null && found !== '') return num(found, fallback)
    }
    return fallback
  }

  return {
    name: payload.name || payload.restaurant_name || '',
    phone: payload.phone || payload.contact_number || '',
    email: payload.email || '',
    currency: payload.currency || '',
    ordering: {
      deliveryCharge: value(['delivery_charge', 'delivery_fee', 'deliveryCharge'], undefined),
      freeDeliveryOver: value(['free_delivery_over', 'free_delivery_over_amount', 'free_delivery', 'freeDeliveryOver'], undefined),
      minimumOrder: value(['min_order', 'minimum_order', 'minimumOrder'], undefined),
      serviceFee: value(['service_charge', 'service_fee', 'serviceFee'], undefined),
      bagCharge: value(['bag_charge', 'bagCharge'], undefined)
    },
    paymentMethods: payload.payment_methods || payload.payments || null,
    branches: mapBranches(payload.branches),
    story: mapStory(payload),
    contact: mapContact(payload)
  }
}

/** Phone, e-mail, address and map position from the dashboard. Blank values are null. */
export function mapContact(payload) {
  const text = (value) => (typeof value === "string" && value.trim() ? value.trim() : null)
  return {
    phone: text(payload.restaurant_phone),
    email: text(payload.restaurant_email),
    address: text(payload.restaurant_address),
    latitude: payload.restaurant_location_coverage?.latitude ?? null,
    longitude: payload.restaurant_location_coverage?.longitude ?? null
  }
}

/** The "Our Story" section from the restaurant dashboard. Null when the restaurant has not filled it in. */
export function mapStory(payload) {
  const text = (value) => (typeof value === "string" && value.trim() ? value.trim() : "")
  const story = {
    eyebrow: text(payload.story_eyebrow),
    title: text(payload.story_title),
    paragraph1: text(payload.story_paragraph_1),
    paragraph2: text(payload.story_paragraph_2),
    circleLabel: text(payload.story_circle_label),
    image: text(payload.story_image)
  }
  return story.paragraph1 || story.paragraph2 ? story : null
}

/** Branches the customer can order from; switched-off branches are left out. */
export function mapBranches(list) {
  if (!Array.isArray(list)) return []
  return list
    .filter((branch) => branch && (branch.status === undefined || branch.status === 1 || branch.status === true))
    .map((branch) => ({
      id: String(branch.id),
      name: branch.name || `Branch ${branch.id}`,
      address: branch.address || '',
      image: branch.image || branch.cover_image || '',
      isDefault: Boolean(branch.is_default)
    }))
}

export function mapBanner(banner, index) {
  return {
    id: banner?.id ?? index,
    title: banner?.title || banner?.name || '',
    subTitle: banner?.sub_title || banner?.subtitle || banner?.description || '',
    image: resolveMedia(pickImage(banner), 'banner_image_url'),
    link: banner?.link || ''
  }
}

export function mapCoupon(coupon) {
  const type = String(coupon?.discount_type || coupon?.type || 'percent').toLowerCase()
  const isPercent = type === 'percent' || type === 'percentage'
  const amount = num(coupon?.discount ?? coupon?.amount ?? coupon?.value)
  const maxDiscount = num(coupon?.max_discount ?? coupon?.maxDiscount, 0)
  return {
    id: coupon?.id ?? coupon?.code,
    code: coupon?.code || coupon?.coupon_code || '',
    title: coupon?.title || coupon?.name || coupon?.description || 'Offer',
    discountType: isPercent ? 'percent' : 'amount',
    discountValue: amount,
    maxDiscount: maxDiscount > 0 ? maxDiscount : undefined,
    discount: isPercent ? `${amount}% off` : `£${amount.toFixed(2)} off`,
    // `/coupon/list` spells the limit `min_purchase`, `/coupon/apply` uses `min_spend`.
    minSpend: num(coupon?.min_spend ?? coupon?.min_purchase ?? coupon?.min_order ?? coupon?.minimum_order, 0) || undefined,
    expiresAt: coupon?.expiry || coupon?.expire_at || ''
  }
}

export function mapAddress(address) {
  return {
    id: address?.id ?? address?.address_id,
    contactPersonName: address?.contact_person_name || address?.name || '',
    contactPersonNumber: address?.contact_person_number || address?.phone || '',
    addressType: (address?.address_type || address?.type || 'home').toLowerCase(),
    house: address?.house || address?.address_line_1 || '',
    floor: address?.floor || address?.address_line_2 || '',
    road: address?.road || address?.street || '',
    address: address?.city || address?.town || address?.address || '',
    postcode: address?.postcode || '',
    isDefault: Boolean(address?.is_default)
  }
}

export function mapOrderLine(line) {
  return {
    productId: line?.product_id ?? line?.id ?? line?.item_id,
    name: line?.name || line?.item_name || 'Item',
    price: num(line?.price),
    image: resolveMedia(pickImage(line), 'product_image_url'),
    optionPath: line?.option_path || line?.options || '',
    quantity: num(line?.quantity ?? line?.qty, 1)
  }
}

export function mapOrder(order) {
  // The list endpoint names the status and amount `order_status` and `order_amount`; details use `status` and `total`.
  const status = order?.status || order?.order_status
  const total = order?.total ?? order?.order_amount
  return {
    id: order?.order_id ?? order?.id,
    status: String(status || 'pending').toLowerCase(),
    createdAt: order?.created_at || order?.createdAt || '',
    orderType: (order?.order_type || order?.orderType || 'order').toLowerCase(),
    mode: (order?.order_type || order?.mode || 'collection').toLowerCase(),
    payment: (order?.payment_method || order?.payment || '').toLowerCase(),
    paymentStatus: order?.payment_status || '',
    subtotal: num(order?.subtotal),
    deliveryCharge: num(order?.delivery_charge),
    discount: num(order?.discount),
    total: num(total),
    customer: {
      name: order?.customer?.name || order?.customer_name || '',
      phone: order?.customer?.phone || order?.customer_phone || '',
      email: order?.customer?.email || order?.customer_email || '',
      address: order?.delivery_address?.address || order?.delivery_address || '',
      postcode: order?.delivery_address?.postcode || ''
    },
    items: Array.isArray(order?.items) ? order.items.map(mapOrderLine) : [],
    history: Array.isArray(order?.history) ? order.history : [],
    driverDistanceKm: order?.driver_distance_km ?? null
  }
}

/**
 * Cart lines in the shape `POST /customer/order/calculate` / `place` expects:
 * products are `{ id, quantity, addons }`, deals are `{ deal_id, quantity,
 * selections }` (spec note 16).
 */
export function toApiCart(items) {
  return items.map((item) =>
    item.isDeal
      ? {
          deal_id: item.dealId || item.productId,
          quantity: item.quantity,
          selections: item.selections || []
        }
      : {
          id: item.productId,
          quantity: item.quantity,
          addons: item.addons || []
        }
  )
}
