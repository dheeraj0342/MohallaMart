import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/'

  if (code) {
    try {
      // Exchange the code for a session
      await supabase.auth.exchangeCodeForSession(code)
      
      // Redirect to the home page or specified next page
      return NextResponse.redirect(new URL(next, requestUrl.origin))
    } catch (error) {
      console.error('Error exchanging code for session:', error)
      // Redirect to auth page with error
      return NextResponse.redirect(
        new URL('/auth?error=Unable to verify email', requestUrl.origin)
      )
    }
  }

  // No code present, redirect to auth page
  return NextResponse.redirect(new URL('/auth', requestUrl.origin))
}
