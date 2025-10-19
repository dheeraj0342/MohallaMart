# Supabase Authentication Setup

This guide will help you set up Supabase authentication for the MohallaMart application.

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in to your account
3. Click "New Project"
4. Choose your organization and enter project details:
   - Name: `mohallamart-auth`
   - Database Password: (choose a strong password)
   - Region: (choose closest to your users)

## 2. Get Your Supabase Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (found under "Project URL")
   - **Anon public** key (found under "Project API keys")

## 3. Configure Environment Variables

1. Create a `.env.local` file in your project root
2. Add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

**Example:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://xyzcompany.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 4. Configure Authentication Settings

1. In your Supabase dashboard, go to **Authentication** → **Settings**
2. Configure the following:
   - **Site URL**: `http://localhost:3000` (for development)
   - **Additional Redirect URLs**: Add your production domain when deploying
   - **Enable email confirmations**: ✅ (recommended)

## 5. Email Templates (Optional)

Customize your email templates in **Authentication** → **Email Templates**:
- Confirm signup
- Reset password
- Magic link

## 6. Test the Setup

1. Start your development server: `npm run dev`
2. Navigate to `http://localhost:3000/auth`
3. Try creating a new account with a real email address
4. Check your email for the confirmation link

## Features Included

✅ **Login Form**
- Email and password authentication
- Form validation
- Error handling
- Loading states

✅ **Signup Form**
- User registration with:
  - Full name
  - Email address
  - Phone number (optional)
  - Password confirmation
- Form validation
- Email confirmation

✅ **Authentication State Management**
- Zustand store integration
- Session persistence
- Automatic logout
- User profile data

✅ **Navigation Integration**
- Login/logout in navbar
- Protected routes ready
- User profile display

## Security Features

- Password strength validation
- Email confirmation required
- Secure session management
- CSRF protection (built into Supabase)
- Row Level Security (RLS) ready

## Next Steps

1. **Customize User Profiles**: Add more fields to user metadata
2. **Implement Protected Routes**: Add authentication guards
3. **Add Social Auth**: Configure Google, GitHub, etc.
4. **Set up RLS Policies**: Configure database security rules
5. **Email Configuration**: Set up custom SMTP for production

## Troubleshooting

**Common Issues:**
- **"Invalid login credentials"**: Check email/password and ensure email is confirmed
- **"Email not confirmed"**: Check email templates and confirmation flow
- **Environment variables not loading**: Restart your development server
- **CORS issues**: Check redirect URLs in Supabase settings

For more help, check the [Supabase Documentation](https://supabase.com/docs).
