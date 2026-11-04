import { useEffect } from 'react'

/**
 * Shown at checkout when some basket items are not on the selected branch's menu.
 * The customer can switch to a branch that has every item, or remove the items that are missing.
 */
export default function BranchMismatchModal({ open, currentBranch, missing, candidates, onSwitch, onRemove, onClose }) {
  useEffect(() => {
    if (!open) return undefined
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="modal-root" role="dialog" aria-modal="true" aria-label="Items not on this branch">
      <button type="button" className="sheet-backdrop" aria-label="Close" onClick={onClose} />
      <div className="branch-panel branch-picker">
        <button type="button" className="sheet-close" aria-label="Close" onClick={onClose}>
          ×
        </button>
        <div className="branch-head">
          <p className="eyebrow dark">Not on this branch</p>
          <h3>{currentBranch ? `${currentBranch} does not have these items` : 'These items are not on this branch'}</h3>
          <p>
            {missing.join(', ')} {missing.length === 1 ? 'is' : 'are'} not on this branch&apos;s menu.
          </p>
        </div>
        <div className="branch-list">
          {candidates.length > 0 ? (
            <>
              <p className="small">Choose a branch that has everything in your basket:</p>
              {candidates.map((branch) => (
                <button type="button" key={branch.id} className="branch-card" onClick={() => onSwitch(branch.id)}>
                  <div className="branch-card-logo" aria-hidden="true">
                    {branch.name.charAt(0).toUpperCase()}
                  </div>
                  <span>
                    <strong>Switch to {branch.name}</strong>
                  </span>
                </button>
              ))}
            </>
          ) : (
            <p className="small">No other branch has all of these items.</p>
          )}
          <button type="button" className="btn btn--outline" onClick={onRemove}>
            Remove these items from my basket
          </button>
        </div>
      </div>
    </div>
  )
}
