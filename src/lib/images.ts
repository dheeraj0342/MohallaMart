/**
 * Image Paths Utility
 * 
 * Centralized image path management for easy access across components.
 * All images should be placed in the public/images directory.
 * 
 * Usage:
 *   import { images } from '@/lib/images';
 *   <Image src={images.hero.slide1} alt="Hero" />
 */

const basePath = '/images';

export const images = {

  // Banner Carousel Images
  banners: {
    // Desktop
    desktopBanner: `${basePath}/banners/DesktopBanner.png`,
    desktopBanner2: `${basePath}/banners/DesktopBanner2.png`,
    desktopBanner3: `${basePath}/banners/herobanner.jpg`,

    // Tablet
    tabletBanner: `${basePath}/banners/TabletBanner.png`,
    tabletBanner2: `${basePath}/banners/TabletBanner2.png`,
    tabletBanner3: `${basePath}/banners/herobanner.jpg`,

    // Mobile
    mobileBanner: `${basePath}/banners/MobileBanner.png`,
    mobileBanner2: `${basePath}/banners/MobileBanner2.png`,
    mobileBanner3: `${basePath}/banners/herobanner.jpg`,
  },

  // Background Images
  bg: {
    mobileHeaderBg: `${basePath}/BG/mobileheaderbg.jpg`,
  },

  // Logo Images
  logos: {
    logo: `${basePath}/logos/logo.png`,
    logoDark: `${basePath}/logos/logo-dark.png`,
    logoLight: `${basePath}/logos/logo-light.png`,
    favicon: `${basePath}/logos/favicon.ico`,
  },

  // Icon Images
  icons: {
    // Add icon image paths as needed
  },
} as const;

/**
 * Helper function to get image path with fallback
 * @param path - Image path from images object
 * @param fallback - Fallback path if image doesn't exist
 * @returns Image path or fallback
 */
export function getImagePath(
  path: string,
  fallback?: string
): string {
  return path || fallback || `${basePath}/placeholder.jpg`;
}

/**
 * Helper function to get Next.js Image src
 * For external images, use the full URL
 * For local images, use the path from images object
 */
export function getImageSrc(path: string): string {
  // If it's already a full URL, return as is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  // Otherwise, it's a local path
  return path;
}

