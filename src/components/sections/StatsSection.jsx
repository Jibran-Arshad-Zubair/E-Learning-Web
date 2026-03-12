'use client'

import { memo, useRef } from 'react'
import { motion, useInView, useMotionValue, useTransform, animate } from 'framer-motion'
import { useEffect } from 'react'
import { Users, BookOpen, GraduationCap, Star } from 'lucide-react'

const stats = [
  { icon: Users, value: 50000, suffix: '+', label: 'Students', prefix: '' },
  { icon: BookOpen, value: 500, suffix: '+', label: 'Courses', prefix: '' },
  { icon: GraduationCap, value: 200, suffix: '+', label: 'Instructors', prefix: '' },
  { icon: Star, value: 4.9, suffix: '', label: 'Rating', prefix: '', decimals: 1 },
]

function AnimatedCounter({ value, suffix = '', prefix = '', decimals = 0 }) {
  const count = useMotionValue(0)
  const rounded = useTransform(count, (latest) => 
    decimals > 0 ? latest.toFixed(decimals) : Math.round(latest)
  )
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  useEffect(() => {
    if (isInView) {
      const controls = animate(count, value, { duration: 2, ease: 'easeOut' })
      return controls.stop
    }
  }, [isInView, count, value])

  return (
    <span ref={ref} className="text-3xl sm:text-4xl font-bold text-white font-[family-name:var(--font-syne)]">
      {prefix}<motion.span>{rounded}</motion.span>{suffix}
    </span>
  )
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
}

function StatsSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section className="py-20 bg-[#0A0A0A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              variants={itemVariants}
              className="relative bg-[#111111] rounded-xl p-6 border border-[#2A2A2A] overflow-hidden group hover:border-purple-800/50 transition-colors"
            >
              {/* Purple accent line */}
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-800" />
              
              <div className="flex flex-col items-start">
                <stat.icon className="w-8 h-8 text-purple-500 mb-4 group-hover:scale-110 transition-transform" />
                <AnimatedCounter 
                  value={stat.value} 
                  suffix={stat.suffix}
                  prefix={stat.prefix}
                  decimals={stat.decimals || 0}
                />
                <span className="text-gray-400 mt-2">{stat.label}</span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export default memo(StatsSection)
