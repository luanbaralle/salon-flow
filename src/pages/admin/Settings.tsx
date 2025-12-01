import { AdminHeader } from '@/components/layout/AdminHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useApp } from '@/contexts/AppContext';
import { Building2, Clock, Shield, Bell } from 'lucide-react';

export default function AdminSettings() {
  const { salonSettings, updateSalonSettings } = useApp();

  return (
    <div className="min-h-screen">
      <AdminHeader title="Configurações" subtitle="Personalize seu salão" />
      <div className="p-6 space-y-6 max-w-4xl">
        <Card>
          <CardHeader><div className="flex items-center gap-2"><Building2 className="h-5 w-5 text-primary" /><CardTitle>Dados do Salão</CardTitle></div></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Nome</Label><Input value={salonSettings.name} onChange={(e) => updateSalonSettings({ name: e.target.value })} /></div>
              <div className="space-y-2"><Label>Telefone</Label><Input value={salonSettings.phone} /></div>
            </div>
            <div className="space-y-2"><Label>Endereço</Label><Input value={salonSettings.address} /></div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2"><Label>Cidade</Label><Input value={salonSettings.city} /></div>
              <div className="space-y-2"><Label>Estado</Label><Input value={salonSettings.state} /></div>
              <div className="space-y-2"><Label>CEP</Label><Input value={salonSettings.zipCode} /></div>
            </div>
            <Button variant="gradient">Salvar Alterações</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><div className="flex items-center gap-2"><Clock className="h-5 w-5 text-primary" /><CardTitle>Horário de Funcionamento</CardTitle></div></CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(salonSettings.workingHours).map(([day, hours]) => (
              <div key={day} className="flex items-center gap-4">
                <span className="w-24 capitalize">{day === 'monday' ? 'Segunda' : day === 'tuesday' ? 'Terça' : day === 'wednesday' ? 'Quarta' : day === 'thursday' ? 'Quinta' : day === 'friday' ? 'Sexta' : day === 'saturday' ? 'Sábado' : 'Domingo'}</span>
                <Switch checked={hours.open} />
                {hours.open && <><Input type="time" value={hours.start} className="w-32" /><span>às</span><Input type="time" value={hours.end} className="w-32" /></>}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><div className="flex items-center gap-2"><Shield className="h-5 w-5 text-primary" /><CardTitle>Política de Cancelamento</CardTitle></div></CardHeader>
          <CardContent>
            <Textarea value={salonSettings.cancellationPolicy} rows={4} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
