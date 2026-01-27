import { LucideIcon, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface AlertCardProps {
  title: string;
  count: number;
  severity: 'warning' | 'error' | 'critical';
  icon?: LucideIcon;
}

const severityClasses = {
  warning: {
    bg: 'bg-yellow-500/10 border-yellow-500/30',
    icon: 'text-yellow-500',
    text: 'text-yellow-500',
  },
  error: {
    bg: 'bg-orange-500/10 border-orange-500/30',
    icon: 'text-orange-500',
    text: 'text-orange-500',
  },
  critical: {
    bg: 'bg-red-500/10 border-red-500/30',
    icon: 'text-red-500',
    text: 'text-red-500',
  },
};

export const AlertCard = ({
  title,
  count,
  severity,
  icon: Icon = AlertTriangle,
}: AlertCardProps) => {
  const classes = severityClasses[severity];

  return (
    <Card className={cn('border', classes.bg)}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={cn('p-2 rounded-lg', classes.bg)}>
            <Icon className={cn('w-5 h-5', classes.icon)} />
          </div>
          <div>
            <p className={cn('text-2xl font-bold', classes.text)}>{count}</p>
            <p className="text-sm text-muted-foreground">{title}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
