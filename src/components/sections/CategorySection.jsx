'use client'

import { memo, useRef } from 'react'
import Link from 'next/link'
import { motion, useInView } from 'framer-motion'
import { Code, Palette, Briefcase, TrendingUp, BarChart3, Camera } from 'lucide-react'
import { categories } from '../../constants/data'

const iconMap = {
  Code,
  Palette,
  Briefcase,
  TrendingUp,
  BarChart3,
  Camera,
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

function CategorySection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

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
            Browse By Category
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Explore our wide range of courses across different categories
          </p>
        </motion.div>

        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
        >
          {categories.map((category) => {
            const Icon = iconMap[category.icon] || Code
            return (
              <motion.div key={category.id} variants={itemVariants}>
                <Link href={`/courses?category=${category.name}`}>
                  <motion.div
                    whileHover={{ scale: 1.05, borderColor: 'rgb(107, 33, 168)' }}
                    className="bg-[#111111] rounded-xl p-6 border border-[#2A2A2A] text-center cursor-pointer transition-all h-full flex flex-col items-center justify-center"
                  >
                    <div className="w-14 h-14 rounded-full bg-purple-800/20 flex items-center justify-center mb-4">
                      <Icon className="w-7 h-7 text-purple-500" />
                    </div>
                    <h3 className="text-white font-semibold mb-1">{category.name}</h3>
                    <span className="text-sm text-gray-500">{category.courseCount} Courses</span>
                  </motion.div>
                </Link>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}

export default memo(CategorySection)
