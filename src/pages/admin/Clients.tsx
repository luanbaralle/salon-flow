import { useState } from 'react';
import { AdminHeader } from '@/components/layout/AdminHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/contexts/AppContext';
import { Search, Plus, Mail, Phone, Calendar, DollarSign } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminClients() {
  const { clients } = useApp();
  const [search, setSearch] = useState('');

  const filteredClients = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen">
      <AdminHeader title="Clientes" subtitle={`${clients.length} clientes cadastrados`} />
      <div className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar clientes..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Button variant="gradient"><Plus className="h-4 w-4" />Novo Cliente</Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredClients.map((client) => (
            <Card key={client.id} variant="interactive">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={client.avatar} />
                    <AvatarFallback className="bg-primary-light text-primary">{client.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{client.name}</h3>
                    <p className="text-sm text-muted-foreground truncate flex items-center gap-1"><Mail className="h-3 w-3" />{client.email}</p>
                    <p className="text-sm text-muted-foreground truncate flex items-center gap-1"><Phone className="h-3 w-3" />{client.phone}</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t grid grid-cols-3 gap-2 text-center">
                  <div><p className="text-lg font-bold text-primary">{client.visitCount}</p><p className="text-xs text-muted-foreground">Visitas</p></div>
                  <div><p className="text-lg font-bold text-success">R$ {client.totalSpent}</p><p className="text-xs text-muted-foreground">Total</p></div>
                  <div><p className="text-sm font-medium">{client.lastVisit ? format(new Date(client.lastVisit), 'dd/MM') : '-'}</p><p className="text-xs text-muted-foreground">Última</p></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
