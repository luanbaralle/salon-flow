import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminHeader } from '@/components/layout/AdminHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { reviewsService, type Review } from '@/services/reviews.service';
import { Star, Trash2, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
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
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function AdminReviews() {
  const { tenant } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [deletingReview, setDeletingReview] = useState<Review | null>(null);
  const [ratingFilter, setRatingFilter] = useState<string>('all');

  // Buscar avaliações
  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['reviews', tenant?.id, ratingFilter],
    queryFn: () => reviewsService.getAll(tenant!.id),
    enabled: !!tenant?.id,
  });

  // Filtrar por rating
  const filteredReviews = ratingFilter === 'all'
    ? reviews
    : reviews.filter(r => r.rating === parseInt(ratingFilter));

  // Deletar avaliação
  const deleteMutation = useMutation({
    mutationFn: (reviewId: string) => reviewsService.delete(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', tenant?.id] });
      queryClient.invalidateQueries({ queryKey: ['professionals', tenant?.id] });
      setDeletingReview(null);
      toast({
        title: 'Avaliação removida',
        description: 'A avaliação foi removida com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao remover avaliação',
        description: error.message || 'Ocorreu um erro ao remover a avaliação.',
        variant: 'destructive',
      });
    },
  });

  // Estatísticas
  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
    : '0.0';
  const ratingDistribution = {
    5: reviews.filter(r => r.rating === 5).length,
    4: reviews.filter(r => r.rating === 4).length,
    3: reviews.filter(r => r.rating === 3).length,
    2: reviews.filter(r => r.rating === 2).length,
    1: reviews.filter(r => r.rating === 1).length,
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando avaliações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <AdminHeader 
        title="Avaliações" 
        subtitle={`${totalReviews} avaliações recebidas`} 
      />
      <div className="p-6 space-y-6">
        {/* Estatísticas */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-warning fill-warning" />
                <div>
                  <p className="text-sm text-muted-foreground">Avaliação Média</p>
                  <p className="text-2xl font-bold">{averageRating}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-warning fill-warning" />
                <div>
                  <p className="text-sm text-muted-foreground">Total de Avaliações</p>
                  <p className="text-2xl font-bold">{totalReviews}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div>
                <p className="text-sm text-muted-foreground">5 Estrelas</p>
                <p className="text-2xl font-bold">{ratingDistribution[5]}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div>
                <p className="text-sm text-muted-foreground">4 Estrelas</p>
                <p className="text-2xl font-bold">{ratingDistribution[4]}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={ratingFilter} onValueChange={setRatingFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por avaliação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as avaliações</SelectItem>
                <SelectItem value="5">5 estrelas</SelectItem>
                <SelectItem value="4">4 estrelas</SelectItem>
                <SelectItem value="3">3 estrelas</SelectItem>
                <SelectItem value="2">2 estrelas</SelectItem>
                <SelectItem value="1">1 estrela</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Lista de Avaliações */}
        {filteredReviews.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Star className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground">
                {ratingFilter === 'all' 
                  ? 'Nenhuma avaliação recebida ainda.' 
                  : 'Nenhuma avaliação encontrada com este filtro.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredReviews.map((review) => (
              <Card key={review.id}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={review.client?.avatar} />
                      <AvatarFallback className="bg-primary-light text-primary">
                        {review.client?.name?.charAt(0) || 'C'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{review.client?.name || 'Cliente'}</h3>
                            <Badge variant="soft-warning" className="gap-1">
                              <Star className="h-3 w-3 fill-warning text-warning" />
                              {review.rating}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            Avaliou{' '}
                            <span className="font-medium">{review.professional?.name}</span>
                            {' '}para o serviço{' '}
                            <span className="font-medium">{review.service?.name}</span>
                          </p>
                          {review.comment && (
                            <p className="text-sm text-foreground mt-2">{review.comment}</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-2">
                            {format(new Date(review.created_at), "d 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeletingReview(review)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={!!deletingReview} onOpenChange={(open) => !open && setDeletingReview(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover avaliação?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A avaliação será permanentemente removida.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingReview && deleteMutation.mutate(deletingReview.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}


