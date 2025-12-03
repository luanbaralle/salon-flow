import { useQuery } from '@tanstack/react-query';
import { AdminHeader } from '@/components/layout/AdminHeader';
import { StatCard } from '@/components/dashboard/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { dashboardService } from '@/services/dashboard.service';
import { appointmentsService } from '@/services/appointments.service';
import { professionalsService } from '@/services/professionals.service';
import { supabase } from '@/lib/supabase';
import {
  Calendar,
  DollarSign,
  Users,
  TrendingUp,
  Clock,
  Star,
  ChevronRight,
  ArrowUpRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { tenant } = useAuth();
  
  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');

  // Buscar estatísticas do dashboard
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard', 'stats', tenant?.id],
    queryFn: () => dashboardService.getStats(tenant!.id),
    enabled: !!tenant?.id,
    refetchInterval: 60000, // Atualizar a cada minuto
  });

  // Buscar agendamentos de hoje com relacionamentos
  const { data: todayAppointments = [], isLoading: appointmentsLoading } = useQuery({
    queryKey: ['appointments', 'today', tenant?.id, todayStr],
    queryFn: async () => {
      const appointments = await appointmentsService.getAll(tenant!.id, {
        dateFrom: todayStr,
        dateTo: todayStr,
      });
      
      // Buscar dados relacionados
      const appointmentsWithDetails = await Promise.all(
        appointments.map(async (apt) => {
          try {
            const [clientData, serviceData, professionalData] = await Promise.all([
              supabase.from('clients').select('name').eq('id', apt.client_id).single(),
              supabase.from('services').select('name').eq('id', apt.service_id).single(),
              supabase.from('professionals').select('name, avatar').eq('id', apt.professional_id).single(),
            ]);
            
            return {
              ...apt,
              clientName: clientData.data?.name || 'Cliente',
              serviceName: serviceData.data?.name || 'Serviço',
              professionalName: professionalData.data?.name || 'Profissional',
              professionalAvatar: professionalData.data?.avatar,
            };
          } catch {
            return {
              ...apt,
              clientName: 'Cliente',
              serviceName: 'Serviço',
              professionalName: 'Profissional',
            };
          }
        })
      );
      
      return appointmentsWithDetails;
    },
    enabled: !!tenant?.id,
  });

  // Buscar profissionais para exibir avatares
  const { data: professionals = [] } = useQuery({
    queryKey: ['professionals', tenant?.id],
    queryFn: () => professionalsService.getAll(tenant!.id),
    enabled: !!tenant?.id,
  });

  if (statsLoading || appointmentsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">Erro ao carregar dashboard</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <AdminHeader
        title="Dashboard"
        subtitle={format(today, "EEEE, d 'de' MMMM", { locale: ptBR })}
      />

      <div className="p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Agendamentos Hoje"
            value={stats.todayAppointments}
            icon={<Calendar className="h-5 w-5" />}
            variant="primary"
            description={`${stats.todayConfirmed} confirmados`}
          />
          <StatCard
            title="Faturamento Semanal"
            value={`R$ ${stats.weekRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            icon={<DollarSign className="h-5 w-5" />}
            variant="success"
          />
          <StatCard
            title="Novos Clientes"
            value={stats.newClients}
            icon={<Users className="h-5 w-5" />}
            variant="info"
            description="Este mês"
          />
          <StatCard
            title="Taxa de Comparecimento"
            value={`${stats.completionRate}%`}
            icon={<TrendingUp className="h-5 w-5" />}
            variant="warning"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Today's Schedule */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">Agenda de Hoje</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate('/admin/agenda')}>
                Ver tudo
                <ChevronRight className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              {todayAppointments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum agendamento para hoje
                </div>
              ) : (
                <div className="space-y-3">
                  {todayAppointments.slice(0, 5).map((appointment: any) => {
                    return (
                      <div
                        key={appointment.id}
                        className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                        onClick={() => navigate(`/admin/agenda?appointment=${appointment.id}`)}
                      >
                        <div className="flex items-center justify-center w-14 text-center">
                          <span className="text-sm font-semibold">{appointment.start_time.substring(0, 5)}</span>
                        </div>
                        <div className="h-10 w-1 rounded-full gradient-primary" />
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={appointment.professionalAvatar} />
                          <AvatarFallback className="bg-primary-light text-primary text-xs">
                            {appointment.professionalName?.charAt(0) || 'P'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{appointment.clientName || 'Cliente'}</p>
                          <p className="text-sm text-muted-foreground truncate">
                            {appointment.serviceName || 'Serviço'}
                          </p>
                        </div>
                        <Badge variant={appointment.status === 'confirmed' ? 'soft-success' : appointment.status === 'pending' ? 'soft-warning' : appointment.status === 'cancelled' ? 'destructive' : 'default'}>
                          {appointment.status === 'confirmed' && 'Confirmado'}
                          {appointment.status === 'pending' && 'Pendente'}
                          {appointment.status === 'cancelled' && 'Cancelado'}
                          {appointment.status === 'completed' && 'Concluído'}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Professionals */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Top Profissionais</CardTitle>
            </CardHeader>
            <CardContent>
              {stats.topProfessionals.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  Nenhum dado disponível
                </div>
              ) : (
                <div className="space-y-4">
                  {stats.topProfessionals.map((prof, index) => (
                    <div key={prof.id} className="flex items-center gap-3">
                      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary-light text-primary font-semibold text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{prof.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {prof.appointments} atendimentos
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-success">
                          R$ {prof.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Revenue Chart */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                Faturamento
                <Badge variant="soft-success" className="font-normal">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  +15% vs mês anterior
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.revenueByMonth}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis
                      dataKey="month"
                      className="text-xs fill-muted-foreground"
                    />
                    <YAxis
                      className="text-xs fill-muted-foreground"
                      tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                      formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 'Faturamento']}
                    />
                    <Bar
                      dataKey="revenue"
                      fill="hsl(var(--primary))"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Top Services */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Serviços Populares</CardTitle>
            </CardHeader>
            <CardContent>
              {stats.topServices.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  Nenhum dado disponível
                </div>
              ) : (
                <div className="space-y-4">
                  {stats.topServices.map((service, index) => {
                    const maxCount = stats.topServices[0]?.count || 1;
                    return (
                      <div key={service.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{service.name}</span>
                          <span className="text-sm text-muted-foreground">
                            {service.count} agendamentos
                          </span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full gradient-primary rounded-full transition-all"
                            style={{
                              width: `${(service.count / maxCount) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="p-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-warning-light flex items-center justify-center">
                <Star className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</p>
                <p className="text-sm text-muted-foreground">Avaliação média</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-success-light flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">R$ {stats.monthRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                <p className="text-sm text-muted-foreground">Faturamento mensal</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-info-light flex items-center justify-center">
                <Clock className="h-6 w-6 text-info" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.averageServiceDuration} min</p>
                <p className="text-sm text-muted-foreground">Tempo médio de serviço</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary-light flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.activeProfessionals}</p>
                <p className="text-sm text-muted-foreground">Profissionais ativos</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
