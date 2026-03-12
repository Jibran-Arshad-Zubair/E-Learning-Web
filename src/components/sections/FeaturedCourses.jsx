'use client'

import { memo } from 'react'
import { motion } from 'framer-motion'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import CourseCard from '../courses/CourseCard'
import { courses } from '../../constants/data'

function FeaturedCourses() {
  const featuredCourses = courses.filter(course => course.isBestseller || course.rating >= 4.8).slice(0, 6)

  return (
    <section className="py-20 bg-gradient-to-b from-[#0A0A0A] to-[#111111]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 font-[family-name:var(--font-syne)]">
            Top Rated Courses
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Learn from the best courses handpicked by our experts
          </p>
        </motion.div>

        {/* Mobile: Swiper Carousel */}
        <div className="lg:hidden">
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={16}
            slidesPerView={1.2}
            centeredSlides={false}
            pagination={{ clickable: true }}
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            breakpoints={{
              480: { slidesPerView: 1.5 },
              640: { slidesPerView: 2 },
            }}
            className="pb-12"
          >
            {featuredCourses.map((course, index) => (
              <SwiperSlide key={course.id}>
                <CourseCard course={course} isPriority={index < 2} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* Desktop: Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="hidden lg:grid lg:grid-cols-3 gap-6"
        >
          {featuredCourses.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <CourseCard course={course} isPriority={index < 3} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export default memo(FeaturedCourses)
