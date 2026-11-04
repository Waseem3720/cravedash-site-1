import { useEffect, useState } from 'react'
import AccountView from './AccountView'
import { EMPTY_ADDRESS, useAddresses } from '../../context/AddressContext'
import { useAuth } from '../../context/AuthContext'
import { isValidUkPostcode, normalisePostcode } from '../../utils/format'

const UK_MOBILE_RE = /^07\d{9}$/

export default function AddressesView({ onBack }) {
  const { addresses, saveAddress, removeAddress } = useAddresses()
  const { user } = useAuth()
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(EMPTY_ADDRESS)
  const [error, setError] = useState('')

  useEffect(() => {
    if (editingId) return
    setForm((current) => ({
      ...current,
      contactPersonName:
        current.contactPersonName || [user?.firstName, user?.lastName].filter(Boolean).join(' '),
      contactPersonNumber: current.contactPersonNumber || user?.phone || ''
    }))
  }, [user, editingId])

  const update = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }))

  const reset = () => {
    setEditingId(null)
    setForm({ ...EMPTY_ADDRESS })
    setError('')
  }

  const onSubmit = async (event) => {
    event.preventDefault()
    const postcode = normalisePostcode(form.postcode)
    const phone = form.contactPersonNumber.trim().replace(/[\s-]/g, '')

    if (!form.house.trim() || !form.road.trim() || !form.address.trim()) {
      setError('House/flat, street, and town/city are required.')
      return
    }
    if (!isValidUkPostcode(postcode)) {
      setError('Please enter a valid UK postcode (e.g. G41 3YN)')
      return
    }
    if (phone && !UK_MOBILE_RE.test(phone)) {
      setError('Enter a valid UK mobile — start with 07, 11 digits (no +44)')
      return
    }

    try {
      await saveAddress({
        ...form,
        id: editingId || undefined,
        postcode,
        contactPersonNumber: phone,
        contactPersonName: form.contactPersonName.trim()
      })
      reset()
    } catch (saveError) {
      setError(saveError?.message || 'This address could not be saved. Please try again.')
    }
  }

  return (
    <AccountView
      title="Saved Addresses"
      subtitle="Manage delivery and collection addresses"
      onBack={onBack}
      hero
    >
      {addresses.length === 0 ? <p className="account-muted">No saved addresses yet.</p> : null}

      <div className="address-list">
        {addresses.map((address) => (
          <article className="card address-card" key={address.id}>
            <div>
              <strong>{address.contactPersonName}</strong>
              <span className="tag tag--prep">{address.addressType || 'home'}</span>
              <p>{[address.house, address.road, address.address].filter(Boolean).join(', ')}</p>
              {address.postcode ? <p>{address.postcode}</p> : null}
              {address.contactPersonNumber ? <em>{address.contactPersonNumber}</em> : null}
            </div>
            <div className="address-actions">
              <button
                type="button"
                className="btn btn--ghost btn--sm"
                onClick={() => {
                  setEditingId(address.id)
                  setForm({ ...EMPTY_ADDRESS, ...address })
                  setError('')
                }}
              >
                Edit
              </button>
              <button
                type="button"
                className="text-link-btn"
                onClick={() => removeAddress(address.id)}
              >
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>

      <form className="account-form" onSubmit={onSubmit}>
        <div className="card">
          <div className="field">
            <label htmlFor="ad-name">Contact name</label>
            <input
              id="ad-name"
              placeholder="e.g. Waseem Hanif"
              value={form.contactPersonName}
              onChange={update('contactPersonName')}
            />
          </div>

          <div className="field" style={{ marginTop: 12 }}>
            <label htmlFor="ad-phone">Contact phone</label>
            <input
              id="ad-phone"
              type="tel"
              placeholder="07123 456789"
              value={form.contactPersonNumber}
              onChange={update('contactPersonNumber')}
            />
            <small style={{ color: 'var(--muted)' }}>
              UK mobile — start with 07, 11 digits (no +44)
            </small>
          </div>

          <div className="field" style={{ marginTop: 12 }}>
            <label htmlFor="ad-type">Type</label>
            <select id="ad-type" value={form.addressType} onChange={update('addressType')}>
              <option value="home">Home</option>
              <option value="work">Work</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="field-row">
            <div className="field">
              <label htmlFor="ad-house">House / flat *</label>
              <input
                id="ad-house"
                required
                placeholder="House or flat number"
                value={form.house}
                onChange={update('house')}
              />
            </div>
            <div className="field">
              <label htmlFor="ad-floor">Floor</label>
              <input
                id="ad-floor"
                placeholder="Optional"
                value={form.floor}
                onChange={update('floor')}
              />
            </div>
          </div>

          <div className="field" style={{ marginTop: 12 }}>
            <label htmlFor="ad-road">Street *</label>
            <input
              id="ad-road"
              required
              placeholder="e.g. Kilmarnock Road"
              value={form.road}
              onChange={update('road')}
            />
          </div>

          <div className="field">
            <label htmlFor="ad-town">Town / city *</label>
            <input
              id="ad-town"
              required
              placeholder="e.g. Glasgow"
              value={form.address}
              onChange={update('address')}
            />
          </div>

          <div className="field">
            <label htmlFor="ad-postcode">Postcode *</label>
            <input
              id="ad-postcode"
              required
              placeholder="e.g. G41 3YN"
              value={form.postcode}
              onChange={update('postcode')}
            />
          </div>

          {error && <p className="pp-form-error">{error}</p>}

          <button className="btn btn--primary btn--block btn--lg" type="submit" style={{ marginTop: 16 }}>
            {editingId ? 'Save address' : 'Save address'}
          </button>

          {editingId ? (
            <div className="account-form-actions">
              <button className="btn btn--ghost" type="button" onClick={reset}>
                Cancel edit
              </button>
            </div>
          ) : null}
        </div>
      </form>
    </AccountView>
  )
}
