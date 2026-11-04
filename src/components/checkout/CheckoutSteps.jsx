const STEPS = [
  { id: 1, label: 'Checkout' },
  { id: 2, label: 'Payment' },
  { id: 3, label: 'Confirmation' }
]

export default function CheckoutSteps({ step }) {
  return (
    <div className="steps">
      <div className="container steps__in">
        {STEPS.map((entry) => (
          <div
            className={`step${step === entry.id ? ' is-active' : ''}${step > entry.id ? ' is-done' : ''}`}
            key={entry.id}
          >
            <span className="step__tick" aria-hidden="true">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m5 13 4 4 10-10" />
              </svg>
            </span>
            {entry.label}
          </div>
        ))}
      </div>
    </div>
  )
}
