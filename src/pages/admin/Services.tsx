import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminHeader } from '@/components/layout/AdminHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { servicesService, type Service } from '@/services/services.service';
import { Plus, Clock, DollarSign, Edit, Trash2 } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';

export default function AdminServices() {
  const { tenant } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [deletingService, setDeletingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration: 60,
    price: 0,
    category: '',
    image: '',
  });

  // Buscar serviços
  const { data: services = [], isLoading } = useQuery({
    queryKey: ['services', tenant?.id],
    queryFn: () => servicesService.getAll(tenant!.id),
    enabled: !!tenant?.id,
  });

  const categories = [...new Set(services.map(s => s.category))];

  // Criar serviço
  const createMutation = useMutation({
    mutationFn: (data: typeof formData) =>
      servicesService.create(tenant!.id, {
        name: data.name,
        description: data.description || undefined,
        duration: data.duration,
        price: data.price,
        category: data.category,
        image: data.image || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services', tenant?.id] });
      setIsCreateDialogOpen(false);
      setFormData({ name: '', description: '', duration: 60, price: 0, category: '', image: '' });
      toast({
        title: 'Serviço criado!',
        description: 'O serviço foi adicionado com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao criar serviço',
        description: error.message || 'Ocorreu um erro ao criar o serviço.',
        variant: 'destructive',
      });
    },
  });

  // Atualizar serviço
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: typeof formData }) =>
      servicesService.update(id, {
        name: data.name,
        description: data.description || undefined,
        duration: data.duration,
        price: data.price,
        category: data.category,
        image: data.image || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services', tenant?.id] });
      setEditingService(null);
      setFormData({ name: '', description: '', duration: 60, price: 0, category: '', image: '' });
      toast({
        title: 'Serviço atualizado!',
        description: 'As alterações foram salvas com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao atualizar serviço',
        description: error.message || 'Ocorreu um erro ao atualizar o serviço.',
        variant: 'destructive',
      });
    },
  });

  // Deletar serviço
  const deleteMutation = useMutation({
    mutationFn: (id: string) => servicesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services', tenant?.id] });
      setDeletingService(null);
      toast({
        title: 'Serviço removido!',
        description: 'O serviço foi removido com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao remover serviço',
        description: error.message || 'Ocorreu um erro ao remover o serviço.',
        variant: 'destructive',
      });
    },
  });

  const handleCreate = () => {
    createMutation.mutate(formData);
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description || '',
      duration: service.duration,
      price: service.price,
      category: service.category,
      image: service.image || '',
    });
  };

  const handleUpdate = () => {
    if (editingService) {
      updateMutation.mutate({ id: editingService.id, data: formData });
    }
  };

  const handleDelete = () => {
    if (deletingService) {
      deleteMutation.mutate(deletingService.id);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando serviços...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <AdminHeader title="Serviços" subtitle={`${services.length} serviços cadastrados`} />
      <div className="p-6 space-y-6">
        <div className="flex justify-end">
          <Button variant="gradient" onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Serviço
          </Button>
        </div>

        {services.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground mb-4">Nenhum serviço cadastrado ainda.</p>
              <Button variant="gradient" onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar primeiro serviço
              </Button>
            </CardContent>
          </Card>
        ) : (
          categories.map((cat) => (
            <div key={cat}>
              <h3 className="text-lg font-semibold mb-4">{cat}</h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {services
                  .filter((s) => s.category === cat)
                  .map((service) => (
                    <Card key={service.id} variant="interactive">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold">{service.name}</h4>
                          <Badge variant="soft-primary">{service.category}</Badge>
                        </div>
                        {service.description && (
                          <p className="text-sm text-muted-foreground mb-4">
                            {service.description}
                          </p>
                        )}
                        <div className="flex items-center justify-between mb-4">
                          <span className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            {service.duration} min
                          </span>
                          <span className="flex items-center gap-1 font-bold text-primary">
                            <DollarSign className="h-4 w-4" />
                            R$ {service.price.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => handleEdit(service)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Editar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => setDeletingService(service)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Remover
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Dialog de Criar */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Novo Serviço</DialogTitle>
            <DialogDescription>
              Adicione um novo serviço ao seu salão.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nome do serviço"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Categoria *</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="Ex: Cabelo, Unhas, Estética..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration">Duração (minutos) *</Label>
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData({ ...formData, duration: Number(e.target.value) })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Preço (R$) *</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: Number(e.target.value) })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descrição do serviço..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="image">URL da Imagem</Label>
              <Input
                id="image"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="https://..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="gradient"
              onClick={handleCreate}
              disabled={!formData.name || !formData.category || createMutation.isPending}
            >
              {createMutation.isPending ? 'Criando...' : 'Criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Editar */}
      <Dialog open={!!editingService} onOpenChange={(open) => !open && setEditingService(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Serviço</DialogTitle>
            <DialogDescription>
              Atualize as informações do serviço.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nome *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nome do serviço"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-category">Categoria *</Label>
              <Input
                id="edit-category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="Ex: Cabelo, Unhas, Estética..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-duration">Duração (minutos) *</Label>
                <Input
                  id="edit-duration"
                  type="number"
                  min="1"
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData({ ...formData, duration: Number(e.target.value) })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-price">Preço (R$) *</Label>
                <Input
                  id="edit-price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: Number(e.target.value) })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Descrição</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descrição do serviço..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-image">URL da Imagem</Label>
              <Input
                id="edit-image"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="https://..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingService(null)}>
              Cancelar
            </Button>
            <Button
              variant="gradient"
              onClick={handleUpdate}
              disabled={!formData.name || !formData.category || updateMutation.isPending}
            >
              {updateMutation.isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmar Exclusão */}
      <AlertDialog open={!!deletingService} onOpenChange={(open) => !open && setDeletingService(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover Serviço</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover {deletingService?.name}? Esta ação não pode ser desfeita.
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
