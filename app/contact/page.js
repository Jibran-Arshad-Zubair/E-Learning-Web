'use client'

import { useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import { Mail, Phone, MapPin, Send, MessageSquare } from 'lucide-react'
import Navbar from '../../src/components/layout/Navbar'
import Footer from '../../src/components/layout/Footer'
import PageWrapper from '../../src/components/layout/PageWrapper'
import Input from '../../src/components/ui/Input'
import Button from '../../src/components/ui/Button'
import toast from 'react-hot-toast'

const ParticleBackground = dynamic(
  () => import('../../src/components/ui/ParticleBackground'),
  { ssr: false }
)

const contactInfo = [
  { icon: Mail, title: 'Email', value: 'support@elearninghub.com', link: 'mailto:support@elearninghub.com' },
  { icon: Phone, title: 'Phone', value: '+1 (234) 567-890', link: 'tel:+1234567890' },
  { icon: MapPin, title: 'Address', value: '123 Learning St, Tech City', link: null },
]

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [loading, setLoading] = useState(false)

  const handleChange = useCallback((e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }, [])

  const handleSubmit = useCallback((e) => {
    e.preventDefault()
    
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast.error('Please fill all fields')
      return
    }

    setLoading(true)
    
    setTimeout(() => {
      setLoading(false)
      toast.success('Message sent! We\'ll respond soon.')
      setFormData({ name: '', email: '', subject: '', message: '' })
    }, 1500)
  }, [formData])

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
              className="text-3xl sm:text-4xl font-bold text-white mb-3 font-[family-name:var(--font-syne)]"
            >
              Get in Touch
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-gray-300 max-w-md mx-auto text-sm"
            >
              Have questions? We&apos;d love to hear from you.
            </motion.p>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-16 relative z-10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* Contact Info */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="text-xl font-bold text-white mb-5">Contact Info</h2>
                
                <div className="space-y-4 mb-8">
                  {contactInfo.map((item) => (
                    <div key={item.title} className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-purple-800/20 flex items-center justify-center flex-shrink-0">
                        <item.icon className="w-5 h-5 text-purple-500" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white text-sm mb-0.5">{item.title}</h3>
                        {item.link ? (
                          <a href={item.link} className="text-gray-400 text-sm hover:text-purple-400 transition-colors">
                            {item.value}
                          </a>
                        ) : (
                          <p className="text-gray-400 text-sm">{item.value}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Map Placeholder */}
                <div className="relative aspect-video rounded-lg overflow-hidden bg-[#111111] border border-[#2A2A2A]">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="w-10 h-10 text-purple-500 mx-auto mb-2" />
                      <p className="text-gray-400 text-sm">Map placeholder</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Contact Form */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="bg-[#111111] rounded-lg border border-[#2A2A2A] p-6">
                  <div className="flex items-center gap-2 mb-5">
                    <div className="w-8 h-8 rounded-lg bg-purple-800/20 flex items-center justify-center">
                      <MessageSquare className="w-4 h-4 text-purple-500" />
                    </div>
                    <h2 className="text-xl font-bold text-white">Send Message</h2>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label="Name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Your name"
                        required
                      />
                      <Input
                        label="Email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="your@email.com"
                        required
                      />
                    </div>

                    <Input
                      label="Subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="How can we help?"
                      required
                    />

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1.5">
                        Message
                      </label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        rows={4}
                        placeholder="Your message..."
                        className="w-full px-3 py-2.5 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-purple-800 focus:ring-1 focus:ring-purple-800 transition-colors resize-none"
                        required
                      />
                    </div>

                    <Button type="submit" variant="primary" size="lg" className="w-full" loading={loading}>
                      <Send className="w-4 h-4 mr-2" />
                      Send Message
                    </Button>
                  </form>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </PageWrapper>
      <Footer />
    </>
  )
}

