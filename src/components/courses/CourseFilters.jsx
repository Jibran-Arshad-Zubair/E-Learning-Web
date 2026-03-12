'use client'

import { memo, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Search, X, SlidersHorizontal } from 'lucide-react'
import Input from '../ui/Input'
import Button from '../ui/Button'

const categories = ['All', 'Development', 'Design', 'Business', 'Marketing', 'Data Science', 'Photography']
const levels = ['All', 'Beginner', 'Intermediate', 'Advanced']
const priceRanges = [
  { label: 'All Prices', value: 'all' },
  { label: 'Free', value: 'free' },
  { label: 'Under $50', value: 'under50' },
  { label: '$50 - $100', value: '50to100' },
  { label: 'Over $100', value: 'over100' },
]
const sortOptions = [
  { label: 'Most Popular', value: 'popular' },
  { label: 'Highest Rated', value: 'rating' },
  { label: 'Latest', value: 'latest' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
]

function CourseFilters({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  selectedLevel,
  setSelectedLevel,
  selectedPrice,
  setSelectedPrice,
  sortBy,
  setSortBy,
  onClose,
  isMobile = false,
}) {
  const handleReset = useCallback(() => {
    setSearchQuery('')
    setSelectedCategory('All')
    setSelectedLevel('All')
    setSelectedPrice('all')
    setSortBy('popular')
  }, [setSearchQuery, setSelectedCategory, setSelectedLevel, setSelectedPrice, setSortBy])

  return (
    <motion.div
      initial={isMobile ? { x: -300, opacity: 0 } : false}
      animate={isMobile ? { x: 0, opacity: 1 } : false}
      exit={isMobile ? { x: -300, opacity: 0 } : false}
      className={`
        bg-[#111111] border border-[#2A2A2A] rounded-xl p-6
        ${isMobile ? 'fixed inset-y-0 left-0 z-50 w-80 overflow-y-auto' : 'sticky top-24'}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5 text-purple-500" />
          <h3 className="text-lg font-semibold text-white">Filters</h3>
        </div>
        {isMobile && (
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        )}
      </div>

      {/* Search */}
      <div className="mb-6">
        <Input
          placeholder="Search courses..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          icon={Search}
        />
      </div>

      {/* Category */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-300 mb-3">Category</h4>
        <div className="space-y-2">
          {categories.map((category) => (
            <label
              key={category}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <input
                type="radio"
                name="category"
                checked={selectedCategory === category}
                onChange={() => setSelectedCategory(category)}
                className="w-4 h-4 accent-purple-600"
              />
              <span className={`text-sm ${selectedCategory === category ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'}`}>
                {category}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Level */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-300 mb-3">Level</h4>
        <div className="space-y-2">
          {levels.map((level) => (
            <label
              key={level}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <input
                type="radio"
                name="level"
                checked={selectedLevel === level}
                onChange={() => setSelectedLevel(level)}
                className="w-4 h-4 accent-purple-600"
              />
              <span className={`text-sm ${selectedLevel === level ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'}`}>
                {level}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-300 mb-3">Price</h4>
        <select
          value={selectedPrice}
          onChange={(e) => setSelectedPrice(e.target.value)}
          className="w-full px-4 py-2 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg text-white text-sm focus:outline-none focus:border-purple-800"
        >
          {priceRanges.map((range) => (
            <option key={range.value} value={range.value}>
              {range.label}
            </option>
          ))}
        </select>
      </div>

      {/* Sort */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-300 mb-3">Sort By</h4>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="w-full px-4 py-2 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg text-white text-sm focus:outline-none focus:border-purple-800"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Reset Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleReset}
        className="w-full"
      >
        Reset Filters
      </Button>
    </motion.div>
  )
}

export default memo(CourseFilters)

