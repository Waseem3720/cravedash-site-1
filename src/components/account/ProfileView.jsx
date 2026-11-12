import { useEffect, useState } from 'react'
import AccountView from './AccountView'
import { useAuth } from '../../context/AuthContext'
import { useAddresses } from '../../context/AddressContext'

const UK_MOBILE_RE = /^07\d{9}$/

export default function ProfileView({ onBack }) {
  const { user, updateProfile } = useAuth()
  const { addresses } = useAddresses()

  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '' })
  const [avatarUrl, setAvatarUrl] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setForm({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      password: ''
    })
    setAvatarUrl(user?.avatarUrl || '')
  }, [user])

  const update = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }))

  const onSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      // Saved numbers can come back as +44 7…; the form and the check both use the 07… form.
      const phone = form.phone.trim().replace(/[\s-]/g, '').replace(/^\+44/, '0')
      if (!form.firstName.trim()) throw new Error('First name is required.')
      if (phone && !UK_MOBILE_RE.test(phone)) {
        throw new Error('Enter a valid UK mobile — start with 07, 11 digits (no +44)')
      }

      await updateProfile({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        phone,
        avatarUrl,
        ...(form.password.trim() ? { password: form.password.trim() } : {})
      })
      setForm((current) => ({ ...current, phone, password: '' }))
      setSuccess('Profile updated')
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Could not update profile')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AccountView title="My Profile" subtitle="Update your personal details" onBack={onBack} hero>
      <form className="account-form" onSubmit={onSubmit}>
        <div className="card">
          <label className="account-avatar-pick">
            <span className="eyebrow" style={{ marginBottom: 8 }}>
              Photo
            </span>
            <div className="account-avatar lg">
              {avatarUrl ? (
                <img src={avatarUrl} alt="" />
              ) : (
                <span className="avatar account-avatar-fallback">
                  {(form.firstName || 'C').slice(0, 1).toUpperCase()}
                </span>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={(event) => {
                const file = event.target.files?.[0] || null
                if (!file) return
                const reader = new FileReader()
                reader.onload = () => {
                  if (typeof reader.result === 'string') setAvatarUrl(reader.result)
                }
                reader.readAsDataURL(file)
              }}
            />
            {avatarUrl ? (
              <button
                type="button"
                className="account-avatar-delete"
                onClick={async () => {
                  setAvatarUrl('')
                  await updateProfile({ avatarUrl: '' })
                }}
              >
                Delete photo
              </button>
            ) : null}
          </label>

          <div className="field-row" style={{ marginTop: 16 }}>
            <div className="field">
              <label htmlFor="acc-fname">First name</label>
              <input
                id="acc-fname"
                required
                placeholder="e.g. Waseem"
                value={form.firstName}
                onChange={update('firstName')}
              />
            </div>
            <div className="field">
              <label htmlFor="acc-lname">Last name</label>
              <input
                id="acc-lname"
                placeholder="e.g. Hanif"
                value={form.lastName}
                onChange={update('lastName')}
              />
            </div>
          </div>

          <div className="field" style={{ marginTop: 12 }}>
            <label htmlFor="acc-email">Email</label>
            <input
              id="acc-email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={update('email')}
            />
          </div>

          <div className="field" style={{ marginTop: 12 }}>
            <label htmlFor="acc-phone">Phone</label>
            <input
              id="acc-phone"
              type="tel"
              placeholder="07123 456789"
              value={form.phone}
              onChange={update('phone')}
            />
            <small style={{ color: 'var(--muted)' }}>
              UK mobile — start with 07, 11 digits (no +44)
            </small>
          </div>

          <div className="field" style={{ marginTop: 12 }}>
            <label htmlFor="acc-pass">New password (optional)</label>
            <input
              id="acc-pass"
              type="password"
              placeholder="Leave blank to keep your current password"
              value={form.password}
              onChange={update('password')}
            />
          </div>

          {error && <p className="pp-form-error">{error}</p>}
          {success && <p className="account-ok">{success}</p>}

          <button
            className="btn btn--primary btn--block"
            type="submit"
            disabled={saving}
            style={{ marginTop: 16 }}
          >
            {saving ? 'Saving…' : 'Update profile'}
          </button>
        </div>

        <p className="account-muted">
          {addresses.length === 0
            ? 'No saved addresses yet — add one from Saved Addresses.'
            : `${addresses.length} saved address${addresses.length === 1 ? '' : 'es'} on this account.`}
        </p>
      </form>
    </AccountView>
  )
}
