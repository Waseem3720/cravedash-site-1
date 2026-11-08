export default function SlotPicker({
  slots,
  selected,
  onSelect,
  message,
  unavailableSlots = [],
  checkingTime = ''
}) {
  return (
    <>
      <div id="availabilityMessage" role="status" aria-live="polite">
        {message}
      </div>
      <div id="slots" className="slots" role="group" aria-label="Available booking times">
        {slots.map((time) => {
          const isUnavailable = unavailableSlots.includes(time)
          const isChecking = checkingTime === time
          return (
            <button
              key={time}
              type="button"
              disabled={isUnavailable}
              aria-pressed={time === selected}
              onClick={() => onSelect(time)}
              title={isUnavailable ? 'Fully booked' : ''}
            >
              {isChecking ? `${time} …` : time}
            </button>
          )
        })}
      </div>
    </>
  )
}
