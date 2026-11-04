import { useEffect, useState } from 'react'
import AccountView from './AccountView'
import { coupons as demoCoupons } from '../../data/account'
import { formatPrice } from '../../utils/format'
import { useToast } from '../../context/ToastContext'
import { isApiConfigured } from '../../api/client'
import { getCoupons } from '../../api/storefront'
import { mapCoupon } from '../../api/normalise'

export default function CouponsView({ onBack }) {
  const { toast } = useToast()
  const [copied, setCopied] = useState('')
  // With the API on, only the restaurant's own coupons are shown; the demo list is for the offline demo.
  const apiMode = isApiConfigured()
  const [coupons, setCoupons] = useState(apiMode ? [] : demoCoupons)
  const [loadError, setLoadError] = useState(false)

  useEffect(() => {
    if (!apiMode) return
    let cancelled = false
    getCoupons()
      .then((data) => {
        const rows = Array.isArray(data) ? data : data?.coupons
        if (!cancelled) setCoupons(Array.isArray(rows) ? rows.map(mapCoupon) : [])
      })
      .catch(() => {
        if (!cancelled) setLoadError(true)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const copy = async (code) => {
    try {
      await navigator.clipboard.writeText(code)
    } catch {
      /* clipboard is unavailable in some browsers — the code is still visible */
    }
    setCopied(code)
    toast(`Coupon ${code} copied`)
  }

  return (
    <AccountView title="Coupons" subtitle="Offers you can use at checkout" onBack={onBack} hero>
      {coupons.length === 0 ? (
        <p className="account-muted">
          {loadError ? 'Coupons could not be loaded right now.' : 'No coupons available.'}
        </p>
      ) : (
        <div className="coupon-list">
          {coupons.map((coupon) => (
            <article className="card coupon-card" key={coupon.id}>
              <div>
                <strong>{coupon.title}</strong>
                <p>
                  {coupon.discount}
                  {coupon.minSpend ? ` · Min ${formatPrice(coupon.minSpend)}` : ''}
                </p>
                <em>Code: {coupon.code}</em>
              </div>
              <button
                type="button"
                className="btn btn--outline btn--sm"
                onClick={() => copy(coupon.code)}
              >
                {copied === coupon.code ? 'Copied' : 'Copy'}
              </button>
            </article>
          ))}
        </div>
      )}
    </AccountView>
  )
}
