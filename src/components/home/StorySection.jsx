import { useStorefront } from '../../context/StorefrontContext'

/** "Our Story" section. The text and image come from the restaurant's dashboard; nothing is shown until they are filled in. */
export default function StorySection() {
  const { story } = useStorefront()

  if (!story || (!story.paragraph1 && !story.paragraph2)) return null

  return (
    <section className="about cd-story" id="our-story">
      <div className="container about__grid">
        <div>
          {story.eyebrow ? <p className="eyebrow">{story.eyebrow}</p> : null}
          {story.title ? <h2>{story.title}</h2> : null}
          <div className="about__rule" />
          {story.paragraph1 ? <p>{story.paragraph1}</p> : null}
          {story.paragraph2 ? <p>{story.paragraph2}</p> : null}
        </div>
        {story.image ? (
          <div className="about__media">
            <img alt={story.title || ''} loading="lazy" src={story.image} />
            {story.circleLabel ? <span className="about__tag">{story.circleLabel}</span> : null}
          </div>
        ) : null}
      </div>
    </section>
  )
}
