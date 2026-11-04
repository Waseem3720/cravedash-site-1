import { useEffect } from 'react'

/** Branch logo when the branch has an absolute image, otherwise its initial. */
function branchLogo(value) {
  return /^(https?:)?\/\//i.test(value) || value.startsWith('data:') ? value : ''
}

/** Branch picker dialog, styled like the other CraveDash storefronts. */
export default function BranchModal({ open, branches = [], currentBranchId, onClose, onSelect }) {
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
    <div className="modal-root" role="dialog" aria-modal="true" aria-label="Choose branch">
      <button type="button" className="sheet-backdrop" aria-label="Close" onClick={onClose} />
      <div className="branch-panel branch-picker">
        <button type="button" className="sheet-close" aria-label="Close" onClick={onClose}>
          ×
        </button>
        <div className="branch-head">
          <p className="eyebrow dark">Locations</p>
          <h3>Choose a branch</h3>
          <p>Menu and availability follow the branch you select.</p>
        </div>
        <div className="branch-list">
          {branches.map((branch) => {
            const isActive = branch.id === currentBranchId
            const logo = branchLogo(branch.image)
            return (
              <button
                type="button"
                key={branch.id}
                className={`branch-card${isActive ? ' active' : ''}`}
                onClick={() => onSelect(branch.id)}
              >
                <div className="branch-card-logo" aria-hidden="true">
                  {logo ? <img src={logo} alt="" /> : branch.name.charAt(0).toUpperCase()}
                </div>
                <span>
                  <strong>{branch.name}</strong>
                  {branch.address ? <em>{branch.address}</em> : null}
                  {isActive ? <b>Selected</b> : null}
                </span>
              </button>
            )
          })}
          {branches.length === 0 ? <p className="cart-empty">No branches available for this restaurant.</p> : null}
        </div>
      </div>
    </div>
  )
}
