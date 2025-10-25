'use client'

import { useState } from 'react'
import { Menu, X, ShoppingCart, User, MapPin, Search as SearchIcon, Clock, Percent, LogOut } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { useAuth } from '@/hooks/useAuth'
import LocationModal from './LocationModal'
import CartSidebar from './CartSidebar'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  
  const { location, getTotalItems, user, setSearchOpen } = useStore()
  const { logout } = useAuth()

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const groceryCategories = [
    { name: "Fruits & Vegetables", href: "#fruits" },
    { name: "Dairy & Bakery", href: "#dairy" },
    { name: "Snacks & Beverages", href: "#snacks" },
    { name: "Personal Care", href: "#personal-care" }
  ]

  return (
    <>
      {/* Top Banner */}
      <div className="bg-linear-to-r from-primary-brand to-secondary-brand text-white py-2 text-center text-sm">
        <div className="flex items-center justify-center space-x-6">
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            <span>10-min delivery</span>
          </div>
          <div className="flex items-center">
            <Percent className="w-4 h-4 mr-1" />
            <span>Free delivery above ₹199</span>
          </div>
          <span className="hidden sm:inline">🎉 Get 20% off on first order</span>
        </div>
      </div>

      <nav className="bg-white shadow-md sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3">
            {/* Logo & Location */}
            <div className="flex items-center space-x-4">
              <div className="shrink-0">
                <Link href="/">
                  <div className="flex items-center cursor-pointer group">
                    <div className="text-3xl mr-2">🛒</div>
                    <div>
                      <h1 className="text-xl font-bold text-primary-brand group-hover:text-primary-hover transition-colors">
                        Mohalla<span className="text-secondary-brand">Mart</span>
                      </h1>
                      <p className="text-xs text-gray-500 -mt-1">Groceries in minutes</p>
                    </div>
                  </div>
                </Link>
              </div>
              
              {/* Location Button - Desktop */}
              <div className="hidden md:block">
                <button 
                  onClick={() => setIsLocationModalOpen(true)}
                  className="flex items-center bg-gray-50 hover:bg-gray-100 px-3 py-2 rounded-lg border transition-colors group"
                >
                  <MapPin className="h-4 w-4 mr-2 text-red-500" />
                  <div className="text-left">
                    <div className="text-xs text-gray-500">Deliver to</div>
                    <div className="text-sm font-medium text-gray-800 max-w-[120px] truncate">
                      {location ? location.area : 'Select Location'}
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Search Bar - Desktop (only show when search modal is closed) */}
            {!useStore.getState().isSearchOpen && (
              <div className="hidden md:flex flex-1 max-w-xl mx-8">
                <div className="relative w-full">
                  <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500 h-5 w-5 pointer-events-none" />
                  <input
                    type="text"
                    readOnly
                    placeholder="Search for groceries, fruits, vegetables..."
                    className="w-full pl-10 pr-24 py-3 bg-white border-2 border-neutral-200 rounded-xl text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-brand focus:border-primary-brand transition-all duration-200 hover:border-neutral-300 cursor-pointer"
                    onClick={() => setSearchOpen(true)}
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1 pointer-events-none">
                    <kbd className="hidden lg:inline-block px-2 py-1 text-xs font-semibold text-gray-600 bg-white border border-gray-200 rounded">
                      Ctrl
                    </kbd>
                    <kbd className="hidden lg:inline-block px-2 py-1 text-xs font-semibold text-gray-600 bg-white border border-gray-200 rounded">
                      V                    </kbd>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons - Desktop */}
            <div className="hidden md:flex items-center space-x-4">
              {/* User Account */}
              {user ? (
                <div className="flex items-center space-x-2">
                  <div className="flex items-center text-gray-700 px-3 py-2 rounded-lg">
                    <User className="h-5 w-5 mr-2" />
                    <div className="text-left">
                      <div className="text-xs text-gray-500">Account</div>
                      <div className="text-sm font-medium">{user.name}</div>
                    </div>
                  </div>
                  <button 
                    onClick={logout}
                    className="flex items-center text-gray-700 hover:text-red-600 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="h-5 w-5 mr-2" />
                    <span className="text-sm">Logout</span>
                  </button>
                </div>
              ) : (
                <Link href="/auth">
                  <button className="flex items-center text-gray-700 hover:text-primary-brand px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                    <User className="h-5 w-5 mr-2" />
                    <div className="text-left">
                      <div className="text-xs text-gray-500">Account</div>
                      <div className="text-sm font-medium">Sign In</div>
                    </div>
                  </button>
                </Link>
              )}

              {/* Cart Button */}
              <button 
                onClick={() => setIsCartOpen(true)}
                className="bg-primary-brand text-white px-6 py-3 rounded-xl hover:bg-primary-hover transition-colors flex items-center relative shadow-sm hover:shadow-md"
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                <div className="text-left">
                  <div className="text-xs opacity-90">My Cart</div>
                  <div className="text-sm font-medium">
                    {getTotalItems() > 0 ? `${getTotalItems()} items` : 'Empty'}
                  </div>
                </div>
                {getTotalItems() > 0 && (
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 bg-secondary-brand text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center shadow-lg"
                  >
                    {getTotalItems()}
                  </motion.span>
                )}
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center space-x-3">
              {/* Mobile Search */}
              <button
                onClick={() => setSearchOpen(true)}
                className="text-gray-600 hover:text-primary-brand p-2"
                aria-label="Open search"
              >
                <SearchIcon className="h-6 w-6" />
              </button>
              {/* Mobile Cart */}
              <button 
                onClick={() => setIsCartOpen(true)}
                className="relative text-gray-600 hover:text-primary-brand p-2"
                aria-label="Open cart"
              >
                <ShoppingCart className="h-6 w-6" />
                {getTotalItems() > 0 && (
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-secondary-brand text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center"
                  >
                    {getTotalItems()}
                  </motion.span>
                )}
              </button>
              {/* Mobile Menu */}
              <button
                onClick={toggleMenu}
                className="text-gray-600 hover:text-primary-brand p-2"
                aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              >
                {isMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>

          {/* Category Navigation - Desktop */}
          <div className="hidden md:block border-t border-gray-100">
            <div className="flex items-center justify-between py-3">
              <div className="flex space-x-8">
                {groceryCategories.map((category, index) => (
                  <Link
                    key={index}
                    href={category.href}
                    className="text-sm text-gray-700 hover:text-primary-brand font-medium transition-colors relative group"
                  >
                    {category.name}
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-brand transition-all group-hover:w-full"></span>
                  </Link>
                ))}
              </div>
              <div className="text-sm text-gray-600">
                <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                  🎯 Same Day Delivery Available
                </span>
              </div>
            </div>
          </div>

          {/* Mobile Navigation */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="md:hidden border-t border-gray-100 overflow-hidden"
              >
                <div className="px-4 py-4 space-y-3 bg-white">
                  {/* Mobile Location */}
                  <button 
                    onClick={() => {
                      setIsLocationModalOpen(true)
                      setIsMenuOpen(false)
                    }}
                    className="flex items-center w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <MapPin className="h-5 w-5 mr-3 text-red-500" />
                    <div>
                      <div className="text-xs text-gray-500">Deliver to</div>
                      <div className="text-sm font-medium text-gray-800">
                        {location ? location.area : 'Select Location'}
                      </div>
                    </div>
                  </button>

                  {/* Mobile Categories */}
                  <div className="border-t pt-3">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Categories</div>
                    {groceryCategories.map((category, index) => (
                      <Link
                        key={index}
                        href={category.href}
                        className="block px-3 py-2 text-gray-700 hover:text-primary-brand hover:bg-gray-50 rounded-lg transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {category.name}
                      </Link>
                    ))}
                  </div>

                  {/* Mobile User Account */}
                  <div className="border-t pt-3">
                    {user ? (
                      <div className="space-y-2">
                        <div className="flex items-center w-full text-left p-3 bg-gray-50 rounded-lg">
                          <User className="h-5 w-5 mr-3 text-gray-600" />
                          <div>
                            <div className="text-xs text-gray-500">Account</div>
                            <div className="text-sm font-medium text-gray-800">{user.name}</div>
                          </div>
                        </div>
                        <button 
                          onClick={() => {
                            logout()
                            setIsMenuOpen(false)
                          }}
                          className="flex items-center w-full text-left p-3 hover:bg-red-50 rounded-lg transition-colors text-red-600"
                        >
                          <LogOut className="h-5 w-5 mr-3" />
                          <div>
                            <div className="text-xs text-red-500">Sign Out</div>
                            <div className="text-sm font-medium">Logout</div>
                          </div>
                        </button>
                      </div>
                    ) : (
                      <Link href="/auth" onClick={() => setIsMenuOpen(false)}>
                        <button className="flex items-center w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors">
                          <User className="h-5 w-5 mr-3 text-gray-600" />
                          <div>
                            <div className="text-xs text-gray-500">Account</div>
                            <div className="text-sm font-medium text-gray-800">Sign In / Sign Up</div>
                          </div>
                        </button>
                      </Link>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Modals */}
        <LocationModal 
          isOpen={isLocationModalOpen} 
          onClose={() => setIsLocationModalOpen(false)} 
        />
        <CartSidebar 
          isOpen={isCartOpen} 
          onClose={() => setIsCartOpen(false)} 
        />
      </nav>
    </>
  )
}