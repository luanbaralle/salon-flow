import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { authService, type UserProfile } from '@/services/auth.service';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

interface Tenant {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  website?: string;
  working_hours: Record<string, any>;
  cancellation_policy?: string;
  booking_rules: Record<string, any>;
}

interface AuthContextType {
  // Estado
  user: User | null;
  profile: UserProfile | null;
  tenant: Tenant | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // Métodos
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (data: {
    email: string;
    password: string;
    name: string;
    salonName: string;
    salonPhone: string;
    salonAddress: string;
  }) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  // Buscar perfil quando user mudar
  const { data: userProfile, refetch: refetchProfile, error: profileError } = useQuery({
    queryKey: ['auth', 'profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      try {
        return await authService.getCurrentUser();
      } catch (error: any) {
        console.error('Error fetching user profile:', error);
        // Se for erro 500, tentar novamente após um delay
        if (error.status === 500 || error.code === 'PGRST500') {
          await new Promise(resolve => setTimeout(resolve, 1000));
          return await authService.getCurrentUser();
        }
        throw error;
      }
    },
    enabled: !!user,
    retry: 2,
    retryDelay: 1000,
  });

  // Buscar tenant quando profile mudar
  const { data: tenantData } = useQuery({
    queryKey: ['auth', 'tenant', userProfile?.tenant_id],
    queryFn: async () => {
      if (!userProfile?.tenant_id) return null;
      return await authService.getCurrentTenant(userProfile.tenant_id);
    },
    enabled: !!userProfile?.tenant_id,
    retry: false,
  });

  // Atualizar estados quando dados mudarem
  useEffect(() => {
    if (userProfile) {
      setProfile(userProfile);
    } else {
      setProfile(null);
    }
  }, [userProfile]);

  useEffect(() => {
    if (tenantData) {
      setTenant(tenantData);
    } else {
      setTenant(null);
    }
  }, [tenantData]);

  // Escutar mudanças de autenticação
  useEffect(() => {
    // Verificar sessão existente
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    // Escutar mudanças
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      
      if (event === 'SIGNED_OUT') {
        setProfile(null);
        setTenant(null);
        queryClient.clear();
      } else if (session?.user) {
        // Refetch profile quando fizer login
        refetchProfile();
      }
      
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [refetchProfile, queryClient]);

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      await authService.signIn({ email, password });
      // O onAuthStateChange vai atualizar o user automaticamente
    } catch (error: any) {
      setIsLoading(false);
      throw error;
    }
  };

  const signUp = async (data: {
    email: string;
    password: string;
    name: string;
    salonName: string;
    salonPhone: string;
    salonAddress: string;
  }) => {
    setIsLoading(true);
    try {
      await authService.signUp(data);
      // O onAuthStateChange vai atualizar o user automaticamente
    } catch (error: any) {
      setIsLoading(false);
      throw error;
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      await authService.signOut();
      setUser(null);
      setProfile(null);
      setTenant(null);
      queryClient.clear();
    } catch (error: any) {
      setIsLoading(false);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshProfile = async () => {
    await refetchProfile();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        tenant,
        isLoading,
        isAuthenticated: !!user && !!profile,
        signIn,
        signUp,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}


