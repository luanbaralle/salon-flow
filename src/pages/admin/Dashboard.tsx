import { AdminHeader } from '@/components/layout/AdminHeader';
import { StatCard } from '@/components/dashboard/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useApp } from '@/contexts/AppContext';
import { dashboardStats } from '@/data/mockData';
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
  const { appointments, professionals } = useApp();
  
  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');
  const todayAppointments = appointments.filter(a => a.date === todayStr);

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
            value={dashboardStats.todayAppointments}
            icon={<Calendar className="h-5 w-5" />}
            variant="primary"
            description="8 confirmados"
          />
          <StatCard
            title="Faturamento Semanal"
            value={`R$ ${dashboardStats.weekRevenue.toLocaleString()}`}
            icon={<DollarSign className="h-5 w-5" />}
            variant="success"
            trend={{ value: 12, isPositive: true }}
          />
          <StatCard
            title="Novos Clientes"
            value={dashboardStats.newClients}
            icon={<Users className="h-5 w-5" />}
            variant="info"
            description="Este mês"
          />
          <StatCard
            title="Taxa de Comparecimento"
            value={`${dashboardStats.completionRate}%`}
            icon={<TrendingUp className="h-5 w-5" />}
            variant="warning"
            trend={{ value: 3, isPositive: true }}
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
                  {todayAppointments.slice(0, 5).map((appointment) => {
                    const professional = professionals.find(p => p.id === appointment.professionalId);
                    return (
                      <div
                        key={appointment.id}
                        className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                        onClick={() => navigate(`/admin/agenda?appointment=${appointment.id}`)}
                      >
                        <div className="flex items-center justify-center w-14 text-center">
                          <span className="text-sm font-semibold">{appointment.startTime}</span>
                        </div>
                        <div className="h-10 w-1 rounded-full gradient-primary" />
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={professional?.avatar} />
                          <AvatarFallback className="bg-primary-light text-primary text-xs">
                            {appointment.professionalName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{appointment.clientName}</p>
                          <p className="text-sm text-muted-foreground truncate">
                            {appointment.serviceName}
                          </p>
                        </div>
                        <Badge variant={appointment.status as any}>
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
              <div className="space-y-4">
                {dashboardStats.topProfessionals.map((prof, index) => (
                  <div key={prof.name} className="flex items-center gap-3">
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
                        R$ {prof.revenue.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
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
                  <BarChart data={dashboardStats.revenueByMonth}>
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
                      formatter={(value: number) => [`R$ ${value.toLocaleString()}`, 'Faturamento']}
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
              <div className="space-y-4">
                {dashboardStats.topServices.map((service, index) => (
                  <div key={service.name} className="space-y-2">
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
                          width: `${(service.count / dashboardStats.topServices[0].count) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
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
                <p className="text-2xl font-bold">{dashboardStats.averageRating}</p>
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
                <p className="text-2xl font-bold">R$ {dashboardStats.monthRevenue.toLocaleString()}</p>
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
                <p className="text-2xl font-bold">45 min</p>
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
                <p className="text-2xl font-bold">{professionals.length}</p>
                <p className="text-sm text-muted-foreground">Profissionais ativos</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
