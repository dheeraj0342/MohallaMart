/**
 * Environment validation utilities for Inngest
 */

export interface ValidationResult {
  isValid: boolean;
  missingVars: string[];
  warnings: string[];
}

/**
 * Validates Inngest environment variables
 */
export const validateInngestEnv = (): ValidationResult => {
  const requiredVars = {
    INNGEST_EVENT_KEY: process.env.INNGEST_EVENT_KEY,
    INNGEST_SIGNING_KEY: process.env.INNGEST_SIGNING_KEY,
  };

  const optionalVars = {
    INNGEST_ENV: process.env.INNGEST_ENV,
    INNGEST_DEPLOYMENT_PROTECTION_KEY: process.env.INNGEST_DEPLOYMENT_PROTECTION_KEY,
  };

  const missingVars = Object.entries(requiredVars)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  const warnings: string[] = [];

  // Check for missing optional variables
  Object.entries(optionalVars).forEach(([key, value]) => {
    if (!value) {
      warnings.push(`${key} is not set (optional but recommended)`);
    }
  });

  // Check for development environment
  if (process.env.NODE_ENV === 'development' && !process.env.INNGEST_ENV) {
    warnings.push('INNGEST_ENV not set, defaulting to development mode');
  }

  return {
    isValid: missingVars.length === 0,
    missingVars,
    warnings,
  };
};

/**
 * Logs validation results
 */
export const logValidationResults = (result: ValidationResult): void => {
  if (!result.isValid) {
    console.error('❌ Inngest configuration invalid:');
    console.error(`Missing required variables: ${result.missingVars.join(', ')}`);
    console.error('Please set these environment variables to use Inngest functions');
  } else {
    console.log('✅ Inngest configuration valid');
  }

  if (result.warnings.length > 0) {
    console.warn('⚠️  Inngest configuration warnings:');
    result.warnings.forEach(warning => console.warn(`  - ${warning}`));
  }
};

/**
 * Validates all required environment variables for the application
 */
export const validateAppEnv = (): ValidationResult => {
  const requiredVars = {
    // Core services
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_CONVEX_URL: process.env.NEXT_PUBLIC_CONVEX_URL,
    CONVEX_DEPLOYMENT: process.env.CONVEX_DEPLOYMENT,
    
    // External services
    REDIS_URL: process.env.REDIS_URL,
    TYPESENSE_API_KEY: process.env.TYPESENSE_API_KEY,
    TYPESENSE_HOST: process.env.TYPESENSE_HOST,
    
    // Payment
    RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
    RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
    
    // Maps
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  };

  const missingVars = Object.entries(requiredVars)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  const warnings: string[] = [];

  // Check for optional but recommended variables
  const optionalVars = {
    ONESIGNAL_REST_API_KEY: process.env.ONESIGNAL_REST_API_KEY,
    TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  };

  Object.entries(optionalVars).forEach(([key, value]) => {
    if (!value) {
      warnings.push(`${key} is not set (optional but recommended for full functionality)`);
    }
  });

  return {
    isValid: missingVars.length === 0,
    missingVars,
    warnings,
  };
};
