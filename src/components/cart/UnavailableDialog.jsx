import { useState } from 'react'
import Modal from '../ui/Modal'

export default function UnavailableDialog({ open, value, onSave, onClose }) {
  const [choice, setChoice] = useState(value)

  return (
    <Modal open={open} label="If a product is not available" onClose={onClose}>
      <h2 className="modal__title">If a product is not available</h2>
      <p className="pp-muted">
        Life happens — sometimes a dish sells out. Tell us what you would prefer and the kitchen
        will follow it.
      </p>

      <label className="check pp-choice">
        <input
          type="radio"
          name="unavailable"
          checked={choice === 'remove'}
          onChange={() => setChoice('remove')}
        />
        <span>
          <b>Remove it from my order</b>
          <small>The rest of your order is prepared as usual.</small>
        </span>
      </label>

      <label className="check pp-choice">
        <input
          type="radio"
          name="unavailable"
          checked={choice === 'call'}
          onChange={() => setChoice('call')}
        />
        <span>
          <b>Call me to suggest a replacement</b>
          <small>We will ring you on the number given at checkout.</small>
        </span>
      </label>

      <button
        className="btn btn--primary btn--block btn--lg"
        type="button"
        style={{ marginTop: 18 }}
        onClick={() => onSave(choice)}
      >
        Save preference
      </button>
    </Modal>
  )
}
