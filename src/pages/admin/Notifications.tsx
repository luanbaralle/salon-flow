import { AdminHeader } from '@/components/layout/AdminHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/contexts/AppContext';
import { Bell, Check, Calendar, DollarSign, Settings, Megaphone } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export default function AdminNotifications() {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useApp();
  const unread = notifications.filter(n => !n.read).length;
  const getIcon = (cat: string) => cat === 'appointment' ? Calendar : cat === 'payment' ? DollarSign : cat === 'marketing' ? Megaphone : Settings;

  return (
    <div className="min-h-screen">
      <AdminHeader title="Notificações" subtitle={`${unread} não lidas`} />
      <div className="p-6 space-y-6 max-w-3xl">
        {unread > 0 && <Button variant="outline" onClick={markAllNotificationsRead}><Check className="h-4 w-4" />Marcar todas como lidas</Button>}
        <div className="space-y-3">
          {notifications.map((n) => {
            const Icon = getIcon(n.category);
            return (
              <Card key={n.id} className={cn(!n.read && 'bg-primary-light/30 border-primary/20')} onClick={() => markNotificationRead(n.id)}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className={cn('h-10 w-10 rounded-full flex items-center justify-center', n.type === 'success' ? 'bg-success-light' : n.type === 'warning' ? 'bg-warning-light' : n.type === 'error' ? 'bg-destructive/10' : 'bg-info-light')}>
                      <Icon className={cn('h-5 w-5', n.type === 'success' ? 'text-success' : n.type === 'warning' ? 'text-warning' : n.type === 'error' ? 'text-destructive' : 'text-info')} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{n.title}</h4>
                        {!n.read && <Badge variant="soft-primary" className="text-[10px]">Nova</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">{n.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">{format(new Date(n.createdAt), 'dd/MM HH:mm')}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
