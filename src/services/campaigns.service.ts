import { supabase } from '@/lib/supabase'

export interface Campaign {
  id: string
  tenant_id: string
  name: string
  type: 'email' | 'sms' | 'whatsapp'
  status: 'draft' | 'scheduled' | 'sent' | 'active'
  target_audience?: string
  message?: string
  sent_count: number
  open_rate: number
  scheduled_date?: string
  created_at: string
  updated_at: string
}

export interface CreateCampaignData {
  name: string
  type: 'email' | 'sms' | 'whatsapp'
  status?: 'draft' | 'scheduled' | 'sent' | 'active'
  target_audience?: string
  message?: string
  scheduled_date?: string
}

export const campaignsService = {
  /**
   * Buscar todas as campanhas do tenant
   */
  async getAll(tenantId: string) {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data as Campaign[]
  },

  /**
   * Buscar campanha por ID
   */
  async getById(id: string) {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data as Campaign
  },

  /**
   * Criar nova campanha
   */
  async create(tenantId: string, data: CreateCampaignData) {
    const { data: campaign, error } = await supabase
      .from('campaigns')
      .insert({
        ...data,
        tenant_id: tenantId,
        status: data.status || 'draft',
        sent_count: 0,
        open_rate: 0,
      })
      .select()
      .single()

    if (error) throw error
    return campaign as Campaign
  },

  /**
   * Atualizar campanha
   */
  async update(id: string, updates: Partial<CreateCampaignData>) {
    const { data: campaign, error } = await supabase
      .from('campaigns')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return campaign as Campaign
  },

  /**
   * Deletar campanha
   */
  async delete(id: string) {
    const { error } = await supabase
      .from('campaigns')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  /**
   * Atualizar estatísticas da campanha
   */
  async updateStats(id: string, stats: { sent_count?: number; open_rate?: number }) {
    const { data, error } = await supabase
      .from('campaigns')
      .update({
        ...stats,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as Campaign
  },
}

