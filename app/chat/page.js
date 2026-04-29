'use client'

import { useState, useCallback, Suspense } from 'react'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from '../../src/components/layout/Navbar'
import Footer from '../../src/components/layout/Footer'
import PageWrapper from '../../src/components/layout/PageWrapper'
import ChatSidebar from '../../src/components/chat/ChatSidebar'
import Loader from '../../src/components/ui/Loader'
import { useWindowSize } from '../../src/hooks/useWindowSize'

const ChatWindow = dynamic(
  () => import('../../src/components/chat/ChatWindow'),
  { loading: () => <Loader className="h-full flex items-center justify-center" />, ssr: false }
)

export default function ChatPage() {
  const [selectedContact, setSelectedContact] = useState(null)
  const [showSidebar, setShowSidebar] = useState(true)
  const { width } = useWindowSize()
  const isMobile = width && width < 768

  const handleSelectContact = useCallback((contact) => {
    setSelectedContact(contact)
    if (isMobile) {
      setShowSidebar(false)
    }
  }, [isMobile])

  console.log('Selected Contact:', selectedContact);

  const handleBack = useCallback(() => {
    setShowSidebar(true)
  }, [])

  return (
    <>
      <Navbar />
      <PageWrapper className="bg-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl sm:text-3xl font-bold text-white mb-6 font-[family-name:var(--font-syne)]"
          >
            Messages
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[#111111] rounded-xl border border-[#2A2A2A] overflow-hidden"
            style={{ height: 'calc(100vh - 220px)' }}
          >
            <div className="flex h-full">
              {/* Sidebar */}
              <AnimatePresence>
                {(showSidebar || !isMobile) && (
                  <motion.div
                    initial={isMobile ? { x: -300 } : false}
                    animate={{ x: 0 }}
                    exit={isMobile ? { x: -300 } : undefined}
                    className={`
                      ${isMobile ? 'absolute inset-0 z-10' : 'w-80 border-r border-[#2A2A2A]'}
                      ${!isMobile ? 'flex-shrink-0' : ''}
                    `}
                  >
                    <ChatSidebar
                      selectedContact={selectedContact}
                      onSelectContact={handleSelectContact}
                      onClose={() => setShowSidebar(false)}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Chat Window */}
              <div className="flex-grow">
                <Suspense fallback={<Loader className="h-full flex items-center justify-center" />}>
                  <ChatWindow
                    contact={selectedContact}
                    onBack={handleBack}
                    isMobile={isMobile}
                  />
                </Suspense>
              </div>
            </div>
          </motion.div>
        </div>
      </PageWrapper>
      <Footer />
    </>
  )
}
