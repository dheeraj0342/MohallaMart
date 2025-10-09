'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, X, TrendingUp } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { motion, AnimatePresence } from 'framer-motion'

interface SearchResult {
  id: string
  title: string
  category: string
  description: string
  price?: string
  emoji?: string
}

const mockSearchData: SearchResult[] = [
  { id: '1', title: 'Fresh Bananas', category: 'Fruits', description: 'Organic ripe bananas (1kg)', price: '₹89', emoji: '🍌' },
  { id: '2', title: 'Organic Apples', category: 'Fruits', description: 'Red delicious apples (1kg)', price: '₹180', emoji: '🍎' },
  { id: '3', title: 'Fresh Milk', category: 'Dairy', description: 'Full cream milk (1L)', price: '₹65', emoji: '🥛' },
  { id: '4', title: 'Whole Wheat Bread', category: 'Bakery', description: 'Fresh baked bread loaf', price: '₹45', emoji: '🍞' },
  { id: '5', title: 'Tomatoes', category: 'Vegetables', description: 'Fresh red tomatoes (1kg)', price: '₹60', emoji: '🍅' },
  { id: '6', title: 'Basmati Rice', category: 'Grains', description: 'Premium basmati rice (5kg)', price: '₹650', emoji: '🌾' },
  { id: '7', title: 'Greek Yogurt', category: 'Dairy', description: 'Plain Greek yogurt (500g)', price: '₹120', emoji: '🥛' },
  { id: '8', title: 'Green Tea', category: 'Beverages', description: 'Organic green tea bags', price: '₹250', emoji: '🍵' },
  { id: '9', title: 'Chicken Breast', category: 'Meat', description: 'Fresh chicken breast (1kg)', price: '₹380', emoji: '🍗' },
  { id: '10', title: 'Mixed Vegetables', category: 'Vegetables', description: 'Fresh mixed vegetable pack', price: '₹150', emoji: '🥕' },
]

const trendingSearches = ['Organic fruits', 'Fresh vegetables', 'Daily essentials', 'Breakfast items', 'Snacks', 'Beverages']

const popularCategories = [
  { name: 'Fruits & Vegetables', icon: '🥕', searches: '2k+ searches' },
  { name: 'Dairy Products', icon: '🥛', searches: '1.5k+ searches' },
  { name: 'Snacks & Beverages', icon: '🍿', searches: '1.2k+ searches' },
  { name: 'Personal Care', icon: '🧴', searches: '900+ searches' },
]

