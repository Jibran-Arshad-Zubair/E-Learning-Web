'use client'

import { useState, useMemo, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'
import { SlidersHorizontal } from 'lucide-react'
import Navbar from '../../src/components/layout/Navbar'
import Footer from '../../src/components/layout/Footer'
import PageWrapper from '../../src/components/layout/PageWrapper'
import CourseGrid from '../../src/components/courses/CourseGrid'
import Button from '../../src/components/ui/Button'
import Loader from '../../src/components/ui/Loader'
import { courses as allCourses } from '../../src/constants/data'
import { useDebounce } from '../../src/hooks/useDebounce'

const CourseFilters = dynamic(
  () => import('../../src/components/courses/CourseFilters'),
  { loading: () => <Loader className="py-10" />, ssr: false }
)

function CoursesContent() {
  const searchParams = useSearchParams()
  const initialCategory = searchParams.get('category') || 'All'

  console.log('Initial Category from URL:', initialCategory);

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(initialCategory)
  const [selectedLevel, setSelectedLevel] = useState('All')
  const [selectedPrice, setSelectedPrice] = useState('all')
  const [sortBy, setSortBy] = useState('popular')
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  const debouncedSearch = useDebounce(searchQuery, 300)

  const filteredCourses = useMemo(() => {
    let result = [...allCourses]

    // Search filter
    if (debouncedSearch) {
      const searchLower = debouncedSearch.toLowerCase()
      result = result.filter(course =>
        course.title.toLowerCase().includes(searchLower) ||
        course.instructor.toLowerCase().includes(searchLower) ||
        course.description.toLowerCase().includes(searchLower)
      )
    }

    // Category filter
    if (selectedCategory !== 'All') {
      result = result.filter(course => course.category === selectedCategory)
    }

    // Level filter
    if (selectedLevel !== 'All') {
      result = result.filter(course => course.level === selectedLevel)
    }

    // Price filter
    if (selectedPrice !== 'all') {
      switch (selectedPrice) {
        case 'free':
          result = result.filter(course => course.price === 0)
          break
        case 'under50':
          result = result.filter(course => course.price < 50)
          break
        case '50to100':
          result = result.filter(course => course.price >= 50 && course.price <= 100)
          break
        case 'over100':
          result = result.filter(course => course.price > 100)
          break
      }
    }

    // Sort
    switch (sortBy) {
      case 'popular':
        result.sort((a, b) => b.students - a.students)
        break
      case 'rating':
        result.sort((a, b) => b.rating - a.rating)
        break
      case 'latest':
        result.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0))
        break
      case 'price_asc':
        result.sort((a, b) => a.price - b.price)
        break
      case 'price_desc':
        result.sort((a, b) => b.price - a.price)
        break
    }

    return result
  }, [debouncedSearch, selectedCategory, selectedLevel, selectedPrice, sortBy])

  const toggleMobileFilters = useCallback(() => {
    setShowMobileFilters(prev => !prev)
  }, [])

  return (
    <>
      <Navbar />
      <PageWrapper className="bg-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 font-[family-name:var(--font-syne)]">
              Explore Our Courses
            </h1>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Discover {allCourses.length}+ courses from expert instructors
            </p>
          </motion.div>

          {/* Mobile Filter Button */}
          <div className="lg:hidden mb-6">
            <Button
              variant="outline"
              onClick={toggleMobileFilters}
              className="w-full"
            >
              <SlidersHorizontal className="w-5 h-5 mr-2" />
              Filters
            </Button>
          </div>

          <div className="flex gap-8">
            {/* Desktop Filters */}
            <div className="hidden lg:block w-72 flex-shrink-0">
              <CourseFilters
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                selectedLevel={selectedLevel}
                setSelectedLevel={setSelectedLevel}
                selectedPrice={selectedPrice}
                setSelectedPrice={setSelectedPrice}
                sortBy={sortBy}
                setSortBy={setSortBy}
              />
            </div>

            {/* Mobile Filters Drawer */}
            <AnimatePresence>
              {showMobileFilters && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={toggleMobileFilters}
                    className="fixed inset-0 bg-black/60 z-40 lg:hidden"
                  />
                  <CourseFilters
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    selectedCategory={selectedCategory}
                    setSelectedCategory={setSelectedCategory}
                    selectedLevel={selectedLevel}
                    setSelectedLevel={setSelectedLevel}
                    selectedPrice={selectedPrice}
                    setSelectedPrice={setSelectedPrice}
                    sortBy={sortBy}
                    setSortBy={setSortBy}
                    onClose={toggleMobileFilters}
                    isMobile
                  />
                </>
              )}
            </AnimatePresence>

            {/* Course Grid */}
            <div className="flex-grow">
              <div className="mb-6 flex items-center justify-between">
                <p className="text-gray-400">
                  Showing <span className="text-white font-medium">{filteredCourses.length}</span> courses
                </p>
              </div>
              <CourseGrid courses={filteredCourses} />
            </div>
          </div>
        </div>
      </PageWrapper>
      <Footer />
    </>
  )
}

export default function CoursesPage() {
  return (
    <Suspense fallback={<Loader className="min-h-screen flex items-center justify-center" />}>
      <CoursesContent />
    </Suspense>
  )
}
