import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { generateTimeSlots } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { CalendarDays, Clock } from 'lucide-react';

interface TimeSlotPickerProps {
  professionalId: string;
  selectedDate?: Date;
  selectedTime?: string;
  onDateChange: (date: Date | undefined) => void;
  onTimeChange: (time: string) => void;
}

export function TimeSlotPicker({
  professionalId,
  selectedDate,
  selectedTime,
  onDateChange,
  onTimeChange,
}: TimeSlotPickerProps) {
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);

  const handleDateChange = (date: Date | undefined) => {
    onDateChange(date);
    if (date) {
      const slots = generateTimeSlots(date, professionalId);
      setAvailableSlots(slots);
    } else {
      setAvailableSlots([]);
    }
  };

  const morningSlots = availableSlots.filter(slot => {
    const hour = parseInt(slot.split(':')[0]);
    return hour < 12;
  });

  const afternoonSlots = availableSlots.filter(slot => {
    const hour = parseInt(slot.split(':')[0]);
    return hour >= 12 && hour < 18;
  });

  const eveningSlots = availableSlots.filter(slot => {
    const hour = parseInt(slot.split(':')[0]);
    return hour >= 18;
  });

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Calendar */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <CalendarDays className="h-5 w-5 text-primary" />
            Selecione a data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateChange}
            disabled={(date) => {
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const maxDate = new Date();
              maxDate.setDate(maxDate.getDate() + 30);
              return date < today || date > maxDate || date.getDay() === 0;
            }}
            className="rounded-lg border p-3"
          />
        </CardContent>
      </Card>

      {/* Time Slots */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="h-5 w-5 text-primary" />
            Horários disponíveis
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!selectedDate ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CalendarDays className="h-12 w-12 text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground">
                Selecione uma data para ver os horários
              </p>
            </div>
          ) : availableSlots.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Clock className="h-12 w-12 text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground">
                Nenhum horário disponível nesta data
              </p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {morningSlots.length > 0 && (
                <div>
                  <Badge variant="soft-primary" className="mb-2">Manhã</Badge>
                  <div className="grid grid-cols-3 gap-2">
                    {morningSlots.map((slot) => (
                      <Button
                        key={slot}
                        variant={selectedTime === slot ? 'default' : 'outline'}
                        size="sm"
                        className={cn(
                          'transition-all',
                          selectedTime === slot && 'gradient-primary shadow-primary'
                        )}
                        onClick={() => onTimeChange(slot)}
                      >
                        {slot}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {afternoonSlots.length > 0 && (
                <div>
                  <Badge variant="soft-warning" className="mb-2">Tarde</Badge>
                  <div className="grid grid-cols-3 gap-2">
                    {afternoonSlots.map((slot) => (
                      <Button
                        key={slot}
                        variant={selectedTime === slot ? 'default' : 'outline'}
                        size="sm"
                        className={cn(
                          'transition-all',
                          selectedTime === slot && 'gradient-primary shadow-primary'
                        )}
                        onClick={() => onTimeChange(slot)}
                      >
                        {slot}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {eveningSlots.length > 0 && (
                <div>
                  <Badge variant="soft-info" className="mb-2">Noite</Badge>
                  <div className="grid grid-cols-3 gap-2">
                    {eveningSlots.map((slot) => (
                      <Button
                        key={slot}
                        variant={selectedTime === slot ? 'default' : 'outline'}
                        size="sm"
                        className={cn(
                          'transition-all',
                          selectedTime === slot && 'gradient-primary shadow-primary'
                        )}
                        onClick={() => onTimeChange(slot)}
                      >
                        {slot}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