export default function SearchBar() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { setSearchQuery, isSearchOpen, setSearchOpen } = useStore()

  useEffect(() => {
    if (query.trim()) {
      const filtered = mockSearchData.filter(
        (item) =>
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.description.toLowerCase().includes(query.toLowerCase()) ||
          item.category.toLowerCase().includes(query.toLowerCase())
      )
      setResults(filtered)
    } else {
      setResults([])
    }
  }, [query])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [setSearchOpen])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl+K to open search (Cmd+K on Mac)
      if ((event.ctrlKey || event.metaKey) && event.key === 'V') {
        event.preventDefault()
        setSearchOpen(true)
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.focus()
          }
        }, 100)
      }
      
      // Esc to close search
      if (event.key === 'Escape') {
        event.preventDefault()
        setSearchOpen(false)
        setQuery('')
        if (inputRef.current) {
          inputRef.current.blur()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [setSearchOpen])

  // Auto-focus when opened
  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isSearchOpen])

  const handleSearch = (searchTerm: string) => {
    setQuery(searchTerm)
    setSearchQuery(searchTerm)
    if (!isSearchOpen) setSearchOpen(true)
  }

  const clearSearch = () => {
    setQuery('')
    setSearchQuery('')
    setResults([])
  }

  const closeSearch = () => {
    setSearchOpen(false)
    setQuery('')
    setResults([])
  }

  return (
    <AnimatePresence>
      {isSearchOpen && (
        <motion.div 
          ref={searchRef} 
          className="relative w-full max-w-2xl"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          {/* Search Input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => setSearchOpen(true)}
              placeholder="Search for groceries, fruits, vegetables, dairy..."
              className="w-full pl-10 pr-20 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-sm shadow-lg"
            />
            
            {/* Keyboard shortcut indicator */}
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center space-x-2">
              {query && (
                <button
                  onClick={clearSearch}
                  className="text-gray-400 hover:text-gray-600 p-1"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              <button
                onClick={closeSearch}
                className="text-gray-400 hover:text-gray-600 p-1"
                aria-label="Close search"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Search Results Dropdown */}
          <AnimatePresence>
            {(query.trim() || isSearchOpen) && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-xl border border-gray-200 max-h-96 overflow-y-auto z-50"
              >
                {/* Keyboard shortcut info bar */}
                <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 flex items-center justify-between text-xs text-gray-500">
                  <span>🔍 Search for products and categories</span>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                      <kbd className="bg-white px-1.5 py-0.5 rounded border text-xs font-mono">Esc</kbd>
                      <span>to close</span>
                    </div>
                  </div>
                </div>
                {query.trim() && results.length > 0 ? (
                  <div className="py-2">
                    <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase border-b border-gray-100">
                      🛒 Products Found ({results.length})
                    </div>
                    {results.map((result) => (
                      <button
                        key={result.id}
                        className="w-full px-4 py-3 hover:bg-green-50 text-left transition-colors border-b border-gray-50 last:border-b-0 group"
                        onClick={() => {
                          setQuery(result.title)
                          setSearchQuery(result.title)
                          closeSearch()
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3 flex-1">
                            <div className="text-2xl">{result.emoji}</div>
                            <div className="flex-1">
                              <div className="font-medium text-gray-900 group-hover:text-green-700">{result.title}</div>
                              <div className="text-sm text-gray-600 mt-1">{result.description}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            {result.price && (
                              <div className="font-bold text-green-600 text-lg">{result.price}</div>
                            )}
                            <span className="inline-block mt-1 px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                              {result.category}
                            </span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : query.trim() && results.length === 0 ? (
                  <div className="px-4 py-8 text-center text-gray-500">
                    <Search className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-lg font-medium mb-1">No products found</p>
                    <p className="text-sm">Try searching for &quot;{query}&quot; with different keywords</p>
                    <div className="mt-4 text-xs text-gray-400">
                      💡 Tip: Try searching for categories like &quot;fruits&quot;, &quot;dairy&quot;, or &quot;snacks&quot;
                    </div>
                  </div>
                ) : (
                  <div className="py-2">
                    {/* Popular Categories */}
                    <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase border-b border-gray-100">
                      🔥 Popular Categories
                    </div>
                    {popularCategories.map((category, index) => (
                      <button
                        key={index}
                        className="w-full px-4 py-3 hover:bg-orange-50 text-left transition-colors border-b border-gray-50"
                        onClick={() => {
                          setQuery(category.name)
                          setSearchQuery(category.name)
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-gray-700">
                            <span className="text-2xl mr-3">{category.icon}</span>
                            <div>
                              <div className="font-medium">{category.name}</div>
                              <div className="text-xs text-gray-500">{category.searches}</div>
                            </div>
                          </div>
                          <div className="text-orange-500 text-sm">→</div>
                        </div>
                      </button>
                    ))}
                    
                    {/* Trending Searches */}
                    <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase flex items-center border-b border-gray-100 mt-2">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      Trending Searches
                    </div>
                    {trendingSearches.map((trend, index) => (
                      <button
                        key={index}
                        className="w-full px-4 py-3 hover:bg-gray-50 text-left transition-colors border-b border-gray-50 last:border-b-0"
                        onClick={() => {
                          setQuery(trend)
                          setSearchQuery(trend)
                        }}
                      >
                        <div className="flex items-center text-gray-700">
                          <TrendingUp className="h-4 w-4 mr-3 text-green-600" />
                          <span className="font-medium">{trend}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  )
}