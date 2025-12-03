import { supabase } from '@/lib/supabase'

export interface Service {
  id: string
  tenant_id: string
  name: string
  description?: string
  duration: number // em minutos
  price: number
  category: string
  image?: string
  active: boolean
  created_at: string
  updated_at: string
}

export interface CreateServiceData {
  name: string
  description?: string
  duration: number
  price: number
  category: string
  image?: string
  professional_ids?: string[]
}

export const servicesService = {
  /**
   * Buscar todos os serviços do tenant
   */
  async getAll(tenantId: string) {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('active', true)
      .order('category, name')

    if (error) throw error
    return data as Service[]
  },

  /**
   * Buscar serviço por ID
   */
  async getById(id: string) {
    const { data, error } = await supabase
      .from('services')
      .select('*, service_professionals(professional_id)')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  /**
   * Criar novo serviço
   */
  async create(tenantId: string, data: CreateServiceData) {
    const { professional_ids, ...serviceData } = data

    // Criar serviço
    const { data: service, error: serviceError } = await supabase
      .from('services')
      .insert({
        ...serviceData,
        tenant_id: tenantId,
        active: true,
      })
      .select()
      .single()

    if (serviceError) throw serviceError

    // Associar profissionais se fornecidos
    if (professional_ids && professional_ids.length > 0) {
      const serviceProfessionals = professional_ids.map(professional_id => ({
        professional_id,
        service_id: service.id,
      }))

      const { error: relError } = await supabase
        .from('service_professionals')
        .insert(serviceProfessionals)

      if (relError) throw relError
    }

    return service
  },

  /**
   * Atualizar serviço
   */
  async update(id: string, updates: Partial<CreateServiceData>) {
    const { professional_ids, ...serviceData } = updates

    // Atualizar serviço
    const { data: service, error: serviceError } = await supabase
      .from('services')
      .update({
        ...serviceData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (serviceError) throw serviceError

    // Atualizar profissionais se fornecidos
    if (professional_ids !== undefined) {
      // Remover associações antigas
      await supabase
        .from('service_professionals')
        .delete()
        .eq('service_id', id)

      // Criar novas associações
      if (professional_ids.length > 0) {
        const serviceProfessionals = professional_ids.map(professional_id => ({
          professional_id,
          service_id: id,
        }))

        const { error: relError } = await supabase
          .from('service_professionals')
          .insert(serviceProfessionals)

        if (relError) throw relError
      }
    }

    return service
  },

  /**
   * Deletar serviço (soft delete)
   */
  async delete(id: string) {
    const { error } = await supabase
      .from('services')
      .update({ active: false, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) throw error
  },

  /**
   * Buscar profissionais do serviço
   */
  async getProfessionals(serviceId: string) {
    const { data, error } = await supabase
      .from('service_professionals')
      .select('professional_id, professionals(*)')
      .eq('service_id', serviceId)

    if (error) throw error
    return data
  },
}

