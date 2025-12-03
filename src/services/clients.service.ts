import { supabase } from '@/lib/supabase'

export interface Client {
  id: string
  tenant_id: string
  name: string
  email: string
  phone?: string
  avatar?: string
  notes?: string
  total_spent: number
  visit_count: number
  last_visit?: string
  created_at: string
  updated_at: string
}

export interface CreateClientData {
  name: string
  email: string
  phone?: string
  avatar?: string
  notes?: string
}

export const clientsService = {
  /**
   * Buscar todos os clientes do tenant
   */
  async getAll(tenantId: string) {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('name')

    if (error) throw error
    return data as Client[]
  },

  /**
   * Buscar cliente por ID
   */
  async getById(id: string) {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data as Client
  },

  /**
   * Buscar cliente por email
   */
  async getByEmail(tenantId: string, email: string) {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('email', email)
      .single()

    if (error && error.code !== 'PGRST116') throw error // PGRST116 = not found
    return data as Client | null
  },

  /**
   * Criar novo cliente
   */
  async create(tenantId: string, data: CreateClientData) {
    const { data: client, error } = await supabase
      .from('clients')
      .insert({
        ...data,
        tenant_id: tenantId,
        total_spent: 0,
        visit_count: 0,
      })
      .select()
      .single()

    if (error) throw error
    return client as Client
  },

  /**
   * Atualizar cliente
   */
  async update(id: string, updates: Partial<CreateClientData>) {
    const { data, error } = await supabase
      .from('clients')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as Client
  },

  /**
   * Deletar cliente
   */
  async delete(id: string) {
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  /**
   * Buscar histórico de agendamentos do cliente
   */
  async getAppointments(clientId: string) {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('client_id', clientId)
      .order('date', { ascending: false })

    if (error) throw error
    return data
  },
}

