import { useCart } from '../../context/CartContext'
import { formatPrice } from '../../utils/format'

function Lock() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
      <rect x="4.5" y="10.5" width="15" height="10" rx="2.5" />
      <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" strokeLinecap="round" />
    </svg>
  )
}

/** Card fields — the design shows a secure card block under the card option. */
export function SecureCardForm({ card, onChange }) {
  const update = (key) => (event) => onChange({ ...card, [key]: event.target.value })

  return (
    <div className="secure-pay">
      <p className="secure-pay__title">
        <Lock />
        Secure card payment
      </p>

      <div className="field">
        <label htmlFor="pay-number">Card Number *</label>
        <input
          id="pay-number"
          inputMode="numeric"
          autoComplete="cc-number"
          placeholder="1234 5678 9012 3456"
          value={card.number}
          onChange={(event) =>
            onChange({
              ...card,
              number: event.target.value
                .replace(/[^\d ]/g, '')
                .slice(0, 23)
            })
          }
        />
      </div>

      <div className="field">
        <label htmlFor="pay-name">Name on Card *</label>
        <input
          id="pay-name"
          autoComplete="cc-name"
          placeholder="Full name as it appears on the card"
          value={card.name}
          onChange={update('name')}
        />
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor="pay-expiry">Expiry Date *</label>
          <input
            id="pay-expiry"
            inputMode="numeric"
            autoComplete="cc-exp"
            placeholder="MM / YY"
            value={card.expiry}
            onChange={update('expiry')}
          />
        </div>
        <div className="field">
          <label htmlFor="pay-cvv">CVV *</label>
          <input
            id="pay-cvv"
            inputMode="numeric"
            autoComplete="cc-csc"
            placeholder="123"
            value={card.cvv}
            onChange={(event) => onChange({ ...card, cvv: event.target.value.replace(/[^\d]/g, '').slice(0, 4) })}
          />
        </div>
      </div>

      <label className="check secure-pay__save">
        <input
          type="checkbox"
          checked={Boolean(card.save)}
          onChange={(event) => onChange({ ...card, save: event.target.checked })}
        />
        <span>Save card for future payments</span>
      </label>
    </div>
  )
}

/** Step 2 — choose cash or card and, for card, fill in the card details. */
export default function PaymentStep({
  method,
  onMethodChange,
  card,
  onCardChange,
  error,
  total,
  onContinue
}) {
  const { mode } = useCart()

  const methods = [
    {
      id: 'cash',
      title: mode === 'delivery' ? 'Cash on Delivery' : 'Pay at Collection',
      note:
        mode === 'delivery'
          ? 'Pay with cash when your order arrives.'
          : 'Pay with cash when you collect your order.'
    },
    { id: 'card', title: 'Card Payment', note: 'Pay securely using your card.' }
  ]

  return (
    <section className="card">
      <h2 className="card__title">Choose payment method</h2>

      <div className="pay-methods">
        {methods.map((entry) => {
          const active = method === entry.id
          return (
            <label className={`pay-option${active ? ' is-active' : ''}`} key={entry.id}>
              <input
                type="radio"
                name="payment-method"
                value={entry.id}
                checked={active}
                onChange={() => onMethodChange(entry.id)}
              />
              <span className="pay-option__dot" aria-hidden="true" />
              <span className="pay-option__text">
                <b>{entry.title}</b>
                <small>{entry.note}</small>
              </span>
            </label>
          )
        })}
      </div>

      {method === 'card' && <SecureCardForm card={card} onChange={onCardChange} />}

      {error && <p className="pp-form-error">{error}</p>}

      <button
        type="button"
        className="btn btn--primary btn--block btn--lg pay-submit"
        onClick={onContinue}
      >
        {method === 'card' ? `Confirm and Pay · ${formatPrice(total)}` : `Continue · ${formatPrice(total)}`}
      </button>

      <p className="pay-terms">
        By placing this order you agree to our <a href="#terms">terms and conditions</a>.
      </p>
    </section>
  )
}
