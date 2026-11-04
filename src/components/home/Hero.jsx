import { useEffect, useState } from 'react'
import { useStorefront } from '../../context/StorefrontContext'

export default function Hero() {
  const { banners } = useStorefront()
  const [active, setActive] = useState(0)

  useEffect(() => {
    if (banners.length < 2) return undefined
    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % banners.length)
    }, 6000)
    return () => window.clearInterval(timer)
  }, [banners.length])

  return (
    <section className="cd-hero" id="home" aria-label="Featured banners">
      <div className={`cd-hero__media${banners.length ? ' has-banners' : ''}`}>
        {banners.length === 0 && <div className="cd-hero__fallback" aria-hidden="true" />}

        {banners.map((banner, index) => (
          <img
            key={banner.id}
            className={`cd-hero__slide${index === active ? ' is-active' : ''}`}
            alt={banner.title}
            src={banner.image}
            decoding="async"
          />
        ))}

        {banners.length > 1 && (
          <div className="cd-hero__dots" role="tablist" aria-label="Banner slides">
            {banners.map((banner, index) => (
              <button
                key={banner.id}
                type="button"
                role="tab"
                className={`cd-hero__dot${index === active ? ' is-active' : ''}`}
                aria-label={`Show banner ${index + 1}`}
                aria-selected={index === active}
                onClick={() => setActive(index)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
