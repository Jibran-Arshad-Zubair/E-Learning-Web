'use client'

import { memo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import { Play, Users } from 'lucide-react'
import Button from '../ui/Button'
import Badge from '../ui/Badge'

const ParticleBackground = dynamic(
  () => import('../ui/ParticleBackground'),
  { ssr: false }
)

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' }
  }
}

const studentAvatars = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&h=40&fit=crop',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=40&h=40&fit=crop',
]

function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
          poster="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1920&h=1080&fit=crop"
        >
          <source
            src="https://cdn.coverr.co/videos/coverr-typing-on-computer-keyboard-5475/1080p.mp4"
            type="video/mp4"
          />
        </video>
        <div className="absolute inset-0 bg-black/70" />
      </div>

      {/* Particle Background */}
      <ParticleBackground variant="hero" />

      {/* Floating Orb */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-purple-800/30 rounded-full blur-3xl floating-orb" />
      <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl floating-orb" style={{ animationDelay: '2s' }} />

      {/* Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
      >
        <motion.div variants={itemVariants}>
          <Badge label="#1 Learning Platform" className="mb-6" />
        </motion.div>

        <motion.h1
          variants={itemVariants}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 font-[family-name:var(--font-syne)] leading-tight text-balance"
        >
          Unlock Your Potential.{' '}
          <span className="gradient-text">Learn From The Best.</span>
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="text-base sm:text-lg text-gray-300 mb-8 max-w-xl mx-auto leading-relaxed"
        >
          Join 50K+ students learning from world-class instructors in Development, Design, Business & More.
        </motion.p>

        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10"
        >
          <Link href="/courses">
            <Button variant="primary" size="lg">
              Explore Courses
            </Button>
          </Link>
          <Button variant="outline" size="lg">
            <Play className="w-4 h-4" />
            Watch Demo
          </Button>
        </motion.div>

        {/* Trust Row */}
        <motion.div
          variants={itemVariants}
          className="flex items-center justify-center gap-3"
        >
          <div className="flex -space-x-2">
            {studentAvatars.map((avatar, index) => (
              <div
                key={index}
                className="w-8 h-8 rounded-full border-2 border-black overflow-hidden"
              >
                <Image
                  src={avatar}
                  alt={`Student ${index + 1}`}
                  width={32}
                  height={32}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
          <div className="flex items-center gap-1.5 text-sm text-gray-300">
            <Users className="w-4 h-4 text-purple-400" />
            <span><strong className="text-white">50K+</strong> Enrolled</span>
          </div>
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="w-5 h-8 rounded-full border-2 border-white/30 flex items-start justify-center pt-1.5"
        >
          <div className="w-1 h-2 bg-purple-500 rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  )
}

export default memo(HeroSection)

