'use client'

import { useRef } from 'react'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import { motion, useInView } from 'framer-motion'
import { Target, Users, Lightbulb, Shield } from 'lucide-react'
import Navbar from '../../src/components/layout/Navbar'
import Footer from '../../src/components/layout/Footer'
import PageWrapper from '../../src/components/layout/PageWrapper'
import { instructors } from '../../src/constants/data'

const ParticleBackground = dynamic(
  () => import('../../src/components/ui/ParticleBackground'),
  { ssr: false }
)

const values = [
  { icon: Target, title: 'Quality', description: 'Top-tier courses from experts.' },
  { icon: Users, title: 'Community', description: 'Learn and grow together.' },
  { icon: Lightbulb, title: 'Innovation', description: 'Cutting-edge learning tools.' },
  { icon: Shield, title: 'Accessible', description: 'Education for everyone.' },
]

const milestones = [
  { year: '2020', title: 'Founded', description: 'Started our journey.' },
  { year: '2021', title: '1K Students', description: 'First milestone reached.' },
  { year: '2022', title: '100+ Courses', description: 'Expanded our catalog.' },
  { year: '2023', title: '50K+ Students', description: 'Global community growth.' },
  { year: '2024', title: 'Global Reach', description: 'Launched in 20+ countries.' },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
}

export default function AboutPage() {
  const valuesRef = useRef(null)
  const teamRef = useRef(null)
  const isValuesInView = useInView(valuesRef, { once: true, margin: '-100px' })
  const isTeamInView = useInView(teamRef, { once: true, margin: '-100px' })

  return (
    <>
      <Navbar />
      <PageWrapper className="bg-[#0A0A0A] relative">
        <ParticleBackground variant="subtle" />

        {/* Hero */}
        <section className="py-16 bg-gradient-to-b from-purple-900/20 to-[#0A0A0A] relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 font-[family-name:var(--font-syne)]"
            >
              About <span className="gradient-text">E-Learning Hub</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-gray-300 max-w-xl mx-auto"
            >
              Empowering learners worldwide with quality education from industry experts.
            </motion.p>
          </div>
        </section>

        {/* Mission */}
        <section className="py-16 relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 font-[family-name:var(--font-syne)]">
                  Our Mission
                </h2>
                <p className="text-gray-300 leading-relaxed mb-4 text-sm">
                  We believe quality education should be accessible to everyone. Our mission is to connect learners with industry experts through practical, career-focused courses.
                </p>
                <p className="text-gray-300 leading-relaxed text-sm">
                  Since founding, we&apos;ve helped 50,000+ students transform their careers with courses taught by passionate professionals.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="relative"
              >
                <div className="relative aspect-square rounded-xl overflow-hidden">
                  <Image
                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=800&fit=crop"
                    alt="Team collaboration"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>
                <div className="absolute -bottom-4 -left-4 bg-[#111111] border border-[#2A2A2A] rounded-lg p-4 shadow-xl">
                  <div className="text-2xl font-bold text-white">50K+</div>
                  <div className="text-xs text-gray-400">Happy Students</div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Core Values */}
        <section className="py-16 bg-[#111111] relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-10"
            >
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 font-[family-name:var(--font-syne)]">
                Our Values
              </h2>
              <p className="text-gray-400 text-sm">Principles that guide us</p>
            </motion.div>

            <motion.div
              ref={valuesRef}
              variants={containerVariants}
              initial="hidden"
              animate={isValuesInView ? "visible" : "hidden"}
              className="grid grid-cols-2 lg:grid-cols-4 gap-4"
            >
              {values.map((value) => (
                <motion.div
                  key={value.title}
                  variants={itemVariants}
                  className="bg-[#0A0A0A] rounded-lg p-5 border border-[#2A2A2A] text-center hover:border-purple-800/50 transition-colors"
                >
                  <div className="w-12 h-12 rounded-full bg-purple-800/20 flex items-center justify-center mx-auto mb-3">
                    <value.icon className="w-6 h-6 text-purple-500" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-1">{value.title}</h3>
                  <p className="text-xs text-gray-400">{value.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Team */}
        <section className="py-16 relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-10"
            >
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 font-[family-name:var(--font-syne)]">
                Our Team
              </h2>
              <p className="text-gray-400 text-sm">Meet the people behind E-Learning Hub</p>
            </motion.div>

            <motion.div
              ref={teamRef}
              variants={containerVariants}
              initial="hidden"
              animate={isTeamInView ? "visible" : "hidden"}
              className="grid grid-cols-2 lg:grid-cols-4 gap-4"
            >
              {instructors.slice(0, 4).map((member) => (
                <motion.div
                  key={member.id}
                  variants={itemVariants}
                  className="bg-[#111111] rounded-lg p-5 border border-[#2A2A2A] text-center hover:border-purple-800/50 transition-colors group"
                >
                  <div className="relative w-16 h-16 mx-auto mb-3 rounded-full overflow-hidden">
                    <Image
                      src={member.avatar}
                      alt={member.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <h3 className="text-sm font-bold text-white mb-0.5">{member.name}</h3>
                  <p className="text-xs text-purple-400">{member.subject}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Timeline */}
        <section className="py-16 bg-[#111111] relative z-10">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-10"
            >
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 font-[family-name:var(--font-syne)]">
                Our Journey
              </h2>
              <p className="text-gray-400 text-sm">Key milestones</p>
            </motion.div>

            <div className="relative">
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-purple-800/30 md:left-1/2 md:-translate-x-1/2" />

              {milestones.map((milestone, index) => (
                <motion.div
                  key={milestone.year}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className={`relative flex items-center mb-6 ${
                    index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                  }`}
                >
                  <div className="absolute left-6 w-3 h-3 bg-purple-800 rounded-full border-3 border-[#111111] z-10 md:left-1/2 md:-translate-x-1/2" />

                  <div className={`ml-12 md:ml-0 md:w-1/2 ${index % 2 === 0 ? 'md:pr-10' : 'md:pl-10'}`}>
                    <div className="bg-[#0A0A0A] rounded-lg p-4 border border-[#2A2A2A]">
                      <span className="text-purple-400 font-bold text-sm">{milestone.year}</span>
                      <h3 className="text-sm font-bold text-white mt-0.5">{milestone.title}</h3>
                      <p className="text-xs text-gray-400 mt-1">{milestone.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </PageWrapper>
      <Footer />
    </>
  )
}
