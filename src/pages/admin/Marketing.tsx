import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminHeader } from '@/components/layout/AdminHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { campaignsService, type Campaign } from '@/services/campaigns.service';
import { Plus, Mail, MessageSquare, Send, Edit, Trash2, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function AdminMarketing() {
  const { tenant } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'email' as 'email' | 'sms' | 'whatsapp',
    status: 'draft' as 'draft' | 'scheduled' | 'sent' | 'active',
    target_audience: '',
    message: '',
    scheduled_date: '',
  });

  // Buscar campanhas
  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ['campaigns', tenant?.id],
    queryFn: () => campaignsService.getAll(tenant!.id),
    enabled: !!tenant?.id,
  });

  // Criar campanha
  const createMutation = useMutation({
    mutationFn: (data: typeof formData) => campaignsService.create(tenant!.id, {
      name: data.name,
      type: data.type,
      status: data.status,
      target_audience: data.target_audience || undefined,
      message: data.message || undefined,
      scheduled_date: data.scheduled_date || undefined,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      setIsModalOpen(false);
      resetForm();
      toast({
        title: 'Campanha criada!',
        description: 'A campanha foi criada com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao criar campanha',
        description: error.message || 'Ocorreu um erro ao criar a campanha.',
        variant: 'destructive',
      });
    },
  });

  // Atualizar campanha
  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<typeof formData> }) =>
      campaignsService.update(id, {
        name: updates.name,
        type: updates.type,
        status: updates.status,
        target_audience: updates.target_audience || undefined,
        message: updates.message || undefined,
        scheduled_date: updates.scheduled_date || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      setIsModalOpen(false);
      setEditingCampaign(null);
      resetForm();
      toast({
        title: 'Campanha atualizada!',
        description: 'As alterações foram salvas com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao atualizar campanha',
        description: error.message || 'Ocorreu um erro ao atualizar a campanha.',
        variant: 'destructive',
      });
    },
  });

  // Deletar campanha
  const deleteMutation = useMutation({
    mutationFn: (id: string) => campaignsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      toast({
        title: 'Campanha removida!',
        description: 'A campanha foi removida com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao remover campanha',
        description: error.message || 'Ocorreu um erro ao remover a campanha.',
        variant: 'destructive',
      });
    },
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'email': return Mail;
      case 'whatsapp': return MessageSquare;
      case 'sms': return Send;
      default: return Mail;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'sent': return 'Enviado';
      case 'active': return 'Ativo';
      case 'scheduled': return 'Agendado';
      default: return 'Rascunho';
    }
  };

  const getStatusVariant = (status: string): 'soft-success' | 'soft-primary' | 'soft-warning' | 'secondary' => {
    switch (status) {
      case 'sent': return 'soft-success';
      case 'active': return 'soft-primary';
      case 'scheduled': return 'soft-warning';
      default: return 'secondary';
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'email',
      status: 'draft',
      target_audience: '',
      message: '',
      scheduled_date: '',
    });
  };

  const handleCreate = () => {
    if (!formData.name) {
      toast({
        title: 'Campo obrigatório',
        description: 'O nome da campanha é obrigatório.',
        variant: 'destructive',
      });
      return;
    }
    createMutation.mutate(formData);
  };

  const handleEdit = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    setFormData({
      name: campaign.name,
      type: campaign.type,
      status: campaign.status,
      target_audience: campaign.target_audience || '',
      message: campaign.message || '',
      scheduled_date: campaign.scheduled_date ? format(new Date(campaign.scheduled_date), "yyyy-MM-dd'T'HH:mm") : '',
    });
    setIsModalOpen(true);
  };

  const handleUpdate = () => {
    if (!editingCampaign) return;
    if (!formData.name) {
      toast({
        title: 'Campo obrigatório',
        description: 'O nome da campanha é obrigatório.',
        variant: 'destructive',
      });
      return;
    }
    updateMutation.mutate({ id: editingCampaign.id, updates: formData });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando campanhas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <AdminHeader title="Marketing" subtitle="Campanhas e automações" />
      <div className="p-6 space-y-6">
        <div className="flex justify-end">
          <Button variant="gradient" onClick={() => {
            resetForm();
            setEditingCampaign(null);
            setIsModalOpen(true);
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Campanha
          </Button>
        </div>

        {campaigns.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">Nenhuma campanha criada ainda</p>
              <Button variant="outline" onClick={() => {
                resetForm();
                setEditingCampaign(null);
                setIsModalOpen(true);
              }}>
                Criar primeira campanha
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {campaigns.map((c) => {
              const Icon = getIcon(c.type);
              return (
                <Card key={c.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-xl bg-primary-light flex items-center justify-center flex-shrink-0">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold truncate">{c.name}</h4>
                          <Badge variant={getStatusVariant(c.status)}>
                            {getStatusLabel(c.status)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{c.target_audience || 'Sem público-alvo definido'}</p>
                        {c.sent_count > 0 && (
                          <p className="text-sm text-muted-foreground mb-2">
                            {c.sent_count} enviados • {c.open_rate}% abertura
                          </p>
                        )}
                        {c.scheduled_date && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(c.scheduled_date), "dd 'de' MMM 'às' HH:mm", { locale: ptBR })}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(c)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (confirm('Tem certeza que deseja remover esta campanha?')) {
                              deleteMutation.mutate(c.id);
                            }
                          }}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal Nova/Editar Campanha */}
      <Dialog open={isModalOpen} onOpenChange={(open) => {
        if (!open) {
          setIsModalOpen(false);
          setEditingCampaign(null);
          resetForm();
        }
      }}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingCampaign ? 'Editar Campanha' : 'Nova Campanha'}</DialogTitle>
            <DialogDescription>
              {editingCampaign ? 'Atualize os dados da campanha' : 'Crie uma nova campanha de marketing'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome da Campanha *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Promoção de Verão"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(v) => setFormData({ ...formData, type: v as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(v) => setFormData({ ...formData, status: v as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Rascunho</SelectItem>
                    <SelectItem value="scheduled">Agendado</SelectItem>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="sent">Enviado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Público-alvo</Label>
              <Input
                value={formData.target_audience}
                onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}
                placeholder="Ex: Clientes que não visitam há mais de 30 dias"
              />
            </div>

            <div className="space-y-2">
              <Label>Mensagem</Label>
              <Textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Digite a mensagem da campanha..."
                rows={5}
              />
            </div>

            {formData.status === 'scheduled' && (
              <div className="space-y-2">
                <Label>Data e Hora do Envio</Label>
                <Input
                  type="datetime-local"
                  value={formData.scheduled_date}
                  onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsModalOpen(false);
              setEditingCampaign(null);
              resetForm();
            }}>
              Cancelar
            </Button>
            <Button
              variant="gradient"
              onClick={editingCampaign ? handleUpdate : handleCreate}
              disabled={!formData.name || createMutation.isPending || updateMutation.isPending}
            >
              {editingCampaign
                ? (updateMutation.isPending ? 'Salvando...' : 'Salvar')
                : (createMutation.isPending ? 'Criando...' : 'Criar Campanha')
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
