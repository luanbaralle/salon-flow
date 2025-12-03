import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { reviewsService } from '@/services/reviews.service';
import { appointmentsService } from '@/services/appointments.service';
import { ReviewForm } from '@/components/reviews/ReviewForm';
import { CheckCircle, Star, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function ReviewPage() {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);

  // Buscar agendamento
  const { data: appointment, isLoading: appointmentLoading } = useQuery({
    queryKey: ['appointment', appointmentId],
    queryFn: () => appointmentId ? appointmentsService.getById(appointmentId) : null,
    enabled: !!appointmentId,
  });

  // Verificar se já existe avaliação
  const { data: existingReview } = useQuery({
    queryKey: ['review', appointmentId],
    queryFn: () => appointmentId ? reviewsService.getByAppointment(appointmentId) : null,
    enabled: !!appointmentId,
  });

  // Criar avaliação
  const createMutation = useMutation({
    mutationFn: ({ rating, comment }: { rating: number; comment?: string }) => {
      if (!appointmentId || !appointment) throw new Error('Agendamento não encontrado');
      return reviewsService.create(appointment.tenant_id, {
        appointmentId,
        rating,
        comment,
      });
    },
    onSuccess: () => {
      setSubmitted(true);
      toast({
        title: 'Avaliação enviada!',
        description: 'Obrigado pelo seu feedback.',
      });
      setTimeout(() => {
        navigate('/');
      }, 3000);
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao enviar avaliação',
        description: error.message || 'Não foi possível enviar a avaliação.',
        variant: 'destructive',
      });
    },
  });

  useEffect(() => {
    if (existingReview) {
      setSubmitted(true);
    }
  }, [existingReview]);

  if (appointmentLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Agendamento não encontrado.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (appointment.status !== 'completed') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">
              Este agendamento ainda não foi concluído. Você só pode avaliar agendamentos concluídos.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (submitted || existingReview) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <CheckCircle className="h-16 w-16 text-success mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Avaliação Enviada!</h2>
            <p className="text-muted-foreground mb-4">
              Obrigado pelo seu feedback. Sua avaliação foi registrada com sucesso.
            </p>
            {existingReview && (
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-center gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-5 w-5 ${
                        star <= existingReview.rating
                          ? 'fill-warning text-warning'
                          : 'text-muted-foreground'
                      }`}
                    />
                  ))}
                </div>
                {existingReview.comment && (
                  <p className="text-sm text-foreground mt-2">{existingReview.comment}</p>
                )}
              </div>
            )}
            <Button onClick={() => navigate('/')} className="mt-4">
              Voltar ao início
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="text-center">Avalie seu Atendimento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">Detalhes do agendamento:</p>
            <p className="font-medium">{appointment.service?.name}</p>
            <p className="text-sm text-muted-foreground">
              {format(new Date(appointment.date), "d 'de' MMMM 'de' yyyy", { locale: ptBR })} às {appointment.start_time}
            </p>
            <p className="text-sm text-muted-foreground">
              Profissional: {appointment.professional?.name}
            </p>
          </div>

          <ReviewForm
            onSubmit={async (rating, comment) => {
              await createMutation.mutateAsync({ rating, comment });
            }}
            isLoading={createMutation.isPending}
          />
        </CardContent>
      </Card>
    </div>
  );
}

