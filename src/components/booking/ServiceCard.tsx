import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, DollarSign, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ServiceCardProps {
  service: {
    id: string;
    name: string;
    duration: number;
    price: number;
    description?: string;
    category?: string;
  };
  selected?: boolean;
  onClick?: () => void;
}

export function ServiceCard({ service, selected, onClick }: ServiceCardProps) {
  return (
    <Card
      variant="interactive"
      className={cn(
        'cursor-pointer transition-all duration-200',
        selected && 'ring-2 ring-primary shadow-primary'
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-foreground">{service.name}</h3>
              <Badge variant="soft-primary" className="text-[10px]">
                {service.category}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {service.description}
            </p>
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1 text-muted-foreground">
                <Clock className="h-4 w-4" />
                {service.duration} min
              </span>
              <span className="flex items-center gap-1 font-semibold text-primary">
                <DollarSign className="h-4 w-4" />
                {service.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
            </div>
          </div>
          <Button
            variant={selected ? 'default' : 'ghost'}
            size="icon"
            className={cn(
              'shrink-0 transition-all',
              selected && 'gradient-primary'
            )}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
