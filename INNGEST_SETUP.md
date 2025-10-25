# Inngest Setup Guide

This guide will help you set up Inngest for the MohallaMart application to fix the 500 and 401 errors.

## Prerequisites

1. An Inngest account at [https://app.inngest.com](https://app.inngest.com)
2. A deployed or local development environment

## Step 1: Create Inngest Account and App

1. Go to [https://app.inngest.com](https://app.inngest.com)
2. Sign up for a free account
3. Create a new app called "mohallamart" (or any name you prefer)
4. Note down your app ID

## Step 2: Get Your Keys

In your Inngest dashboard:

1. Go to **Settings** → **Keys**
2. Copy the following values:
   - **Event Key** (starts with `key_`)
   - **Signing Key** (starts with `signkey_`)

## Step 3: Set Environment Variables

Create a `.env.local` file in your project root (if it doesn't exist) and add:

```bash
# Inngest Configuration
INNGEST_EVENT_KEY=your_event_key_here
INNGEST_SIGNING_KEY=your_signing_key_here
INNGEST_ENV=development

# For production, use:
# INNGEST_ENV=production
```

## Step 4: Verify Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Check the console for validation messages:
   - ✅ `Inngest configuration valid` - Everything is set up correctly
   - ❌ `Inngest configuration invalid` - Missing required variables

## Step 5: Test Functions

1. Go to your Inngest dashboard
2. Navigate to **Functions** tab
3. You should see all your functions listed:
   - `send-welcome-email`
   - `send-order-confirmation`
   - `monitor-data-sync`
   - `scheduled-cleanup`
   - And more...

## Troubleshooting

### 500 Errors
- **Cause**: Missing environment variables or function errors
- **Solution**: Ensure all required environment variables are set
- **Check**: Look for validation warnings in console

### 401 Errors
- **Cause**: Invalid or missing signing key
- **Solution**: Verify `INNGEST_SIGNING_KEY` is correct
- **Check**: Ensure the signing key starts with `signkey_`

### Function Not Appearing
- **Cause**: Functions not properly exported or registered
- **Solution**: Check that functions are included in the serve handler
- **Check**: Verify function IDs are unique

## Environment Variables Reference

### Required Variables
```bash
INNGEST_EVENT_KEY=key_...          # Your Inngest event key
INNGEST_SIGNING_KEY=signkey_...     # Your Inngest signing key
```

### Optional Variables
```bash
INNGEST_ENV=development             # Environment (development/production)
INNGEST_DEPLOYMENT_PROTECTION_KEY=... # For Vercel deployment protection
```

## Production Deployment

For production deployment:

1. Set `INNGEST_ENV=production`
2. Ensure all environment variables are set in your deployment platform
3. Verify functions are registered in the Inngest dashboard
4. Monitor function execution in the Inngest dashboard

## Monitoring

- **Dashboard**: [https://app.inngest.com](https://app.inngest.com)
- **Function Logs**: Available in the Inngest dashboard
- **Error Tracking**: Built-in error reporting and retry logic

## Support

- **Documentation**: [https://www.inngest.com/docs](https://www.inngest.com/docs)
- **Community**: [https://discord.gg/inngest](https://discord.gg/inngest)
- **GitHub**: [https://github.com/inngest/inngest](https://github.com/inngest/inngest)