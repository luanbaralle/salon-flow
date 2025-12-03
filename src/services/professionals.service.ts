import { supabase } from '@/lib/supabase'

export interface Professional {
  id: string
  tenant_id: string
  user_id?: string
  name: string
  avatar?: string
  specialty?: string
  commission: number
  availability: Record<string, { start: string; end: string }>
  rating: number
  review_count: number
  active: boolean
  created_at: string
  updated_at: string
}

export interface CreateProfessionalData {
  name: string
  avatar?: string
  specialty?: string
  commission?: number
  availability?: Record<string, { start: string; end: string }>
  service_ids?: string[]
}

export const professionalsService = {
  /**
   * Buscar todos os profissionais do tenant
   */
  async getAll(tenantId: string) {
    const { data, error } = await supabase
      .from('professionals')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('active', true)
      .order('name')

    if (error) throw error
    return data as Professional[]
  },

  /**
   * Buscar profissional por ID
   */
  async getById(id: string) {
    const { data, error } = await supabase
      .from('professionals')
      .select('*, service_professionals(service_id)')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  /**
   * Criar novo profissional
   */
  async create(tenantId: string, data: CreateProfessionalData) {
    const { service_ids, ...professionalData } = data

    // Criar profissional com disponibilidade padrão se não fornecida
    const defaultAvailability = {
      monday: { open: true, start: '09:00', end: '18:00' },
      tuesday: { open: true, start: '09:00', end: '18:00' },
      wednesday: { open: true, start: '09:00', end: '18:00' },
      thursday: { open: true, start: '09:00', end: '18:00' },
      friday: { open: true, start: '09:00', end: '18:00' },
      saturday: { open: true, start: '09:00', end: '14:00' },
      sunday: { open: false, start: '', end: '' },
    };

    // Criar profissional
    const { data: professional, error: profError } = await supabase
      .from('professionals')
      .insert({
        ...professionalData,
        tenant_id: tenantId,
        commission: professionalData.commission || 0,
        availability: professionalData.availability || defaultAvailability,
        rating: 0,
        review_count: 0,
        active: true,
      })
      .select()
      .single()

    if (profError) throw profError

    // Associar serviços se fornecidos
    if (service_ids && service_ids.length > 0) {
      const serviceProfessionals = service_ids.map(service_id => ({
        service_id,
        professional_id: professional.id,
      }))

      const { error: relError } = await supabase
        .from('service_professionals')
        .insert(serviceProfessionals)

      if (relError) throw relError
    }

    return professional
  },

  /**
   * Atualizar profissional
   */
  async update(id: string, updates: Partial<CreateProfessionalData>) {
    const { service_ids, ...professionalData } = updates

    // Atualizar profissional
    const { data: professional, error: profError } = await supabase
      .from('professionals')
      .update({
        ...professionalData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (profError) throw profError

    // Atualizar serviços se fornecidos
    if (service_ids !== undefined) {
      // Remover associações antigas
      await supabase
        .from('service_professionals')
        .delete()
        .eq('professional_id', id)

      // Criar novas associações
      if (service_ids.length > 0) {
        const serviceProfessionals = service_ids.map(service_id => ({
          service_id,
          professional_id: id,
        }))

        const { error: relError } = await supabase
          .from('service_professionals')
          .insert(serviceProfessionals)

        if (relError) throw relError
      }
    }

    return professional
  },

  /**
   * Deletar profissional (soft delete)
   */
  async delete(id: string) {
    const { error } = await supabase
      .from('professionals')
      .update({ active: false, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) throw error
  },

  /**
   * Buscar serviços do profissional
   */
  async getServices(professionalId: string) {
    const { data, error } = await supabase
      .from('service_professionals')
      .select('service_id, services(*)')
      .eq('professional_id', professionalId)

    if (error) throw error
    return data
  },
}



