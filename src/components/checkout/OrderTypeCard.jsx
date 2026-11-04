import { EMPTY_CART_ADDRESS, useCart } from '../../context/CartContext'
import { useStorefront } from '../../context/StorefrontContext'
import { useAddresses } from '../../context/AddressContext'

function Bike() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <circle cx="5.5" cy="17" r="3" />
      <circle cx="18.5" cy="17" r="3" />
      <path d="M6 17 10 7h3.5l3 10M8 12h6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function Home() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="m3 10.5 9-7.5 9 7.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.5 9.5V20h13V9.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function OrderTypeCard() {
  const { profile } = useStorefront()
  const { mode, setMode, address, updateAddress, setAddress } = useCart()
  const { addresses } = useAddresses()

  const useSaved = () => {
    const saved = addresses[0]
    if (!saved) return
    setAddress({
      ...EMPTY_CART_ADDRESS,
      house: saved.house || '',
      floor: saved.floor || '',
      road: saved.road || '',
      town: saved.address || '',
      postcode: saved.postcode || ''
    })
  }

  return (
    <section className="card">
      <h2 className="card__title">Order type</h2>

      <div className="mode-tabs" style={{ marginTop: 16 }}>
        <button
          type="button"
          className={`mode-tab${mode === 'delivery' ? ' is-active' : ''}`}
          onClick={() => setMode('delivery')}
        >
          <Bike />
          <b>Delivery</b>
          <small>35–45 min</small>
        </button>
        <button
          type="button"
          className={`mode-tab${mode === 'collection' ? ' is-active' : ''}`}
          onClick={() => setMode('collection')}
        >
          <Home />
          <b>Collection</b>
          <small>20–25 min</small>
        </button>
      </div>

      {mode === 'delivery' ? (
        <>
          <div className="field-row">
            <div className="field">
              <label htmlFor="co-house">House / flat *</label>
              <input
                id="co-house"
                required
                placeholder="House or flat number"
                value={address.house}
                onChange={(e) => updateAddress('house', e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="co-floor">Floor / apartment</label>
              <input
                id="co-floor"
                placeholder="Optional"
                value={address.floor}
                onChange={(e) => updateAddress('floor', e.target.value)}
              />
            </div>
          </div>

          <div className="field" style={{ marginTop: 12 }}>
            <label htmlFor="co-road">Street *</label>
            <input
              id="co-road"
              required
              placeholder="e.g. Kilmarnock Road"
              value={address.road}
              onChange={(e) => updateAddress('road', e.target.value)}
            />
          </div>

          <div className="field-row">
            <div className="field">
              <label htmlFor="co-town">Town / city *</label>
              <input
                id="co-town"
                required
                placeholder="e.g. Glasgow"
                value={address.town}
                onChange={(e) => updateAddress('town', e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="co-postcode">Postcode *</label>
              <input
                id="co-postcode"
                required
                placeholder="e.g. G41 3YN"
                value={address.postcode}
                onChange={(e) => updateAddress('postcode', e.target.value)}
              />
            </div>
          </div>

          <div className="field" style={{ marginTop: 12 }}>
            <label htmlFor="co-company">Company name</label>
            <input
              id="co-company"
              placeholder="Company Ltd"
              value={address.company}
              onChange={(e) => updateAddress('company', e.target.value)}
            />
          </div>

          <div className="field" style={{ marginTop: 12 }}>
            <label htmlFor="co-instructions">Order instructions</label>
            <textarea
              id="co-instructions"
              rows={3}
              maxLength={500}
              placeholder="eg. Entrance through large dark gate…"
              value={address.instructions}
              onChange={(e) => updateAddress('instructions', e.target.value)}
            />
            <div className="field-count">{address.instructions.length} / 500</div>
          </div>

          <div className="field" style={{ marginTop: 12 }}>
            <label htmlFor="co-delivery-notes">Delivery notes</label>
            <textarea
              id="co-delivery-notes"
              rows={3}
              maxLength={500}
              placeholder="Any additional notes for the delivery driver…"
              value={address.deliveryNotes}
              onChange={(e) => updateAddress('deliveryNotes', e.target.value)}
            />
            <div className="field-count">{address.deliveryNotes.length} / 500</div>
          </div>

          {addresses.length > 0 ? (
            <button type="button" className="btn btn--ghost btn--sm" style={{ marginTop: 14 }} onClick={useSaved}>
              Use saved address
            </button>
          ) : null}
        </>
      ) : (
        <div className="info-box" style={{ marginTop: 14 }}>
          <b>Collection address</b>
          <p>{profile.address.full}</p>
          <small>Please bring your order confirmation when collecting.</small>
        </div>
      )}
    </section>
  )
}
