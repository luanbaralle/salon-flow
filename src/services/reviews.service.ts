import { supabase } from '@/lib/supabase';

export interface Review {
  id: string;
  tenant_id: string;
  appointment_id: string;
  client_id: string;
  professional_id: string;
  service_id: string;
  rating: number;
  comment?: string;
  created_at: string;
  updated_at: string;
  // Relacionamentos (quando incluídos na query)
  client?: {
    id: string;
    name: string;
    avatar?: string;
  };
  professional?: {
    id: string;
    name: string;
    avatar?: string;
  };
  service?: {
    id: string;
    name: string;
  };
  appointment?: {
    id: string;
    date: string;
    start_time: string;
  };
}

export interface CreateReviewData {
  appointmentId: string;
  rating: number;
  comment?: string;
}

export const reviewsService = {
  /**
   * Buscar todas as avaliações do tenant
   */
  async getAll(tenantId: string) {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        client:clients(id, name, avatar),
        professional:professionals(id, name, avatar),
        service:services(id, name),
        appointment:appointments(id, date, start_time)
      `)
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Review[];
  },

  /**
   * Buscar avaliações de um profissional
   */
  async getByProfessional(tenantId: string, professionalId: string) {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        client:clients(id, name, avatar),
        service:services(id, name),
        appointment:appointments(id, date, start_time)
      `)
      .eq('tenant_id', tenantId)
      .eq('professional_id', professionalId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Review[];
  },

  /**
   * Buscar avaliação por agendamento
   */
  async getByAppointment(appointmentId: string) {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        client:clients(id, name, avatar),
        professional:professionals(id, name, avatar),
        service:services(id, name)
      `)
      .eq('appointment_id', appointmentId)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found
    return data as Review | null;
  },

  /**
   * Criar avaliação
   */
  async create(tenantId: string, data: CreateReviewData) {
    // Buscar dados do agendamento
    const { data: appointment, error: aptError } = await supabase
      .from('appointments')
      .select('client_id, professional_id, service_id, status')
      .eq('id', data.appointmentId)
      .eq('tenant_id', tenantId)
      .single();

    if (aptError) throw aptError;
    if (!appointment) throw new Error('Agendamento não encontrado');
    if (appointment.status !== 'completed') {
      throw new Error('Apenas agendamentos concluídos podem ser avaliados');
    }

    // Verificar se já existe avaliação
    const existing = await this.getByAppointment(data.appointmentId);
    if (existing) {
      throw new Error('Este agendamento já foi avaliado');
    }

    // Criar avaliação
    const { data: review, error } = await supabase
      .from('reviews')
      .insert({
        tenant_id: tenantId,
        appointment_id: data.appointmentId,
        client_id: appointment.client_id,
        professional_id: appointment.professional_id,
        service_id: appointment.service_id,
        rating: data.rating,
        comment: data.comment || null,
      })
      .select(`
        *,
        client:clients(id, name, avatar),
        professional:professionals(id, name, avatar),
        service:services(id, name)
      `)
      .single();

    if (error) throw error;
    return review as Review;
  },

  /**
   * Atualizar avaliação
   */
  async update(reviewId: string, updates: { rating?: number; comment?: string }) {
    const { data, error } = await supabase
      .from('reviews')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', reviewId)
      .select(`
        *,
        client:clients(id, name, avatar),
        professional:professionals(id, name, avatar),
        service:services(id, name)
      `)
      .single();

    if (error) throw error;
    return data as Review;
  },

  /**
   * Deletar avaliação
   */
  async delete(reviewId: string) {
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', reviewId);

    if (error) throw error;
  },

  /**
   * Buscar estatísticas de avaliações
   */
  async getStats(tenantId: string) {
    const { data, error } = await supabase
      .from('reviews')
      .select('rating')
      .eq('tenant_id', tenantId);

    if (error) throw error;

    const total = data.length;
    const average = total > 0
      ? data.reduce((sum, r) => sum + r.rating, 0) / total
      : 0;

    const distribution = {
      5: data.filter(r => r.rating === 5).length,
      4: data.filter(r => r.rating === 4).length,
      3: data.filter(r => r.rating === 3).length,
      2: data.filter(r => r.rating === 2).length,
      1: data.filter(r => r.rating === 1).length,
    };

    return {
      total,
      average: Number(average.toFixed(2)),
      distribution,
    };
  },
};



