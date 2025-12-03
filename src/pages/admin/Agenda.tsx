import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminHeader } from '@/components/layout/AdminHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { appointmentsService, type Appointment } from '@/services/appointments.service';
import { professionalsService } from '@/services/professionals.service';
import { servicesService } from '@/services/services.service';
import { clientsService } from '@/services/clients.service';
import { reviewsService } from '@/services/reviews.service';
import { Calendar, ChevronLeft, ChevronRight, Plus, Clock, User, Scissors, Edit, Trash2, Check, Star, Copy, CheckCircle } from 'lucide-react';
import { format, addDays, startOfWeek, addWeeks, subWeeks, startOfDay, endOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

type ViewMode = 'day' | 'week';

const timeSlots = Array.from({ length: 24 }, (_, i) => {
  const hour = Math.floor(i / 2) + 8;
  const minute = i % 2 === 0 ? '00' : '30';
  return `${hour.toString().padStart(2, '0')}:${minute}`;
}).filter(t => {
  const hour = parseInt(t.split(':')[0]);
  return hour >= 8 && hour < 20;
});

export default function AdminAgenda() {
  const { tenant } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedProfessional, setSelectedProfessional] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [copiedReviewLink, setCopiedReviewLink] = useState(false);
  const [hasReview, setHasReview] = useState(false);
  const [formData, setFormData] = useState({
    client_id: '',
    professional_id: '',
    service_id: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    start_time: '09:00',
    notes: '',
  });

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Calcular range de datas para buscar agendamentos
  // Expandir o range para garantir que não perdemos agendamentos
  const dateRange = useMemo(() => {
    if (viewMode === 'week') {
      // Buscar uma semana antes e depois para garantir que vemos todos
      return {
        from: format(addDays(weekStart, -7), 'yyyy-MM-dd'),
        to: format(addDays(weekStart, 13), 'yyyy-MM-dd'), // Semana atual + 1 semana
      };
    } else {
      // Buscar 3 dias antes e depois
      return {
        from: format(addDays(currentDate, -3), 'yyyy-MM-dd'),
        to: format(addDays(currentDate, 3), 'yyyy-MM-dd'),
      };
    }
  }, [viewMode, weekStart, currentDate]);

  // Buscar profissionais
  const { data: professionals = [] } = useQuery({
    queryKey: ['professionals', tenant?.id],
    queryFn: () => professionalsService.getAll(tenant!.id),
    enabled: !!tenant?.id,
  });

  // Buscar serviços
  const { data: services = [] } = useQuery({
    queryKey: ['services', tenant?.id],
    queryFn: () => servicesService.getAll(tenant!.id),
    enabled: !!tenant?.id,
  });

  // Buscar clientes
  const { data: clients = [] } = useQuery({
    queryKey: ['clients', tenant?.id],
    queryFn: () => clientsService.getAll(tenant!.id),
    enabled: !!tenant?.id,
  });

  // Buscar agendamentos
  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ['appointments', tenant?.id, dateRange.from, dateRange.to, selectedProfessional],
    queryFn: () =>
      appointmentsService.getAll(tenant!.id, {
        dateFrom: dateRange.from,
        dateTo: dateRange.to,
        professionalId: selectedProfessional !== 'all' ? selectedProfessional : undefined,
      }),
    enabled: !!tenant?.id,
  });

  // Criar agendamento
  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const service = services.find(s => s.id === data.service_id);
      if (!service) throw new Error('Serviço não encontrado');

      // Calcular end_time baseado na duração do serviço
      const [startHour, startMinute] = data.start_time.split(':').map(Number);
      const totalMinutes = startHour * 60 + startMinute + service.duration;
      const endHour = Math.floor(totalMinutes / 60);
      const endMinute = totalMinutes % 60;
      const end_time = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;

      return appointmentsService.create(tenant!.id, {
        client_id: data.client_id,
        professional_id: data.professional_id,
        service_id: data.service_id,
        date: data.date,
        start_time: data.start_time,
        end_time,
        price: service.price,
        notes: data.notes || undefined,
        status: 'pending',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      setIsModalOpen(false);
      setFormData({
        client_id: '',
        professional_id: '',
        service_id: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        start_time: '09:00',
        notes: '',
      });
      toast({
        title: 'Agendamento criado!',
        description: 'O agendamento foi criado com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao criar agendamento',
        description: error.message || 'Ocorreu um erro ao criar o agendamento.',
        variant: 'destructive',
      });
    },
  });

  // Atualizar agendamento
  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Appointment> }) =>
      appointmentsService.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      setEditingAppointment(null);
      toast({
        title: 'Agendamento atualizado!',
        description: 'As alterações foram salvas com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao atualizar agendamento',
        description: error.message || 'Ocorreu um erro ao atualizar o agendamento.',
        variant: 'destructive',
      });
    },
  });

  // Deletar agendamento
  const deleteMutation = useMutation({
    mutationFn: (id: string) => appointmentsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      setEditingAppointment(null);
      toast({
        title: 'Agendamento removido!',
        description: 'O agendamento foi removido com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao remover agendamento',
        description: error.message || 'Ocorreu um erro ao remover o agendamento.',
        variant: 'destructive',
      });
    },
  });

  const getAppointmentsForDay = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayAppointments = appointments.filter(a => {
      // Comparar apenas a parte da data (ignorar timezone)
      // O campo date pode vir como string 'YYYY-MM-DD' ou como Date object
      let appointmentDate: string;
      if (typeof a.date === 'string') {
        appointmentDate = a.date.split('T')[0]; // Remove timezone se houver
      } else {
        appointmentDate = format(new Date(a.date), 'yyyy-MM-dd');
      }
      return appointmentDate === dateStr;
    });
    return dayAppointments;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-success';
      case 'pending': return 'bg-warning';
      case 'cancelled': return 'bg-destructive';
      case 'completed': return 'bg-info';
      default: return 'bg-muted';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmado';
      case 'pending': return 'Pendente';
      case 'cancelled': return 'Cancelado';
      case 'completed': return 'Concluído';
      default: return status;
    }
  };

  const handlePrevious = () => {
    if (viewMode === 'week') {
      setCurrentDate(subWeeks(currentDate, 1));
    } else {
      setCurrentDate(addDays(currentDate, -1));
    }
  };

  const handleNext = () => {
    if (viewMode === 'week') {
      setCurrentDate(addWeeks(currentDate, 1));
    } else {
      setCurrentDate(addDays(currentDate, 1));
    }
  };

  const handleCreate = () => {
    createMutation.mutate(formData);
  };

  const handleEdit = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setIsModalOpen(true);
  };

  // Verificar se agendamento já foi avaliado
  useEffect(() => {
    if (editingAppointment && editingAppointment.status === 'completed') {
      reviewsService.getByAppointment(editingAppointment.id)
        .then(review => setHasReview(!!review))
        .catch(() => setHasReview(false));
    } else {
      setHasReview(false);
    }
  }, [editingAppointment]);

  // Atualizar formData quando editingAppointment mudar
  useEffect(() => {
    if (editingAppointment) {
      // Normalizar o formato do horário (remover segundos se houver)
      const normalizedTime = editingAppointment.start_time.includes(':')
        ? editingAppointment.start_time.split(':').slice(0, 2).join(':')
        : editingAppointment.start_time;
      
      // Normalizar a data (remover timezone se houver)
      const normalizedDate = editingAppointment.date.includes('T')
        ? editingAppointment.date.split('T')[0]
        : editingAppointment.date;
      
      setFormData({
        client_id: editingAppointment.client_id,
        professional_id: editingAppointment.professional_id,
        service_id: editingAppointment.service_id,
        date: normalizedDate,
        start_time: normalizedTime,
        notes: editingAppointment.notes || '',
      });
    }
  }, [editingAppointment]);

  const handleCopyReviewLink = async (appointmentId: string) => {
    const reviewLink = `${window.location.origin}/avaliar/${appointmentId}`;
    try {
      await navigator.clipboard.writeText(reviewLink);
      setCopiedReviewLink(true);
      toast({
        title: 'Link copiado!',
        description: 'O link de avaliação foi copiado para a área de transferência.',
      });
      setTimeout(() => setCopiedReviewLink(false), 2000);
    } catch (error) {
      toast({
        title: 'Erro ao copiar',
        description: 'Não foi possível copiar o link.',
        variant: 'destructive',
      });
    }
  };

  const handleUpdate = () => {
    if (editingAppointment) {
      const service = services.find(s => s.id === formData.service_id);
      if (!service) return;

      // Recalcular end_time se necessário
      const [startHour, startMinute] = formData.start_time.split(':').map(Number);
      const totalMinutes = startHour * 60 + startMinute + service.duration;
      const endHour = Math.floor(totalMinutes / 60);
      const endMinute = totalMinutes % 60;
      const end_time = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;

      updateMutation.mutate({
        id: editingAppointment.id,
        updates: {
          client_id: formData.client_id,
          professional_id: formData.professional_id,
          service_id: formData.service_id,
          date: formData.date,
          start_time: formData.start_time,
          end_time,
          price: service.price,
          notes: formData.notes || undefined,
        },
      });
    }
  };

  const handleStatusChange = (id: string, status: Appointment['status']) => {
    updateMutation.mutate({ id, updates: { status } });
  };

  const handleDelete = () => {
    if (editingAppointment) {
      deleteMutation.mutate(editingAppointment.id);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando agendamentos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <AdminHeader
        title="Agenda"
        subtitle="Gerencie os agendamentos do seu salão"
      />

      <div className="p-6 space-y-6">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={handlePrevious}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={handleNext}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={() => setCurrentDate(new Date())}>
              Hoje
            </Button>
            <span className="font-semibold">
              {viewMode === 'week'
                ? `${format(weekStart, "d 'de' MMM", { locale: ptBR })} - ${format(addDays(weekStart, 6), "d 'de' MMM", { locale: ptBR })}`
                : format(currentDate, "EEEE, d 'de' MMMM", { locale: ptBR })
              }
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Select value={selectedProfessional} onValueChange={setSelectedProfessional}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar profissional" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os profissionais</SelectItem>
                {professionals.map(p => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Dia</SelectItem>
                <SelectItem value="week">Semana</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="gradient" onClick={() => setIsModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Agendamento
            </Button>
          </div>
        </div>

        {/* Calendar Grid */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <div className="min-w-[800px]">
                {/* Header */}
                <div className="grid grid-cols-8 border-b">
                  <div className="p-3 text-sm font-medium text-muted-foreground">
                    <Clock className="h-4 w-4" />
                  </div>
                  {(viewMode === 'week' ? weekDays : [currentDate]).map((day) => {
                    const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
                    return (
                      <div
                        key={day.toISOString()}
                        className={cn(
                          'p-3 text-center border-l',
                          isToday && 'bg-primary-light'
                        )}
                      >
                        <p className="text-sm text-muted-foreground">
                          {format(day, 'EEE', { locale: ptBR })}
                        </p>
                        <p className={cn(
                          'text-lg font-semibold',
                          isToday && 'text-primary'
                        )}>
                          {format(day, 'd')}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Time Grid */}
                <div className="relative">
                  {timeSlots.map((time) => (
                    <div key={time} className="grid grid-cols-8 border-b min-h-[60px]">
                      <div className="p-2 text-xs text-muted-foreground text-right pr-3">
                        {time}
                      </div>
                      {(viewMode === 'week' ? weekDays : [currentDate]).map((day) => {
                        const dayAppointments = getAppointmentsForDay(day).filter(a => {
                          // Normalizar o formato do horário (remover segundos se houver)
                          const aptTime = a.start_time.includes(':') 
                            ? a.start_time.split(':').slice(0, 2).join(':')
                            : a.start_time;
                          
                          // Comparar exatamente
                          return aptTime === time;
                        });
                        return (
                          <div
                            key={`${day.toISOString()}-${time}`}
                            className="border-l p-1 relative"
                          >
                            {dayAppointments.map((apt) => {
                              const client = clients.find(c => c.id === apt.client_id);
                              const service = services.find(s => s.id === apt.service_id);
                              return (
                                <div
                                  key={apt.id}
                                  className={cn(
                                    'absolute inset-x-1 p-2 rounded-lg text-xs cursor-pointer transition-all hover:scale-[1.02] z-10',
                                    'bg-primary-light border-l-4 border-primary'
                                  )}
                                  style={{
                                    top: '2px',
                                    minHeight: '56px',
                                  }}
                                  onClick={() => handleEdit(apt)}
                                >
                                  <div className="flex items-center gap-1 mb-1">
                                    <div className={cn('h-2 w-2 rounded-full', getStatusColor(apt.status))} />
                                    <span className="font-medium truncate">{client?.name || 'Cliente'}</span>
                                  </div>
                                  <p className="text-muted-foreground truncate">{service?.name || 'Serviço'}</p>
                                  <p className="text-[10px] text-muted-foreground">{apt.start_time} - {apt.end_time}</p>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-sm text-muted-foreground">Legenda:</span>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-success" />
            <span className="text-sm">Confirmado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-warning" />
            <span className="text-sm">Pendente</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-info" />
            <span className="text-sm">Concluído</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-destructive" />
            <span className="text-sm">Cancelado</span>
          </div>
        </div>
      </div>

      {/* New/Edit Appointment Modal */}
      <Dialog open={isModalOpen || !!editingAppointment} onOpenChange={(open) => {
        if (!open) {
          setIsModalOpen(false);
          setEditingAppointment(null);
          setFormData({
            client_id: '',
            professional_id: '',
            service_id: '',
            date: format(new Date(), 'yyyy-MM-dd'),
            start_time: '09:00',
            notes: '',
          });
        }
      }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingAppointment ? 'Editar Agendamento' : 'Novo Agendamento'}</DialogTitle>
            <DialogDescription>
              {editingAppointment ? 'Atualize os dados do agendamento' : 'Preencha os dados para criar um novo agendamento'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Cliente *</Label>
              <Select
                value={formData.client_id}
                onValueChange={(v) => setFormData({ ...formData, client_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map(c => (
                    <SelectItem key={c.id} value={c.id}>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {c.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Profissional *</Label>
              <Select
                value={formData.professional_id}
                onValueChange={(v) => setFormData({ ...formData, professional_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o profissional" />
                </SelectTrigger>
                <SelectContent>
                  {professionals.map(p => (
                    <SelectItem key={p.id} value={p.id}>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={p.avatar} />
                          <AvatarFallback className="text-[10px]">{p.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        {p.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Serviço *</Label>
              <Select
                value={formData.service_id}
                onValueChange={(v) => setFormData({ ...formData, service_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o serviço" />
                </SelectTrigger>
                <SelectContent>
                  {services.map(s => (
                    <SelectItem key={s.id} value={s.id}>
                      <div className="flex items-center gap-2">
                        <Scissors className="h-4 w-4" />
                        {s.name} - R$ {s.price.toFixed(2)}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data *</Label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Horário *</Label>
                <Select
                  value={formData.start_time}
                  onValueChange={(v) => setFormData({ ...formData, start_time: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map(t => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Observações</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Observações sobre o agendamento..."
                rows={3}
              />
            </div>
          </div>
          {editingAppointment && (
            <div className="mt-4 pt-4 border-t space-y-3">
              <p className="text-sm text-muted-foreground font-medium">Ações rápidas:</p>
              <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleStatusChange(editingAppointment.id, 'confirmed')}
                disabled={editingAppointment.status === 'confirmed' || updateMutation.isPending}
              >
                <Check className="h-4 w-4 mr-2" />
                Confirmar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleStatusChange(editingAppointment.id, 'completed')}
                disabled={editingAppointment.status === 'completed' || updateMutation.isPending}
              >
                Concluir
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleStatusChange(editingAppointment.id, 'cancelled')}
                disabled={editingAppointment.status === 'cancelled' || updateMutation.isPending}
              >
                Cancelar
              </Button>
              </div>
              {editingAppointment.status === 'completed' && (
                <div className="mt-3 pt-3 border-t">
                  <div className="flex items-center gap-2 mb-2">
                    <p className="text-sm font-medium">Link de avaliação:</p>
                    {hasReview && (
                      <Badge variant="soft-success" className="gap-1">
                        <Star className="h-3 w-3 fill-warning text-warning" />
                        Já avaliado
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      value={`${window.location.origin}/avaliar/${editingAppointment.id}`}
                      readOnly
                      className="font-mono text-xs bg-muted"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyReviewLink(editingAppointment.id)}
                      className="shrink-0"
                    >
                      {copiedReviewLink ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2 text-success" />
                          Copiado!
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-2" />
                          Copiar
                        </>
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {hasReview 
                      ? 'Este agendamento já foi avaliado pelo cliente'
                      : 'Envie este link para o cliente avaliar o atendimento'}
                  </p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsModalOpen(false);
                setEditingAppointment(null);
              }}
            >
              Cancelar
            </Button>
            {editingAppointment && (
              <Button
                variant="outline"
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {deleteMutation.isPending ? 'Removendo...' : 'Remover'}
              </Button>
            )}
            <Button
              variant="gradient"
              onClick={editingAppointment ? handleUpdate : handleCreate}
              disabled={
                !formData.client_id ||
                !formData.professional_id ||
                !formData.service_id ||
                createMutation.isPending ||
                updateMutation.isPending
              }
            >
              {editingAppointment
                ? (updateMutation.isPending ? 'Salvando...' : 'Salvar')
                : (createMutation.isPending ? 'Criando...' : 'Criar')
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
