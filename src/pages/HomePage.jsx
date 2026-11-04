import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import ToTop from '../components/layout/ToTop'
import Hero from '../components/home/Hero'
import StorySection from '../components/home/StorySection'
import ContactSection from '../components/home/ContactSection'
import BookingCallout from '../components/home/BookingCallout'
import TrustBar from '../components/home/TrustBar'
import MenuSection from '../components/menu/MenuSection'

export default function HomePage() {
  return (
    <>
      <Header />
      <Hero />
      <MenuSection />
      <BookingCallout />
      <StorySection />
      <ContactSection />
      <TrustBar />
      <Footer />
      <ToTop />
    </>
  )
}
