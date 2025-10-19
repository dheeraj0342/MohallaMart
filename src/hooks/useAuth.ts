'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useStore } from '@/store/useStore'
import { User } from '@supabase/supabase-js'

export const useAuth = () => {
  const router = useRouter()
  const { supabaseUser, setSupabaseUser, setUser, signOut } = useStore()

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        setSupabaseUser(session.user)
        
        // Update user profile if we have user metadata
        const { user_metadata, email } = session.user
        if (email) {
          setUser({
            id: session.user.id,
            name: user_metadata?.full_name || user_metadata?.name || email.split('@')[0],
            email: email,
            phone: user_metadata?.phone,
            avatar_url: user_metadata?.avatar_url
          })
        }
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setSupabaseUser(session.user)
          
          const { user_metadata, email } = session.user
          if (email) {
            setUser({
              id: session.user.id,
              name: user_metadata?.full_name || user_metadata?.name || email.split('@')[0],
              email: email,
              phone: user_metadata?.phone,
              avatar_url: user_metadata?.avatar_url
            })
          }
        } else {
          setSupabaseUser(null)
          setUser(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [setSupabaseUser, setUser])

  const logout = async () => {
    await supabase.auth.signOut()
    signOut()
    router.push('/')
  }

  return {
    user: supabaseUser,
    logout
  }
}
