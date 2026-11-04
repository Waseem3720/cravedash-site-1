import { useEffect, useMemo, useState } from 'react'
import Icon from '../ui/Icon'
import OptionGroup from './OptionGroup'
import { addOnsFor, optionGroupsFor, variationGroupsFor } from '../../data/productOptions'
import { isApiConfigured } from '../../api/client'
import { getDeal, getProductDetails } from '../../api/catalog'
import { previewDeal } from '../../api/orders'
import { computeUnitPrice, optionDeltaLabel, optionPathLabel, fromPrice } from '../../utils/pricing'
import { dishImage, formatPrice, onDishImageError } from '../../utils/format'
import { useCart } from '../../context/CartContext'
import { useUI } from '../../context/UIContext'
import { useToast } from '../../context/ToastContext'
import { useStorefront } from '../../context/StorefrontContext'
import { useFavourites } from '../../context/FavouritesContext'
import { useBodyLock } from '../../hooks/useUiEffects'

const DESC_LIMIT = 160
const PREVIEW_LIMIT = 3

function ItemModalBody({ product, onClose }) {
  const { branchId } = useStorefront()
  const { addItem } = useCart()
  const { toast } = useToast()
  const { isFavourite, toggle: toggleFavourite } = useFavourites()

  // With the API on, options are the restaurant's own variations; the built-in demo options are for the offline demo only.
  const groups = useMemo(
    () => (isApiConfigured() ? variationGroupsFor(product) : optionGroupsFor(product)),
    [product]
  )

  /**
   * `GET /products/details/{id}` lists the add-ons linked to this product in
   * the back office. With the API on, only those add-ons are offered. Offline, the demo add-ons show.
   */
  const [apiAddOns, setApiAddOns] = useState(null)
  const addOns = useMemo(() => {
    if (isApiConfigured()) return Array.isArray(apiAddOns) ? apiAddOns : []
    return addOnsFor(product)
  }, [apiAddOns, product])

  /**
   * Deal slots. The catalog payload leaves `slots` empty, so deals fetch their
   * slots from `GET /deals/:id`; the demo catalog keeps whatever it ships with.
   */
  const [apiSlots, setApiSlots] = useState(null)
  const slots = useMemo(() => {
    if (!product.isDeal) return []
    if (Array.isArray(apiSlots) && apiSlots.length) return apiSlots
    // Catalog slots carry items as `{ product_id, name }`; the picker works on names.
    return Array.isArray(product.slots)
      ? product.slots.map((slot) => ({
          ...slot,
          items: Array.isArray(slot.items)
            ? slot.items.map((item) => (typeof item === 'string' ? item : item?.name || ''))
            : []
        }))
      : []
  }, [product.isDeal, product.slots, apiSlots])
  /** A slot that asks for more items than the menu has can never be filled, so the deal cannot be ordered. */
  const unfillableSlot = product.isDeal
    ? slots.find((slot) => Number(slot.required || 0) > (slot.items || []).length)
    : null
  /** Slot choices: `{ [slotId]: [itemName, …] }` — exactly `required` picks. */
  const [picks, setPicks] = useState({})

  const [selected, setSelected] = useState(() => groups.map((group) => group.values.map(() => false)))
  const [addOnActive, setAddOnActive] = useState(() => addOns.map(() => false))
  const [quantity, setQuantity] = useState(1)
  const [showFullDesc, setShowFullDesc] = useState(false)
  const [showAllAddOns, setShowAllAddOns] = useState(false)
  const [error, setError] = useState('')

  useBodyLock(true)

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  // Deal slots (label, required count, item names) — deal builder data.
  useEffect(() => {
    if (!isApiConfigured() || !product.isDeal) return undefined
    let cancelled = false

    getDeal(product.id)
      .then((data) => {
        if (!cancelled && Array.isArray(data?.slots) && data.slots.length) {
          setApiSlots(
            data.slots.map((slot) => ({
              id: slot?.id || slot?.slot_id,
              label: slot?.label || 'Choose items',
              required: Number(slot?.required) || 0,
              items: Array.isArray(slot?.items)
                ? slot.items.map((item) => (typeof item === 'string' ? item : item?.name || ''))
                : []
            }))
          )
        }
      })
      .catch(() => {
        /* the catalog copy of the deal stays as a fallback */
      })

    return () => {
      cancelled = true
    }
  }, [product.id, product.isDeal])

  // Product-specific add-ons (name + price) straight from the catalogue API.
  useEffect(() => {
    if (!isApiConfigured() || product.isDeal) return undefined
    let cancelled = false

    getProductDetails(product.id, branchId)
      .then((data) => {
        const list = Array.isArray(data?.addon_details) ? data.addon_details : []
        const usable = list
          .filter((addon) => addon && addon.status !== false && addon.name)
          .map((addon) => ({ id: addon.id, name: addon.name, price: Number(addon.price) || 0 }))
        if (!cancelled && usable.length) setApiAddOns(usable)
      })
      .catch(() => {
        /* keep the catalogue defaults */
      })

    return () => {
      cancelled = true
    }
  }, [product.id, product.isDeal, branchId])

  // Add-on switches are positional, so re-shape them when the list changes.
  useEffect(() => {
    setAddOnActive((current) => addOns.map((_, index) => Boolean(current[index])))
  }, [addOns])

  const unitPrice = computeUnitPrice({ product, groups, addOns, selected, addOnActive })
  const total = Number((unitPrice * quantity).toFixed(2))
  const priceTeaser = fromPrice(product, groups)
  const favourite = isFavourite(product.id)

  const description = String(product.description || '')
  const truncated = description.length > DESC_LIMIT
  const visibleDescription =
    !truncated || showFullDesc ? description : `${description.slice(0, DESC_LIMIT).trimEnd()}…`

  const toggleOption = (group, valueIndex) => {
    const groupIndex = groups.indexOf(group)
    setSelected((current) => {
      const next = current.map((row) => [...row])
      const row = next[groupIndex]

      if (group.type === 'multi') {
        const max = Number(group.max || 0)
        const activeCount = row.filter(Boolean).length
        if (!row[valueIndex] && max > 0 && activeCount >= max) {
          setError(`Maximum for ${group.name} is ${max}`)
          return current
        }
        row[valueIndex] = !row[valueIndex]
      } else if (row[valueIndex]) {
        // Single choice: keep it while the group is mandatory, otherwise clear it.
        row[valueIndex] = Boolean(group.required)
      } else {
        row.fill(false)
        row[valueIndex] = true
      }

      return next
    })
    setError('')
  }

  const toggleAddOn = (index) => {
    setAddOnActive((current) => current.map((isOn, i) => (i === index ? !isOn : isOn)))
    setError('')
  }

  /** Deal slot choice — exactly `required` names per slot (spec note 16). */
  const toggleSlot = (slot, item) => {
    setPicks((current) => {
      const list = [...(current[slot.id] || [])]
      if (list.includes(item)) {
        list.splice(list.indexOf(item), 1)
      } else {
        const max = Number(slot.required || 0)
        if (max && list.length >= max) {
          setError(`Pick ${max} item${max === 1 ? '' : 's'} for ${slot.label}`)
          return current
        }
        list.push(item)
      }
      return { ...current, [slot.id]: list }
    })
    setError('')
  }

  const handleDealAdd = async () => {
    const missing = slots.find(
      (slot) => Number(slot.required || 0) > 0 && (picks[slot.id] || []).length !== Number(slot.required)
    )
    if (missing) {
      setError(`Pick ${missing.required} item${missing.required === 1 ? '' : 's'} for ${missing.label}`)
      return
    }

    const selections = slots.flatMap((slot) =>
      (picks[slot.id] || []).map((name) => ({ slot_id: slot.id, name }))
    )
    const optionPath = slots
      .flatMap((slot) => picks[slot.id] || [])
      .join(', ')

    // `/customer/order/deal-preview` validates the selection against the deal.
    if (isApiConfigured()) {
      try {
        await previewDeal({ dealId: product.id, selections })
      } catch (previewError) {
        setError(previewError?.message || 'This deal selection is not valid.')
        return
      }
    }

    addItem(product, quantity, {
      unitPrice: product.price,
      optionPath,
      isDeal: true,
      selections
    })
    toast(`${quantity} × ${product.name} added to your cart — ${formatPrice(total)}`)
    onClose()
  }

  const handleAdd = () => {
    for (let groupIndex = 0; groupIndex < groups.length; groupIndex += 1) {
      const group = groups[groupIndex]
      const chosen = (selected[groupIndex] || []).filter(Boolean).length
      const min = Number(group.min || (group.required ? 1 : 0))

      if (group.required && chosen === 0) {
        setError(`Choose an option from ${group.name}`)
        return
      }
      if (chosen > 0 && chosen < min) {
        setError(`Select at least ${min} options from ${group.name}`)
        return
      }
    }

    const path = optionPathLabel({ groups, selected, addOns, addOnActive })
    // The chosen add-ons travel by name so the server can price each one from its own add-on list.
    const chosenAddons = addOns.filter((_, index) => addOnActive[index]).map((addOn) => ({ name: addOn.name }))
    // The server prices one variation per line, so the first option group's pick is the variation sent.
    const firstPick = (selected[0] || []).findIndex(Boolean)
    const variation = isApiConfigured() && groups[0] && firstPick !== -1 ? groups[0].values[firstPick].name : undefined
    addItem(product, quantity, { unitPrice, optionPath: path, addons: chosenAddons, variation })
    toast(
      `${quantity} × ${product.name} added to your cart — ${formatPrice(total)}`
    )
    onClose()
  }

  const submit = product.isDeal ? handleDealAdd : handleAdd

  const visibleAddOns = showAllAddOns ? addOns : addOns.slice(0, PREVIEW_LIMIT)

  return (
    <div
      className="modal item-modal is-open"
      role="dialog"
      aria-modal="true"
      aria-label={product.name}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div className="modal__box" onMouseDown={(event) => event.stopPropagation()}>
        <button className="modal__close" type="button" aria-label="Close" onClick={onClose}>
          <Icon name="close" />
        </button>

        <div className="item-modal__media">
          <img alt={product.name} src={dishImage(product.image)} onError={onDishImageError} />
          <button
            type="button"
            className={`item-modal__fav fav${favourite ? ' is-on' : ''}`}
            aria-label={favourite ? 'Remove from favourites' : 'Add to favourites'}
            aria-pressed={favourite}
            onClick={() => toggleFavourite(product.id)}
          >
            <Icon name="heart" />
          </button>
        </div>

        <div className="item-modal__body">
          <p className="eyebrow">Customise</p>
          <h3 className="item-modal__name">{product.name}</h3>
          <p className="item-modal__price">
            {product.isDeal ? '' : 'from '}
            {formatPrice(product.isDeal ? product.price : priceTeaser)}
          </p>

          {description ? (
            <>
              <p className="item-modal__desc">{visibleDescription}</p>
              {truncated && (
                <button
                  type="button"
                  className="show-more"
                  onClick={() => setShowFullDesc((open) => !open)}
                >
                  {showFullDesc ? 'Show less' : 'Show More'}
                  {showFullDesc ? null : (
                    <svg
                      viewBox="0 0 24 24"
                      width="12"
                      height="12"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  )}
                </button>
              )}
            </>
          ) : null}

          {groups.map((group, groupIndex) => (
            <OptionGroup
              key={group.id}
              group={group}
              selected={selected[groupIndex]}
              onToggle={toggleOption}
            />
          ))}

          {unfillableSlot ? (
            <p className="deal-notice" role="alert">
              {unfillableSlot.label} needs {unfillableSlot.required} items but only{' '}
              {(unfillableSlot.items || []).length} {(unfillableSlot.items || []).length === 1 ? 'is' : 'are'} on the
              menu. This deal cannot be ordered until the restaurant fixes it.
            </p>
          ) : null}

          {slots.map((slot) => (
            <div className="deal-slot" key={slot.id}>
              <div className="opt-head">
                <b>{slot.label}</b>
                <span className="opt-flag opt-flag--optional">
                  choose {slot.required || (picks[slot.id] || []).length}
                </span>
              </div>
              {slot.items.map((item) => {
                const active = (picks[slot.id] || []).includes(item)
                return (
                  <label className="opt-row" key={`${slot.id}-${item}`}>
                    <b>{item}</b>
                    <span />
                    <span className="switch">
                      <input
                        type="checkbox"
                        checked={active}
                        onChange={() => toggleSlot(slot, item)}
                      />
                      <span />
                    </span>
                  </label>
                )
              })}
            </div>
          ))}

          {!product.isDeal && addOns.length > 0 && (
            <>
              <div className="opt-head">
                <b>Add-ons</b>
                <span className="opt-flag opt-flag--optional">optional</span>
              </div>
              {visibleAddOns.map((addOn, index) => (
                <label className="opt-row" key={addOn.id}>
                  <b>{addOn.name}</b>
                  <span>{optionDeltaLabel(addOn.price)}</span>
                  <span className="switch">
                    <input
                      type="checkbox"
                      checked={Boolean(addOnActive[index])}
                      onChange={() => toggleAddOn(index)}
                    />
                    <span />
                  </span>
                </label>
              ))}
              {addOns.length > PREVIEW_LIMIT && (
                <button
                  type="button"
                  className="show-more"
                  onClick={() => setShowAllAddOns((open) => !open)}
                >
                  {showAllAddOns ? 'Show less' : 'Show More'}
                </button>
              )}
            </>
          )}

          {error && <p className="pp-form-error">{error}</p>}
        </div>

        <div className="item-modal__sticky">
          <div className="item-modal__foot">
            <span className="qty">
              <button
                type="button"
                aria-label="Decrease"
                onClick={() => setQuantity((current) => Math.max(1, current - 1))}
              >
                −
              </button>
              <output>{quantity}</output>
              <button type="button" aria-label="Increase" onClick={() => setQuantity((current) => current + 1)}>
                +
              </button>
            </span>
            <span className="item-modal__total">
              Total: <b>{formatPrice(total)}</b>
            </span>
          </div>

          <div className="item-modal__actions">
            <button className="btn btn--ghost" type="button" onClick={onClose}>
              Cancel
            </button>
            <button className="btn btn--primary" type="button" onClick={submit} disabled={Boolean(unfillableSlot)}>
              {product.isDeal ? 'Add deal — ' : 'Preorder — '}
              {formatPrice(total)}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/** Product detail popup — opened from any menu card. */
export default function ItemModal() {
  const { activeProduct, closeProduct } = useUI()

  if (!activeProduct) return null

  return <ItemModalBody key={activeProduct.id} product={activeProduct} onClose={closeProduct} />
}
