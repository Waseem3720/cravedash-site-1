import { useMemo, useState } from 'react'
import AccountView from './AccountView'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'

export default function ReferView({ onBack }) {
  const { fullName } = useAuth()
  const { toast } = useToast()
  const [copied, setCopied] = useState(false)

  const code = useMemo(() => {
    const base = String(fullName || 'PORTO')
      .replace(/[^a-zA-Z]/g, '')
      .slice(0, 5)
      .toUpperCase()
    return `${base || 'PORTO'}25`
  }, [fullName])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code)
    } catch {
      /* clipboard can be blocked — the code stays on screen */
    }
    setCopied(true)
    toast('Referral code copied')
  }

  return (
    <AccountView title="Refer & Earn" subtitle="Share your code, earn rewards" onBack={onBack} hero>
      <div className="card account-balance-card">
        <span className="eyebrow">Your referral code</span>
        <strong className="account-balance-value">{code}</strong>
        <p className="account-muted">
          Share this code with friends. When they sign up and order, you can earn rewards.
        </p>
      </div>

      <div className="account-form-actions">
        <button type="button" className="btn btn--primary" onClick={copy}>
          {copied ? 'Copied' : 'Copy code'}
        </button>
        {typeof navigator !== 'undefined' && 'share' in navigator ? (
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => navigator.share?.({ title: 'Join me', text: `Use my referral code ${code}` })}
          >
            Share
          </button>
        ) : null}
      </div>
    </AccountView>
  )
}
