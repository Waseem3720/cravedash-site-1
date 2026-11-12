import AccountView from './AccountView'
import { useAuth } from '../../context/AuthContext'
import { formatPrice } from '../../utils/format'
import { formatOrderDate } from '../../utils/orderStatus'

export default function WalletView({ onBack }) {
  const { walletBalance, walletTransactions } = useAuth()

  return (
    <AccountView title="Wallet" onBack={onBack}>
      <div className="card account-balance-card">
        <span className="eyebrow">Available balance</span>
        <strong className="account-balance-value">{formatPrice(walletBalance)}</strong>
        <p className="account-muted">Add funds is available in the mobile app checkout flow.</p>
      </div>

      <h2 className="account-subhead">Transactions</h2>
      {walletTransactions.length === 0 ? (
        <p className="account-muted">No wallet transactions yet.</p>
      ) : (
        <div className="card account-transaction-list">
          {walletTransactions.map((entry) => (
            <div className="account-transaction" key={entry.id}>
              <div>
                <strong>{entry.label}</strong>
                <small>{formatOrderDate(entry.createdAt)}</small>
              </div>
              <span className="num">
                {Number(entry.amount) < 0 ? '−' : '+'}
                {formatPrice(Math.abs(Number(entry.amount) || 0))}
              </span>
            </div>
          ))}
        </div>
      )}
    </AccountView>
  )
}
