import { MetadataRoute } from 'next'
 
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://mohalla.vercel.app',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: 'https://mohalla.vercel.app/shopkeeper/apply',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: 'https://mohalla.vercel.app/auth',
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
  ]
}
