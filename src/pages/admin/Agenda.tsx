import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminHeader } from '@/components/layout/AdminHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { appointmentsService, type Appointment } from '@/services/appointments.service';
import { professionalsService } from '@/services/professionals.service';
import { servicesService } from '@/services/services.service';
import { clientsService } from '@/services/clients.service';
import { reviewsService } from '@/services/reviews.service';
import { Calendar, ChevronLeft, ChevronRight, Plus, Clock, User, Scissors, Edit, Trash2, Check, Star, Copy, CheckCircle, List, Grid, UserPlus, Mail, Phone, Briefcase, DollarSign, Tag } from 'lucide-react';
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
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>('today');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [copiedReviewLink, setCopiedReviewLink] = useState(false);
  const [hasReview, setHasReview] = useState(false);
  const [showListView, setShowListView] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isProfessionalModalOpen, setIsProfessionalModalOpen] = useState(false);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [newClientData, setNewClientData] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [newProfessionalData, setNewProfessionalData] = useState({
    name: '',
    specialty: '',
  });
  const [newServiceData, setNewServiceData] = useState({
    name: '',
    duration: 60,
    price: 0,
    category: '',
  });
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
  const { data: professionals = [], refetch: refetchProfessionals } = useQuery({
    queryKey: ['professionals', tenant?.id],
    queryFn: () => professionalsService.getAll(tenant!.id),
    enabled: !!tenant?.id,
  });

  // Buscar serviços
  const { data: services = [], refetch: refetchServices } = useQuery({
    queryKey: ['services', tenant?.id],
    queryFn: () => servicesService.getAll(tenant!.id),
    enabled: !!tenant?.id,
  });

  // Obter categorias únicas dos serviços existentes
  const serviceCategories = useMemo(() => {
    return [...new Set(services.map(s => s.category))];
  }, [services]);

  // Buscar clientes
  const { data: clients = [], refetch: refetchClients } = useQuery({
    queryKey: ['clients', tenant?.id],
    queryFn: () => clientsService.getAll(tenant!.id),
    enabled: !!tenant?.id,
  });

  // Criar cliente rapidamente
  const createClientMutation = useMutation({
    mutationFn: (data: typeof newClientData) =>
      clientsService.create(tenant!.id, {
        name: data.name,
        email: data.email,
        phone: data.phone || undefined,
      }),
    onSuccess: async (newClient) => {
      await refetchClients();
      setFormData({ ...formData, client_id: newClient.id });
      setIsClientModalOpen(false);
      setNewClientData({ name: '', email: '', phone: '' });
      toast({
        title: 'Cliente cadastrado!',
        description: `${newClient.name} foi adicionado e selecionado automaticamente.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao cadastrar cliente',
        description: error.message || 'Ocorreu um erro ao cadastrar o cliente.',
        variant: 'destructive',
      });
    },
  });

  // Criar profissional rapidamente
  const createProfessionalMutation = useMutation({
    mutationFn: (data: typeof newProfessionalData) =>
      professionalsService.create(tenant!.id, {
        name: data.name,
        specialty: data.specialty || undefined,
        commission: 40,
      }),
    onSuccess: async (newProfessional) => {
      await refetchProfessionals();
      setFormData({ ...formData, professional_id: newProfessional.id });
      setIsProfessionalModalOpen(false);
      setNewProfessionalData({ name: '', specialty: '' });
      toast({
        title: 'Profissional cadastrado!',
        description: `${newProfessional.name} foi adicionado e selecionado automaticamente.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao cadastrar profissional',
        description: error.message || 'Ocorreu um erro ao cadastrar o profissional.',
        variant: 'destructive',
      });
    },
  });

  // Criar serviço rapidamente
  const createServiceMutation = useMutation({
    mutationFn: (data: typeof newServiceData) =>
      servicesService.create(tenant!.id, {
        name: data.name,
        duration: data.duration,
        price: data.price,
        category: data.category || 'Geral',
      }),
    onSuccess: async (newService) => {
      await refetchServices();
      setFormData({ ...formData, service_id: newService.id });
      setIsServiceModalOpen(false);
      setNewServiceData({ name: '', duration: 60, price: 0, category: '' });
      toast({
        title: 'Serviço cadastrado!',
        description: `${newService.name} foi adicionado e selecionado automaticamente.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao cadastrar serviço',
        description: error.message || 'Ocorreu um erro ao cadastrar o serviço.',
        variant: 'destructive',
      });
    },
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

  // Filtrar agendamentos para a lista
  const filteredAppointments = useMemo(() => {
    let filtered = [...appointments];

    // Filtrar por profissional
    if (selectedProfessional !== 'all') {
      filtered = filtered.filter(a => a.professional_id === selectedProfessional);
    }

    // Filtrar por status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(a => a.status === selectedStatus);
    }

    // Filtrar por data
    const today = format(new Date(), 'yyyy-MM-dd');
    if (selectedDateFilter === 'today') {
      filtered = filtered.filter(a => {
        const aptDate = typeof a.date === 'string' ? a.date.split('T')[0] : format(new Date(a.date), 'yyyy-MM-dd');
        return aptDate === today;
      });
    } else if (selectedDateFilter === 'week') {
      const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
      const weekEnd = addDays(weekStart, 6);
      filtered = filtered.filter(a => {
        const aptDate = typeof a.date === 'string' ? a.date.split('T')[0] : format(new Date(a.date), 'yyyy-MM-dd');
        return aptDate >= format(weekStart, 'yyyy-MM-dd') && aptDate <= format(weekEnd, 'yyyy-MM-dd');
      });
    } else if (selectedDateFilter === 'month') {
      const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      const monthEnd = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);
      filtered = filtered.filter(a => {
        const aptDate = typeof a.date === 'string' ? a.date.split('T')[0] : format(new Date(a.date), 'yyyy-MM-dd');
        return aptDate >= format(monthStart, 'yyyy-MM-dd') && aptDate <= format(monthEnd, 'yyyy-MM-dd');
      });
    }

    // Ordenar por data e horário
    return filtered.sort((a, b) => {
      const dateA = typeof a.date === 'string' ? a.date : format(new Date(a.date), 'yyyy-MM-dd');
      const dateB = typeof b.date === 'string' ? b.date : format(new Date(b.date), 'yyyy-MM-dd');
      if (dateA !== dateB) {
        return dateA.localeCompare(dateB);
      }
      return a.start_time.localeCompare(b.start_time);
    });
  }, [appointments, selectedProfessional, selectedStatus, selectedDateFilter]);

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

            <Button 
              variant={showListView ? "default" : "outline"} 
              size="icon"
              onClick={() => setShowListView(!showListView)}
              title={showListView ? "Mostrar calendário" : "Mostrar lista"}
            >
              {showListView ? <Grid className="h-4 w-4" /> : <List className="h-4 w-4" />}
            </Button>

            <Button variant="gradient" onClick={() => setIsModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Agendamento
            </Button>
          </div>
        </div>

        {/* Lista de Agendamentos */}
        {showListView && (
          <Card>
            <CardContent className="p-0">
              <div className="p-4 border-b space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Lista de Agendamentos</h3>
                  <div className="flex items-center gap-2">
                    <Select value={selectedDateFilter} onValueChange={setSelectedDateFilter}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas as datas</SelectItem>
                        <SelectItem value="today">Hoje</SelectItem>
                        <SelectItem value="week">Esta semana</SelectItem>
                        <SelectItem value="month">Este mês</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os status</SelectItem>
                        <SelectItem value="pending">Pendente</SelectItem>
                        <SelectItem value="confirmed">Confirmado</SelectItem>
                        <SelectItem value="completed">Concluído</SelectItem>
                        <SelectItem value="cancelled">Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <div className="p-4">
                {filteredAppointments.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum agendamento encontrado</p>
                    <p className="text-sm mt-2">Ajuste os filtros ou crie um novo agendamento</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredAppointments.map((appointment) => {
                      const client = clients.find(c => c.id === appointment.client_id);
                      const service = services.find(s => s.id === appointment.service_id);
                      const professional = professionals.find(p => p.id === appointment.professional_id);
                      const aptDate = typeof appointment.date === 'string' 
                        ? appointment.date.split('T')[0] 
                        : format(new Date(appointment.date), 'yyyy-MM-dd');
                      const isToday = aptDate === format(new Date(), 'yyyy-MM-dd');
                      
                      return (
                        <div
                          key={appointment.id}
                          className={cn(
                            "flex items-center gap-4 p-4 rounded-lg border transition-all hover:shadow-md cursor-pointer",
                            !appointment.read && "bg-primary-light/20 border-primary/30",
                            appointment.status === 'cancelled' && "opacity-60"
                          )}
                          onClick={() => handleEdit(appointment)}
                        >
                          <div className="flex items-center justify-center w-16 text-center shrink-0">
                            <div className="text-center">
                              <p className={cn(
                                "text-sm font-semibold",
                                isToday && "text-primary"
                              )}>
                                {appointment.start_time.substring(0, 5)}
                              </p>
                              {isToday && (
                                <p className="text-xs text-primary">Hoje</p>
                              )}
                              {!isToday && (
                                <p className="text-xs text-muted-foreground">
                                  {format(new Date(aptDate), "d 'de' MMM", { locale: ptBR })}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className={cn(
                            "h-12 w-1 rounded-full shrink-0",
                            appointment.status === 'confirmed' && "bg-success",
                            appointment.status === 'pending' && "bg-warning",
                            appointment.status === 'completed' && "bg-info",
                            appointment.status === 'cancelled' && "bg-destructive"
                          )} />
                          <Avatar className="h-12 w-12 shrink-0">
                            <AvatarImage src={professional?.avatar} />
                            <AvatarFallback className="bg-primary-light text-primary">
                              {professional?.name?.charAt(0) || 'P'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-semibold truncate">{client?.name || 'Cliente'}</p>
                              <Badge 
                                variant={
                                  appointment.status === 'confirmed' ? 'soft-success' : 
                                  appointment.status === 'pending' ? 'soft-warning' : 
                                  appointment.status === 'completed' ? 'soft-info' : 
                                  'destructive'
                                }
                                className="text-xs"
                              >
                                {getStatusLabel(appointment.status)}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground truncate flex items-center gap-2">
                              <Scissors className="h-3 w-3" />
                              {service?.name || 'Serviço'}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                              <User className="h-3 w-3" />
                              {professional?.name || 'Profissional'}
                              <span className="mx-1">•</span>
                              <Clock className="h-3 w-3" />
                              {appointment.start_time.substring(0, 5)} - {appointment.end_time.substring(0, 5)}
                              {appointment.price && (
                                <>
                                  <span className="mx-1">•</span>
                                  R$ {appointment.price.toFixed(2)}
                                </>
                              )}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(appointment);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Calendar Grid */}
        {!showListView && (
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
                                    'absolute inset-x-1 p-2 rounded-lg text-xs cursor-pointer transition-all hover:scale-[1.02] hover:shadow-md z-10',
                                    'bg-primary-light border-l-4',
                                    apt.status === 'confirmed' && 'border-success',
                                    apt.status === 'pending' && 'border-warning',
                                    apt.status === 'completed' && 'border-info',
                                    apt.status === 'cancelled' && 'border-destructive',
                                    !apt.status && 'border-primary'
                                  )}
                                  style={{
                                    top: '2px',
                                    minHeight: '56px',
                                  }}
                                  onClick={() => handleEdit(apt)}
                                >
                                  <div className="flex items-center gap-1 mb-1">
                                    <div className={cn('h-2 w-2 rounded-full', getStatusColor(apt.status))} />
                                    <span className="font-semibold truncate">{client?.name || 'Cliente'}</span>
                                  </div>
                                  <p className="text-muted-foreground truncate font-medium">{service?.name || 'Serviço'}</p>
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
        )}

        {/* Legend */}
        {!showListView && (
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
        )}
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
              <div className="flex items-center justify-between">
                <Label>Cliente *</Label>
                {clients.length === 0 && (
                  <span className="text-xs text-muted-foreground">Nenhum cliente cadastrado</span>
                )}
              </div>
              <div className="flex gap-2">
                <Select
                  value={formData.client_id}
                  onValueChange={(v) => {
                    if (v === 'new-client') {
                      setIsClientModalOpen(true);
                    } else {
                      setFormData({ ...formData, client_id: v });
                    }
                  }}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder={clients.length === 0 ? "Cadastre um cliente primeiro" : "Selecione o cliente"} />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.length === 0 ? (
                      <SelectItem value="new-client" className="text-primary font-medium">
                        <div className="flex items-center gap-2">
                          <UserPlus className="h-4 w-4" />
                          Cadastrar novo cliente
                        </div>
                      </SelectItem>
                    ) : (
                      <>
                        {clients.map(c => (
                          <SelectItem key={c.id} value={c.id}>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              {c.name}
                            </div>
                          </SelectItem>
                        ))}
                        <div className="border-t my-1" />
                        <SelectItem value="new-client" className="text-primary font-medium">
                          <div className="flex items-center gap-2">
                            <UserPlus className="h-4 w-4" />
                            Cadastrar novo cliente
                          </div>
                        </SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Profissional *</Label>
                {professionals.length === 0 && (
                  <span className="text-xs text-muted-foreground">Nenhum profissional cadastrado</span>
                )}
              </div>
              <Select
                value={formData.professional_id}
                onValueChange={(v) => {
                  if (v === 'new-professional') {
                    setIsProfessionalModalOpen(true);
                  } else {
                    setFormData({ ...formData, professional_id: v });
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder={professionals.length === 0 ? "Cadastre um profissional primeiro" : "Selecione o profissional"} />
                </SelectTrigger>
                <SelectContent>
                  {professionals.length === 0 ? (
                    <SelectItem value="new-professional" className="text-primary font-medium">
                      <div className="flex items-center gap-2">
                        <UserPlus className="h-4 w-4" />
                        Cadastrar novo profissional
                      </div>
                    </SelectItem>
                  ) : (
                    <>
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
                      <div className="border-t my-1" />
                      <SelectItem value="new-professional" className="text-primary font-medium">
                        <div className="flex items-center gap-2">
                          <UserPlus className="h-4 w-4" />
                          Cadastrar novo profissional
                        </div>
                      </SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Serviço *</Label>
                {services.length === 0 && (
                  <span className="text-xs text-muted-foreground">Nenhum serviço cadastrado</span>
                )}
              </div>
              <Select
                value={formData.service_id}
                onValueChange={(v) => {
                  if (v === 'new-service') {
                    setIsServiceModalOpen(true);
                  } else {
                    setFormData({ ...formData, service_id: v });
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder={services.length === 0 ? "Cadastre um serviço primeiro" : "Selecione o serviço"} />
                </SelectTrigger>
                <SelectContent>
                  {services.length === 0 ? (
                    <SelectItem value="new-service" className="text-primary font-medium">
                      <div className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Cadastrar novo serviço
                      </div>
                    </SelectItem>
                  ) : (
                    <>
                      {services.map(s => (
                        <SelectItem key={s.id} value={s.id}>
                          <div className="flex items-center gap-2">
                            <Scissors className="h-4 w-4" />
                            {s.name} - R$ {s.price.toFixed(2)}
                          </div>
                        </SelectItem>
                      ))}
                      <div className="border-t my-1" />
                      <SelectItem value="new-service" className="text-primary font-medium">
                        <div className="flex items-center gap-2">
                          <Plus className="h-4 w-4" />
                          Cadastrar novo serviço
                        </div>
                      </SelectItem>
                    </>
                  )}
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
                onClick={() => setDeleteDialogOpen(true)}
                disabled={deleteMutation.isPending}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Remover
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

      {/* Modal de Confirmação de Exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover este agendamento? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                handleDelete();
                setDeleteDialogOpen(false);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal de Cadastro Rápido de Cliente */}
      <Dialog open={isClientModalOpen} onOpenChange={setIsClientModalOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" />
              Cadastrar Novo Cliente
            </DialogTitle>
            <DialogDescription>
              Preencha os dados básicos do cliente para continuar com o agendamento
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome *</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Nome completo"
                  className="pl-10"
                  value={newClientData.name}
                  onChange={(e) => setNewClientData({ ...newClientData, name: e.target.value })}
                  autoFocus
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="email@exemplo.com"
                  className="pl-10"
                  value={newClientData.email}
                  onChange={(e) => setNewClientData({ ...newClientData, email: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Telefone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="tel"
                  placeholder="(11) 99999-9999"
                  className="pl-10"
                  value={newClientData.phone}
                  onChange={(e) => setNewClientData({ ...newClientData, phone: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsClientModalOpen(false);
                setNewClientData({ name: '', email: '', phone: '' });
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="gradient"
              onClick={() => {
                if (!newClientData.name || !newClientData.email) {
                  toast({
                    title: 'Campos obrigatórios',
                    description: 'Nome e email são obrigatórios.',
                    variant: 'destructive',
                  });
                  return;
                }
                createClientMutation.mutate(newClientData);
              }}
              disabled={createClientMutation.isPending || !newClientData.name || !newClientData.email}
            >
              {createClientMutation.isPending ? 'Cadastrando...' : 'Cadastrar e Continuar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Cadastro Rápido de Profissional */}
      <Dialog open={isProfessionalModalOpen} onOpenChange={setIsProfessionalModalOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary" />
              Cadastrar Novo Profissional
            </DialogTitle>
            <DialogDescription>
              Preencha os dados básicos do profissional para continuar com o agendamento
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome *</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Nome completo"
                  className="pl-10"
                  value={newProfessionalData.name}
                  onChange={(e) => setNewProfessionalData({ ...newProfessionalData, name: e.target.value })}
                  autoFocus
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Especialidade</Label>
              <div className="relative">
                <Scissors className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Ex: Cabeleireira, Manicure, Esteticista..."
                  className="pl-10"
                  value={newProfessionalData.specialty}
                  onChange={(e) => setNewProfessionalData({ ...newProfessionalData, specialty: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsProfessionalModalOpen(false);
                setNewProfessionalData({ name: '', specialty: '' });
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="gradient"
              onClick={() => {
                if (!newProfessionalData.name) {
                  toast({
                    title: 'Campo obrigatório',
                    description: 'Nome é obrigatório.',
                    variant: 'destructive',
                  });
                  return;
                }
                createProfessionalMutation.mutate(newProfessionalData);
              }}
              disabled={createProfessionalMutation.isPending || !newProfessionalData.name}
            >
              {createProfessionalMutation.isPending ? 'Cadastrando...' : 'Cadastrar e Continuar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Cadastro Rápido de Serviço */}
      <Dialog open={isServiceModalOpen} onOpenChange={setIsServiceModalOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Scissors className="h-5 w-5 text-primary" />
              Cadastrar Novo Serviço
            </DialogTitle>
            <DialogDescription>
              Preencha os dados básicos do serviço para continuar com o agendamento
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome *</Label>
              <div className="relative">
                <Scissors className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Ex: Corte de Cabelo, Manicure..."
                  className="pl-10"
                  value={newServiceData.name}
                  onChange={(e) => setNewServiceData({ ...newServiceData, name: e.target.value })}
                  autoFocus
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Duração (min) *</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="number"
                    placeholder="60"
                    className="pl-10"
                    min="15"
                    step="15"
                    value={newServiceData.duration}
                    onChange={(e) => setNewServiceData({ ...newServiceData, duration: parseInt(e.target.value) || 60 })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Preço (R$) *</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="number"
                    placeholder="0.00"
                    className="pl-10"
                    min="0"
                    step="0.01"
                    value={newServiceData.price}
                    onChange={(e) => setNewServiceData({ ...newServiceData, price: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Categoria</Label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Ex: Cabelo, Unhas, Estética..."
                  className="pl-10"
                  value={newServiceData.category}
                  onChange={(e) => setNewServiceData({ ...newServiceData, category: e.target.value })}
                  list="categories"
                />
                {serviceCategories.length > 0 && (
                  <datalist id="categories">
                    {serviceCategories.map(cat => (
                      <option key={cat} value={cat} />
                    ))}
                  </datalist>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsServiceModalOpen(false);
                setNewServiceData({ name: '', duration: 60, price: 0, category: '' });
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="gradient"
              onClick={() => {
                if (!newServiceData.name || !newServiceData.duration || !newServiceData.price) {
                  toast({
                    title: 'Campos obrigatórios',
                    description: 'Nome, duração e preço são obrigatórios.',
                    variant: 'destructive',
                  });
                  return;
                }
                createServiceMutation.mutate(newServiceData);
              }}
              disabled={createServiceMutation.isPending || !newServiceData.name || !newServiceData.duration || !newServiceData.price}
            >
              {createServiceMutation.isPending ? 'Cadastrando...' : 'Cadastrar e Continuar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
