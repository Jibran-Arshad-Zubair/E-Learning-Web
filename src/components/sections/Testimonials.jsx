'use client'

import { memo } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination, Autoplay } from 'swiper/modules'
import { Quote, Star } from 'lucide-react'
import 'swiper/css'
import 'swiper/css/pagination'
import { testimonials } from '../../constants/data'

function TestimonialCard({ testimonial }) {
  return (
    <div className="bg-[#111111] rounded-xl p-6 sm:p-8 border border-[#2A2A2A] h-full flex flex-col">
      <Quote className="w-10 h-10 text-purple-500/30 mb-4" />
      
      <p className="text-gray-300 leading-relaxed flex-grow mb-6">
        &ldquo;{testimonial.text}&rdquo;
      </p>
      
      <div className="flex items-center gap-4">
        <div className="relative w-12 h-12 rounded-full overflow-hidden">
          <Image
            src={testimonial.avatar}
            alt={testimonial.studentName}
            fill
            className="object-cover"
          />
        </div>
        <div className="flex-grow">
          <h4 className="text-white font-semibold">{testimonial.studentName}</h4>
          <p className="text-sm text-gray-500">{testimonial.course}</p>
        </div>
        <div className="flex gap-0.5">
          {Array.from({ length: testimonial.rating }).map((_, i) => (
            <Star key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
          ))}
        </div>
      </div>
    </div>
  )
}

function Testimonials() {
  return (
    <section className="py-20 bg-[#0A0A0A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 font-[family-name:var(--font-syne)]">
            What Our Students Say
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Join thousands of satisfied learners who transformed their careers
          </p>
        </motion.div>

        <Swiper
          modules={[Pagination, Autoplay]}
          spaceBetween={24}
          slidesPerView={1}
          pagination={{ clickable: true }}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          breakpoints={{
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
          className="pb-12"
        >
          {testimonials.map((testimonial) => (
            <SwiperSlide key={testimonial.id} className="h-auto">
              <TestimonialCard testimonial={testimonial} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  )
}

export default memo(Testimonials)
