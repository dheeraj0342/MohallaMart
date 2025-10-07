'use client'

import { useState } from 'react'
import { Menu, X, ShoppingCart, User, MapPin, Search as SearchIcon } from 'lucide-react'
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

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link href="/">
                <h1 className="text-2xl font-bold text-primary-brand cursor-pointer hover:text-primary-brand-hover transition-colors">
                  Mohalla<span className="text-secondary-500">Mart</span>
                </h1>
              </Link>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <Link
                href="#home"
                className="text-neutral-700 hover:text-primary-brand px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Home
              </Link>
              <Link
                href="#features"
                className="text-neutral-700 hover:text-primary-brand px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Features
              </Link>
              <Link
                href="#about"
                className="text-neutral-700 hover:text-primary-brand px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                About
              </Link>
              <Link
                href="#contact"
                className="text-neutral-700 hover:text-primary-brand px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Contact
              </Link>
            </div>
          </div>

          {/* Desktop Action Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <button 
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="flex items-center text-neutral-700 hover:text-primary-brand px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              <SearchIcon className="h-4 w-4 mr-1" />
              Search
            </button>
            <button 
              onClick={() => setIsLocationModalOpen(true)}
              className="flex items-center text-neutral-700 hover:text-primary-brand px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              <MapPin className="h-4 w-4 mr-1" />
              {location ? (
                <span className="truncate max-w-[100px]">{location.area}</span>
              ) : (
                'Location'
              )}
            </button>
            <button className="flex items-center text-neutral-700 hover:text-primary-brand px-3 py-2 rounded-md text-sm font-medium transition-colors">
              <User className="h-4 w-4 mr-1" />
              {user ? user.name : 'Login'}
            </button>
            <button 
              onClick={() => setIsCartOpen(true)}
              className="bg-primary-brand text-white px-4 py-2 rounded-lg hover:bg-primary-brand-hover transition-colors flex items-center relative"
            >
              <ShoppingCart className="h-4 w-4 mr-1" />
              Cart
              {getTotalItems() > 0 && (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center"
                >
                  {getTotalItems()}
                </motion.span>
              )}
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-secondary-700 hover:text-primary-600 focus:outline-none focus:text-primary-600"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
              <Link
                href="#home"
                className="text-neutral-700 hover:text-primary-brand block px-3 py-2 rounded-md text-base font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="#features"
                className="text-neutral-700 hover:text-primary-brand block px-3 py-2 rounded-md text-base font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Features
              </Link>
              <Link
                href="#about"
                className="text-neutral-700 hover:text-primary-brand block px-3 py-2 rounded-md text-base font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              <Link
                href="#contact"
                className="text-neutral-700 hover:text-primary-brand block px-3 py-2 rounded-md text-base font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
              <div className="border-t pt-3 mt-3">
                <button 
                  onClick={() => {
                    setIsSearchOpen(true)
                    setIsMenuOpen(false)
                  }}
                  className="flex items-center text-neutral-700 hover:text-primary-brand w-full px-3 py-2 rounded-md text-base font-medium transition-colors"
                >
                  <SearchIcon className="h-4 w-4 mr-2" />
                  Search
                </button>
                <button 
                  onClick={() => {
                    setIsLocationModalOpen(true)
                    setIsMenuOpen(false)
                  }}
                  className="flex items-center text-neutral-700 hover:text-primary-brand w-full px-3 py-2 rounded-md text-base font-medium transition-colors"
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  {location ? location.area : 'Location'}
                </button>
                <button className="flex items-center text-neutral-700 hover:text-primary-brand w-full px-3 py-2 rounded-md text-base font-medium transition-colors">
                  <User className="h-4 w-4 mr-2" />
                  {user ? user.name : 'Login'}
                </button>
                <button 
                  onClick={() => {
                    setIsCartOpen(true)
                    setIsMenuOpen(false)
                  }}
                  className="bg-primary-brand text-white px-3 py-2 rounded-lg hover:bg-primary-brand-hover transition-colors flex items-center justify-between w-full mt-2"
                >
                  <span className="flex items-center">
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Cart
                  </span>
                  {getTotalItems() > 0 && (
                    <span className="bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {getTotalItems()}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Search Bar - Full Width Below Navbar */}
      {isSearchOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="border-t border-gray-200 bg-white py-4"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SearchBar />
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
  )
}
