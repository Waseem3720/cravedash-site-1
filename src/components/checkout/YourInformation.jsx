import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'

/** Checkout contact details — editable inputs, with Update saving them to the profile. */
export default function YourInformation({ onChange }) {
  const { user, updateProfile } = useAuth()
  const { toast } = useToast()
  const [form, setForm] = useState({ firstName: '', lastName: '', phone: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const next = {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phone: user?.phone || ''
    }
    setForm(next)
    onChange?.(next)
  }, [user, onChange])

  const update = (key) => (event) => {
    const next = { ...form, [key]: event.target.value }
    setForm(next)
    onChange?.(next)
  }

  const save = async () => {
    setSaving(true)
    try {
      await updateProfile({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        phone: form.phone.trim()
      })
      toast('Contact details updated')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="card">
      <div className="card__head">
        <h2 className="card__title">Your Information</h2>
        <button type="button" className="btn btn--outline btn--sm" onClick={save} disabled={saving}>
          {saving ? 'Saving…' : 'Update'}
        </button>
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor="co-fname">First Name</label>
          <input
            id="co-fname"
            placeholder="e.g. Waseem"
            value={form.firstName}
            onChange={update('firstName')}
          />
        </div>
        <div className="field">
          <label htmlFor="co-lname">Last Name</label>
          <input
            id="co-lname"
            placeholder="e.g. Hanif"
            value={form.lastName}
            onChange={update('lastName')}
          />
        </div>
      </div>

      <div className="field" style={{ marginTop: 12 }}>
        <label htmlFor="co-phone">Phone Number</label>
        <input
          id="co-phone"
          type="tel"
          placeholder="07123 456789"
          value={form.phone}
          onChange={update('phone')}
        />
      </div>
    </section>
  )
}
