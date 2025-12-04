import { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  description?: string;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'info' | 'destructive';
  className?: string;
}

const variantStyles = {
  default: {
    icon: 'bg-muted text-muted-foreground',
  },
  primary: {
    icon: 'bg-primary-light text-primary',
  },
  success: {
    icon: 'bg-success-light text-success',
  },
  warning: {
    icon: 'bg-warning-light text-warning',
  },
  info: {
    icon: 'bg-info-light text-info',
  },
  destructive: {
    icon: 'bg-destructive/10 text-destructive',
  },
};

export function StatCard({ title, value, icon, trend, description, variant = 'default', className }: StatCardProps) {
  return (
    <Card variant="stat" className={cn("relative overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5", className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold font-display text-foreground">{value}</p>
              {trend && (
                <span
                  className={cn(
                    'flex items-center text-xs font-medium',
                    trend.isPositive ? 'text-success' : 'text-destructive'
                  )}
                >
                  {trend.isPositive ? (
                    <TrendingUp className="h-3 w-3 mr-0.5" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-0.5" />
                  )}
                  {trend.value}%
                </span>
              )}
            </div>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
          <div className={cn('p-3 rounded-xl transition-transform duration-200 group-hover:scale-110', variantStyles[variant].icon)}>
            {icon}
          </div>
        </div>
      </CardContent>
      {/* Decorative gradient */}
      <div className={cn(
        'absolute bottom-0 left-0 right-0 h-1',
        variant === 'primary' && 'gradient-primary',
        variant === 'success' && 'bg-success',
        variant === 'warning' && 'bg-warning',
        variant === 'info' && 'bg-info',
        variant === 'destructive' && 'bg-destructive',
        variant === 'default' && 'bg-muted'
      )} />
    </Card>
  );
}
