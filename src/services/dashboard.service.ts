import { supabase } from '@/lib/supabase'
import { startOfMonth, startOfWeek, endOfWeek, subMonths } from 'date-fns'

export interface DashboardStats {
  todayAppointments: number
  todayConfirmed: number
  weekRevenue: number
  monthRevenue: number
  newClients: number
  completionRate: number
  averageRating: number
  averageServiceDuration: number
  activeProfessionals: number
  topProfessionals: Array<{
    id: string
    name: string
    appointments: number
    revenue: number
    avatar?: string
  }>
  topServices: Array<{
    id: string
    name: string
    count: number
  }>
  revenueByMonth: Array<{
    month: string
    revenue: number
  }>
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]
}

export const dashboardService = {
  /**
   * Buscar todas as estatísticas do dashboard
   */
  async getStats(tenantId: string): Promise<DashboardStats> {
    const now = new Date()
    const today = formatDate(now)
    const monthStart = formatDate(startOfMonth(now))
    const weekStart = formatDate(startOfWeek(now, { weekStartsOn: 1 }))
    const weekEnd = formatDate(endOfWeek(now, { weekStartsOn: 1 }))

    // 1. Agendamentos de hoje
    const { data: todayAppointments, error: todayError } = await supabase
      .from('appointments')
      .select('id, status')
      .eq('tenant_id', tenantId)
      .eq('date', today)

    if (todayError) throw todayError

    const todayAppointmentsCount = todayAppointments?.length || 0
    const todayConfirmed = todayAppointments?.filter(a => a.status === 'confirmed').length || 0

    // 2. Faturamento semanal e mensal
    const { data: weekTransactions, error: weekError } = await supabase
      .from('transactions')
      .select('amount, type')
      .eq('tenant_id', tenantId)
      .eq('type', 'income')
      .gte('date', weekStart)
      .lte('date', weekEnd)

    if (weekError) throw weekError

    const { data: monthTransactions, error: monthError } = await supabase
      .from('transactions')
      .select('amount, type')
      .eq('tenant_id', tenantId)
      .eq('type', 'income')
      .gte('date', monthStart)

    if (monthError) throw monthError

    const weekRevenue = weekTransactions?.reduce((sum, t) => sum + Number(t.amount), 0) || 0
    const monthRevenue = monthTransactions?.reduce((sum, t) => sum + Number(t.amount), 0) || 0

    // 3. Novos clientes do mês
    const { count: newClientsCount, error: clientsError } = await supabase
      .from('clients')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)
      .gte('created_at', new Date(monthStart).toISOString())

    if (clientsError) throw clientsError

    // 4. Taxa de comparecimento (últimos 30 dias)
    const thirtyDaysAgo = formatDate(new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000))
    
    const { data: recentAppointments, error: recentError } = await supabase
      .from('appointments')
      .select('status')
      .eq('tenant_id', tenantId)
      .gte('date', thirtyDaysAgo)
      .lte('date', today)

    if (recentError) throw recentError

    const totalRecent = recentAppointments?.length || 0
    const completedRecent = recentAppointments?.filter(a => a.status === 'completed').length || 0
    const completionRate = totalRecent > 0 ? Math.round((completedRecent / totalRecent) * 100) : 0

    // 5. Top Profissionais (por faturamento e agendamentos)
    const { data: professionalStats, error: profError } = await supabase
      .from('appointments')
      .select(`
        professional_id,
        price,
        professionals!inner(id, name, avatar)
      `)
      .eq('tenant_id', tenantId)
      .eq('status', 'completed')
      .gte('date', monthStart)

    if (profError) throw profError

    const profMap = new Map<string, { name: string; appointments: number; revenue: number; avatar?: string; id: string }>()
    
    professionalStats?.forEach((apt: any) => {
      const profId = apt.professional_id
      const prof = apt.professionals
      
      if (!profMap.has(profId)) {
        profMap.set(profId, {
          id: profId,
          name: prof.name,
          appointments: 0,
          revenue: 0,
          avatar: prof.avatar,
        })
      }
      
      const current = profMap.get(profId)!
      current.appointments++
      current.revenue += Number(apt.price)
    })

    const topProfessionals = Array.from(profMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)

    // 6. Top Serviços (por quantidade de agendamentos)
    const { data: serviceStats, error: serviceError } = await supabase
      .from('appointments')
      .select(`
        service_id,
        services!inner(id, name)
      `)
      .eq('tenant_id', tenantId)
      .gte('date', monthStart)

    if (serviceError) throw serviceError

    const serviceMap = new Map<string, { name: string; count: number; id: string }>()
    
    serviceStats?.forEach((apt: any) => {
      const serviceId = apt.service_id
      const service = apt.services
      
      if (!serviceMap.has(serviceId)) {
        serviceMap.set(serviceId, {
          id: serviceId,
          name: service.name,
          count: 0,
        })
      }
      
      const current = serviceMap.get(serviceId)!
      current.count++
    })

    const topServices = Array.from(serviceMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // 7. Faturamento mensal (últimos 6 meses)
    const revenueByMonth: Array<{ month: string; revenue: number }> = []
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
    
    for (let i = 5; i >= 0; i--) {
      const monthDate = subMonths(now, i)
      const monthStartDate = startOfMonth(monthDate)
      const monthEndDate = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0)
      
      const { data: monthData, error: monthDataError } = await supabase
        .from('transactions')
        .select('amount')
        .eq('tenant_id', tenantId)
        .eq('type', 'income')
        .gte('date', formatDate(monthStartDate))
        .lte('date', formatDate(monthEndDate))

      if (monthDataError) throw monthDataError

      const revenue = monthData?.reduce((sum, t) => sum + Number(t.amount), 0) || 0
      revenueByMonth.push({
        month: monthNames[monthDate.getMonth()],
        revenue,
      })
    }

    // 8. Tempo médio de serviço
    const { data: services, error: servicesError } = await supabase
      .from('services')
      .select('duration')
      .eq('tenant_id', tenantId)
      .eq('active', true)

    if (servicesError) throw servicesError

    const averageServiceDuration = services && services.length > 0
      ? Math.round(services.reduce((sum, s) => sum + s.duration, 0) / services.length)
      : 0

    // 9. Profissionais ativos
    const { count: activeProfessionalsCount, error: activeProfError } = await supabase
      .from('professionals')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)
      .eq('active', true)

    if (activeProfError) throw activeProfError

    // 10. Avaliação média (placeholder - pode ser implementado depois)
    const averageRating = 4.8

    return {
      todayAppointments: todayAppointmentsCount,
      todayConfirmed,
      weekRevenue,
      monthRevenue,
      newClients: newClientsCount || 0,
      completionRate,
      averageRating,
      averageServiceDuration,
      activeProfessionals: activeProfessionalsCount || 0,
      topProfessionals,
      topServices,
      revenueByMonth,
    }
  },
}

