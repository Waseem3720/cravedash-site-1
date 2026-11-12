import { useEffect, useMemo, useState } from 'react'
import AccountView from './AccountView'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { isApiConfigured } from '../../api/client'
import { applyReferralCode, getReferralInfo } from '../../api/customer'
import { formatPrice } from '../../utils/format'

export default function ReferView({ onBack }) {
  const { fullName, refreshAccount } = useAuth()
  const { toast } = useToast()
  const [copied, setCopied] = useState(false)
  const [info, setInfo] = useState(null)
  const [loading, setLoading] = useState(isApiConfigured())
  const [error, setError] = useState('')
  const [applyCode, setApplyCode] = useState('')
  const [applying, setApplying] = useState(false)
  const [applyError, setApplyError] = useState('')
  const [applySuccess, setApplySuccess] = useState('')

  useEffect(() => {
    if (!isApiConfigured()) return undefined
    let cancelled = false
    getReferralInfo()
      .then((res) => {
        if (!cancelled) setInfo(res || null)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Could not load referral info')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const fallbackCode = useMemo(() => {
    const base = String(fullName || 'PORTO')
      .replace(/[^a-zA-Z]/g, '')
      .slice(0, 5)
      .toUpperCase()
    return `${base || 'PORTO'}25`
  }, [fullName])

  const code = info?.referral_code || (isApiConfigured() ? '' : fallbackCode)

  const copy = async () => {
    if (!code) return
    try {
      await navigator.clipboard.writeText(code)
    } catch {
      /* clipboard can be blocked — the code stays on screen */
    }
    setCopied(true)
    toast('Referral code copied')
  }

  const onApply = async (event) => {
    event.preventDefault()
    setApplyError('')
    setApplySuccess('')
    const trimmed = applyCode.trim().toUpperCase()
    if (!trimmed) {
      setApplyError('Enter a referral code.')
      return
    }
    setApplying(true)
    try {
      const res = await applyReferralCode(trimmed)
      setInfo((current) => ({ ...(current || {}), referred_by: trimmed }))
      setApplyCode('')
      setApplySuccess(res?.message || 'Referral code applied!')
      toast('Referral code applied!')
      refreshAccount?.().catch(() => { })
    } catch (err) {
      setApplyError(err instanceof Error ? err.message : 'Could not apply referral code')
    } finally {
      setApplying(false)
    }
  }

  return (
    <AccountView title="Refer & Earn" subtitle="Share your code, earn rewards" onBack={onBack} hero>
      {loading ? <p className="account-muted">Loading referral details…</p> : null}
      {error ? <p className="pp-form-error">{error}</p> : null}

      <div className="card account-balance-card">
        <span className="eyebrow">Your referral code</span>
        <strong className="account-balance-value">{code || '—'}</strong>
        <p className="account-muted">
          Share this code with friends.
          {info?.reward_amount ? ` Earn ${formatPrice(info.reward_amount)} when they join.` : ' When they sign up and order, you can earn rewards.'}
        </p>
        {info && typeof info.referrals_count === 'number' ? (
          <p className="account-muted" style={{ marginTop: 6 }}>
            Friends referred: <strong>{info.referrals_count}</strong>
          </p>
        ) : null}
      </div>

      <div className="account-form-actions">
        <button type="button" className="btn btn--primary" onClick={copy} disabled={!code}>
          {copied ? 'Copied' : 'Copy code'}
        </button>
        {typeof navigator !== 'undefined' && 'share' in navigator && code ? (
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => navigator.share?.({ title: 'Join me', text: `Use my referral code ${code}` })}
          >
            Share
          </button>
        ) : null}
      </div>

      {isApiConfigured() ? (
        info?.referred_by ? (
          <p className="account-muted" style={{ marginTop: 18 }}>
            Referred by code: <strong>{info.referred_by}</strong>
          </p>
        ) : (
          <form className="card account-form" style={{ marginTop: 18 }} onSubmit={onApply}>
            <div className="field">
              <label htmlFor="referral-apply-code">Have a friend&apos;s referral code?</label>
              <input
                id="referral-apply-code"
                placeholder="e.g. WASE4A1B"
                value={applyCode}
                onChange={(event) => setApplyCode(event.target.value.toUpperCase())}
              />
            </div>
            {applyError ? <p className="pp-form-error">{applyError}</p> : null}
            {applySuccess ? <p className="account-muted">{applySuccess}</p> : null}
            <button className="btn btn--primary btn--block" type="submit" disabled={applying}>
              {applying ? 'Applying…' : 'Apply referral code'}
            </button>
          </form>
        )
      ) : null}
    </AccountView>
  )
}
