'use client'

import { useState } from 'react'
import { X, MapPin, Loader2, Navigation } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { motion, AnimatePresence } from 'framer-motion'

interface LocationModalProps {
  isOpen: boolean
  onClose: () => void
}

const popularCities = [
  { name: 'Mumbai', areas: ['Andheri', 'Bandra', 'Powai', 'Worli', 'Juhu'] },
  { name: 'Delhi', areas: ['Connaught Place', 'Karol Bagh', 'Dwarka', 'Rohini', 'Saket'] },
  { name: 'Bangalore', areas: ['Koramangala', 'Indiranagar', 'Whitefield', 'HSR Layout', 'Marathahalli'] },
  { name: 'Hyderabad', areas: ['Hitech City', 'Gachibowli', 'Banjara Hills', 'Jubilee Hills', 'Madhapur'] },
  { name: 'Pune', areas: ['Koregaon Park', 'Hinjewadi', 'Viman Nagar', 'Kothrud', 'Wakad'] },
  { name: 'Chennai', areas: ['T Nagar', 'Velachery', 'Adyar', 'Anna Nagar', 'Tambaram'] },
]

export default function LocationModal({ isOpen, onClose }: LocationModalProps) {
  const [selectedCity, setSelectedCity] = useState('')
  const [selectedArea, setSelectedArea] = useState('')
  const [isDetecting, setIsDetecting] = useState(false)
  const setLocation = useStore((state) => state.setLocation)

  const detectLocation = () => {
    setIsDetecting(true)
    
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          
          // Mock reverse geocoding (in real app, use Google Maps API)
          const mockCity = popularCities[Math.floor(Math.random() * popularCities.length)]
          const mockArea = mockCity.areas[0]
          
          setLocation({
            city: mockCity.name,
            area: mockArea,
            coordinates: { lat: latitude, lng: longitude }
          })
          
          setIsDetecting(false)
          onClose()
        },
        (error) => {
          console.error('Error detecting location:', error)
          alert('Unable to detect location. Please select manually.')
          setIsDetecting(false)
        }
      )
    } else {
      alert('Geolocation is not supported by your browser')
      setIsDetecting(false)
    }
  }

  const handleConfirm = () => {
    if (selectedCity && selectedArea) {
      setLocation({
        city: selectedCity,
        area: selectedArea,
      })
      onClose()
    }
  }

  const cityData = popularCities.find((city) => city.name === selectedCity)

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black bg-opacity-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Select Location</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Auto-detect Location */}
              <button
                onClick={detectLocation}
                disabled={isDetecting}
                className="w-full bg-primary-50 border-2 border-primary-200 text-primary-brand px-4 py-3 rounded-lg font-semibold hover:bg-primary-100 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isDetecting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Detecting...
                  </>
                ) : (
                  <>
                    <Navigation className="h-5 w-5" />
                    Use Current Location
                  </>
                )}
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or select manually</span>
                </div>
              </div>

              {/* City Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select City
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {popularCities.map((city) => (
                    <button
                      key={city.name}
                      onClick={() => {
                        setSelectedCity(city.name)
                        setSelectedArea('')
                      }}
                      className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                        selectedCity === city.name
                          ? 'border-primary-brand bg-primary-50 text-primary-brand font-semibold'
                          : 'border-neutral-200 text-neutral-700 hover:border-neutral-300'
                      }`}
                    >
                      {city.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Area Selection */}
              {selectedCity && cityData && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Area in {selectedCity}
                  </label>
                  <div className="space-y-2">
                    {cityData.areas.map((area) => (
                      <button
                        key={area}
                        onClick={() => setSelectedArea(area)}
                        className={`w-full px-4 py-3 rounded-lg border-2 transition-colors text-left ${
                          selectedArea === area
                            ? 'border-primary-brand bg-primary-50 text-primary-brand font-semibold'
                            : 'border-neutral-200 text-neutral-700 hover:border-neutral-300'
                        }`}
                      >
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2" />
                          {area}
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-white border-t px-6 py-4">
              <button
                onClick={handleConfirm}
                disabled={!selectedCity || !selectedArea}
                className="w-full bg-primary-brand text-white px-4 py-3 rounded-lg font-semibold hover:bg-primary-brand-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm Location
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
