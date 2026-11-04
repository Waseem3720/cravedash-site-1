export default function SlotPicker({ slots, selected, onSelect, message }) {
  return (
    <>
      <div id="availabilityMessage" role="status" aria-live="polite">
        {message}
      </div>
      <div id="slots" className="slots" role="group" aria-label="Available booking times">
        {slots.map((time) => (
          <button
            key={time}
            type="button"
            aria-pressed={time === selected}
            onClick={() => onSelect(time)}
          >
            {time}
          </button>
        ))}
      </div>
    </>
  )
}
