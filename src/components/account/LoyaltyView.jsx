import { useState } from 'react'
import AccountView from './AccountView'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { formatPrice } from '../../utils/format'

export default function LoyaltyView({ onBack }) {
  const { loyaltyPoints, pointTransactions, loyaltySettings, convertPointsToWallet } = useAuth()
  const { toast } = useToast()
  const [amount, setAmount] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const onSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setBusy(true)
    try {
      const credit = await convertPointsToWallet(Number(amount))
      setAmount('')
      toast(`${formatPrice(credit)} added to your wallet`)
    } catch (convertError) {
      setError(convertError instanceof Error ? convertError.message : 'Could not convert points')
    } finally {
      setBusy(false)
    }
  }

  return (
    <AccountView title="Loyalty Points" onBack={onBack}>
      <div className="card account-balance-card">
        <span className="eyebrow">Your points</span>
        <strong className="account-balance-value">{loyaltyPoints}</strong>
        <p className="account-muted">
          Exchange rate: {loyaltySettings.exchangeRate} points = {formatPrice(1)} · minimum{' '}
          {loyaltySettings.minimumPoints} points per conversion.
        </p>
      </div>

      <form className="card account-form" onSubmit={onSubmit}>
        <div className="field">
          <label htmlFor="loyalty-points">Convert points to wallet</label>
          <input
            id="loyalty-points"
            inputMode="numeric"
            placeholder="Points"
            value={amount}
            onChange={(event) => setAmount(event.target.value.replace(/[^\d]/g, ''))}
          />
        </div>
        {error && <p className="pp-form-error">{error}</p>}
        <button className="btn btn--primary btn--block btn--lg" type="submit" disabled={busy}>
          {busy ? 'Converting…' : 'Convert'}
        </button>
      </form>

      <h2 className="account-subhead">Points history</h2>
      {pointTransactions.length === 0 ? (
        <p className="account-muted">No points yet — you earn 1 point for every £1 spent.</p>
      ) : (
        <div className="card account-transaction-list">
          {pointTransactions.map((entry) => (
            <div className="account-transaction" key={entry.id}>
              <div>
                <strong>{entry.label}</strong>
                <small>{new Date(entry.createdAt).toLocaleDateString()}</small>
              </div>
              <span className="num">
                {entry.points > 0 ? '+' : ''}
                {entry.points}
              </span>
            </div>
          ))}
        </div>
      )}
    </AccountView>
  )
}
