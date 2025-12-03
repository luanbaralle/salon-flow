import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminHeader } from '@/components/layout/AdminHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { notificationsService, type Notification } from '@/services/notifications.service';
import { Bell, Check, Calendar, DollarSign, Settings, Megaphone, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

export default function AdminNotifications() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterRead, setFilterRead] = useState<string>('all');

  // Buscar notificações
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications', profile?.id, filterCategory, filterRead],
    queryFn: () => notificationsService.getAll(profile!.id, {
      category: filterCategory !== 'all' ? filterCategory as any : undefined,
      read: filterRead !== 'all' ? filterRead === 'read' : undefined,
    }),
    enabled: !!profile?.id,
    refetchInterval: 30000, // Atualizar a cada 30 segundos
  });

  // Marcar como lida
  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => notificationsService.markAsRead(id),
    onSuccess: () => {
      // Invalidar todas as queries de notificações para sincronizar header e sidebar
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao marcar notificação',
        description: error.message || 'Ocorreu um erro.',
        variant: 'destructive',
      });
    },
  });

  // Marcar todas como lidas
  const markAllAsReadMutation = useMutation({
    mutationFn: () => notificationsService.markAllAsRead(profile!.id),
    onSuccess: () => {
      // Invalidar todas as queries de notificações para sincronizar header e sidebar
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast({
        title: 'Todas as notificações foram marcadas como lidas',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao marcar notificações',
        description: error.message || 'Ocorreu um erro.',
        variant: 'destructive',
      });
    },
  });

  // Deletar notificação
  const deleteMutation = useMutation({
    mutationFn: (id: string) => notificationsService.delete(id),
    onSuccess: () => {
      // Invalidar todas as queries de notificações para sincronizar header e sidebar
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast({
        title: 'Notificação removida',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao remover notificação',
        description: error.message || 'Ocorreu um erro.',
        variant: 'destructive',
      });
    },
  });

  const unread = notifications.filter(n => !n.read).length;
  const getIcon = (cat: string) => {
    switch (cat) {
      case 'appointment': return Calendar;
      case 'payment': return DollarSign;
      case 'marketing': return Megaphone;
      default: return Settings;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success': return { bg: 'bg-success-light', text: 'text-success' };
      case 'warning': return { bg: 'bg-warning-light', text: 'text-warning' };
      case 'error': return { bg: 'bg-destructive/10', text: 'text-destructive' };
      default: return { bg: 'bg-info-light', text: 'text-info' };
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando notificações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <AdminHeader title="Notificações" subtitle={`${unread} não lidas`} />
      <div className="p-6 space-y-6 max-w-4xl">
        {/* Filtros e Ações */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                <SelectItem value="appointment">Agendamentos</SelectItem>
                <SelectItem value="payment">Pagamentos</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="system">Sistema</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterRead} onValueChange={setFilterRead}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="unread">Não lidas</SelectItem>
                <SelectItem value="read">Lidas</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {unread > 0 && (
            <Button
              variant="outline"
              onClick={() => markAllAsReadMutation.mutate()}
              disabled={markAllAsReadMutation.isPending}
            >
              <Check className="h-4 w-4 mr-2" />
              Marcar todas como lidas
            </Button>
          )}
        </div>

        {/* Lista de Notificações */}
        {notifications.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhuma notificação encontrada</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => {
              const Icon = getIcon(n.category);
              const colors = getTypeColor(n.type);
              return (
                <Card
                  key={n.id}
                  className={cn(
                    'cursor-pointer transition-all hover:shadow-md',
                    !n.read && 'bg-primary-light/30 border-primary/20'
                  )}
                  onClick={() => {
                    if (!n.read) {
                      markAsReadMutation.mutate(n.id);
                    }
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className={cn('h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0', colors.bg)}>
                        <Icon className={cn('h-5 w-5', colors.text)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{n.title}</h4>
                          {!n.read && <Badge variant="soft-primary" className="text-[10px]">Nova</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{n.message}</p>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(n.created_at), "dd 'de' MMM 'às' HH:mm", { locale: ptBR })}
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm('Tem certeza que deseja remover esta notificação?')) {
                                deleteMutation.mutate(n.id);
                              }
                            }}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
