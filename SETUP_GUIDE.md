# MohallaMart Setup Guide

This guide will help you configure all the necessary services and dependencies for MohallaMart to work properly.

## Prerequisites

- Node.js 18+ and npm
- Git
- A code editor (VS Code recommended)

## Environment Variables Setup

Create a `.env.local` file in the root directory with the following variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Convex Configuration
CONVEX_DEPLOYMENT=your_convex_deployment
NEXT_PUBLIC_CONVEX_URL=your_convex_url

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
REDIS_URL=redis://localhost:6379

# Typesense Configuration
TYPESENSE_API_KEY=your_typesense_api_key
TYPESENSE_HOST=localhost
TYPESENSE_PORT=8108

# Razorpay Configuration
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Google Maps Configuration
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# OneSignal Configuration
NEXT_PUBLIC_ONESIGNAL_APP_ID=your_onesignal_app_id
ONESIGNAL_REST_API_KEY=your_onesignal_rest_api_key

# Twilio Configuration
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Inngest Configuration
INNGEST_EVENT_KEY=your_inngest_event_key
INNGEST_SIGNING_KEY=your_inngest_signing_key
INNGEST_ENV=development
INNGEST_DEPLOYMENT_PROTECTION_KEY=2406b41fcd2fb6f7381d3a04f5245b861d9d10ea9fed29164ca50ad3d97fd3bb

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

## Service Setup Instructions

### 1. Supabase Setup

1. Go to [Supabase](https://supabase.com) and create a new project
2. Get your project URL and anon key from Settings > API
3. Set up authentication providers in Authentication > Providers
4. Create the following tables in the SQL editor:

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);
```

### 2. Convex Setup

1. Install Convex CLI: `npm install -g convex`
2. Initialize Convex: `npx convex dev`
3. Follow the setup instructions to get your deployment URL
4. The schema and functions are already configured in the `convex/` directory

### 3. Redis Setup

#### Option A: Local Redis

```bash
# Install Redis (Ubuntu/Debian)
sudo apt update
sudo apt install redis-server

# Start Redis
sudo systemctl start redis-server
sudo systemctl enable redis-server
```

#### Option B: Redis Cloud

1. Go to [Redis Cloud](https://redis.com/redis-enterprise-cloud/)
2. Create a free account and database
3. Get your connection details

### 4. Typesense Setup

#### Option A: Local Typesense

```bash
# Install Typesense
curl -O https://dl.typesense.org/releases/0.25.1/typesense-0.25.1-amd64.deb
sudo dpkg -i typesense-0.25.1-amd64.deb

# Start Typesense
sudo systemctl start typesense-server
sudo systemctl enable typesense-server
```

#### Option B: Typesense Cloud

1. Go to [Typesense Cloud](https://cloud.typesense.org/)
2. Create a free cluster
3. Get your API key and host

### 5. Razorpay Setup

1. Go to [Razorpay](https://razorpay.com/) and create an account
2. Get your API keys from Dashboard > Settings > API Keys
3. Enable test mode for development

### 6. Google Maps Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable Maps JavaScript API and Places API
3. Create an API key and restrict it to your domain

### 7. OneSignal Setup

1. Go to [OneSignal](https://onesignal.com/) and create an account
2. Create a new app and get your App ID and REST API Key

### 8. Twilio Setup

1. Go to [Twilio](https://www.twilio.com/) and create an account
2. Get your Account SID and Auth Token from the console

### 9. Cloudinary Setup

1. Go to [Cloudinary](https://cloudinary.com/) and create an account
2. Get your Cloud Name, API Key, and API Secret from the dashboard

### 10. Inngest Setup

1. Go to [Inngest](https://inngest.com/) and create an account
2. Create a new app and get your Event Key and Signing Key
3. Set up your webhook endpoint

## Installation and Running

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. In another terminal, start Convex:

```bash
npx convex dev
```

4. In another terminal, start Inngest:

```bash
npx inngest-cli dev
```

## Verification

1. Open http://localhost:3000 in your browser
2. Check the browser console for any errors
3. Verify that all services are connected by checking the network tab
4. Test authentication by trying to sign up/login
5. Test search functionality
6. Test cart functionality

## Troubleshooting

### Common Issues

1. **Environment variables not loading**: Make sure your `.env.local` file is in the root directory
2. **Convex connection issues**: Check that your Convex deployment is running and the URL is correct
3. **Supabase auth issues**: Verify your Supabase URL and anon key are correct
4. **Redis connection issues**: Make sure Redis is running and accessible
5. **Typesense connection issues**: Verify your Typesense host and API key

### Debug Mode

Enable debug mode by setting `NODE_ENV=development` in your environment variables.

## Production Deployment

1. Set up production versions of all services
2. Update environment variables with production values
3. Configure proper CORS settings
4. Set up monitoring and logging
5. Configure SSL certificates
6. Set up backup strategies

## Support

If you encounter any issues, check the logs in the browser console and server logs. Most issues are related to missing environment variables or service configuration.
