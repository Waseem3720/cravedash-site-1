const TABLE_ICON = (
  <svg viewBox="0 0 90 65" fill="none" aria-hidden="true">
    <rect x="23" y="13" width="44" height="39" rx="9" fill="currentColor" opacity=".28" stroke="currentColor" strokeWidth="2" />
    <rect x="33" y="2" width="24" height="7" rx="3" fill="currentColor" />
    <rect x="33" y="56" width="24" height="7" rx="3" fill="currentColor" />
    <rect x="11" y="23" width="7" height="20" rx="3" fill="currentColor" />
    <rect x="72" y="23" width="7" height="20" rx="3" fill="currentColor" />
  </svg>
)

export default function TablePicker({
  tables,
  availableIds,
  selectedId,
  guests,
  time,
  onSelect
}) {
  return (
    <div className="table-picker">
      <div className="card-heading">
        <span className="step-badge">02</span>
        <h3>Choose your table</h3>
      </div>
      <p className="small">
        {time ? 'Tables that fit your party for this time.' : 'Choose a time above to see tables for your party.'}
      </p>

      <div className="table-legend">
        <span>
          <i />Available
        </span>
        <span>
          <i className="taken" />Unavailable
        </span>
        <span>
          <i className="chosen" />Selected
        </span>
      </div>

      <div id="tables" className="table-grid">
        {tables.map((table) => {
          const free = availableIds.includes(table.id)
          const selected = selectedId === table.id
          return (
            <button
              key={table.id}
              type="button"
              className={`table-card${selected ? ' selected' : ''}`}
              disabled={!free}
              aria-pressed={selected}
              onClick={() => onSelect(table.id)}
            >
              {TABLE_ICON}
              <strong>Table {table.number}</strong>
              <small>
                {table.seats} seats · {table.area || 'Dining area'}
              </small>
              <small>
                {free
                  ? selected
                    ? 'Selected ✓'
                    : 'Available'
                  : table.seats < guests
                    ? 'Too small for your party'
                    : 'Unavailable'}
              </small>
            </button>
          )
        })}
      </div>
    </div>
  )
}
