import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminHeader } from '@/components/layout/AdminHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import { tenantsService } from '@/services/tenants.service';
import { Building2, Clock, Shield, Save, Link2, Copy, Check } from 'lucide-react';
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

  return (
    <div className="min-h-screen">
      <AdminHeader title="Configurações" subtitle="Personalize seu salão" />
      <div className="p-6 space-y-6 max-w-4xl">
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
                <code className="text-xs bg-background px-2 py-1 rounded border">{tenant.slug}</code>
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
                  onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
                  placeholder="00000-000"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Horário de Funcionamento */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <CardTitle>Horário de Funcionamento</CardTitle>
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
      </div>
    </div>
  );
}
