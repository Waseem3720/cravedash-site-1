/**
 * Shared account page shell — `.account-view` with a back link, the ACCOUNT
 * eyebrow, the page heading (and optional extra content such as filters).
 */
export default function AccountView({
  title,
  subtitle,
  eyebrow = 'Account',
  backLabel = 'Back',
  onBack,
  headExtra,
  hero = false,
  footer,
  children
}) {
  return (
    <div className="account-view">
      <div className={`account-view-body${hero ? ' account-view-body--hero' : ''}`}>
        {onBack && (
          <button type="button" className="back-link" onClick={onBack}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M19 12H5" />
              <path d="m12 19-7-7 7-7" />
            </svg>
            {backLabel}
          </button>
        )}

        {hero ? (
          <div className="page-head account-page-head">
            <p className="eyebrow">{eyebrow}</p>
            <h1>{title}</h1>
            {subtitle ? <p>{subtitle}</p> : null}
            {headExtra}
          </div>
        ) : (
          <div className="account-view-title">
            {onBack ? null : <p className="eyebrow">{eyebrow}</p>}
            <h1 className="account-subhead">{title}</h1>
            {subtitle ? <p className="detail-date">{subtitle}</p> : null}
            {headExtra}
          </div>
        )}

        {children}
      </div>

      {footer ? <div className="account-view-footer">{footer}</div> : null}
    </div>
  )
}
