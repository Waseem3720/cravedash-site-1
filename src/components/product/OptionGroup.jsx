import { useState } from 'react'
import { optionDeltaLabel } from '../../utils/pricing'

const PREVIEW_LIMIT = 3

function ChevronDown() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="12"
      height="12"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

/**
 * One option group: header with a REQUIRED / OPTIONAL flag plus a toggle row
 * per value, exactly like the design's `.opt-head` / `.opt-row` markup.
 */
export default function OptionGroup({ group, selected = [], onToggle }) {
  const [expanded, setExpanded] = useState(false)
  const multi = group.type === 'multi'
  const values = group.values || []
  const visible = expanded ? values : values.slice(0, PREVIEW_LIMIT)
  const title =
    multi && Number(group.max || 0) > 0
      ? `${group.name} · max ${group.max}`
      : group.name

  return (
    <>
      <div className="opt-head">
        <b>{title}</b>
        <span className={group.required ? 'opt-flag opt-flag--required' : 'opt-flag opt-flag--optional'}>
          {group.required ? 'required' : 'optional'}
        </span>
      </div>

      {visible.map((value, index) => {
        const price = Number(value.optionPrice || 0)
        const isOn = Boolean(selected[index])
        return (
          <label className="opt-row" key={value.id || `${value.name}-${index}`}>
            <b>{value.name}</b>
            <span>{optionDeltaLabel(price)}</span>
            <span className="switch">
              <input
                type="checkbox"
                role={multi ? 'checkbox' : 'radio'}
                aria-checked={isOn}
                checked={isOn}
                onChange={() => onToggle(group, index)}
              />
              <span />
            </span>
          </label>
        )
      })}

      {values.length > PREVIEW_LIMIT && (
        <button type="button" className="show-more" onClick={() => setExpanded((open) => !open)}>
          {expanded ? 'Show less' : 'Show More'}
          {expanded ? null : <ChevronDown />}
        </button>
      )}
    </>
  )
}
