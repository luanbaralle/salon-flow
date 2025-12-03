import { supabase } from '@/lib/supabase'

export interface Tenant {
  id: string
  name: string
  slug: string
  phone?: string
  email?: string
  address?: string
  city?: string
  state?: string
  zip_code?: string
  logo?: string
  working_hours: Record<string, any>
  cancellation_policy?: string
  booking_rules: Record<string, any>
  created_at: string
  updated_at: string
}

export interface UpdateTenantData {
  name?: string
  phone?: string
  email?: string
  address?: string
  city?: string
  state?: string
  zip_code?: string
  logo?: string
  working_hours?: Record<string, any>
  cancellation_policy?: string
  booking_rules?: Record<string, any>
}

export const tenantsService = {
  /**
   * Buscar tenant por ID
   */
  async getById(id: string) {
    const { data, error } = await supabase
      .from('tenants')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data as Tenant
  },

  /**
   * Buscar tenant por slug
   */
  async getBySlug(slug: string) {
    const { data, error } = await supabase
      .from('tenants')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error) throw error
    return data as Tenant
  },

  /**
   * Atualizar tenant
   */
  async update(id: string, updates: UpdateTenantData) {
    const { data, error } = await supabase
      .from('tenants')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as Tenant
  },
}

