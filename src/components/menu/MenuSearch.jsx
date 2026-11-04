import Icon from '../ui/Icon'

export default function MenuSearch({ value, onChange }) {
  return (
    <label className="cd-menu__search">
      <span className="sr-only">Search menu</span>
      <input
        className="cd-menu__search-input"
        placeholder="Search menu…"
        autoComplete="off"
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      <span className="cd-menu__search-ic" aria-hidden="true">
        <Icon name="search" size={16} />
      </span>
    </label>
  )
}
