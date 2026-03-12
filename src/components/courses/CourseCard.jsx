'use client'

import { memo, useCallback, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Star, Clock, BookOpen, ShoppingCart } from 'lucide-react'
import Button from '../ui/Button'
import Badge from '../ui/Badge'
import FallbackCourseThumbnail from '../ui/FallbackCourseThumbnail'
import { formatPrice, formatNumber } from '../../utils/helpers'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import toast from 'react-hot-toast'

function CourseCard({ course, isPriority = false }) {
  const [cart, setCart] = useLocalStorage('cart', [])
  const [imageError, setImageError] = useState(false)

  const handleAddToCart = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    
    const isInCart = cart.some(item => item.id === course.id)
    if (isInCart) {
      toast.error('Already in cart')
      return
    }
    
    setCart([...cart, course])
    toast.success('Added to cart!')
  }, [cart, setCart, course])

  const discount = Math.round(((course.originalPrice - course.price) / course.originalPrice) * 100)
  const showFallback = !course.thumbnail || imageError

  return (
    <Link href={`/courses/${course.id}`}>
      <motion.div
        whileHover={{ y: -5 }}
        className="bg-[#111111] rounded-xl border border-[#2A2A2A] overflow-hidden cursor-pointer group h-full flex flex-col hover:border-purple-800/50 transition-colors"
      >
        {/* Thumbnail */}
        <div className="relative aspect-video overflow-hidden">
          {showFallback ? (
            <FallbackCourseThumbnail />
          ) : (
            <Image
              src={course.thumbnail}
              alt={course.title}
              fill
              priority={isPriority}
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              onError={() => setImageError(true)}
            />
          )}
          {course.isBestseller && (
            <div className="absolute top-3 left-3">
              <Badge label="Bestseller" color="purple" />
            </div>
          )}
          {course.isNew && !course.isBestseller && (
            <div className="absolute top-3 left-3">
              <Badge label="New" color="green" />
            </div>
          )}
          {discount > 0 && (
            <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
              -{discount}%
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-grow">
          <span className="text-xs text-purple-400 font-medium mb-2">{course.category}</span>
          
          <h3 className="text-white font-semibold mb-2 line-clamp-2 group-hover:text-purple-400 transition-colors text-sm">
            {course.title}
          </h3>

          <div className="flex items-center gap-2 mb-3">
            <div className="relative w-5 h-5 rounded-full overflow-hidden">
              <Image
                src={course.instructorAvatar}
                alt={course.instructor}
                fill
                className="object-cover"
              />
            </div>
            <span className="text-xs text-gray-400">{course.instructor}</span>
          </div>

          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
              <span className="text-white font-medium text-sm">{course.rating}</span>
            </div>
            <span className="text-gray-500 text-xs">({formatNumber(course.reviewCount)})</span>
          </div>

          <div className="flex items-center gap-3 text-xs text-gray-400 mb-4">
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{course.duration}</span>
            </div>
            <div className="flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5" />
              <span>{course.lessons}</span>
            </div>
          </div>

          <div className="mt-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-white">{formatPrice(course.price)}</span>
              {course.originalPrice > course.price && (
                <span className="text-xs text-gray-500 line-through">{formatPrice(course.originalPrice)}</span>
              )}
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={handleAddToCart}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ShoppingCart className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </motion.div>
    </Link>
  )
}

export default memo(CourseCard)
