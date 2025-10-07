'use client'

import { motion } from 'framer-motion'
import { ShoppingBag, Heart, TrendingUp, CheckCircle } from 'lucide-react'

const approachItems = [
  {
    icon: ShoppingBag,
    iconBg: 'bg-primary-100',
    iconColor: 'text-primary-brand',
    title: 'Understanding',
    description: 'We analyze customer needs and preferences to provide personalized shopping experiences and relevant product recommendations.',
    features: [
      'AI-powered recommendations',
      'Purchase history analysis',
      'Smart search suggestions'
    ]
  },
  {
    icon: Heart,
    iconBg: 'bg-secondary-100',
    iconColor: 'text-secondary-500',
    title: 'Experience',
    description: 'Creating delightful shopping experiences through quality products, special offers, and exceptional customer service.',
    features: [
      'Premium product collections',
      'Special offers & deals',
      'Curated bundles'
    ]
  },
  {
    icon: TrendingUp,
    iconBg: 'bg-accent-100',
    iconColor: 'text-accent-brand',
    title: 'Innovation',
    description: 'Continuously innovating our platform with new features, technology, and services to enhance your shopping journey.',
    features: [
      'Trending products',
      'Recipe suggestions',
      'Seasonal collections'
    ]
  }
]

export default function CustomerApproachSection() {
  return (
    <section className="py-20 bg-gradient-to-r from-neutral-50 to-neutral-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
            Our Customer-First Approach
          </h2>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
            How we deliver exceptional service through our proven methodology
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {approachItems.map((item, index) => {
            const IconComponent = item.icon
            return (
              <motion.div 
                key={item.title}
                className="bg-white p-8 rounded-xl shadow-lg"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                <div className="text-center mb-6">
                  <div className={`${item.iconBg} w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <IconComponent className={`h-10 w-10 ${item.iconColor}`} />
                  </div>
                  <h3 className="text-2xl font-bold text-neutral-900 mb-2">{item.title}</h3>
                </div>
                <p className="text-neutral-600 text-center mb-6">
                  {item.description}
                </p>
                <ul className="space-y-2 text-sm text-neutral-600">
                  {item.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <CheckCircle className={`h-4 w-4 ${item.iconColor} mr-2`} />
                      {feature}
                    </li>
                  ))}
                </ul>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
