'use client'

import { useCallback } from 'react'
import { use } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Star, Clock, BookOpen, Users, PlayCircle, CheckCircle, ShoppingCart, ArrowLeft } from 'lucide-react'
import Navbar from '../../../src/components/layout/Navbar'
import Footer from '../../../src/components/layout/Footer'
import PageWrapper from '../../../src/components/layout/PageWrapper'
import Button from '../../../src/components/ui/Button'
import Badge from '../../../src/components/ui/Badge'
import { courses } from '../../../src/constants/data'
import { formatPrice, formatNumber } from '../../../src/utils/helpers'
import { useLocalStorage } from '../../../src/hooks/useLocalStorage'
import toast from 'react-hot-toast'

const features = [
  'Lifetime access to course materials',
  'Downloadable resources and code files',
  'Certificate of completion',
  'Access on mobile and desktop',
  'Direct instructor support',
  'Regular content updates',
]

export default function CourseDetailPage({ params }) {
  const { id } = use(params)
  const course = courses.find(c => c.id === parseInt(id))
  const [cart, setCart] = useLocalStorage('cart', [])

  const handleAddToCart = useCallback(() => {
    const isInCart = cart.some(item => item.id === course?.id)
    if (isInCart) {
      toast.error('Course already in cart')
      return
    }
    setCart([...cart, course])
    toast.success('Added to cart!')
  }, [cart, setCart, course])

  if (!course) {
    return (
      <>
        <Navbar />
        <PageWrapper className="bg-[#0A0A0A]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
            <h1 className="text-3xl font-bold text-white mb-4">Course Not Found</h1>
            <p className="text-gray-400 mb-8">The course you&apos;re looking for doesn&apos;t exist.</p>
            <Link href="/courses">
              <Button variant="primary">Browse Courses</Button>
            </Link>
          </div>
        </PageWrapper>
        <Footer />
      </>
    )
  }

  const discount = Math.round(((course.originalPrice - course.price) / course.originalPrice) * 100)

  return (
    <>
      <Navbar />
      <PageWrapper className="bg-[#0A0A0A]">
        {/* Hero Section */}
        <div className="bg-gradient-to-b from-purple-900/20 to-[#0A0A0A]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* Back Button */}
            <Link href="/courses" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to Courses
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Left: Course Info */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <Badge label={course.category} />
                  {course.isBestseller && <Badge label="Bestseller" color="purple" />}
                  {course.isNew && <Badge label="New" color="green" />}
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 font-[family-name:var(--font-syne)] leading-tight">
                  {course.title}
                </h1>

                <p className="text-lg text-gray-300 mb-6 leading-relaxed">
                  {course.description}
                </p>

                {/* Stats */}
                <div className="flex flex-wrap items-center gap-6 mb-6">
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    <span className="text-white font-semibold">{course.rating}</span>
                    <span className="text-gray-400">({formatNumber(course.reviewCount)} reviews)</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <Users className="w-5 h-5" />
                    <span>{formatNumber(course.students)} students</span>
                  </div>
                </div>

                {/* Instructor */}
                <div className="flex items-center gap-4 mb-8">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden">
                    <Image
                      src={course.instructorAvatar}
                      alt={course.instructor}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Created by</p>
                    <p className="text-white font-medium">{course.instructor}</p>
                  </div>
                </div>

                {/* Meta */}
                <div className="flex flex-wrap gap-6 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{course.duration} total</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    <span>{course.lessons} lessons</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <PlayCircle className="w-4 h-4" />
                    <span>{course.level}</span>
                  </div>
                </div>
              </motion.div>

              {/* Right: Purchase Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="bg-[#111111] rounded-xl border border-[#2A2A2A] overflow-hidden sticky top-24">
                  {/* Thumbnail */}
                  <div className="relative aspect-video">
                    <Image
                      src={course.thumbnail}
                      alt={course.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-purple-800/80 flex items-center justify-center cursor-pointer hover:bg-purple-700 transition-colors">
                        <PlayCircle className="w-8 h-8 text-white" />
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    {/* Price */}
                    <div className="flex items-center gap-3 mb-6">
                      <span className="text-3xl font-bold text-white">{formatPrice(course.price)}</span>
                      {course.originalPrice > course.price && (
                        <>
                          <span className="text-lg text-gray-500 line-through">{formatPrice(course.originalPrice)}</span>
                          <span className="text-sm font-medium text-green-500">{discount}% off</span>
                        </>
                      )}
                    </div>

                    {/* Buttons */}
                    <div className="space-y-3 mb-6">
                      <Button variant="primary" size="lg" className="w-full" onClick={handleAddToCart}>
                        <ShoppingCart className="w-5 h-5 mr-2" />
                        Add to Cart
                      </Button>
                      <Button variant="outline" size="lg" className="w-full">
                        Buy Now
                      </Button>
                    </div>

                    <p className="text-center text-sm text-gray-500 mb-6">
                      30-Day Money-Back Guarantee
                    </p>

                    {/* Features */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-white">This course includes:</h4>
                      {features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-3 text-sm text-gray-400">
                          <CheckCircle className="w-4 h-4 text-purple-500 flex-shrink-0" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </PageWrapper>
      <Footer />
    </>
  )
}
