'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight, FiCheck } from 'react-icons/fi'
import { FcGoogle } from 'react-icons/fc'
import { FaGithub, FaApple, FaGraduationCap, FaChalkboardTeacher } from 'react-icons/fa'
import toast from 'react-hot-toast'

const ParticleBackground = dynamic(
  () => import('../../src/components/ui/ParticleBackground'),
  { ssr: false }
)

export default function SignupPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [agreeToTerms, setAgreeToTerms] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const passwordRequirements = [
    { label: '8+ characters', met: formData.password.length >= 8 },
    { label: 'Uppercase', met: /[A-Z]/.test(formData.password) },
    { label: 'Lowercase', met: /[a-z]/.test(formData.password) },
    { label: 'Number', met: /[0-9]/.test(formData.password) },
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (!agreeToTerms) {
      toast.error('Please agree to the terms')
      return
    }

    const allRequirementsMet = passwordRequirements.every((req) => req.met)
    if (!allRequirementsMet) {
      toast.error('Please meet all password requirements')
      return
    }

    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    toast.success('Account created successfully!')
    setIsLoading(false)
    router.push('/dashboard')
  }

  const handleSocialSignup = (provider) => {
    toast.success(`Signing up with ${provider}...`)
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex relative overflow-hidden">
      <ParticleBackground variant="auth" />

  
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
              <div className="grid grid-cols-2 gap-3">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center shadow-lg">
                  <FaGraduationCap className="w-8 h-8 text-white" />
                </div>
                <div className="w-16 h-16 rounded-xl bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center">
                  <FaChalkboardTeacher className="w-8 h-8 text-purple-400" />
                </div>
                <div className="w-16 h-16 rounded-xl bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center">
                  <FiCheck className="w-8 h-8 text-purple-400" />
                </div>
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-700 to-purple-800 flex items-center justify-center shadow-lg">
                  <FiCheck className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: 'var(--font-syne)' }}>
            Start Learning Today
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            Join our community and unlock access to premium courses from industry experts.
          </p>

          <div className="mt-6 space-y-2 text-left">
            {['500+ courses', 'Expert instructors', 'Certificates'].map((feature, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-purple-600/20 flex items-center justify-center">
                  <FiCheck className="w-2.5 h-2.5 text-purple-500" />
                </div>
                <span className="text-gray-400 text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

   
      <div className="flex-1 flex items-center justify-center px-6 py-12 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
        
          <Link href="/" className="flex items-center gap-2 mb-6">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center">
              <span className="text-white font-bold text-lg" style={{ fontFamily: 'var(--font-syne)' }}>E</span>
            </div>
            <span className="text-lg font-bold text-white" style={{ fontFamily: 'var(--font-syne)' }}>E-Learning Hub</span>
          </Link>

        
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: 'var(--font-syne)' }}>
              Create your account
            </h1>
            <p className="text-gray-400 text-sm">Join our learning community today</p>
          </div>

         
          <div className="flex gap-2 mb-5">
            {[
              { icon: FcGoogle, provider: 'Google' },
              { icon: FaGithub, provider: 'GitHub' },
              { icon: FaApple, provider: 'Apple' },
            ].map(({ icon: Icon, provider }) => (
              <button
                key={provider}
                onClick={() => handleSocialSignup(provider)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg hover:bg-[#222222] transition-colors"
              >
                <Icon className="w-4 h-4 text-white" />
              </button>
            ))}
          </div>

     
          <div className="relative mb-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#2A2A2A]"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-[#0A0A0A] text-gray-500">or with email</span>
            </div>
          </div>

        
          <form onSubmit={handleSubmit} className="space-y-4">
           
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-300 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 transition-colors"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

           
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1.5">
                Email Address
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
                  placeholder="Create password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                </button>
              </div>
              {formData.password && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {passwordRequirements.map((req, index) => (
                    <span
                      key={index}
                      className={`text-xs px-2 py-0.5 rounded ${
                        req.met ? 'bg-green-500/20 text-green-400' : 'bg-[#2A2A2A] text-gray-500'
                      }`}
                    >
                      {req.label}
                    </span>
                  ))}
                </div>
              )}
            </div>

          
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-10 py-2.5 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 transition-colors"
                  placeholder="Confirm password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showConfirmPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                </button>
              </div>
            </div>

          
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={agreeToTerms}
                onChange={(e) => setAgreeToTerms(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-[#2A2A2A] bg-[#1A1A1A] text-purple-600 focus:ring-purple-600 focus:ring-offset-0"
              />
              <span className="text-xs text-gray-400">
                I agree to the{' '}
                <Link href="/terms" className="text-purple-500 hover:text-purple-400">Terms</Link>
                {' '}and{' '}
                <Link href="/privacy" className="text-purple-500 hover:text-purple-400">Privacy Policy</Link>
              </span>
            </label>

          
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-800 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-purple-900 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2 focus:ring-offset-[#0A0A0A] disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  Create Account
                  <FiArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

        
          <p className="mt-6 text-center text-gray-400 text-sm">
            Already have an account?{' '}
            <Link href="/login" className="text-purple-500 hover:text-purple-400 font-medium transition-colors">
              Login
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}