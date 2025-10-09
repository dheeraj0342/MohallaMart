'use client'

import { useState } from 'react'
import { Menu, X, ShoppingCart, User, MapPin, Search as SearchIcon, Clock, Percent } from 'lucide-react'
import { useStore } from '@/store/useStore'
import LocationModal from './LocationModal'
import SearchBar from './SearchBar'
import CartSidebar from './CartSidebar'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  
  const { location, getTotalItems, user } = useStore()

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
      <div className="bg-gradient-to-r from-green-600 to-orange-500 text-white py-2 text-center text-sm">
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
          <div className="flex justify-between items-center h-18 py-3">
            {/* Logo & Location */}
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <Link href="/">
                  <div className="flex items-center cursor-pointer group">
                    <div className="text-3xl mr-2">🛒</div>
                    <div>
                      <h1 className="text-xl font-bold text-primary-brand group-hover:text-green-700 transition-colors">
                        Mohalla<span className="text-orange-500">Mart</span>
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

            {/* Search Bar - Desktop */}
            <div className="hidden md:flex flex-1 max-w-xl mx-8">
              <div className="relative w-full">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search for groceries, fruits, vegetables..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  onClick={() => setIsSearchOpen(true)}
                />
              </div>
            </div>

            {/* Action Buttons - Desktop */}
            <div className="hidden md:flex items-center space-x-4">
              {/* User Account */}
              <button className="flex items-center text-gray-700 hover:text-primary-brand px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                <User className="h-5 w-5 mr-2" />
                <div className="text-left">
                  <div className="text-xs text-gray-500">Account</div>
                  <div className="text-sm font-medium">
                    {user ? user.name : 'Sign In'}
                  </div>
                </div>
              </button>

              {/* Cart Button */}
              <button 
                onClick={() => setIsCartOpen(true)}
                className="bg-primary-brand text-white px-6 py-3 rounded-xl hover:bg-green-700 transition-colors flex items-center relative shadow-sm hover:shadow-md"
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
                    className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center shadow-lg"
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
                onClick={() => setIsSearchOpen(true)}
                className="text-gray-600 hover:text-primary-brand p-2"
              >
                <SearchIcon className="h-6 w-6" />
              </button>
              {/* Mobile Cart */}
              <button 
                onClick={() => setIsCartOpen(true)}
                className="relative text-gray-600 hover:text-primary-brand p-2"
              >
                <ShoppingCart className="h-6 w-6" />
                {getTotalItems() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {getTotalItems()}
                  </span>
                )}
              </button>
              {/* Mobile Menu */}
              <button
                onClick={toggleMenu}
                className="text-gray-600 hover:text-primary-brand p-2"
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
          {isMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="md:hidden border-t border-gray-100"
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
                  <button className="flex items-center w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <User className="h-5 w-5 mr-3 text-gray-600" />
                    <div>
                      <div className="text-xs text-gray-500">Account</div>
                      <div className="text-sm font-medium text-gray-800">
                        {user ? user.name : 'Sign In / Sign Up'}
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Search Bar Overlay */}
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg z-40"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex items-center space-x-3">
                <div className="flex-1">
                  <SearchBar />
                </div>
                <button
                  onClick={() => setIsSearchOpen(false)}
                  className="text-gray-500 hover:text-gray-700 p-2"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}

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