import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminHeader } from '@/components/layout/AdminHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { tenantsService } from '@/services/tenants.service';
import { Building2, Clock, Shield, Save, Link2, Copy, Check, Settings, CreditCard, Bell } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ImageUpload } from '@/components/ui/image-upload';

const daysOfWeek = [
  { key: 'monday', label: 'Segunda-feira' },
  { key: 'tuesday', label: 'Terça-feira' },
  { key: 'wednesday', label: 'Quarta-feira' },
  { key: 'thursday', label: 'Quinta-feira' },
  { key: 'friday', label: 'Sexta-feira' },
  { key: 'saturday', label: 'Sábado' },
  { key: 'sunday', label: 'Domingo' },
];

export default function AdminSettings() {
  const { tenant, refreshProfile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    logo: '',
    cancellation_policy: '',
    working_hours: {} as Record<string, { open: boolean; start: string; end: string }>,
  });

  const bookingUrl = tenant?.slug 
    ? `${window.location.origin}/agendar/${tenant.slug}`
    : '';

  const handleCopyLink = async () => {
    if (!bookingUrl) return;
    
    try {
      await navigator.clipboard.writeText(bookingUrl);
      setCopied(true);
      toast({
        title: 'Link copiado!',
        description: 'O link de agendamento foi copiado para a área de transferência.',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: 'Erro ao copiar',
        description: 'Não foi possível copiar o link.',
        variant: 'destructive',
      });
    }
  };

  // Preencher formulário quando tenant carregar
  useEffect(() => {
    if (tenant) {
      setFormData({
        name: tenant.name || '',
        phone: tenant.phone || '',
        email: tenant.email || '',
        address: tenant.address || '',
        city: tenant.city || '',
        state: tenant.state || '',
        zip_code: tenant.zip_code || '',
        logo: tenant.logo || '',
        cancellation_policy: tenant.cancellation_policy || '',
        working_hours: tenant.working_hours || {
          monday: { open: true, start: '09:00', end: '18:00' },
          tuesday: { open: true, start: '09:00', end: '18:00' },
          wednesday: { open: true, start: '09:00', end: '18:00' },
          thursday: { open: true, start: '09:00', end: '18:00' },
          friday: { open: true, start: '09:00', end: '18:00' },
          saturday: { open: true, start: '09:00', end: '14:00' },
          sunday: { open: false, start: '', end: '' },
        },
      });
    }
  }, [tenant]);

  // Atualizar tenant
  const updateMutation = useMutation({
    mutationFn: (updates: typeof formData) => tenantsService.update(tenant!.id, updates),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'tenant'] });
      await refreshProfile();
      toast({
        title: 'Configurações salvas!',
        description: 'As alterações foram salvas com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao salvar configurações',
        description: error.message || 'Ocorreu um erro ao salvar as configurações.',
        variant: 'destructive',
      });
    },
  });

  const handleSave = () => {
    if (!formData.name) {
      toast({
        title: 'Campo obrigatório',
        description: 'O nome do salão é obrigatório.',
        variant: 'destructive',
      });
      return;
    }
    updateMutation.mutate(formData);
  };

  const updateWorkingHours = (day: string, updates: Partial<{ open: boolean; start: string; end: string }>) => {
    setFormData({
      ...formData,
      working_hours: {
        ...formData.working_hours,
        [day]: {
          ...formData.working_hours[day],
          ...updates,
        },
      },
    });
  };

  if (!tenant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  // Função para copiar horário de segunda para todos os dias
  const copyMondayHours = () => {
    const mondayHours = formData.working_hours.monday;
    if (!mondayHours || !mondayHours.open) {
      toast({
        title: 'Atenção',
        description: 'Configure primeiro o horário de segunda-feira.',
        variant: 'destructive',
      });
      return;
    }
    
    const updatedHours = { ...formData.working_hours };
    daysOfWeek.forEach(day => {
      updatedHours[day.key] = { ...mondayHours };
    });
    
    setFormData({ ...formData, working_hours: updatedHours });
    toast({
      title: 'Horários copiados!',
      description: 'O horário de segunda-feira foi aplicado a todos os dias.',
    });
  };

  // Máscara de CEP
  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 5) {
      value = value.slice(0, 5) + '-' + value.slice(5, 8);
    }
    setFormData({ ...formData, zip_code: value });
    
    // Buscar CEP automaticamente quando tiver 8 dígitos
    if (value.replace(/\D/g, '').length === 8) {
      fetch(`https://viacep.com.br/ws/${value.replace(/\D/g, '')}/json/`)
        .then(res => res.json())
        .then(data => {
          if (!data.erro) {
            setFormData(prev => ({
              ...prev,
              zip_code: value,
              city: data.localidade || prev.city,
              state: data.uf || prev.state,
              address: data.logradouro || prev.address,
            }));
          }
        })
        .catch(() => {
          // Silenciosamente falha se a API não responder
        });
    }
  };

  return (
    <div className="min-h-screen">
      <AdminHeader title="Configurações" subtitle="Personalize seu salão" />
      <div className="p-6 max-w-4xl">
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Geral
            </TabsTrigger>
            <TabsTrigger value="hours" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Horários
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Pagamentos
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notificações
            </TabsTrigger>
          </TabsList>

          {/* Aba Geral */}
          <TabsContent value="general" className="space-y-6">
            {/* Link Público de Agendamento */}
            <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Link2 className="h-5 w-5 text-primary" />
              <CardTitle>Link Público de Agendamento</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Compartilhe este link com seus clientes</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={bookingUrl}
                  readOnly
                  className="font-mono text-sm bg-muted"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyLink}
                  className="shrink-0"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-success" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Seus clientes podem usar este link para agendar serviços online 24 horas por dia.
              </p>
            </div>
            {tenant?.slug && (
              <div className="p-4 bg-primary-light/10 rounded-lg border border-primary/20">
                <p className="text-sm font-medium mb-2">Slug do salão:</p>
                <div className="flex items-center gap-2">
                  <code className="text-xs bg-background px-2 py-1 rounded border flex-1">{tenant.slug}</code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(tenant.slug);
                      toast({
                        title: 'Slug copiado!',
                        description: 'O slug foi copiado para a área de transferência.',
                      });
                    }}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  O slug é gerado automaticamente a partir do nome do salão e não pode ser alterado.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dados do Salão */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              <CardTitle>Dados do Salão</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <ImageUpload
              currentImageUrl={formData.logo}
              onImageUploaded={(url) => setFormData({ ...formData, logo: url })}
              onImageRemoved={() => setFormData({ ...formData, logo: '' })}
              folder="logos"
              tenantId={tenant.id}
              label="Logo do Salão"
            />
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nome do salão"
                />
              </div>
              <div className="space-y-2">
                <Label>Telefone</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="contato@salon.com"
              />
            </div>
            <div className="space-y-2">
              <Label>Endereço</Label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Rua, número"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Cidade</Label>
                <Input
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="Cidade"
                />
              </div>
              <div className="space-y-2">
                <Label>Estado</Label>
                <Input
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  placeholder="Estado"
                />
              </div>
              <div className="space-y-2">
                <Label>CEP</Label>
                <Input
                  value={formData.zip_code}
                  onChange={handleCepChange}
                  placeholder="00000-000"
                  maxLength={9}
                />
              </div>
            </div>
          </CardContent>
        </Card>

            {/* Botão Salvar */}
            <div className="flex justify-end">
              <Button
                variant="gradient"
                onClick={handleSave}
                disabled={updateMutation.isPending || !formData.name}
              >
                <Save className="h-4 w-4 mr-2" />
                {updateMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </div>
          </TabsContent>

          {/* Aba Horários */}
          <TabsContent value="hours" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    <CardTitle>Horário de Funcionamento</CardTitle>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyMondayHours}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copiar de Segunda
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {daysOfWeek.map((day) => {
                  const hours = formData.working_hours[day.key] || { open: false, start: '09:00', end: '18:00' };
                  return (
                    <div key={day.key} className="flex items-center gap-4">
                      <span className="w-32 font-medium">{day.label}</span>
                      <Switch
                        checked={hours.open}
                        onCheckedChange={(checked) => updateWorkingHours(day.key, { open: checked })}
                      />
                      {hours.open && (
                        <>
                          <Input
                            type="time"
                            value={hours.start}
                            onChange={(e) => updateWorkingHours(day.key, { start: e.target.value })}
                            className="w-32"
                          />
                          <span className="text-muted-foreground">às</span>
                          <Input
                            type="time"
                            value={hours.end}
                            onChange={(e) => updateWorkingHours(day.key, { end: e.target.value })}
                            className="w-32"
                          />
                        </>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Política de Cancelamento */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <CardTitle>Política de Cancelamento</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={formData.cancellation_policy}
                  onChange={(e) => setFormData({ ...formData, cancellation_policy: e.target.value })}
                  placeholder="Descreva a política de cancelamento do seu salão..."
                  rows={6}
                />
              </CardContent>
            </Card>

            {/* Botão Salvar */}
            <div className="flex justify-end">
              <Button
                variant="gradient"
                onClick={handleSave}
                disabled={updateMutation.isPending || !formData.name}
              >
                <Save className="h-4 w-4 mr-2" />
                {updateMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </div>
          </TabsContent>

          {/* Aba Pagamentos */}
          <TabsContent value="payments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Pagamento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Configurações de pagamento em breve</p>
                  <p className="text-sm mt-2">Integração com gateways de pagamento será adicionada em uma atualização futura.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Notificações */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Notificações</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Configurações de notificações em breve</p>
                  <p className="text-sm mt-2">Personalize como e quando receber notificações sobre agendamentos e eventos.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
