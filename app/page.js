import Navbar from '../src/components/layout/Navbar'
import Footer from '../src/components/layout/Footer'
import HeroSection from '../src/components/sections/HeroSection'
import StatsSection from '../src/components/sections/StatsSection'
import CategorySection from '../src/components/sections/CategorySection'
import FeaturedCourses from '../src/components/sections/FeaturedCourses'
import HowItWorks from '../src/components/sections/HowItWorks'
import TopInstructors from '../src/components/sections/TopInstructors'
import Testimonials from '../src/components/sections/Testimonials'
import CTABanner from '../src/components/sections/CTABanner'

export const metadata = {
  title: 'E-Learning Hub | #1 Online Learning Platform',
  description: 'Join 50,000+ students learning from world-class instructors. Courses in Development, Design, Business & More.',
}

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <StatsSection />
        <CategorySection />
        <FeaturedCourses />
        <HowItWorks />
        <TopInstructors />
        <Testimonials />
        <CTABanner />
      </main>
      <Footer />
    </>
  )
}
