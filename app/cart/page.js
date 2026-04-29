'use client'

import { useCallback, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-react'
import Navbar from '../../src/components/layout/Navbar'
import Footer from '../../src/components/layout/Footer'
import PageWrapper from '../../src/components/layout/PageWrapper'
import Button from '../../src/components/ui/Button'
import { formatPrice } from '../../src/utils/helpers'
import { useLocalStorage } from '../../src/hooks/useLocalStorage'
import toast from 'react-hot-toast'

export default function CartPage() {
  const [cart, setCart, isLoaded] = useLocalStorage('cart', [])

  const handleRemoveItem = useCallback((courseId) => {
    setCart(cart.filter(item => item.id !== courseId))
    toast.success('Removed from cart')
  }, [cart, setCart])

  const handleClearCart = useCallback(() => {
    setCart([])
    toast.success('Cart cleared')
  }, [setCart])

  console.log('Cart Items:', cart);

  const { subtotal, discount, total } = useMemo(() => {
    const subtotal = cart.reduce((sum, item) => sum + item.originalPrice, 0)
    const total = cart.reduce((sum, item) => sum + item.price, 0)
    const discount = subtotal - total
    return { subtotal, discount, total }
  }, [cart])

  if (!isLoaded) {
    return (
      <>
        <Navbar />
        <PageWrapper className="bg-[#0A0A0A] min-h-screen" />
        <Footer />
      </>
    )
  }

  return (
    <>
      <Navbar />
      <PageWrapper className="bg-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl sm:text-4xl font-bold text-white mb-8 font-[family-name:var(--font-syne)]"
          >
            Shopping Cart
          </motion.h1>

          {cart.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20"
            >
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-[#1A1A1A] flex items-center justify-center">
                <ShoppingBag className="w-12 h-12 text-gray-500" />
              </div>
              <h2 className="text-2xl font-semibold text-white mb-4">Your cart is empty</h2>
              <p className="text-gray-400 mb-8 max-w-md mx-auto">
                Looks like you haven&apos;t added any courses yet. Start exploring our catalog!
              </p>
              <Link href="/courses">
                <Button variant="primary" size="lg">
                  Browse Courses
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2">
                <div className="flex items-center justify-between mb-6">
                  <p className="text-gray-400">{cart.length} course{cart.length !== 1 ? 's' : ''} in cart</p>
                  <button
                    onClick={handleClearCart}
                    className="text-sm text-red-400 hover:text-red-300 transition-colors"
                  >
                    Clear Cart
                  </button>
                </div>

                <div className="space-y-4">
                  {cart.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-[#111111] rounded-xl border border-[#2A2A2A] p-4 flex gap-4"
                    >
                      {/* Thumbnail */}
                      <Link href={`/courses/${item.id}`} className="flex-shrink-0">
                        <div className="relative w-32 h-20 rounded-lg overflow-hidden">
                          <Image
                            src={item.thumbnail}
                            alt={item.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      </Link>

                      {/* Info */}
                      <div className="flex-grow min-w-0">
                        <Link href={`/courses/${item.id}`}>
                          <h3 className="text-white font-semibold hover:text-purple-400 transition-colors line-clamp-1">
                            {item.title}
                          </h3>
                        </Link>
                        <p className="text-sm text-gray-400 mb-2">{item.instructor}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-white font-bold">{formatPrice(item.price)}</span>
                          {item.originalPrice > item.price && (
                            <span className="text-sm text-gray-500 line-through">{formatPrice(item.originalPrice)}</span>
                          )}
                        </div>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="flex-shrink-0 p-2 hover:bg-red-500/10 rounded-lg transition-colors group"
                      >
                        <Trash2 className="w-5 h-5 text-gray-400 group-hover:text-red-400" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-[#111111] rounded-xl border border-[#2A2A2A] p-6 sticky top-24"
                >
                  <h2 className="text-xl font-semibold text-white mb-6">Order Summary</h2>

                  <div className="space-y-4 mb-6">
                    <div className="flex items-center justify-between text-gray-400">
                      <span>Subtotal</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex items-center justify-between text-green-500">
                        <span>Discount</span>
                        <span>-{formatPrice(discount)}</span>
                      </div>
                    )}
                    <div className="border-t border-[#2A2A2A] pt-4">
                      <div className="flex items-center justify-between">
                        <span className="text-white font-semibold">Total</span>
                        <span className="text-2xl font-bold text-white">{formatPrice(total)}</span>
                      </div>
                    </div>
                  </div>

                  <Button variant="primary" size="lg" className="w-full">
                    Proceed to Checkout
                  </Button>

                  <p className="text-center text-xs text-gray-500 mt-4">
                    30-Day Money-Back Guarantee
                  </p>
                </motion.div>
              </div>
            </div>
          )}
        </div>
      </PageWrapper>
      <Footer />
    </>
  )
}
