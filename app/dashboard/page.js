'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { BookOpen, Clock, Trophy, Calendar, Play, ArrowRight } from 'lucide-react'
import Navbar from '../../src/components/layout/Navbar'
import Footer from '../../src/components/layout/Footer'
import PageWrapper from '../../src/components/layout/PageWrapper'
import Button from '../../src/components/ui/Button'
import { courses } from '../../src/constants/data'

const quickStats = [
  { icon: BookOpen, label: 'Enrolled Courses', value: 5, color: 'purple' },
  { icon: Clock, label: 'Hours Learned', value: 24, color: 'blue' },
  { icon: Trophy, label: 'Assignments Done', value: 12, color: 'green' },
  { icon: Calendar, label: 'Streak Days', value: 7, color: 'orange' },
]

const continueLearning = courses.slice(0, 3).map((course, index) => ({
  ...course,
  progress: [75, 45, 20][index],
  lastWatched: ['2 hours ago', 'Yesterday', '3 days ago'][index],
}))

const recommendedCourses = courses.slice(3, 6)

const recentActivity = [
  { action: 'Completed lesson', course: 'Complete Web Development Bootcamp', lesson: 'Introduction to React Hooks', time: '2 hours ago' },
  { action: 'Started course', course: 'UI/UX Design Masterclass', lesson: 'Design Principles', time: '1 day ago' },
  { action: 'Earned badge', course: 'Python for Data Science', lesson: 'Python Basics Complete', time: '2 days ago' },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
}

export default function DashboardPage() {
  const userName = 'John'

  return (
    <>
      <Navbar />
      <PageWrapper className="bg-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-purple-900/50 to-purple-800/20 rounded-2xl p-8 mb-8 border border-purple-800/30"
          >
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 font-[family-name:var(--font-syne)]">
              Welcome back, {userName}!
            </h1>
            <p className="text-gray-300">
              You&apos;re making great progress. Keep up the momentum!
            </p>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
          >
            {quickStats.map((stat) => (
              <motion.div
                key={stat.label}
                variants={itemVariants}
                className="bg-[#111111] rounded-xl p-6 border border-[#2A2A2A] hover:border-purple-800/50 transition-colors"
              >
                <stat.icon className="w-8 h-8 text-purple-500 mb-3" />
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-sm text-gray-400">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Continue Learning */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">Continue Learning</h2>
                  <Link href="/profile" className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1">
                    View All <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

                <div className="space-y-4">
                  {continueLearning.map((course, index) => (
                    <Link key={course.id} href={`/courses/${course.id}`}>
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                        className="bg-[#111111] rounded-xl p-4 border border-[#2A2A2A] hover:border-purple-800/50 transition-colors group"
                      >
                        <div className="flex gap-4">
                          <div className="relative w-32 sm:w-40 h-20 rounded-lg overflow-hidden flex-shrink-0">
                            <Image
                              src={course.thumbnail}
                              alt={course.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <Play className="w-8 h-8 text-white" />
                            </div>
                          </div>
                          <div className="flex-grow min-w-0">
                            <h3 className="text-white font-semibold line-clamp-1 mb-1 group-hover:text-purple-400 transition-colors">
                              {course.title}
                            </h3>
                            <p className="text-sm text-gray-400 mb-3">{course.instructor}</p>
                            <div className="flex items-center gap-4">
                              <div className="flex-grow">
                                <div className="w-full bg-[#2A2A2A] rounded-full h-2">
                                  <div
                                    className="bg-purple-800 h-2 rounded-full transition-all"
                                    style={{ width: `${course.progress}%` }}
                                  />
                                </div>
                              </div>
                              <span className="text-xs text-gray-500 flex-shrink-0">{course.progress}%</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">{course.lastWatched}</p>
                          </div>
                        </div>
                      </motion.div>
                    </Link>
                  ))}
                </div>
              </motion.div>

              {/* Recommended Courses */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-10"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">Recommended for You</h2>
                  <Link href="/courses" className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1">
                    Browse All <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {recommendedCourses.map((course, index) => (
                    <Link key={course.id} href={`/courses/${course.id}`}>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                        className="bg-[#111111] rounded-xl border border-[#2A2A2A] overflow-hidden hover:border-purple-800/50 transition-colors group"
                      >
                        <div className="relative aspect-video">
                          <Image
                            src={course.thumbnail}
                            alt={course.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <div className="p-4">
                          <h3 className="text-white font-semibold text-sm line-clamp-2 group-hover:text-purple-400 transition-colors">
                            {course.title}
                          </h3>
                          <p className="text-xs text-gray-400 mt-1">{course.instructor}</p>
                        </div>
                      </motion.div>
                    </Link>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Upcoming Sessions */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-[#111111] rounded-xl p-6 border border-[#2A2A2A]"
              >
                <h3 className="text-lg font-semibold text-white mb-4">Upcoming Sessions</h3>
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm">No upcoming sessions</p>
                  <p className="text-gray-500 text-xs mt-1">Schedule your learning time</p>
                </div>
              </motion.div>

              {/* Recent Activity */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-[#111111] rounded-xl p-6 border border-[#2A2A2A]"
              >
                <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm text-white">{activity.action}</p>
                        <p className="text-xs text-gray-400 line-clamp-1">{activity.lesson}</p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </PageWrapper>
      <Footer />
    </>
  )
}
