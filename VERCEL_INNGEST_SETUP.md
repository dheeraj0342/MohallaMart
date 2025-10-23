# Vercel + Inngest Deployment Setup

## Overview

This guide explains how to configure Inngest with Vercel deployment protection to ensure reliable background job processing in production.

## 🔐 Deployment Protection Configuration

### **Step 1: Generate Deployment Protection Key**

Use the generated key: `2406b41fcd2fb6f7381d3a04f5245b861d9d10ea9fed29164ca50ad3d97fd3bb`

### **Step 2: Configure Inngest Dashboard**

In your Inngest dashboard:

1. **Project Status**: ✅ Enabled
2. **Path Information**: `/api/inngest`
3. **Deployment Protection Key**: `2406b41fcd2fb6f7381d3a04f5245b861d9d10ea9fed29164ca50ad3d97fd3bb`
4. **Custom Production Domain**: (Optional) Your custom domain

### **Step 3: Environment Variables**

Add these environment variables to your Vercel project:

#### **Required Environment Variables**
```env
# Inngest Configuration
INNGEST_EVENT_KEY=your_inngest_event_key
INNGEST_SIGNING_KEY=your_inngest_signing_key
INNGEST_ENV=production

# Deployment Protection
INNGEST_DEPLOYMENT_PROTECTION_KEY=2406b41fcd2fb6f7381d3a04f5245b861d9d10ea9fed29164ca50ad3d97fd3bb
```

#### **Other Service Variables**
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Convex
CONVEX_DEPLOYMENT=your_convex_deployment
NEXT_PUBLIC_CONVEX_URL=your_convex_url

# Redis
REDIS_URL=your_redis_url

# Typesense
TYPESENSE_API_KEY=your_typesense_api_key
TYPESENSE_HOST=your_typesense_host

# Other Services
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
NEXT_PUBLIC_ONESIGNAL_APP_ID=your_onesignal_app_id
ONESIGNAL_REST_API_KEY=your_onesignal_rest_api_key
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

## 🚀 Deployment Steps

### **1. Deploy to Vercel**

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy your project
vercel --prod
```

### **2. Configure Environment Variables in Vercel**

1. Go to your Vercel dashboard
2. Select your MohallaMart project
3. Go to Settings → Environment Variables
4. Add all the environment variables listed above

### **3. Update Inngest Dashboard**

1. Go to your Inngest dashboard
2. Update the webhook URL to your Vercel deployment URL:
   - Example: `https://mohallamart.vercel.app/api/inngest`
3. Set the deployment protection key
4. Test the connection

## 🔧 Configuration Details

### **Deployment Protection**

The deployment protection key ensures that:
- Only authorized requests can trigger Inngest functions
- Vercel's security measures don't block legitimate webhook calls
- Your background jobs run reliably in production

### **Path Configuration**

- **Development**: `http://localhost:3000/api/inngest`
- **Production**: `https://yourdomain.com/api/inngest`

### **Function Endpoints**

All 14 Inngest functions are available at the `/api/inngest` endpoint:

1. **Email Functions**:
   - `sendWelcomeEmail`
   - `sendOrderConfirmation`
   - `sendOrderUpdate`
   - `sendNotification`

2. **Data Sync Functions**:
   - `syncUserData`
   - `syncProductData`
   - `syncOrderData`
   - `syncInventoryUpdate`

3. **Search Functions**:
   - `indexProduct`

4. **Monitoring Functions**:
   - `cleanupExpiredSessions`
   - `scheduledCleanup`
   - `monitorDataSync`

5. **Analytics Functions**:
   - `trackAnalytics`
   - `processOutOfStockAlert`

## 🧪 Testing

### **Local Testing**
```bash
# Start development server
npm run dev

# Test Inngest endpoint
curl http://localhost:3000/api/inngest
```

### **Production Testing**
```bash
# Test production endpoint
curl https://yourdomain.com/api/inngest
```

### **Inngest Dashboard Testing**
1. Go to your Inngest dashboard
2. Navigate to Functions
3. Test individual functions
4. Monitor execution logs

## 📊 Monitoring

### **Vercel Monitoring**
- Check deployment logs in Vercel dashboard
- Monitor function execution times
- Set up alerts for failures

### **Inngest Monitoring**
- Monitor function success/failure rates
- Track execution performance
- Set up notifications for critical failures

## 🛠️ Troubleshooting

### **Common Issues**

1. **Deployment Protection Errors**
   - Verify the deployment protection key is correct
   - Check environment variables in Vercel
   - Ensure the key matches in both Vercel and Inngest

2. **Function Not Triggering**
   - Check webhook URL configuration
   - Verify environment variables
   - Check Vercel deployment logs

3. **Authentication Errors**
   - Verify INNGEST_SIGNING_KEY is set correctly
   - Check that the key matches in Inngest dashboard
   - Ensure the key is properly configured in Vercel

### **Debug Commands**

```bash
# Check environment variables
vercel env ls

# View deployment logs
vercel logs

# Test webhook endpoint
curl -X POST https://yourdomain.com/api/inngest \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

## 🔒 Security Best Practices

1. **Environment Variables**
   - Never commit sensitive keys to version control
   - Use Vercel's environment variable system
   - Rotate keys regularly

2. **Deployment Protection**
   - Use strong, unique deployment protection keys
   - Keep keys secure and private
   - Monitor for unauthorized access

3. **Webhook Security**
   - Verify webhook signatures
   - Use HTTPS in production
   - Implement rate limiting

## 📈 Performance Optimization

1. **Function Optimization**
   - Optimize function execution times
   - Implement proper error handling
   - Use step functions for long-running operations

2. **Caching**
   - Implement Redis caching for frequently accessed data
   - Cache function results when appropriate
   - Use proper cache invalidation strategies

3. **Monitoring**
   - Set up performance monitoring
   - Track function execution metrics
   - Implement alerting for performance issues

## 🎯 Next Steps

1. **Deploy to Vercel** with the configuration above
2. **Configure environment variables** in Vercel dashboard
3. **Update Inngest dashboard** with production URL
4. **Test all functions** to ensure they work correctly
5. **Set up monitoring** and alerting
6. **Monitor performance** and optimize as needed

Your MohallaMart application with Inngest integration is now ready for production deployment on Vercel! 🚀
