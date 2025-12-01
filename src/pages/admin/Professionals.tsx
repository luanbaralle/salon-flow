import { useState } from 'react';
import { AdminHeader } from '@/components/layout/AdminHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/contexts/AppContext';
import { Plus, Star, Percent } from 'lucide-react';

export default function AdminProfessionals() {
  const { professionals } = useApp();

  return (
    <div className="min-h-screen">
      <AdminHeader title="Profissionais" subtitle={`${professionals.length} profissionais ativos`} />
      <div className="p-6 space-y-6">
        <div className="flex justify-end">
          <Button variant="gradient"><Plus className="h-4 w-4" />Novo Profissional</Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {professionals.map((prof) => (
            <Card key={prof.id} variant="interactive">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  <Avatar className="h-20 w-20 mb-4">
                    <AvatarImage src={prof.avatar} />
                    <AvatarFallback className="bg-primary-light text-primary text-xl">{prof.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <h3 className="font-semibold text-lg">{prof.name}</h3>
                  <Badge variant="soft-primary" className="mt-1">{prof.specialty}</Badge>
                  <div className="flex items-center gap-4 mt-4">
                    <div className="flex items-center gap-1"><Star className="h-4 w-4 fill-warning text-warning" /><span className="font-medium">{prof.rating}</span></div>
                    <div className="flex items-center gap-1"><Percent className="h-4 w-4 text-muted-foreground" /><span className="text-muted-foreground">{prof.commission}%</span></div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{prof.reviewCount} avaliações</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
