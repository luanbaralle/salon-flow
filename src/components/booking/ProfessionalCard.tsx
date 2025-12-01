import { Professional } from '@/data/mockData';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProfessionalCardProps {
  professional: Professional;
  selected?: boolean;
  onClick?: () => void;
}

export function ProfessionalCard({ professional, selected, onClick }: ProfessionalCardProps) {
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
        <div className="flex items-center gap-4">
          <Avatar className="h-14 w-14 border-2 border-border">
            <AvatarImage src={professional.avatar} alt={professional.name} />
            <AvatarFallback className="bg-primary-light text-primary font-semibold">
              {professional.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate">{professional.name}</h3>
            <p className="text-sm text-muted-foreground">{professional.specialty}</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-warning text-warning" />
                <span className="text-sm font-medium">{professional.rating}</span>
              </div>
              <span className="text-xs text-muted-foreground">
                ({professional.reviewCount} avaliações)
              </span>
            </div>
          </div>
          <ChevronRight className={cn(
            'h-5 w-5 text-muted-foreground transition-colors',
            selected && 'text-primary'
          )} />
        </div>
      </CardContent>
    </Card>
  );
}
