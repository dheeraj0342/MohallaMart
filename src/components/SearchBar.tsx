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
}

const mockSearchData: SearchResult[] = [
  { id: '1', title: '10-Minute Delivery', category: 'Feature', description: 'Ultra-fast delivery model' },
  { id: '2', title: 'Hyperlocal Network', category: 'Feature', description: 'Dense network of dark stores' },
  { id: '3', title: 'Quality Assurance', category: 'Feature', description: 'Rigorous quality control' },
  { id: '4', title: 'Blinkit', category: 'Platform', description: 'Quick commerce platform comparison' },
  { id: '5', title: 'Swiggy Instamart', category: 'Platform', description: 'Food delivery and quick commerce' },
  { id: '6', title: 'Dark Stores', category: 'Concept', description: 'Micro-warehouses for quick delivery' },
  { id: '7', title: 'Last Mile Delivery', category: 'Concept', description: 'Final step of delivery process' },
  { id: '8', title: 'Mobile App', category: 'Feature', description: 'Mobile-first shopping experience' },
]

const trendingSearches = ['Grocery delivery', 'Fast delivery', 'Local products', 'Neighborhood shopping']

export default function SearchBar() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const searchRef = useRef<HTMLDivElement>(null)
  const { searchQuery, setSearchQuery } = useStore()

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
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearch = (searchTerm: string) => {
    setQuery(searchTerm)
    setSearchQuery(searchTerm)
    setIsOpen(true)
  }

  const clearSearch = () => {
    setQuery('')
    setSearchQuery('')
    setResults([])
  }

  return (
    <div ref={searchRef} className="relative w-full max-w-2xl">
      {/* Search Input */}
      <div className="relative">
        <div             className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-neutral-400" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder="Search features, services, products..."
          className="w-full pl-10 pr-10 py-2.5 border-2 border-neutral-300 rounded-lg focus:outline-none focus:border-primary-brand transition-colors"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-neutral-600"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-2xl border border-neutral-200 max-h-96 overflow-y-auto z-50"
          >
            {query.trim() && results.length > 0 ? (
              <div className="py-2">
                <div className="px-4 py-2 text-xs font-semibold text-neutral-500 uppercase">
                  Search Results ({results.length})
                </div>
                {results.map((result) => (
                  <button
                    key={result.id}
                    className="w-full px-4 py-3 hover:bg-neutral-50 text-left transition-colors border-b border-neutral-100 last:border-b-0"
                    onClick={() => {
                      setQuery(result.title)
                      setSearchQuery(result.title)
                      setIsOpen(false)
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-neutral-900">{result.title}</div>
                        <div className="text-sm text-neutral-600 mt-1">{result.description}</div>
                      </div>
                      <span className="ml-2 px-2 py-1 text-xs font-medium bg-primary-100 text-primary-brand rounded">
                        {result.category}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            ) : query.trim() && results.length === 0 ? (
              <div className="px-4 py-8 text-center text-neutral-500">
                <Search className="h-12 w-12 mx-auto mb-2 text-neutral-300" />
                <p>No results found for "{query}"</p>
              </div>
            ) : (
              <div className="py-2">
                <div className="px-4 py-2 text-xs font-semibold text-neutral-500 uppercase flex items-center">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  Trending Searches
                </div>
                {trendingSearches.map((trend, index) => (
                  <button
                    key={index}
                    className="w-full px-4 py-3 hover:bg-neutral-50 text-left transition-colors border-b border-neutral-100 last:border-b-0"
                    onClick={() => {
                      setQuery(trend)
                      setSearchQuery(trend)
                    }}
                  >
                    <div className="flex items-center text-neutral-700">
                      <TrendingUp className="h-4 w-4 mr-3 text-primary-brand" />
                      {trend}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
