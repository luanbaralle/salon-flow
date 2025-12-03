import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { notificationsService } from '@/services/notifications.service';
import { useApp } from '@/contexts/AppContext';
import {
  LayoutDashboard,
  Calendar,
  Users,
  UserCircle,
  Scissors,
  DollarSign,
  Megaphone,
  Settings,
  LogOut,
  ChevronLeft,
  Bell,
  Sparkles,
  Star,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface AdminSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
  { icon: Calendar, label: 'Agenda', path: '/admin/agenda' },
  { icon: Users, label: 'Clientes', path: '/admin/clientes' },
  { icon: UserCircle, label: 'Profissionais', path: '/admin/profissionais' },
  { icon: Scissors, label: 'Serviços', path: '/admin/servicos' },
  { icon: DollarSign, label: 'Financeiro', path: '/admin/financeiro' },
  { icon: Megaphone, label: 'Marketing', path: '/admin/marketing' },
  { icon: Star, label: 'Avaliações', path: '/admin/avaliacoes' },
  { icon: Settings, label: 'Configurações', path: '/admin/configuracoes' },
];

export function AdminSidebar({ collapsed, onToggle }: AdminSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { salonSettings } = useApp();
  const { profile, signOut } = useAuth();

  // Buscar notificações do Supabase
  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications', profile?.id],
    queryFn: () => notificationsService.getAll(profile!.id),
    enabled: !!profile?.id,
    refetchInterval: 30000, // Atualizar a cada 30 segundos
  });

  const unreadCount = notifications.filter(n => !n.read).length;
  
  // Usar profile do AuthContext
  const user = profile ? {
    name: profile.name,
    email: profile.email,
    role: profile.role,
    avatar: profile.avatar_url,
  } : null;
  
  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      // Mesmo com erro, redirecionar para login
      navigate('/login', { replace: true });
    }
  };

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-display font-semibold text-sidebar-foreground">
                {salonSettings.name}
              </span>
            </div>
          )}
          {collapsed && (
            <div className="mx-auto h-8 w-8 rounded-lg gradient-primary flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
          )}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onToggle}
            className={cn('text-sidebar-foreground', collapsed && 'mx-auto')}
          >
            <ChevronLeft className={cn('h-4 w-4 transition-transform', collapsed && 'rotate-180')} />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-3">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path || 
              (item.path !== '/admin' && location.pathname.startsWith(item.path));
            
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-primary'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-primary'
                )}
              >
                <item.icon className={cn('h-5 w-5 shrink-0', collapsed && 'mx-auto')} />
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* Notifications Link */}
        <div className="px-3 pb-2">
          <NavLink
            to="/admin/notificacoes"
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
              location.pathname === '/admin/notificacoes'
                ? 'bg-sidebar-accent text-sidebar-primary'
                : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-primary'
            )}
          >
            <div className="relative">
              <Bell className={cn('h-5 w-5 shrink-0', collapsed && 'mx-auto')} />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </div>
            {!collapsed && (
              <span className="flex items-center gap-2">
                Notificações
                {unreadCount > 0 && (
                  <Badge variant="soft-destructive" className="px-1.5 py-0 text-[10px]">
                    {unreadCount}
                  </Badge>
                )}
              </span>
            )}
          </NavLink>
        </div>

        {/* User section */}
        <div className="border-t border-sidebar-border p-3">
          <div className={cn('flex items-center gap-3', collapsed && 'flex-col')}>
            <Avatar className="h-9 w-9">
              <AvatarImage src={user?.avatar} alt={user?.name} />
              <AvatarFallback className="bg-sidebar-accent text-sidebar-primary text-xs">
                {user?.name?.charAt(0) || 'A'}
              </AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {user?.name || 'Administrador'}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.role === 'admin' ? 'Gestor' : 'Profissional'}
                </p>
              </div>
            )}
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleLogout}
              className="text-muted-foreground hover:text-destructive"
              title="Sair"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
}
