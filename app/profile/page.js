'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { BookOpen, Settings, History, User } from 'lucide-react'
import Navbar from '../../src/components/layout/Navbar'
import Footer from '../../src/components/layout/Footer'
import PageWrapper from '../../src/components/layout/PageWrapper'
import ProfileCard from '../../src/components/profile/ProfileCard'
import EditProfileForm from '../../src/components/profile/EditProfileForm'
import Button from '../../src/components/ui/Button'
import { courses } from '../../src/constants/data'

const tabs = [
  { id: 'courses', label: 'My Courses', icon: BookOpen },
  { id: 'edit', label: 'Edit Profile', icon: User },
  { id: 'history', label: 'Purchase History', icon: History },
  { id: 'settings', label: 'Settings', icon: Settings },
]

const mockUser = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop',
  role: 'Student',
  joinedDate: 'January 2024',
  bio: 'Passionate about learning new technologies and building amazing products.',
}

const enrolledCourses = courses.slice(0, 3).map(course => ({
  ...course,
  progress: Math.floor(Math.random() * 100),
}))

const purchaseHistory = [
  { id: 1, course: 'Complete Web Development Bootcamp', date: 'Jan 15, 2024', amount: '$89.99', status: 'Completed' },
  { id: 2, course: 'UI/UX Design Masterclass', date: 'Jan 10, 2024', amount: '$79.99', status: 'Completed' },
  { id: 3, course: 'Python for Data Science', date: 'Dec 28, 2023', amount: '$94.99', status: 'Completed' },
]

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('courses')
  const [user, setUser] = useState(mockUser)

  const handleUpdateProfile = useCallback((updatedData) => {
    setUser(prev => ({ ...prev, ...updatedData }))
  }, [])

  const renderTabContent = () => {
    switch (activeTab) {
      case 'courses':
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white">Enrolled Courses</h3>
            {enrolledCourses.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-400 mb-4">You haven&apos;t enrolled in any courses yet.</p>
                <Link href="/courses">
                  <Button variant="primary">Browse Courses</Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {enrolledCourses.map((course) => (
                  <Link key={course.id} href={`/courses/${course.id}`}>
                    <div className="bg-[#1A1A1A] rounded-lg p-4 hover:bg-[#222222] transition-colors">
                      <div className="flex gap-4">
                        <div className="relative w-24 h-16 rounded-lg overflow-hidden flex-shrink-0">
                          <Image
                            src={course.thumbnail}
                            alt={course.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-grow min-w-0">
                          <h4 className="text-white font-medium line-clamp-1 mb-1">{course.title}</h4>
                          <p className="text-sm text-gray-400 mb-2">{course.instructor}</p>
                          <div className="w-full bg-[#2A2A2A] rounded-full h-2">
                            <div
                              className="bg-purple-800 h-2 rounded-full transition-all"
                              style={{ width: `${course.progress}%` }}
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{course.progress}% complete</p>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )

      case 'edit':
        return (
          <div>
            <h3 className="text-xl font-semibold text-white mb-6">Edit Profile</h3>
            <EditProfileForm user={user} onUpdate={handleUpdateProfile} />
          </div>
        )

      case 'history':
        return (
          <div>
            <h3 className="text-xl font-semibold text-white mb-6">Purchase History</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#2A2A2A]">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Course</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Date</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Amount</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {purchaseHistory.map((purchase) => (
                    <tr key={purchase.id} className="border-b border-[#2A2A2A] hover:bg-white/5">
                      <td className="py-4 px-4 text-white">{purchase.course}</td>
                      <td className="py-4 px-4 text-gray-400">{purchase.date}</td>
                      <td className="py-4 px-4 text-white font-medium">{purchase.amount}</td>
                      <td className="py-4 px-4">
                        <span className="px-2 py-1 bg-green-800/20 text-green-400 text-xs rounded-full">
                          {purchase.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )

      case 'settings':
        return (
          <div>
            <h3 className="text-xl font-semibold text-white mb-6">Settings</h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-[#1A1A1A] rounded-lg">
                <div>
                  <h4 className="text-white font-medium">Email Notifications</h4>
                  <p className="text-sm text-gray-400">Receive email updates about your courses</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-[#2A2A2A] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-800"></div>
                </label>
              </div>
              <div className="flex items-center justify-between p-4 bg-[#1A1A1A] rounded-lg">
                <div>
                  <h4 className="text-white font-medium">Course Reminders</h4>
                  <p className="text-sm text-gray-400">Get reminders to continue learning</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-[#2A2A2A] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-800"></div>
                </label>
              </div>
              <div className="flex items-center justify-between p-4 bg-[#1A1A1A] rounded-lg">
                <div>
                  <h4 className="text-white font-medium">Promotional Emails</h4>
                  <p className="text-sm text-gray-400">Receive promotional offers and discounts</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-[#2A2A2A] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-800"></div>
                </label>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <>
      <Navbar />
      <PageWrapper className="bg-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-white mb-8 font-[family-name:var(--font-syne)]"
          >
            My Profile
          </motion.h1>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-1"
            >
              <ProfileCard user={user} />
            </motion.div>

            {/* Main Content */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-3"
            >
              {/* Tabs */}
              <div className="flex flex-wrap gap-2 mb-6 border-b border-[#2A2A2A] pb-4">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-lg transition-colors
                      ${activeTab === tab.id 
                        ? 'bg-purple-800 text-white' 
                        : 'text-gray-400 hover:bg-white/10'
                      }
                    `}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="bg-[#111111] rounded-xl border border-[#2A2A2A] p-6">
                {renderTabContent()}
              </div>
            </motion.div>
          </div>
        </div>
      </PageWrapper>
      <Footer />
    </>
  )
}

