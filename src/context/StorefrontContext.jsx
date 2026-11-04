import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { categories as demoCategories } from '../data/categories'
import { products as demoProducts } from '../data/products'
import { deals as demoDeals } from '../data/deals'
import { banners as demoBanners } from '../data/banners'
import { restaurant } from '../data/restaurant'
import { isApiConfigured } from '../api/client'
import { getCatalog } from '../api/catalog'
import { getBanners, getConfig } from '../api/storefront'
import { mapBanner, mapCatalog, mapConfig } from '../api/normalise'

const StorefrontContext = createContext(null)

/** The restaurant's contact details from the dashboard. Missing values are null, so the page hides them. */
function buildProfile(contact) {
  const phone = contact?.phone || null
  const address = contact?.address || null
  const latitude = Number(contact?.latitude)
  const longitude = Number(contact?.longitude)
  return {
    phone,
    phoneHref: phone ? `tel:${phone.replace(/[^\d+]/g, "")}` : null,
    email: contact?.email || null,
    address: { full: address },
    location: Number.isFinite(latitude) && Number.isFinite(longitude) && contact?.latitude != null ? { latitude, longitude } : null
  }
}

/** The branch the customer picked, remembered on this device. */
const BRANCH_STORAGE_KEY = 'cravedash_branch_id'

function readStoredBranch() {
  try {
    return window.localStorage.getItem(BRANCH_STORAGE_KEY) || ''
  } catch {
    return ''
  }
}

function storeBranch(id) {
  try {
    window.localStorage.setItem(BRANCH_STORAGE_KEY, id)
  } catch {
    /* private mode: the choice lasts for this visit only */
  }
}

// With the API on, the menu is empty until the server answers; the demo menu is only for the offline demo.
const EMPTY = { categories: [], products: [], deals: [] }

const DEMO = {
  categories: demoCategories,
  products: demoProducts,
  deals: demoDeals
}

function withDefaults(overrides) {
  // Only what the server sends: no built-in delivery figures are shown for a live restaurant.
  const next = {}
  Object.entries(overrides || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && Number.isFinite(Number(value))) next[key] = Number(value)
  })
  return next
}

/**
 * Loads the storefront data (menu, settings, banners) from the API.
 * The menu follows the selected branch: changing the branch reloads the products and add-ons for it.
 * Without an API key / base URL the demo data is used, so the site always renders.
 */
export function StorefrontProvider({ children }) {
  const [catalog, setCatalog] = useState(isApiConfigured() ? EMPTY : DEMO)
  const [ordering, setOrdering] = useState(restaurant.ordering)
  // With the API on, banners come only from the restaurant; the demo banners are for the offline demo.
  const [banners, setBanners] = useState(isApiConfigured() ? [] : demoBanners)
  const [source, setSource] = useState(isApiConfigured() ? 'loading' : 'demo')
  const [error, setError] = useState('')
  const [branches, setBranches] = useState([])
  const [branchId, setBranchId] = useState(readStoredBranch)
  const [story, setStory] = useState(null)
  const [contact, setContact] = useState(null)
  // Each load gets a number; an older response that arrives late is ignored.
  const requestRef = useRef(0)

  const load = useCallback(async (requestedBranch = '') => {
    if (!isApiConfigured()) {
      setSource('demo')
      return
    }

    const requestId = ++requestRef.current
    setSource('loading')
    setError('')

    // Config first: it lists the branches and carries `base_urls`, which the catalog mapper needs.
    let configResult
    try {
      configResult = { status: 'fulfilled', value: await getConfig() }
    } catch (reason) {
      configResult = { status: 'rejected', reason }
    }
    if (requestId !== requestRef.current) return

    let activeBranch = requestedBranch
    if (configResult.status === 'fulfilled') {
      const mapped = mapConfig(configResult.value)
      if (mapped?.ordering) setOrdering(withDefaults(mapped.ordering))
      setStory(mapped?.story || null)
      setContact(mapped?.contact || null)
      const configBranches = mapped?.branches || []
      setBranches(configBranches)
      // Keep the chosen branch when it still exists; otherwise fall back to the default one.
      if (!configBranches.some((branch) => branch.id === activeBranch)) {
        const fallback = configBranches.find((branch) => branch.isDefault) || configBranches[0]
        activeBranch = fallback ? fallback.id : ''
      }
      setBranchId(activeBranch)
    }

    const [catalogResult, bannerResult] = await Promise.allSettled([getCatalog(activeBranch), getBanners()])
    if (requestId !== requestRef.current) return

    if (catalogResult.status === 'fulfilled') {
      // A branch with no products shows an empty menu, not the demo dishes.
      const mapped = mapCatalog(catalogResult.value) || { categories: [], products: [], deals: [] }
      setCatalog({ categories: mapped.categories, products: mapped.products, deals: mapped.deals })
    } else {
      setCatalog(isApiConfigured() ? EMPTY : DEMO)
    }

    if (bannerResult.status === 'fulfilled' && Array.isArray(bannerResult.value)) {
      setBanners(bannerResult.value.map(mapBanner))
    } else {
      setBanners([])
    }

    const failures = [configResult, catalogResult, bannerResult].filter((r) => r.status === 'rejected')
    setError(failures.length ? failures[0].reason?.message || 'Some storefront data could not load' : '')
    setSource(catalogResult.status === 'fulfilled' ? 'api' : 'demo')
  }, [])

  useEffect(() => {
    load(readStoredBranch())
  }, [load])

  const selectBranch = useCallback(
    (id) => {
      storeBranch(id)
      setBranchId(id)
      load(id)
    },
    [load]
  )

  const refresh = useCallback(() => load(branchId), [load, branchId])

  const profile = useMemo(() => buildProfile(contact), [contact])

  const selectedBranch = useMemo(
    () => branches.find((branch) => branch.id === branchId) || null,
    [branches, branchId]
  )

  const value = useMemo(
    () => ({
      ...catalog,
      banners,
      ordering,
      source,
      error,
      isLoading: source === 'loading',
      refresh,
      branches,
      branchId,
      selectedBranch,
      selectBranch,
      story,
      profile
    }),
    [catalog, banners, ordering, source, error, refresh, branches, branchId, selectedBranch, selectBranch, story, profile]
  )

  return <StorefrontContext.Provider value={value}>{children}</StorefrontContext.Provider>
}

export function useStorefront() {
  const context = useContext(StorefrontContext)
  if (!context) throw new Error('useStorefront must be used inside <StorefrontProvider>')
  return context
}

export default StorefrontContext
