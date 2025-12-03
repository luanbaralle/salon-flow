import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

export interface SignUpData {
  email: string
  password: string
  name: string
  salonName: string
  salonPhone: string
  salonAddress: string
}

export interface LoginData {
  email: string
  password: string
}

export interface UserProfile {
  id: string
  tenant_id: string
  name: string
  email: string
  role: 'admin' | 'professional' | 'client'
  avatar?: string
  phone?: string
}

export const authService = {
  /**
   * Registro de novo salão e admin
   */
  async signUp(data: SignUpData) {
    // 1. Criar usuário no Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    })

    if (authError) throw authError
    if (!authData.user) throw new Error('Failed to create user')

    // 2. Usar função RPC que bypassa RLS
    // Passamos o user_id explicitamente
    try {
      const { data: tenantId, error: functionError } = await supabase.rpc(
        'create_tenant_and_user',
        {
          p_user_id: authData.user.id,
          p_salon_name: data.salonName,
          p_salon_phone: data.salonPhone,
          p_salon_address: data.salonAddress,
          p_user_name: data.name,
          p_user_email: data.email,
        }
      )

      if (functionError) {
        console.error('RPC Error:', functionError)
        
        // Se o erro for "User already has a tenant", verificar se pode fazer login
        if (functionError.message?.includes('already has a tenant') || functionError.code === 'P0001') {
          throw new Error('Este email já está cadastrado. Faça login ao invés de criar nova conta.')
        }
        
        // Erro 400 geralmente significa função não encontrada ou parâmetros errados
        if (functionError.code === '42883' || functionError.message?.includes('function') || functionError.message?.includes('does not exist')) {
          throw new Error('Função não encontrada no servidor. Execute o script SQL fix_all_issues.sql no Supabase.')
        }
        
        throw new Error(functionError.message || 'Erro ao criar conta. Tente novamente.')
      }

      if (!tenantId) {
        throw new Error('Falha ao criar tenant e usuário')
      }

      // 3. Aguardar um pouco para garantir que o RLS está atualizado
      await new Promise(resolve => setTimeout(resolve, 500))

      // 4. Buscar tenant criado usando a função RPC ou diretamente
      // Tentar buscar diretamente primeiro
      let tenant
      let tenantError
      
      // Tentar buscar tenant
      const tenantResponse = await supabase
        .from('tenants')
        .select('*')
        .eq('id', tenantId)
        .single()

      tenant = tenantResponse.data
      tenantError = tenantResponse.error

      // Se der erro, tentar buscar user primeiro para estabelecer contexto
      if (tenantError) {
        const userResponse = await supabase
          .from('users')
          .select('*')
          .eq('id', authData.user.id)
          .single()

        if (userResponse.data) {
          // Tentar buscar tenant novamente
          const retryTenant = await supabase
            .from('tenants')
            .select('*')
            .eq('id', tenantId)
            .single()
          
          tenant = retryTenant.data
          tenantError = retryTenant.error
        }
      }

      if (tenantError || !tenant) {
        console.error('Tenant Error:', tenantError)
        // Mesmo com erro, retornar o tenant_id para que o sistema possa continuar
        // O AuthContext vai tentar buscar novamente depois
        return { 
          user: authData.user, 
          tenant: { id: tenantId } as any // Retornar pelo menos o ID
        }
      }

      return { user: authData.user, tenant }
    } catch (error: any) {
      // Se for erro de rate limiting (429), aguardar um pouco
      if (error.status === 429 || error.message?.includes('429')) {
        throw new Error('Muitas tentativas. Aguarde alguns segundos e tente novamente.')
      }
      throw error
    }
  },

  /**
   * Login
   */
  async signIn(data: LoginData) {
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    if (error) throw error
    return authData
  },

  /**
   * Logout
   */
  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  /**
   * Buscar perfil do usuário atual
   */
  async getCurrentUser(): Promise<UserProfile | null> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data: profile, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) throw error
    return profile
  },

  /**
   * Buscar tenant do usuário atual
   */
  async getCurrentTenant(tenantId: string) {
    const { data, error } = await supabase
      .from('tenants')
      .select('*')
      .eq('id', tenantId)
      .single()

    if (error) throw error
    return data
  },

  /**
   * Recuperar senha
   */
  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) throw error
  },

  /**
   * Atualizar senha
   */
  async updatePassword(newPassword: string) {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (error) throw error
  },

  /**
   * Escutar mudanças de autenticação
   */
  onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(session?.user ?? null)
    })
  },
}


