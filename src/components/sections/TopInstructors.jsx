'use client'

import { memo, useRef } from 'react'
import Image from 'next/image'
import { motion, useInView } from 'framer-motion'
import { Star, Users } from 'lucide-react'
import { instructors } from '../../constants/data'
import { formatNumber } from '../../utils/helpers'

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

function TopInstructors() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  const topInstructors = instructors.slice(0, 4)

  return (
    <section className="py-20 bg-gradient-to-b from-[#111111] to-[#0A0A0A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 font-[family-name:var(--font-syne)]">
            Learn From The Best
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Our instructors are industry experts with years of experience
          </p>
        </motion.div>

        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {topInstructors.map((instructor) => (
            <motion.div
              key={instructor.id}
              variants={itemVariants}
              whileHover={{ 
                y: -5,
                boxShadow: '0 0 30px rgba(107, 33, 168, 0.3)'
              }}
              className="bg-[#111111] rounded-xl p-6 border border-[#2A2A2A] text-center cursor-pointer transition-all"
            >
              <div className="relative w-24 h-24 mx-auto mb-4">
                <Image
                  src={instructor.avatar}
                  alt={instructor.name}
                  fill
                  className="rounded-full object-cover"
                />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-[#111111]" />
              </div>
              
              <h3 className="text-lg font-bold text-white mb-1">{instructor.name}</h3>
              <p className="text-purple-400 text-sm mb-3">{instructor.subject}</p>
              
              <div className="flex items-center justify-center gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span>{instructor.rating}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4 text-purple-500" />
                  <span>{formatNumber(instructor.students)}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export default memo(TopInstructors)
