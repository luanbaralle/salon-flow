import { supabase } from '@/lib/supabase'

export interface Transaction {
  id: string
  tenant_id: string
  appointment_id?: string
  type: 'income' | 'expense'
  category?: string
  description: string
  amount: number
  date: string
  created_at: string
}

export interface CreateTransactionData {
  appointment_id?: string
  type: 'income' | 'expense'
  category?: string
  description: string
  amount: number
  date: string
}

export interface TransactionStats {
  monthRevenue: number
  weekRevenue: number
  monthExpenses: number
  weekExpenses: number
  averageTicket: number
  totalTransactions: number
}

export const transactionsService = {
  /**
   * Buscar todas as transações do tenant
   */
  async getAll(tenantId: string, filters?: {
    dateFrom?: string
    dateTo?: string
    type?: 'income' | 'expense'
    category?: string
  }) {
    let query = supabase
      .from('transactions')
      .select('*')
      .eq('tenant_id', tenantId)

    if (filters?.dateFrom) {
      query = query.gte('date', filters.dateFrom)
    }
    if (filters?.dateTo) {
      query = query.lte('date', filters.dateTo)
    }
    if (filters?.type) {
      query = query.eq('type', filters.type)
    }
    if (filters?.category) {
      query = query.eq('category', filters.category)
    }

    const { data, error } = await query
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) throw error
    return data as Transaction[]
  },

  /**
   * Buscar transação por ID
   */
  async getById(id: string) {
    const { data, error } = await supabase
      .from('transactions')
      .select('*, appointment:appointments(id, client_id, service_id, date, start_time)')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  /**
   * Criar nova transação
   */
  async create(tenantId: string, data: CreateTransactionData) {
    const { data: transaction, error } = await supabase
      .from('transactions')
      .insert({
        ...data,
        tenant_id: tenantId,
      })
      .select()
      .single()

    if (error) throw error
    return transaction as Transaction
  },

  /**
   * Atualizar transação
   */
  async update(id: string, updates: Partial<CreateTransactionData>) {
    const { data: transaction, error } = await supabase
      .from('transactions')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return transaction as Transaction
  },

  /**
   * Deletar transação
   */
  async delete(id: string) {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  /**
   * Buscar estatísticas financeiras
   */
  async getStats(tenantId: string) {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay() + 1) // Segunda-feira
    startOfWeek.setHours(0, 0, 0, 0)

    const monthStart = formatDate(startOfMonth)
    const weekStart = formatDate(startOfWeek)
    const today = formatDate(now)

    // Buscar todas as transações do mês
    const { data: monthTransactions, error: monthError } = await supabase
      .from('transactions')
      .select('*')
      .eq('tenant_id', tenantId)
      .gte('date', monthStart)
      .lte('date', today)

    if (monthError) throw monthError

    // Buscar transações da semana
    const { data: weekTransactions, error: weekError } = await supabase
      .from('transactions')
      .select('*')
      .eq('tenant_id', tenantId)
      .gte('date', weekStart)
      .lte('date', today)

    if (weekError) throw weekError

    // Calcular estatísticas
    const monthRevenue = monthTransactions
      ?.filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0) || 0

    const weekRevenue = weekTransactions
      ?.filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0) || 0

    const monthExpenses = monthTransactions
      ?.filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0) || 0

    const weekExpenses = weekTransactions
      ?.filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0) || 0

    const incomeTransactions = monthTransactions?.filter(t => t.type === 'income') || []
    const averageTicket = incomeTransactions.length > 0
      ? monthRevenue / incomeTransactions.length
      : 0

    return {
      monthRevenue,
      weekRevenue,
      monthExpenses,
      weekExpenses,
      averageTicket,
      totalTransactions: monthTransactions?.length || 0,
    } as TransactionStats
  },
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]
}

