import { useState } from 'react'
import Modal from '../ui/Modal'
import Icon from '../ui/Icon'
import { useAuth } from '../../context/AuthContext'
import { useUI } from '../../context/UIContext'
import { useToast } from '../../context/ToastContext'

import * as authApi from '../../api/auth'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const UK_MOBILE_RE = /^07\d{9}$/

function LoginForm({ onSwitch }) {
  const { login, loginWithSocial } = useAuth()
  const { closeAuth } = useUI()
  const { toast } = useToast()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const handleSocial = async (provider) => {
    setError('')
    setBusy(true)
    try {
      if (provider === 'google') {
        const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
        if (!googleClientId) {
          throw new Error('Google sign-in is currently unavailable. Please try another method.')
        }
        if (typeof window.google === 'undefined') {
          throw new Error('Google sign-in service is initializing. Please try again.')
        }
        // Initialize Google Prompt / Token flow
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: async (response) => {
            try {
              await loginWithSocial({ provider: 'google', idToken: response.credential })
              closeAuth()
              toast('Signed in with Google!')
            } catch (authErr) {
              setError(authErr?.message || 'Google sign-in could not be completed.')
            }
          }
        })
        window.google.accounts.id.prompt()
        return
      }

      if (provider === 'apple') {
        const appleClientId = import.meta.env.VITE_APPLE_CLIENT_ID
        if (!appleClientId) {
          throw new Error('Apple sign-in is currently unavailable. Please try another method.')
        }
        throw new Error('Apple sign-in is currently unavailable.')
      }
    } catch (err) {
      setError(err?.message || `Could not sign in with ${provider}.`)
    } finally {
      setBusy(false)
    }
  }

  const onSubmit = async (event) => {
    event.preventDefault()
    if (!EMAIL_RE.test(email.trim())) return setError('Enter a valid e-mail address.')
    if (password.length < 6) return setError('Password must be at least 6 characters.')
    try {
      await login({ email: email.trim().toLowerCase(), password })
      closeAuth()
      toast('Welcome back!')
    } catch (submitError) {
      setError(submitError?.message || 'Could not sign in. Please try again.')
    }
  }

  return (
    <>
      <h2 className="modal__title">Login</h2>
      <form onSubmit={onSubmit}>
        <div className="field">
          <label htmlFor="li-email">E-mail *</label>
          <input
            id="li-email"
            required
            autoComplete="email"
            placeholder="johndoe@example.com"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="li-pass">Password *</label>
          <input
            id="li-pass"
            required
            minLength={6}
            autoComplete="current-password"
            placeholder="Your password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>
        <div className="modal__row">
          <label className="check">
            <input type="checkbox" defaultChecked /> Remember me
          </label>
          <button type="button" className="link-orange" onClick={() => onSwitch('forgot')}>
            Forgot password?
          </button>
        </div>
        {error && <p className="pp-form-error">{error}</p>}
        <button className="btn btn--primary btn--block btn--lg" type="submit">
          Login
        </button>
        <p className="modal__alt">
          Don&apos;t have an account?{' '}
          <button type="button" className="link-orange" onClick={() => onSwitch('register')}>
            Create account
          </button>
        </p>
        <p className="modal__alt">
          No password handy?{' '}
          <button type="button" className="link-orange" onClick={() => onSwitch('otp')}>
            Login with SMS code
          </button>
        </p>
        <div className="or">or</div>
        <div className="socials-auth">
          <button
            className="social-btn social-btn--apple"
            type="button"
            onClick={() => handleSocial('apple')}
            disabled={busy}
          >
            <Icon name="apple" />
            Continue with Apple
          </button>
          <button
            className="social-btn"
            type="button"
            onClick={() => handleSocial('google')}
            disabled={busy}
          >
            <Icon name="google" />
            Continue with Google
          </button>
        </div>
      </form>
    </>
  )
}

/**
 * Passwordless login: `POST /auth/otp/request` → `POST /auth/otp/verify`.
 */
