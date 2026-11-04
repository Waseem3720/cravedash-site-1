import Icon from '../ui/Icon'

export default function CategoryRail({
  variant = 'desktop',
  categories,
  counts,
  activeId,
  onSelect
}) {
  if (variant === 'mobile') {
    return (
      <div className="cd-rail cd-rail--mobile">
        <div className="container cd-rail__mobile-in">
          <div className="cd-rail__mobile-scroll" role="tablist" aria-label="Menu categories">
            {categories.map((category) => {
              const active = category.id === activeId
              return (
                <button
                  key={category.id}
                  type="button"
                  role="tab"
                  data-chip-id={category.id}
                  aria-selected={active}
                  className={`cd-rail__pill${active ? ' is-active' : ''}`}
                  onClick={() => onSelect(category.id)}
                >
                  <span className="cd-rail__ic" aria-hidden="true" style={category.tint}>
                    <Icon name={category.icon} size={12} />
                  </span>
                  {category.name}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  return (
    <aside className="cd-rail cd-rail--desk" aria-label="Categories">
      <ul className="cd-rail__list">
        {categories.map((category) => {
          const active = category.id === activeId
          return (
            <li key={category.id}>
              <a
                href={`#cat-${category.id}`}
                aria-current={active ? 'true' : undefined}
                data-chip-id={category.id}
                onClick={(event) => {
                  event.preventDefault()
                  onSelect(category.id)
                }}
              >
                <span className="cd-rail__ic" aria-hidden="true" style={category.tint}>
                  <Icon name={category.icon} size={14} />
                </span>
                {category.name}
                <span className="cd-rail__ct num">{counts[category.id] || 0}</span>
              </a>
            </li>
          )
        })}
      </ul>
    </aside>
  )
}
