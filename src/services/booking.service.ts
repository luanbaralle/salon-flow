import { supabase } from '@/lib/supabase'
import { format } from 'date-fns'

export interface AvailableTimeSlot {
  time: string
  available: boolean
}

export interface BookingData {
  tenantId: string
  serviceId: string
  professionalId: string
  date: string
  startTime: string
  clientName: string
  clientEmail: string
  clientPhone?: string
}

export const bookingService = {
  /**
   * Buscar horários disponíveis para um profissional em uma data
   */
  async getAvailableTimeSlots(
    tenantId: string,
    professionalId: string,
    serviceId: string,
    date: string
  ): Promise<string[]> {
    // 1. Buscar disponibilidade do profissional
    const { data: professional, error: profError } = await supabase
      .from('professionals')
      .select('availability')
      .eq('id', professionalId)
      .eq('tenant_id', tenantId)
      .single()

    if (profError) throw profError
    
    // Se não houver disponibilidade configurada, usar horário padrão
    if (!professional?.availability || Object.keys(professional.availability).length === 0) {
      // Horário padrão: 09:00 às 18:00 de segunda a sábado
      const dateParts = date.split('-');
      const dateObj = new Date(Date.UTC(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2])));
      const dayOfWeek = dateObj.getUTCDay();
      
      // Domingo = 0, não trabalha
      if (dayOfWeek === 0) return [];
      
      // Gerar slots padrão (09:00 - 18:00)
      const slots: string[] = [];
      for (let hour = 9; hour < 18; hour++) {
        slots.push(`${hour.toString().padStart(2, '0')}:00`);
        slots.push(`${hour.toString().padStart(2, '0')}:30`);
      }
      
      // Verificar conflitos com agendamentos existentes
      const { data: existingAppointments } = await supabase
        .from('appointments')
        .select('start_time, end_time')
        .eq('tenant_id', tenantId)
        .eq('professional_id', professionalId)
        .eq('date', date)
        .in('status', ['pending', 'confirmed']);
      
      // Buscar duração do serviço
      const { data: service } = await supabase
        .from('services')
        .select('duration')
        .eq('id', serviceId)
        .eq('tenant_id', tenantId)
        .single();
      
      const serviceDuration = service?.duration || 60;
      
      // Filtrar slots ocupados
      const availableSlots = slots.filter(slot => {
        const [slotHour, slotMinute] = slot.split(':').map(Number);
        const slotStartMinutes = slotHour * 60 + slotMinute;
        const slotEndMinutes = slotStartMinutes + serviceDuration;

        const isAvailable = !existingAppointments?.some(apt => {
          const [aptStartHour, aptStartMinute] = apt.start_time.split(':').map(Number);
          const [aptEndHour, aptEndMinute] = apt.end_time.split(':').map(Number);
          const aptStartMinutes = aptStartHour * 60 + aptStartMinute;
          const aptEndMinutes = aptEndHour * 60 + aptEndMinute;

          return slotStartMinutes < aptEndMinutes && slotEndMinutes > aptStartMinutes;
        });

        return isAvailable;
      });
      
      return availableSlots;
    }

    // 2. Buscar duração do serviço
    const { data: service, error: serviceError } = await supabase
      .from('services')
      .select('duration')
      .eq('id', serviceId)
      .eq('tenant_id', tenantId)
      .single()

    if (serviceError) {
      console.error('Error fetching service:', serviceError);
      throw serviceError;
    }
    const serviceDuration = service?.duration || 60

    // 3. Determinar dia da semana
    // Usar UTC para evitar problemas de timezone
    const dateParts = date.split('-');
    const dateObj = new Date(Date.UTC(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2])));
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    const dayName = dayNames[dateObj.getUTCDay()] as keyof typeof professional.availability

    const availability = professional.availability[dayName]
    
    if (!availability || availability.open === false || !availability.start || !availability.end) {
      return [];
    }

    // 4. Gerar slots baseados na disponibilidade
    const slots: string[] = []
    const startParts = availability.start.split(':');
    const endParts = availability.end.split(':');
    const [startHour, startMinute] = [parseInt(startParts[0]), parseInt(startParts[1] || '0')];
    const [endHour, endMinute] = [parseInt(endParts[0]), parseInt(endParts[1] || '0')];

    // Gerar slots de 30 em 30 minutos
    for (let hour = startHour; hour <= endHour; hour++) {
      const startMin = hour === startHour ? startMinute : 0;
      const endMin = hour === endHour ? endMinute : 60;
      
      for (let minute = startMin; minute < endMin; minute += 30) {
        const slotTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        slots.push(slotTime)
      }
    }

    // 5. Buscar agendamentos existentes para este profissional nesta data
    const { data: existingAppointments, error: aptError } = await supabase
      .from('appointments')
      .select('start_time, end_time')
      .eq('tenant_id', tenantId)
      .eq('professional_id', professionalId)
      .eq('date', date)
      .in('status', ['pending', 'confirmed'])

    if (aptError) throw aptError

    // 6. Filtrar slots ocupados
    const availableSlots = slots.filter(slot => {
      const [slotHour, slotMinute] = slot.split(':').map(Number)
      const slotStartMinutes = slotHour * 60 + slotMinute
      const slotEndMinutes = slotStartMinutes + serviceDuration

      // Verificar se o slot conflita com algum agendamento existente
      const isAvailable = !existingAppointments?.some(apt => {
        const [aptStartHour, aptStartMinute] = apt.start_time.split(':').map(Number)
        const [aptEndHour, aptEndMinute] = apt.end_time.split(':').map(Number)
        const aptStartMinutes = aptStartHour * 60 + aptStartMinute
        const aptEndMinutes = aptEndHour * 60 + aptEndMinute

        // Conflito se o slot começa antes do agendamento terminar E termina depois do agendamento começar
        return slotStartMinutes < aptEndMinutes && slotEndMinutes > aptStartMinutes
      })

      return isAvailable
    })

    return availableSlots
  },

  /**
   * Criar agendamento (cria cliente se não existir)
   */
  async createBooking(data: BookingData) {
    // 1. Buscar ou criar cliente
    let clientId: string

    // Tentar encontrar cliente existente por email
    const { data: existingClient } = await supabase
      .from('clients')
      .select('id')
      .eq('tenant_id', data.tenantId)
      .eq('email', data.clientEmail)
      .single()

    if (existingClient) {
      clientId = existingClient.id
      // Atualizar dados do cliente se necessário
      await supabase
        .from('clients')
        .update({
          name: data.clientName,
          phone: data.clientPhone,
          updated_at: new Date().toISOString(),
        })
        .eq('id', clientId)
    } else {
      // Criar novo cliente
      const { data: newClient, error: clientError } = await supabase
        .from('clients')
        .insert({
          tenant_id: data.tenantId,
          name: data.clientName,
          email: data.clientEmail,
          phone: data.clientPhone,
          total_spent: 0,
          visit_count: 0,
        })
        .select()
        .single()

      if (clientError) throw clientError
      clientId = newClient.id
    }

    // 2. Buscar preço do serviço
    const { data: service, error: serviceError } = await supabase
      .from('services')
      .select('price, duration')
      .eq('id', data.serviceId)
      .eq('tenant_id', data.tenantId)
      .single()

    if (serviceError) throw serviceError

    // 3. Calcular end_time
    const [startHour, startMinute] = data.startTime.split(':').map(Number)
    const totalMinutes = startHour * 60 + startMinute + service.duration
    const endHour = Math.floor(totalMinutes / 60)
    const endMinute = totalMinutes % 60
    const endTime = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}:00`

    // 4. Criar agendamento
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .insert({
        tenant_id: data.tenantId,
        client_id: clientId,
        professional_id: data.professionalId,
        service_id: data.serviceId,
        date: data.date,
        start_time: data.startTime,
        end_time: endTime,
        price: service.price,
        status: 'pending',
      })
      .select()
      .single()

    if (appointmentError) throw appointmentError

    return appointment
  },
}

