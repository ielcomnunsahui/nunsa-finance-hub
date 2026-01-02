import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/types/finance';

interface StatCardProps {
  title: string;
  value: number;
  change?: number;
  icon: LucideIcon;
  variant?: 'default' | 'success' | 'warning' | 'info';
  className?: string;
  delay?: number;
}

const variantStyles = {
  default: {
    iconBg: 'bg-primary/10',
    iconColor: 'text-primary',
    changePositive: 'text-success',
    changeNegative: 'text-destructive',
  },
  success: {
    iconBg: 'bg-success/10',
    iconColor: 'text-success',
    changePositive: 'text-success',
    changeNegative: 'text-destructive',
  },
  warning: {
    iconBg: 'bg-warning/10',
    iconColor: 'text-warning',
    changePositive: 'text-success',
    changeNegative: 'text-destructive',
  },
  info: {
    iconBg: 'bg-info/10',
    iconColor: 'text-info',
    changePositive: 'text-success',
    changeNegative: 'text-destructive',
  },
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  icon: Icon,
  variant = 'default',
  className,
  delay = 0,
}) => {
  const styles = variantStyles[variant];

  return (
    <div
      className={cn(
        'stat-card opacity-0 animate-slide-up',
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl lg:text-3xl font-bold font-display tracking-tight">
            {formatCurrency(value)}
          </p>
          {change !== undefined && (
            <div className="flex items-center gap-1">
              <span
                className={cn(
                  'text-sm font-medium',
                  change >= 0 ? styles.changePositive : styles.changeNegative
                )}
              >
                {change >= 0 ? '+' : ''}{change.toFixed(1)}%
              </span>
              <span className="text-xs text-muted-foreground">vs last period</span>
            </div>
          )}
        </div>
        <div className={cn('p-3 rounded-xl', styles.iconBg)}>
          <Icon className={cn('h-6 w-6', styles.iconColor)} />
        </div>
      </div>
    </div>
  );
};
