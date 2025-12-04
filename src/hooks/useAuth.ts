import { useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { authService, type SignUpData, type LoginData, type UserProfile } from '@/services/auth.service'
import type { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const queryClient = useQueryClient()

  // Buscar usuário atual
  useEffect(() => {
    // Verificar sessão existente
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        
        if (session?.user) {
          // Buscar perfil quando usuário fizer login
          try {
            const profile = await authService.getCurrentUser()
            setProfile(profile)
          } catch (error) {
            console.error('Error fetching user profile:', error)
          }
        } else {
          setProfile(null)
          queryClient.clear()
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Buscar perfil quando user mudar
  useEffect(() => {
    if (user) {
      authService.getCurrentUser().then(setProfile).catch(console.error)
    } else {
      setProfile(null)
    }
  }, [user])

  const signUpMutation = useMutation({
    mutationFn: (data: SignUpData) => authService.signUp(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth'] })
    },
  })

  const signInMutation = useMutation({
    mutationFn: (data: LoginData) => authService.signIn(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth'] })
    },
  })

  const signOutMutation = useMutation({
    mutationFn: () => authService.signOut(),
    onSuccess: () => {
      setUser(null)
      setProfile(null)
      queryClient.clear()
    },
  })

  return {
    user,
    profile,
    loading,
    isAuthenticated: !!user && !!profile,
    signUp: signUpMutation.mutate,
    signIn: signInMutation.mutate,
    signOut: signOutMutation.mutate,
    isSigningUp: signUpMutation.isPending,
    isSigningIn: signInMutation.isPending,
    isSigningOut: signOutMutation.isPending,
  }
}





