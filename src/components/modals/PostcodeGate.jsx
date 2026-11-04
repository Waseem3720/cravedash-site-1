import { useEffect, useState } from 'react'
import Icon from '../ui/Icon'
import { restaurant } from '../../data/restaurant'
import { formatPrice } from '../../utils/format'
import { useDelivery } from '../../context/DeliveryContext'
import { useBodyLock } from '../../hooks/useUiEffects'

export default function PostcodeGate() {
  const {
    gateOpen,
    closeGate,
    postcode,
    covered,
    checkPostcode,
    continueWithDelivery,
    continueWithCollection
  } = useDelivery()

  const [value, setValue] = useState(postcode)
  const [error, setError] = useState('')
  const [checking, setChecking] = useState(false)

  useBodyLock(gateOpen)

  useEffect(() => {
    if (gateOpen) {
      setValue(postcode)
      setError('')
    }
  }, [gateOpen, postcode])

  useEffect(() => {
    if (!gateOpen) return undefined
    const onKeyDown = (event) => {
      if (event.key === 'Escape') closeGate()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [gateOpen, closeGate])

  if (!gateOpen) return null

  const onSubmit = async (event) => {
    event.preventDefault()
    setChecking(true)
    try {
      const result = await checkPostcode(value)
      if (result.ok) {
        setError('')
      } else if (result.reason === 'not-covered') {
        setError('Sorry, we do not deliver to this postcode yet — collection is still available.')
      } else {
        setError('Please enter a valid UK postcode (e.g. G41 3YN)')
      }
    } finally {
      setChecking(false)
    }
  }

  return (
    <div
      className="cd-gate-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cd-gate-title"
    >
      <div className="cd-gate">
        <h2 id="cd-gate-title" className="cd-gate__title">
          Where should we deliver?
        </h2>
        <p className="cd-gate__hint" style={{ marginTop: 0, marginBottom: 12 }}>
          Enter your UK postcode to check delivery, or continue for collection only.
        </p>

        <form onSubmit={onSubmit}>
          <label className="cd-gate__label" htmlFor="cd-gate-pc">
            Delivery postcode
          </label>
          <div className="cd-gate__row">
            <input
              id="cd-gate-pc"
              className="cd-gate__input"
              autoComplete="postal-code"
              placeholder="e.g. G41 3YN"
              type="text"
              value={value}
              onChange={(event) => {
                setValue(event.target.value)
                setError('')
              }}
            />
            <button type="submit" className="btn btn--primary cd-gate__btn" disabled={checking}>
              {checking ? 'Checking…' : 'Check'}
            </button>
          </div>
        </form>

        {error && (
          <div className="cd-gate__result">
            <p className="cd-gate__fail">{error}</p>
          </div>
        )}

        {covered && !error && (
          <div className="cd-gate__result">
            <p className="cd-gate__ok">
              <Icon name="truck" /> We deliver to this location
            </p>
            <p className="cd-gate__hint">
              Delivery from {formatPrice(restaurant.ordering.deliveryCharge)} · free over{' '}
              {formatPrice(restaurant.ordering.freeDeliveryOver)}
            </p>
            <div className="cd-gate__cta">
              <button type="button" className="btn btn--primary" onClick={continueWithDelivery}>
                Continue with delivery
              </button>
            </div>
          </div>
        )}

        <div className="cd-gate__cta cd-gate__cta--idle">
          <button type="button" className="btn btn--outline" onClick={continueWithCollection}>
            Collection only
          </button>
        </div>

        <button type="button" className="cd-gate__close" aria-label="Close" onClick={closeGate}>
          <Icon name="close" />
        </button>
      </div>
    </div>
  )
}
