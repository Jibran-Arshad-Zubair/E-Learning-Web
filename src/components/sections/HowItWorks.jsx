'use client'

import { memo, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { UserPlus, Search, PlayCircle } from 'lucide-react'

const steps = [
  {
    icon: UserPlus,
    title: 'Sign Up',
    description: 'Create your free account in seconds and join our learning community.',
  },
  {
    icon: Search,
    title: 'Browse Courses',
    description: 'Explore 500+ courses across various categories and skill levels.',
  },
  {
    icon: PlayCircle,
    title: 'Start Learning',
    description: 'Watch video lessons, complete assignments, and earn certifications.',
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, x: -30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6 } }
}

function HowItWorks() {
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
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 font-[family-name:var(--font-syne)]">
            How It Works
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Start your learning journey in three simple steps
          </p>
        </motion.div>

        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="relative"
        >
          {/* Connecting Line - Desktop */}
          <div className="hidden lg:block absolute top-24 left-1/6 right-1/6 h-0.5 border-t-2 border-dashed border-purple-800/50" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                variants={itemVariants}
                className="relative text-center"
              >
                {/* Step Number */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-purple-800 flex items-center justify-center text-white font-bold text-sm z-10">
                  {index + 1}
                </div>

                <div className="bg-[#111111] rounded-xl p-8 pt-12 border border-[#2A2A2A] hover:border-purple-800/50 transition-colors">
                  <div className="w-16 h-16 rounded-full bg-purple-800/20 flex items-center justify-center mx-auto mb-6">
                    <step.icon className="w-8 h-8 text-purple-500" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3 font-[family-name:var(--font-syne)]">
                    {step.title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default memo(HowItWorks)
