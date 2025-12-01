import { AdminHeader } from '@/components/layout/AdminHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/contexts/AppContext';
import { Plus, Mail, MessageSquare, Send } from 'lucide-react';

export default function AdminMarketing() {
  const { campaigns } = useApp();
  const getIcon = (type: string) => type === 'email' ? Mail : type === 'whatsapp' ? MessageSquare : Send;

  return (
    <div className="min-h-screen">
      <AdminHeader title="Marketing" subtitle="Campanhas e automações" />
      <div className="p-6 space-y-6">
        <div className="flex justify-end">
          <Button variant="gradient"><Plus className="h-4 w-4" />Nova Campanha</Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {campaigns.map((c) => {
            const Icon = getIcon(c.type);
            return (
              <Card key={c.id} variant="interactive">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-xl bg-primary-light flex items-center justify-center">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{c.name}</h4>
                        <Badge variant={c.status === 'sent' ? 'soft-success' : c.status === 'active' ? 'soft-primary' : c.status === 'scheduled' ? 'soft-warning' : 'secondary'}>
                          {c.status === 'sent' ? 'Enviado' : c.status === 'active' ? 'Ativo' : c.status === 'scheduled' ? 'Agendado' : 'Rascunho'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{c.targetAudience}</p>
                      {c.sentCount && <p className="text-sm mt-2">{c.sentCount} enviados • {c.openRate}% abertura</p>}
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
