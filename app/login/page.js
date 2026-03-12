'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi'
import { FcGoogle } from 'react-icons/fc'
import { FaGithub, FaApple } from 'react-icons/fa'
import toast from 'react-hot-toast'

const ParticleBackground = dynamic(
  () => import('../../src/components/ui/ParticleBackground'),
  { ssr: false }
)

export default function LoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    toast.success('Welcome back!')
    setIsLoading(false)
    router.push('/dashboard')
  }

  const handleSocialLogin = (provider) => {
    toast.success(`Signing in with ${provider}...`)
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex relative overflow-hidden">
      <ParticleBackground variant="auth" />

      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center">
              <span className="text-white font-bold text-lg" style={{ fontFamily: 'var(--font-syne)' }}>E</span>
            </div>
            <span className="text-lg font-bold text-white" style={{ fontFamily: 'var(--font-syne)' }}>E-Learning Hub</span>
          </Link>

          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: 'var(--font-syne)' }}>
              Welcome back
            </h1>
            <p className="text-gray-400 text-sm">Sign in to continue learning</p>
          </div>

          {/* Social Login */}
          <div className="flex gap-2 mb-5">
            {[
              { icon: FcGoogle, provider: 'Google' },
              { icon: FaGithub, provider: 'GitHub' },
              { icon: FaApple, provider: 'Apple' },
            ].map(({ icon: Icon, provider }) => (
              <button
                key={provider}
                onClick={() => handleSocialLogin(provider)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg hover:bg-[#222222] transition-colors"
              >
                <Icon className="w-4 h-4 text-white" />
                <span className="text-xs text-white hidden sm:inline">{provider}</span>
              </button>
            ))}
          </div>

          {/* Divider */}
          <div className="relative mb-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#2A2A2A]"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-[#0A0A0A] text-gray-500">or with email</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1.5">
                Email address
              </label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 transition-colors"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-10 py-2.5 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 transition-colors"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-[#2A2A2A] bg-[#1A1A1A] text-purple-600 focus:ring-purple-600 focus:ring-offset-0"
                />
                <span className="text-gray-400 text-xs">Remember me</span>
              </label>
              <Link href="/forgot-password" className="text-xs text-purple-500 hover:text-purple-400 transition-colors">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-800 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-purple-900 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2 focus:ring-offset-[#0A0A0A] disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  Sign in
                  <FiArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-gray-400 text-sm">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-purple-500 hover:text-purple-400 font-medium transition-colors">
              Sign up free
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Right Side - Illustration */}
      <div className="hidden lg:flex flex-1 items-center justify-center bg-gradient-to-br from-purple-900/20 to-[#0A0A0A] p-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-md text-center"
        >
          <div className="relative mb-8">
            <div className="w-48 h-48 mx-auto rounded-full bg-gradient-to-br from-purple-600/30 to-purple-800/30 blur-3xl"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-36 h-36 rounded-2xl bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center shadow-2xl shadow-purple-600/30">
                <span className="text-5xl font-bold text-white" style={{ fontFamily: 'var(--font-syne)' }}>E</span>
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: 'var(--font-syne)' }}>
            Continue Learning
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            Access your courses and track your progress with E-Learning Hub.
          </p>

          <div className="flex justify-center gap-6 mt-6">
            {[
              { label: 'Students', value: '50K+' },
              { label: 'Courses', value: '500+' },
              { label: 'Instructors', value: '100+' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-xl font-bold text-white" style={{ fontFamily: 'var(--font-syne)' }}>{stat.value}</div>
                <div className="text-xs text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

