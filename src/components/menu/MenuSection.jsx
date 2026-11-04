import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Icon from '../ui/Icon'
import CategoryRail from './CategoryRail'
import DealCard from './DealCard'
import FoodCard from './FoodCard'
import MenuSearch from './MenuSearch'
import { DEALS_CATEGORY_ID } from '../../data/deals'
import { useStorefront } from '../../context/StorefrontContext'
import { pluralise } from '../../utils/format'

const MENU_VIEW = 'image'

const DEALS_CATEGORY = {
  id: DEALS_CATEGORY_ID,
  name: 'Deals',
  icon: 'star',
  tint: { background: 'var(--orange-soft)', color: 'var(--orange)' }
}

export default function MenuSection({ showHeading = true }) {
  const { categories, products, deals } = useStorefront()
  const [query, setQuery] = useState('')
  const [activeId, setActiveId] = useState(DEALS_CATEGORY_ID)
  const sectionRefs = useRef({})

  const counts = useMemo(() => {
    const map = { [DEALS_CATEGORY_ID]: deals.length }
    categories.forEach((category) => {
      map[category.id] = products.filter((product) => product.categoryId === category.id).length
    })
    return map
  }, [categories, products, deals])

  const term = query.trim().toLowerCase()

  const filteredDeals = useMemo(() => {
    if (!term) return deals
    return deals.filter(
      (deal) =>
        deal.name.toLowerCase().includes(term) ||
        (deal.description || '').toLowerCase().includes(term) ||
        (deal.contents || []).some((line) => String(line.value).toLowerCase().includes(term))
    )
  }, [deals, term])

  const filtered = useMemo(() => {
    if (!term) return products
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(term) ||
        (product.description || '').toLowerCase().includes(term)
    )
  }, [products, term])

  const railCategories = [DEALS_CATEGORY, ...categories]
  const visibleCategories = railCategories.filter((category) =>
    category.id === DEALS_CATEGORY_ID
      ? filteredDeals.length > 0
      : filtered.some((product) => product.categoryId === category.id)
  )

  /**
   * While a rail click glides the page, the scroll spy would re-highlight
   * every section it flies past (the "blink"), so it is paused until the
   * scroll settles.
   */
  const spyLockRef = useRef({ active: false, timer: 0 })

  const spyCurrent = useCallback(() => {
    const offset = 140
    let current = visibleCategories[0]?.id
    visibleCategories.forEach((category) => {
      const node = sectionRefs.current[category.id]
      if (node && node.getBoundingClientRect().top <= offset) current = category.id
    })
    return current
  }, [visibleCategories])

  const scrollToCategory = useCallback((id, behavior = 'smooth') => {
    const node = sectionRefs.current[id]
    if (!node) return
    const offset = Number.parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue('--header-offset')
    )
    const top = node.getBoundingClientRect().top + window.scrollY - (Number.isFinite(offset) ? offset : 110) - 8
    window.scrollTo({ top, behavior })
    spyLockRef.current.active = true
    setActiveId(id)
  }, [])

  // Scroll spy so the rail highlights the section currently on screen.
  useEffect(() => {
    const onScroll = () => {
      if (spyLockRef.current.active) {
        // Pause: keep the clicked section highlighted until the glide stops.
        window.clearTimeout(spyLockRef.current.timer)
        spyLockRef.current.timer = window.setTimeout(() => {
          spyLockRef.current.active = false
          const current = spyCurrent()
          if (current) setActiveId(current)
        }, 180)
        return
      }
      const current = spyCurrent()
      if (current) setActiveId(current)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.clearTimeout(spyLockRef.current.timer)
      window.removeEventListener('scroll', onScroll)
    }
  }, [visibleCategories, spyCurrent])

  return (
    <div className="full-menu cd-menu" id="full-menu" data-menu-view={MENU_VIEW}>
      <div className="menu-sticky-sentinel" aria-hidden="true" />

      <CategoryRail
        variant="mobile"
        categories={railCategories}
        counts={counts}
        activeId={activeId}
        onSelect={scrollToCategory}
      />

      <div className="menu-sticky-spacer" aria-hidden="true" />

      <div className="container">
        <div>
          <div>
            <div className="cd-menu__hd">
              <div>
                {showHeading && <p className="eyebrow">Full menu</p>}
                <h2 className="cd-menu__ttl">
                  {pluralise(filtered.length, 'dish', 'dishes')}, cooked to order
                </h2>
              </div>
              <MenuSearch value={query} onChange={setQuery} />
            </div>

            <div className="cd-menu__grid">
              <CategoryRail
                categories={railCategories}
                counts={counts}
                activeId={activeId}
                onSelect={(id) => scrollToCategory(id)}
              />

              <div className="cd-menu__main">
                {filteredDeals.length > 0 && (
                  <section
                    className="cd-sec section cd-sec--deals"
                    id={`cat-${DEALS_CATEGORY_ID}`}
                    data-cat-id={DEALS_CATEGORY_ID}
                    ref={(node) => {
                      sectionRefs.current[DEALS_CATEGORY_ID] = node
                    }}
                  >
                    <div className="cd-sec__hd">
                      <span className="cd-sec__ic cd-sec__ic--deal">
                        <span className="cd-rail__ic" aria-hidden="true" style={DEALS_CATEGORY.tint}>
                          <Icon name="star" size={18} />
                        </span>
                      </span>
                      <div>
                        <p className="eyebrow">Limited</p>
                        <h2 className="cd-sec__ttl section__title">Deals</h2>
                      </div>
                      <div className="cd-sec__meta">
                        <span className="cd-sec__ct num">{pluralise(filteredDeals.length, 'item')}</span>
                      </div>
                    </div>

                    <div className="cd-dealx-list cd-deal-list">
                      {filteredDeals.map((deal) => (
                        <DealCard key={deal.id} deal={deal} />
                      ))}
                    </div>
                  </section>
                )}

                {visibleCategories
                  .filter((category) => category.id !== DEALS_CATEGORY_ID)
                  .map((category) => {
                    const items = filtered.filter((product) => product.categoryId === category.id)
                    return (
                      <section
                        className="cd-sec section"
                        id={`cat-${category.id}`}
                        data-cat-id={category.id}
                        key={category.id}
                        ref={(node) => {
                          sectionRefs.current[category.id] = node
                        }}
                      >
                        <div className="cd-sec__hd">
                          <span className="cd-sec__ic">
                            <span className="cd-rail__ic" aria-hidden="true" style={category.tint}>
                              <Icon name={category.icon} size={18} />
                            </span>
                          </span>
                          <div>
                            <h2 className="cd-sec__ttl section__title">{category.name}</h2>
                          </div>
                          <div className="cd-sec__meta">
                            <span className="cd-sec__ct num">{pluralise(items.length, 'item')}</span>
                          </div>
                        </div>

                        <div className="menu-grid" data-display-mode={MENU_VIEW}>
                          {items.map((product) => (
                            <FoodCard key={product.id} product={product} />
                          ))}
                        </div>
                      </section>
                    )
                  })}

                {visibleCategories.length === 0 && (
                  <p className="pp-empty">
                    No dishes match “{query}”. Try another search or clear the field.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
