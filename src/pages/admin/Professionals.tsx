import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminHeader } from '@/components/layout/AdminHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { professionalsService, type Professional } from '@/services/professionals.service';
import { Plus, Star, Percent, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { servicesService } from '@/services/services.service';
import { Checkbox } from '@/components/ui/checkbox';
import { Scissors } from 'lucide-react';
import { ImageUpload } from '@/components/ui/image-upload';

export default function AdminProfessionals() {
  const { tenant } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingProfessional, setEditingProfessional] = useState<Professional | null>(null);
  const [deletingProfessional, setDeletingProfessional] = useState<Professional | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    specialty: '',
    commission: 40,
    avatar: '',
    service_ids: [] as string[],
  });

  // Buscar profissionais
  const { data: professionals = [], isLoading } = useQuery({
    queryKey: ['professionals', tenant?.id],
    queryFn: () => professionalsService.getAll(tenant!.id),
    enabled: !!tenant?.id,
  });

  // Buscar serviços para seleção
  const { data: services = [] } = useQuery({
    queryKey: ['services', tenant?.id],
    queryFn: () => servicesService.getAll(tenant!.id),
    enabled: !!tenant?.id,
  });

  // Criar profissional
  const createMutation = useMutation({
    mutationFn: (data: typeof formData) =>
      professionalsService.create(tenant!.id, {
        name: data.name,
        specialty: data.specialty || undefined,
        commission: data.commission,
        avatar: data.avatar || undefined,
        service_ids: data.service_ids.length > 0 ? data.service_ids : undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professionals', tenant?.id] });
      setIsCreateDialogOpen(false);
      setFormData({ name: '', specialty: '', commission: 40, avatar: '', service_ids: [] });
      toast({
        title: 'Profissional criado!',
        description: 'O profissional foi adicionado com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao criar profissional',
        description: error.message || 'Ocorreu um erro ao criar o profissional.',
        variant: 'destructive',
      });
    },
  });

  // Atualizar profissional
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: typeof formData }) =>
      professionalsService.update(id, {
        name: data.name,
        specialty: data.specialty || undefined,
        commission: data.commission,
        avatar: data.avatar || undefined,
        service_ids: data.service_ids,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professionals', tenant?.id] });
      setEditingProfessional(null);
      setFormData({ name: '', specialty: '', commission: 40, avatar: '', service_ids: [] });
      toast({
        title: 'Profissional atualizado!',
        description: 'As alterações foram salvas com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao atualizar profissional',
        description: error.message || 'Ocorreu um erro ao atualizar o profissional.',
        variant: 'destructive',
      });
    },
  });

  // Deletar profissional
  const deleteMutation = useMutation({
    mutationFn: (id: string) => professionalsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professionals', tenant?.id] });
      setDeletingProfessional(null);
      toast({
        title: 'Profissional removido!',
        description: 'O profissional foi removido com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao remover profissional',
        description: error.message || 'Ocorreu um erro ao remover o profissional.',
        variant: 'destructive',
      });
    },
  });

  const handleCreate = () => {
    createMutation.mutate(formData);
  };

  const handleEdit = (prof: Professional) => {
    setEditingProfessional(prof);
    
    // Buscar serviços associados ao profissional
    professionalsService.getServices(prof.id).then((professionalServices) => {
      const serviceIds = professionalServices?.map((sp: any) => sp.service_id) || [];
      setFormData({
        name: prof.name,
        specialty: prof.specialty || '',
        commission: prof.commission,
        avatar: prof.avatar || '',
        service_ids: serviceIds,
      });
    }).catch(() => {
      // Se houver erro, definir sem serviços
      setFormData({
        name: prof.name,
        specialty: prof.specialty || '',
        commission: prof.commission,
        avatar: prof.avatar || '',
        service_ids: [],
      });
    });
  };

  const toggleService = (serviceId: string) => {
    setFormData({
      ...formData,
      service_ids: formData.service_ids.includes(serviceId)
        ? formData.service_ids.filter(id => id !== serviceId)
        : [...formData.service_ids, serviceId],
    });
  };

  const handleUpdate = () => {
    if (editingProfessional) {
      updateMutation.mutate({ id: editingProfessional.id, data: formData });
    }
  };

  const handleDelete = () => {
    if (deletingProfessional) {
      deleteMutation.mutate(deletingProfessional.id);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando profissionais...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <AdminHeader title="Profissionais" subtitle={`${professionals.length} profissionais ativos`} />
      <div className="p-6 space-y-6">
        <div className="flex justify-end">
          <Button variant="gradient" onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Profissional
          </Button>
        </div>

        {professionals.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground mb-4">Nenhum profissional cadastrado ainda.</p>
              <Button variant="gradient" onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar primeiro profissional
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {professionals.map((prof) => (
              <Card key={prof.id} variant="interactive">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center">
                    <Avatar className="h-20 w-20 mb-4">
                      <AvatarImage src={prof.avatar} />
                      <AvatarFallback className="bg-primary-light text-primary text-xl">
                        {prof.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="font-semibold text-lg">{prof.name}</h3>
                    {prof.specialty && (
                      <Badge variant="soft-primary" className="mt-1">
                        {prof.specialty}
                      </Badge>
                    )}
                    <div className="flex items-center gap-4 mt-4">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-warning text-warning" />
                        <span className="font-medium">{prof.rating.toFixed(1)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Percent className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{prof.commission}%</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      {prof.review_count} avaliações
                    </p>
                    <div className="flex gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(prof)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeletingProfessional(prof)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Remover
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Dialog de Criar */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Profissional</DialogTitle>
            <DialogDescription>
              Adicione um novo profissional ao seu salão.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nome do profissional"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="specialty">Especialidade</Label>
              <Input
                id="specialty"
                value={formData.specialty}
                onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                placeholder="Ex: Cabeleireira, Manicure..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="commission">Comissão (%)</Label>
              <Input
                id="commission"
                type="number"
                min="0"
                max="100"
                value={formData.commission}
                onChange={(e) =>
                  setFormData({ ...formData, commission: Number(e.target.value) })
                }
              />
            </div>
            <ImageUpload
              currentImageUrl={formData.avatar}
              onImageUploaded={(url) => setFormData({ ...formData, avatar: url })}
              onImageRemoved={() => setFormData({ ...formData, avatar: '' })}
              folder="avatars"
              tenantId={tenant!.id}
              label="Foto do Profissional"
            />
            <div className="space-y-2">
              <Label>Serviços oferecidos</Label>
              <div className="border rounded-lg p-4 max-h-48 overflow-y-auto space-y-2">
                {services.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhum serviço cadastrado. Adicione serviços primeiro.
                  </p>
                ) : (
                  services.map((service) => (
                    <div key={service.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`service-${service.id}`}
                        checked={formData.service_ids.includes(service.id)}
                        onCheckedChange={() => toggleService(service.id)}
                      />
                      <Label
                        htmlFor={`service-${service.id}`}
                        className="text-sm font-normal cursor-pointer flex-1"
                      >
                        <div className="flex items-center gap-2">
                          <Scissors className="h-4 w-4 text-muted-foreground" />
                          <span>{service.name}</span>
                          <span className="text-xs text-muted-foreground">
                            ({service.duration} min - R$ {service.price.toFixed(2)})
                          </span>
                        </div>
                      </Label>
                    </div>
                  ))
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Selecione os serviços que este profissional oferece. Isso permite que clientes escolham este profissional ao agendar.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="gradient"
              onClick={handleCreate}
              disabled={!formData.name || createMutation.isPending}
            >
              {createMutation.isPending ? 'Criando...' : 'Criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Editar */}
      <Dialog open={!!editingProfessional} onOpenChange={(open) => !open && setEditingProfessional(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Profissional</DialogTitle>
            <DialogDescription>
              Atualize as informações do profissional.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nome *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nome do profissional"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-specialty">Especialidade</Label>
              <Input
                id="edit-specialty"
                value={formData.specialty}
                onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                placeholder="Ex: Cabeleireira, Manicure..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-commission">Comissão (%)</Label>
              <Input
                id="edit-commission"
                type="number"
                min="0"
                max="100"
                value={formData.commission}
                onChange={(e) =>
                  setFormData({ ...formData, commission: Number(e.target.value) })
                }
              />
            </div>
            <ImageUpload
              currentImageUrl={formData.avatar}
              onImageUploaded={(url) => setFormData({ ...formData, avatar: url })}
              onImageRemoved={() => setFormData({ ...formData, avatar: '' })}
              folder="avatars"
              tenantId={tenant!.id}
              label="Foto do Profissional"
            />
            <div className="space-y-2">
              <Label>Serviços oferecidos</Label>
              <div className="border rounded-lg p-4 max-h-48 overflow-y-auto space-y-2">
                {services.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhum serviço cadastrado. Adicione serviços primeiro.
                  </p>
                ) : (
                  services.map((service) => (
                    <div key={service.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`edit-service-${service.id}`}
                        checked={formData.service_ids.includes(service.id)}
                        onCheckedChange={() => toggleService(service.id)}
                      />
                      <Label
                        htmlFor={`edit-service-${service.id}`}
                        className="text-sm font-normal cursor-pointer flex-1"
                      >
                        <div className="flex items-center gap-2">
                          <Scissors className="h-4 w-4 text-muted-foreground" />
                          <span>{service.name}</span>
                          <span className="text-xs text-muted-foreground">
                            ({service.duration} min - R$ {service.price.toFixed(2)})
                          </span>
                        </div>
                      </Label>
                    </div>
                  ))
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Selecione os serviços que este profissional oferece. Isso permite que clientes escolham este profissional ao agendar.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingProfessional(null)}>
              Cancelar
            </Button>
            <Button
              variant="gradient"
              onClick={handleUpdate}
              disabled={!formData.name || updateMutation.isPending}
            >
              {updateMutation.isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmar Exclusão */}
      <AlertDialog open={!!deletingProfessional} onOpenChange={(open) => !open && setDeletingProfessional(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover Profissional</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover {deletingProfessional?.name}? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? 'Removendo...' : 'Remover'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
