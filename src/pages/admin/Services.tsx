import { AdminHeader } from '@/components/layout/AdminHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/contexts/AppContext';
import { Plus, Clock, DollarSign } from 'lucide-react';

export default function AdminServices() {
  const { services } = useApp();
  const categories = [...new Set(services.map(s => s.category))];

  return (
    <div className="min-h-screen">
      <AdminHeader title="Serviços" subtitle={`${services.length} serviços cadastrados`} />
      <div className="p-6 space-y-6">
        <div className="flex justify-end">
          <Button variant="gradient"><Plus className="h-4 w-4" />Novo Serviço</Button>
        </div>
        {categories.map(cat => (
          <div key={cat}>
            <h3 className="text-lg font-semibold mb-4">{cat}</h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {services.filter(s => s.category === cat).map((service) => (
                <Card key={service.id} variant="interactive">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold">{service.name}</h4>
                      <Badge variant="soft-primary">{service.category}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">{service.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 text-sm text-muted-foreground"><Clock className="h-4 w-4" />{service.duration} min</span>
                      <span className="flex items-center gap-1 font-bold text-primary"><DollarSign className="h-4 w-4" />R$ {service.price}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
