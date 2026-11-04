import Icon from '../ui/Icon'

const ITEMS = [
  {
    icon: 'shield',
    title: 'Order direct',
    subtitle: 'Same kitchen — no aggregator mark-up'
  },
  {
    icon: 'clock',
    title: 'Freshly prepared',
    subtitle: 'Cooked to order when you checkout'
  },
  {
    icon: 'note',
    title: 'Allergens on every dish',
    subtitle: 'Shown on the menu and as you customise'
  }
]

export default function TrustBar() {
  return (
    <section className="cd-trust cd-trust--footer" aria-label="Why order with us">
      <div className="container cd-trust__in">
        {ITEMS.map((item) => (
          <div className="cd-trust__i" key={item.title}>
            <span className="cd-trust__ic" aria-hidden="true">
              <Icon name={item.icon} />
            </span>
            <div>
              <div className="cd-trust__t">{item.title}</div>
              <div className="cd-trust__s">{item.subtitle}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
