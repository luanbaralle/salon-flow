import { supabase } from '@/lib/supabase'

export interface Notification {
  id: string
  tenant_id: string
  user_id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  category: 'appointment' | 'payment' | 'system' | 'marketing'
  read: boolean
  created_at: string
}

export interface CreateNotificationData {
  title: string
  message: string
  type?: 'info' | 'success' | 'warning' | 'error'
  category?: 'appointment' | 'payment' | 'system' | 'marketing'
}

export const notificationsService = {
  /**
   * Buscar todas as notificações do usuário
   */
  async getAll(userId: string, filters?: {
    read?: boolean
    category?: string
    limit?: number
  }) {
    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)

    if (filters?.read !== undefined) {
      query = query.eq('read', filters.read)
    }
    if (filters?.category) {
      query = query.eq('category', filters.category)
    }

    query = query.order('created_at', { ascending: false })

    if (filters?.limit) {
      query = query.limit(filters.limit)
    }

    const { data, error } = await query

    if (error) throw error
    return data as Notification[]
  },

  /**
   * Buscar notificação por ID
   */
  async getById(id: string) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data as Notification
  },

  /**
   * Criar nova notificação
   */
  async create(tenantId: string, userId: string, data: CreateNotificationData) {
    const { data: notification, error } = await supabase
      .from('notifications')
      .insert({
        tenant_id: tenantId,
        user_id: userId,
        title: data.title,
        message: data.message,
        type: data.type || 'info',
        category: data.category || 'system',
        read: false,
      })
      .select()
      .single()

    if (error) throw error
    return notification as Notification
  },

  /**
   * Marcar notificação como lida
   */
  async markAsRead(id: string) {
    const { data, error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as Notification
  },

  /**
   * Marcar todas as notificações como lidas
   */
  async markAllAsRead(userId: string) {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false)

    if (error) throw error
  },

  /**
   * Deletar notificação
   */
  async delete(id: string) {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  /**
   * Contar notificações não lidas
   */
  async getUnreadCount(userId: string) {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false)

    if (error) throw error
    return count || 0
  },
}



