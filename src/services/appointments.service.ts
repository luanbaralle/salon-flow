import { supabase } from '@/lib/supabase'

export interface Appointment {
  id: string
  tenant_id: string
  client_id: string
  professional_id: string
  service_id: string
  date: string // DATE format YYYY-MM-DD
  start_time: string // TIME format HH:MM
  end_time: string // TIME format HH:MM
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  price: number
  notes?: string
  created_at: string
  updated_at: string
}

export interface AppointmentWithDetails extends Appointment {
  client?: {
    id: string
    name: string
    email: string
    phone?: string
    avatar?: string
  }
  professional?: {
    id: string
    name: string
    specialty?: string
    avatar?: string
  }
  service?: {
    id: string
    name: string
    duration: number
    price: number
  }
}

export interface CreateAppointmentData {
  client_id: string
  professional_id: string
  service_id: string
  date: string
  start_time: string
  end_time: string
  status?: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  price: number
  notes?: string
}

export const appointmentsService = {
  /**
   * Buscar todos os agendamentos do tenant
   */
  async getAll(tenantId: string, filters?: {
    dateFrom?: string
    dateTo?: string
    professionalId?: string
    status?: string
  }) {
    let query = supabase
      .from('appointments')
      .select('*')
      .eq('tenant_id', tenantId)

    if (filters?.dateFrom) {
      // Garantir que a comparação seja feita corretamente com DATE
      query = query.gte('date', filters.dateFrom)
    }
    if (filters?.dateTo) {
      query = query.lte('date', filters.dateTo)
    }
    if (filters?.professionalId) {
      query = query.eq('professional_id', filters.professionalId)
    }
    if (filters?.status) {
      query = query.eq('status', filters.status)
    }

    const { data, error } = await query
      .order('date', { ascending: true })
      .order('start_time', { ascending: true })

    if (error) throw error
    return data as Appointment[]
  },

  /**
   * Buscar agendamento por ID com detalhes
   */
  async getById(id: string) {
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        clients:client_id (id, name, email, phone, avatar),
        professionals:professional_id (id, name, specialty, avatar),
        services:service_id (id, name, duration, price)
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return data as AppointmentWithDetails
  },

  /**
   * Criar novo agendamento
   */
  async create(tenantId: string, data: CreateAppointmentData) {
    const { data: appointment, error } = await supabase
      .from('appointments')
      .insert({
        ...data,
        tenant_id: tenantId,
        status: data.status || 'pending',
      })
      .select()
      .single()

    if (error) throw error
    return appointment as Appointment
  },

  /**
   * Atualizar agendamento
   */
  async update(id: string, updates: Partial<CreateAppointmentData> & { status?: Appointment['status'] }) {
    const { data, error } = await supabase
      .from('appointments')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as Appointment
  },

  /**
   * Deletar agendamento
   */
  async delete(id: string) {
    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  /**
   * Buscar agendamentos de um profissional
   */
  async getByProfessional(professionalId: string, dateFrom?: string, dateTo?: string) {
    let query = supabase
      .from('appointments')
      .select('*')
      .eq('professional_id', professionalId)

    if (dateFrom) {
      query = query.gte('date', dateFrom)
    }
    if (dateTo) {
      query = query.lte('date', dateTo)
    }

    const { data, error } = await query.order('date', { ascending: true }).order('start_time', { ascending: true })

    if (error) throw error
    return data as Appointment[]
  },

  /**
   * Buscar agendamentos de um cliente
   */
  async getByClient(clientId: string) {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('client_id', clientId)
      .order('date', { ascending: false })
      .order('start_time', { ascending: false })

    if (error) throw error
    return data as Appointment[]
  },
}

