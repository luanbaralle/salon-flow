import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'admin' | 'professional' | 'client';
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, profile } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirecionar para login, salvando a rota que tentou acessar
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Verificar role se necessário
  if (requiredRole && profile?.role !== requiredRole) {
    // Redirecionar para dashboard apropriado ou mostrar erro
    if (profile?.role === 'admin') {
      return <Navigate to="/admin" replace />;
    } else if (profile?.role === 'professional') {
      return <Navigate to="/profissional" replace />;
    } else {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
}


