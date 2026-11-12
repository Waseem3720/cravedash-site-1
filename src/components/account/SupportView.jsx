import { useEffect, useState } from 'react'
import AccountView from './AccountView'
import { useStorefront } from '../../context/StorefrontContext'
import { useToast } from '../../context/ToastContext'
import { isApiConfigured } from '../../api/client'
import { createSupportTicket, getSupportTickets } from '../../api/customer'
import { formatOrderDate } from '../../utils/orderStatus'

export default function SupportView({ onBack }) {
  const { profile } = useStorefront()
  const { toast } = useToast()
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(isApiConfigured())
  const [error, setError] = useState('')
  const [subject, setSubject] = useState('')
  const [orderId, setOrderId] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  useEffect(() => {
    if (!isApiConfigured()) return undefined
    let cancelled = false
    getSupportTickets()
      .then((res) => {
        if (!cancelled) {
          const rows = Array.isArray(res) ? res : res?.tickets || []
          setTickets(rows)
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Could not load support tickets')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const onSubmit = async (event) => {
    event.preventDefault()
    setSubmitError('')
    if (!subject.trim() || !message.trim()) {
      setSubmitError('Please enter a subject and message.')
      return
    }
    setSubmitting(true)
    try {
      const res = await createSupportTicket({ subject, message, orderId })
      const created = res?.ticket || res
      if (created && created.id) {
        setTickets((current) => [created, ...current])
      }
      setSubject('')
      setOrderId('')
      setMessage('')
      toast('Support message sent')
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Could not submit support ticket')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AccountView title="Help & Support" subtitle="We are happy to help" onBack={onBack} hero>
      <div className="support-list">
        <a className="card support-card" href={profile.phoneHref}>
          <strong>Call us</strong>
          <span>{profile.phone}</span>
        </a>
        <a className="card support-card" href={`mailto:${profile.email}`}>
          <strong>Email</strong>
          <span>{profile.email}</span>
        </a>
        <div className="card support-card">
          <strong>Visit</strong>
          <span>{profile.address.full}</span>
        </div>
      </div>

      {isApiConfigured() ? (
        <>
          <h2 className="account-subhead">Send us a message</h2>
          <form className="card account-form" onSubmit={onSubmit}>
            <div className="field">
              <label htmlFor="support-subject">Subject</label>
              <input
                id="support-subject"
                placeholder="e.g. Question about my order"
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="support-order">Order ID (optional)</label>
              <input
                id="support-order"
                placeholder="e.g. 1042"
                value={orderId}
                onChange={(event) => setOrderId(event.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="support-message">Message</label>
              <textarea
                id="support-message"
                rows={4}
                placeholder="Tell us how we can help…"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
              />
            </div>
            {submitError ? <p className="pp-form-error">{submitError}</p> : null}
            <button className="btn btn--primary btn--block" type="submit" disabled={submitting}>
              {submitting ? 'Sending…' : 'Send message'}
            </button>
          </form>

          <h2 className="account-subhead">Your tickets</h2>
          {loading ? <p className="account-muted">Loading tickets…</p> : null}
          {error ? <p className="pp-form-error">{error}</p> : null}
          {!loading && tickets.length === 0 ? (
            <p className="account-muted">No support tickets yet.</p>
          ) : (
            <div className="card account-transaction-list">
              {tickets.map((ticket) => (
                <div className="account-transaction" key={ticket.id}>
                  <div>
                    <strong>{ticket.subject}</strong>
                    <small>
                      {ticket.status || 'open'}
                      {ticket.created_at ? ` · ${formatOrderDate(ticket.created_at)}` : ''}
                    </small>
                    <p className="account-muted" style={{ marginTop: 4 }}>{ticket.message}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : null}
    </AccountView>
  )
}
