import { useState } from 'react';
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
import { useApp } from '@/contexts/AppContext';
import { Calendar, ChevronLeft, ChevronRight, Plus, Clock, User, Scissors } from 'lucide-react';
import { format, addDays, startOfWeek, addWeeks, subWeeks } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

type ViewMode = 'day' | 'week' | 'month';

const timeSlots = Array.from({ length: 24 }, (_, i) => {
  const hour = Math.floor(i / 2) + 8;
  const minute = i % 2 === 0 ? '00' : '30';
  return `${hour.toString().padStart(2, '0')}:${minute}`;
}).filter(t => {
  const hour = parseInt(t.split(':')[0]);
  return hour >= 8 && hour < 20;
});

export default function AdminAgenda() {
  const { appointments, professionals, services, clients, addAppointment, updateAppointment } = useApp();
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedProfessional, setSelectedProfessional] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [newAppointment, setNewAppointment] = useState({
    clientId: '',
    professionalId: '',
    serviceId: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    startTime: '09:00',
  });

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const getAppointmentsForDay = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return appointments.filter(a => {
      const matchDate = a.date === dateStr;
      const matchProfessional = selectedProfessional === 'all' || a.professionalId === selectedProfessional;
      return matchDate && matchProfessional;
    });
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

  const handleCreateAppointment = () => {
    const service = services.find(s => s.id === newAppointment.serviceId);
    const client = clients.find(c => c.id === newAppointment.clientId);
    const professional = professionals.find(p => p.id === newAppointment.professionalId);

    if (service && client && professional) {
      const startHour = parseInt(newAppointment.startTime.split(':')[0]);
      const startMinute = parseInt(newAppointment.startTime.split(':')[1]);
      const endMinute = startMinute + service.duration;
      const endHour = startHour + Math.floor(endMinute / 60);
      const endTime = `${endHour.toString().padStart(2, '0')}:${(endMinute % 60).toString().padStart(2, '0')}`;

      addAppointment({
        clientId: client.id,
        clientName: client.name,
        professionalId: professional.id,
        professionalName: professional.name,
        serviceId: service.id,
        serviceName: service.name,
        date: newAppointment.date,
        startTime: newAppointment.startTime,
        endTime,
        status: 'pending',
        price: service.price,
      });

      setIsModalOpen(false);
      setNewAppointment({
        clientId: '',
        professionalId: '',
        serviceId: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        startTime: '09:00',
      });
    }
  };

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
              <Plus className="h-4 w-4" />
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
                        const dayAppointments = getAppointmentsForDay(day).filter(
                          a => a.startTime === time
                        );
                        return (
                          <div
                            key={`${day.toISOString()}-${time}`}
                            className="border-l p-1 relative"
                          >
                            {dayAppointments.map((apt) => {
                              const professional = professionals.find(p => p.id === apt.professionalId);
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
                                  onClick={() => {
                                    setSelectedAppointment(apt);
                                  }}
                                >
                                  <div className="flex items-center gap-1 mb-1">
                                    <div className={cn('h-2 w-2 rounded-full', getStatusColor(apt.status))} />
                                    <span className="font-medium truncate">{apt.clientName}</span>
                                  </div>
                                  <p className="text-muted-foreground truncate">{apt.serviceName}</p>
                                  <p className="text-[10px] text-muted-foreground">{apt.startTime} - {apt.endTime}</p>
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

      {/* New Appointment Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Novo Agendamento</DialogTitle>
            <DialogDescription>
              Preencha os dados para criar um novo agendamento
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Cliente</Label>
              <Select
                value={newAppointment.clientId}
                onValueChange={(v) => setNewAppointment({ ...newAppointment, clientId: v })}
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
              <Label>Profissional</Label>
              <Select
                value={newAppointment.professionalId}
                onValueChange={(v) => setNewAppointment({ ...newAppointment, professionalId: v })}
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
              <Label>Serviço</Label>
              <Select
                value={newAppointment.serviceId}
                onValueChange={(v) => setNewAppointment({ ...newAppointment, serviceId: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o serviço" />
                </SelectTrigger>
                <SelectContent>
                  {services.map(s => (
                    <SelectItem key={s.id} value={s.id}>
                      <div className="flex items-center gap-2">
                        <Scissors className="h-4 w-4" />
                        {s.name} - R$ {s.price}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data</Label>
                <Input
                  type="date"
                  value={newAppointment.date}
                  onChange={(e) => setNewAppointment({ ...newAppointment, date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Horário</Label>
                <Select
                  value={newAppointment.startTime}
                  onValueChange={(v) => setNewAppointment({ ...newAppointment, startTime: v })}
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="gradient" onClick={handleCreateAppointment}>
              Criar Agendamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Appointment Details Modal */}
      <Dialog open={!!selectedAppointment} onOpenChange={() => setSelectedAppointment(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalhes do Agendamento</DialogTitle>
          </DialogHeader>
          {selectedAppointment && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-primary-light text-primary">
                    {selectedAppointment.clientName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{selectedAppointment.clientName}</p>
                  <p className="text-sm text-muted-foreground">{selectedAppointment.serviceName}</p>
                </div>
                <Badge variant={selectedAppointment.status} className="ml-auto">
                  {selectedAppointment.status === 'confirmed' && 'Confirmado'}
                  {selectedAppointment.status === 'pending' && 'Pendente'}
                  {selectedAppointment.status === 'cancelled' && 'Cancelado'}
                  {selectedAppointment.status === 'completed' && 'Concluído'}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Profissional</p>
                  <p className="font-medium">{selectedAppointment.professionalName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Valor</p>
                  <p className="font-medium">R$ {selectedAppointment.price}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Data</p>
                  <p className="font-medium">
                    {format(new Date(selectedAppointment.date), "dd/MM/yyyy")}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Horário</p>
                  <p className="font-medium">
                    {selectedAppointment.startTime} - {selectedAppointment.endTime}
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="soft-destructive"
              onClick={() => {
                updateAppointment(selectedAppointment.id, { status: 'cancelled' });
                setSelectedAppointment(null);
              }}
            >
              Cancelar Agendamento
            </Button>
            <Button
              variant="success"
              onClick={() => {
                updateAppointment(selectedAppointment.id, { status: 'confirmed' });
                setSelectedAppointment(null);
              }}
            >
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