function OtpForm({ onSwitch }) {
  const { requestOtp, verifyOtp } = useAuth()
  const { closeAuth } = useUI()
  const { toast } = useToast()
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [stage, setStage] = useState('phone')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const digits = phone.replace(/\s+/g, '')

  const sendCode = async (event) => {
    event.preventDefault()
    if (!UK_MOBILE_RE.test(digits)) {
      return setError('Enter a UK mobile number starting with 07 (11 digits).')
    }
    setBusy(true)
    setError('')
    try {
      await requestOtp(digits)
      setStage('code')
      toast('We sent you a 6-digit code')
    } catch (submitError) {
      setError(submitError?.message || 'Could not send the code. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  const submitCode = async (event) => {
    event.preventDefault()
    if (!/^\d{4,8}$/.test(code.trim())) return setError('Enter the code from the SMS.')
    setBusy(true)
    setError('')
    try {
      await verifyOtp({ phone: digits, code: code.trim() })
      closeAuth()
      toast('Signed in')
    } catch (submitError) {
      setError(submitError?.message || 'That code is not valid or has expired.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <h2 className="modal__title">Login with SMS</h2>
      {stage === 'phone' ? (
        <form onSubmit={sendCode}>
          <p className="pp-muted">We will text you a 6-digit code to sign in without a password.</p>
          <div className="field">
            <label htmlFor="otp-phone">Mobile number *</label>
            <input
              id="otp-phone"
              required
              inputMode="numeric"
              autoComplete="tel"
              maxLength={13}
              placeholder="07123456789"
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
            />
            <small style={{ color: 'var(--muted)' }}>UK mobile — start with 07, 11 digits (no +44)</small>
          </div>
          {error && <p className="pp-form-error">{error}</p>}
          <button className="btn btn--primary btn--block btn--lg" type="submit" disabled={busy}>
            {busy ? 'Sending…' : 'Send code'}
          </button>
        </form>
      ) : (
        <form onSubmit={submitCode}>
          <p className="pp-muted">
            Enter the code we sent to {digits}.{' '}
            <button type="button" className="link-orange" onClick={() => setStage('phone')}>
              Change number
            </button>
          </p>
          <div className="field">
            <label htmlFor="otp-code">6-digit code *</label>
            <input
              id="otp-code"
              required
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={8}
              placeholder="123456"
              type="text"
              value={code}
              onChange={(event) => setCode(event.target.value.replace(/\D/g, ''))}
            />
          </div>
          {error && <p className="pp-form-error">{error}</p>}
          <button className="btn btn--primary btn--block btn--lg" type="submit" disabled={busy}>
            {busy ? 'Verifying…' : 'Verify and sign in'}
          </button>
        </form>
      )}
      <p className="modal__alt">
        <button type="button" className="link-orange" onClick={() => onSwitch('login')}>
          Back to password login
        </button>
      </p>
    </>
  )
}

function RegisterForm({ onSwitch }) {
  const { register } = useAuth()
  const { closeAuth } = useUI()
  const { toast } = useToast()
  const [form, setForm] = useState({ firstName: '', lastName: '', phone: '', email: '', password: '' })
  const [error, setError] = useState('')

  const update = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }))

  const onSubmit = async (event) => {
    event.preventDefault()
    if (!form.firstName.trim() || !form.lastName.trim()) return setError('Enter your first and last name.')
    if (!UK_MOBILE_RE.test(form.phone.replace(/\s+/g, ''))) {
      return setError('Enter a UK mobile number starting with 07 (11 digits).')
    }
    if (!EMAIL_RE.test(form.email.trim())) return setError('Enter a valid e-mail address.')
    if (form.password.length < 6) return setError('Password must be at least 6 characters.')
    try {
      await register({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        phone: form.phone.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password
      })
      closeAuth()
      toast(`Welcome, ${form.firstName.trim()}!`)
    } catch (submitError) {
      setError(submitError?.message || 'Could not create your account. Please try again.')
    }
  }

  return (
    <>
      <h2 className="modal__title">Register</h2>
      <form onSubmit={onSubmit}>
        <div className="field">
          <label htmlFor="re-fname">Firstname *</label>
          <input
            id="re-fname"
            required
            autoComplete="given-name"
            placeholder="John"
            type="text"
            value={form.firstName}
            onChange={update('firstName')}
          />
        </div>
        <div className="field">
          <label htmlFor="re-lname">Lastname *</label>
          <input
            id="re-lname"
            required
            autoComplete="family-name"
            placeholder="Doe"
            type="text"
            value={form.lastName}
            onChange={update('lastName')}
          />
        </div>
        <div className="field">
          <label htmlFor="re-phone">Phone *</label>
          <input
            id="re-phone"
            required
            inputMode="numeric"
            autoComplete="tel"
            maxLength={13}
            placeholder="07123456789"
            type="tel"
            value={form.phone}
            onChange={update('phone')}
          />
          <small style={{ color: 'var(--muted)' }}>UK mobile — start with 07, 11 digits (no +44)</small>
        </div>
        <div className="field">
          <label htmlFor="re-email">E-mail *</label>
          <input
            id="re-email"
            required
            autoComplete="email"
            placeholder="johndoe@example.com"
            type="email"
            value={form.email}
            onChange={update('email')}
          />
        </div>
        <div className="field">
          <label htmlFor="re-pass">Password *</label>
          <input
            id="re-pass"
            required
            minLength={6}
            autoComplete="new-password"
            placeholder="New password"
            type="password"
            value={form.password}
            onChange={update('password')}
          />
        </div>
        <p style={{ margin: '16px 0 12px', fontSize: 11.5, lineHeight: 1.7, color: 'var(--text-2)' }}>
          You agree to our{' '}
          <a className="link-orange" href="#terms">
            Terms of Use
          </a>{' '}
          and confirm that you have read our{' '}
          <a className="link-orange" href="#privacy">
            Privacy Promise
          </a>{' '}
          by creating an account, placing an order or making a reservation.
        </p>
        <label className="check" style={{ marginBottom: 20 }}>
          <input type="checkbox" defaultChecked />
          <span style={{ fontSize: 11.5, lineHeight: 1.7 }}>
            I would like to receive news and offers regarding the restaurant&apos;s products, campaigns
            etc. via email, SMS and push messages. I am aware that I may withdraw my consent at any time
            by deactivating the channels in the messages I receive or in my user profile.
          </span>
        </label>
        {error && <p className="pp-form-error">{error}</p>}
        <button className="btn btn--primary btn--block btn--lg" type="submit">
          Create account
        </button>
        <p className="modal__alt">
          Have an account?{' '}
          <button type="button" className="link-orange" onClick={() => onSwitch('login')}>
            Login
          </button>
        </p>
      </form>
    </>
  )
}

function ForgotForm({ onSwitch }) {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const onSubmit = async (event) => {
    event.preventDefault()
    if (!EMAIL_RE.test(email.trim())) return setError('Enter a valid e-mail address.')
    setError('')
    setBusy(true)
    try {
      await authApi.requestPasswordReset(email.trim().toLowerCase())
      setSent(true)
    } catch {
      // Security best practice: show confirmation even if email is unlisted to avoid account enumeration
      setSent(true)
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <h2 className="modal__title">Reset password</h2>
      <form onSubmit={onSubmit}>
        <p className="pp-muted">
          Enter the e-mail associated with your account and we will send you a reset link.
        </p>
        <div className="field">
          <label htmlFor="fp-email">E-mail *</label>
          <input
            id="fp-email"
            required
            autoComplete="email"
            placeholder="johndoe@example.com"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>
        {error && <p className="pp-form-error">{error}</p>}
        <button className="btn btn--primary btn--block btn--lg" type="submit" disabled={busy}>
          {busy ? 'Sending…' : 'Send reset link'}
        </button>
        {sent && (
          <p className="note" style={{ marginTop: 16 }}>
            If an account exists for {email}, instructions to reset your password have been sent.
          </p>
        )}
        <p className="modal__alt">
          <button type="button" className="link-orange" onClick={() => onSwitch('login')}>
            Back to login
          </button>
        </p>
      </form>
    </>
  )
}

export default function AuthModal() {
  const { authView, closeAuth, setAuthView } = useUI()

  return (
    <Modal open={Boolean(authView)} label="Account" onClose={closeAuth}>
      {authView === 'register' && <RegisterForm onSwitch={setAuthView} />}
      {authView === 'otp' && <OtpForm onSwitch={setAuthView} />}
      {authView === 'forgot' && <ForgotForm onSwitch={setAuthView} />}
      {authView === 'login' && <LoginForm onSwitch={setAuthView} />}
    </Modal>
  )
}
