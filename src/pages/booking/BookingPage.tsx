import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ServiceCard } from '@/components/booking/ServiceCard';
import { ProfessionalCard } from '@/components/booking/ProfessionalCard';
import { TimeSlotPicker } from '@/components/booking/TimeSlotPicker';
import { useApp } from '@/contexts/AppContext';
import { Sparkles, ArrowLeft, ArrowRight, Check, Calendar, Clock, User, Scissors, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const steps = ['Serviço', 'Profissional', 'Data e Hora', 'Seus Dados', 'Confirmação'];

export default function BookingPage() {
  const { services, professionals, salonSettings, addAppointment } = useApp();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedService, setSelectedService] = useState<string>('');
  const [selectedProfessional, setSelectedProfessional] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [clientData, setClientData] = useState({ name: '', email: '', phone: '' });
  const [booked, setBooked] = useState(false);

  const service = services.find(s => s.id === selectedService);
  const professional = professionals.find(p => p.id === selectedProfessional);
  const availableProfessionals = professionals.filter(p => p.services.includes(selectedService));

  const handleNext = () => currentStep < steps.length - 1 && setCurrentStep(currentStep + 1);
  const handleBack = () => currentStep > 0 && setCurrentStep(currentStep - 1);

  const handleConfirm = () => {
    if (service && professional && selectedDate && selectedTime) {
      const endHour = parseInt(selectedTime.split(':')[0]) + Math.floor(service.duration / 60);
      const endMinute = (parseInt(selectedTime.split(':')[1]) + service.duration % 60) % 60;
      addAppointment({
        clientId: `client-${Date.now()}`, clientName: clientData.name, professionalId: professional.id, professionalName: professional.name,
        serviceId: service.id, serviceName: service.name, date: format(selectedDate, 'yyyy-MM-dd'), startTime: selectedTime,
        endTime: `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`, status: 'pending', price: service.price,
      });
      setBooked(true);
    }
  };

  if (booked) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="p-8">
            <div className="h-16 w-16 rounded-full bg-success-light flex items-center justify-center mx-auto mb-6"><Check className="h-8 w-8 text-success" /></div>
            <h2 className="text-2xl font-display font-bold mb-2">Agendamento Confirmado!</h2>
            <p className="text-muted-foreground mb-6">Você receberá uma confirmação por email.</p>
            <div className="text-left bg-muted p-4 rounded-lg space-y-2 text-sm">
              <p><strong>Serviço:</strong> {service?.name}</p>
              <p><strong>Profissional:</strong> {professional?.name}</p>
              <p><strong>Data:</strong> {selectedDate && format(selectedDate, "dd/MM/yyyy")}</p>
              <p><strong>Horário:</strong> {selectedTime}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-background border-b p-4">
        <div className="container mx-auto flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center"><Sparkles className="h-5 w-5 text-primary-foreground" /></div>
          <div><h1 className="font-display font-bold">{salonSettings.name}</h1><p className="text-sm text-muted-foreground">Agendamento Online</p></div>
        </div>
      </header>

      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-center mb-8">
          {steps.map((step, i) => (
            <div key={step} className="flex items-center">
              <div className={cn('h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium', i < currentStep ? 'bg-success text-success-foreground' : i === currentStep ? 'gradient-primary text-primary-foreground' : 'bg-muted text-muted-foreground')}>
                {i < currentStep ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              {i < steps.length - 1 && <div className={cn('w-12 h-1 mx-2 rounded', i < currentStep ? 'bg-success' : 'bg-muted')} />}
            </div>
          ))}
        </div>

        <motion.div key={currentStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="max-w-3xl mx-auto">
          {currentStep === 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-display font-bold text-center mb-6">Escolha o serviço</h2>
              {services.map(s => <ServiceCard key={s.id} service={s} selected={selectedService === s.id} onClick={() => setSelectedService(s.id)} />)}
            </div>
          )}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-display font-bold text-center mb-6">Escolha o profissional</h2>
              {availableProfessionals.map(p => <ProfessionalCard key={p.id} professional={p} selected={selectedProfessional === p.id} onClick={() => setSelectedProfessional(p.id)} />)}
            </div>
          )}
          {currentStep === 2 && (
            <div><h2 className="text-2xl font-display font-bold text-center mb-6">Escolha data e horário</h2><TimeSlotPicker professionalId={selectedProfessional} selectedDate={selectedDate} selectedTime={selectedTime} onDateChange={setSelectedDate} onTimeChange={setSelectedTime} /></div>
          )}
          {currentStep === 3 && (
            <Card><CardHeader><CardTitle>Seus dados</CardTitle></CardHeader><CardContent className="space-y-4">
              <div className="space-y-2"><Label>Nome</Label><Input value={clientData.name} onChange={e => setClientData({...clientData, name: e.target.value})} /></div>
              <div className="space-y-2"><Label>Email</Label><Input type="email" value={clientData.email} onChange={e => setClientData({...clientData, email: e.target.value})} /></div>
              <div className="space-y-2"><Label>Telefone</Label><Input value={clientData.phone} onChange={e => setClientData({...clientData, phone: e.target.value})} /></div>
            </CardContent></Card>
          )}
          {currentStep === 4 && (
            <Card><CardHeader><CardTitle>Confirme seu agendamento</CardTitle></CardHeader><CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg"><Scissors className="h-5 w-5 text-primary" /><div><p className="text-sm text-muted-foreground">Serviço</p><p className="font-medium">{service?.name}</p></div></div>
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg"><User className="h-5 w-5 text-primary" /><div><p className="text-sm text-muted-foreground">Profissional</p><p className="font-medium">{professional?.name}</p></div></div>
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg"><Calendar className="h-5 w-5 text-primary" /><div><p className="text-sm text-muted-foreground">Data e Hora</p><p className="font-medium">{selectedDate && format(selectedDate, "dd/MM/yyyy")} às {selectedTime}</p></div></div>
              <div className="flex items-center gap-3 p-3 bg-primary-light rounded-lg"><DollarSign className="h-5 w-5 text-primary" /><div><p className="text-sm text-muted-foreground">Total</p><p className="font-bold text-primary text-lg">R$ {service?.price}</p></div></div>
            </CardContent></Card>
          )}
        </motion.div>

        <div className="flex justify-between max-w-3xl mx-auto mt-8">
          <Button variant="outline" onClick={handleBack} disabled={currentStep === 0}><ArrowLeft className="h-4 w-4" />Voltar</Button>
          {currentStep < steps.length - 1 ? (
            <Button variant="gradient" onClick={handleNext} disabled={currentStep === 0 && !selectedService || currentStep === 1 && !selectedProfessional || currentStep === 2 && (!selectedDate || !selectedTime) || currentStep === 3 && !clientData.name}>Continuar<ArrowRight className="h-4 w-4" /></Button>
          ) : (
            <Button variant="hero" onClick={handleConfirm}>Confirmar Agendamento<Check className="h-4 w-4" /></Button>
          )}
        </div>
      </div>
    </div>
  );
}
