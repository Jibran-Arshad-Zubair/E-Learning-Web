'use client'

import { memo } from 'react'
import Link from 'next/link'
import { GraduationCap, Youtube, Linkedin, Twitter, Instagram, Heart } from 'lucide-react'

const quickLinks = [
  { href: '/', label: 'Home' },
  { href: '/courses', label: 'Courses' },
  { href: '/about', label: 'About Us' },
  { href: '/contact', label: 'Contact' },
  { href: '/chat', label: 'Chat' },
]

const categories = [
  { href: '/courses?category=Development', label: 'Development' },
  { href: '/courses?category=Design', label: 'Design' },
  { href: '/courses?category=Business', label: 'Business' },
  { href: '/courses?category=Marketing', label: 'Marketing' },
  { href: '/courses?category=Data Science', label: 'Data Science' },
]

const socialLinks = [
  { href: '#', icon: Youtube, label: 'YouTube' },
  { href: '#', icon: Linkedin, label: 'LinkedIn' },
  { href: '#', icon: Twitter, label: 'Twitter' },
  { href: '#', icon: Instagram, label: 'Instagram' },
]

function Footer() {
  return (
    <footer className="bg-black border-t border-[#2A2A2A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Logo & Tagline */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="relative">
                <GraduationCap className="w-8 h-8 text-purple-500" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-purple-500 rounded-full" />
              </div>
              <span className="text-xl font-bold text-white font-[family-name:var(--font-syne)]">
                E-Learning Hub
              </span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Empowering learners worldwide with world-class courses from industry experts. 
              Start your learning journey today.
            </p>
            <div className="flex items-center gap-4">
              {socialLinks.map(social => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="p-2 rounded-lg bg-[#1A1A1A] hover:bg-purple-800/30 transition-colors"
                >
                  <social.icon className="w-5 h-5 text-gray-400 hover:text-purple-400" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks.map(link => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-purple-400 transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-white font-semibold mb-4">Categories</h4>
            <ul className="space-y-3">
              {categories.map(category => (
                <li key={category.href}>
                  <Link
                    href={category.href}
                    className="text-gray-400 hover:text-purple-400 transition-colors text-sm"
                  >
                    {category.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li>
                <span className="block">Email</span>
                <a href="mailto:support@elearninghub.com" className="text-purple-400 hover:text-purple-300">
                  support@elearninghub.com
                </a>
              </li>
              <li>
                <span className="block">Phone</span>
                <a href="tel:+1234567890" className="text-purple-400 hover:text-purple-300">
                  +1 (234) 567-890
                </a>
              </li>
              <li>
                <span className="block">Address</span>
                <span>123 Learning Street, Tech City, TC 12345</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-[#2A2A2A] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} E-Learning Hub. All rights reserved.
          </p>
          <p className="text-gray-500 text-sm flex items-center gap-1">
            Made with <Heart className="w-4 h-4 text-purple-500 fill-purple-500" /> by E-Learning Hub Team
          </p>
        </div>
      </div>
    </footer>
  )
}

export default memo(Footer)
