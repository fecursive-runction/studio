'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { TrendingDown, TrendingUp, Thermometer, Gauge, Zap, Award } from 'lucide-react';
import type { LucideProps } from 'lucide-react';
import React from 'react';

const iconMap = {
  Thermometer,
  Gauge,
  Zap,
  Award,
};

type MetricCardProps = {
  title: string;
  value: string;
  unit: string;
  icon: keyof typeof iconMap;
  trend: number;
};

export function MetricCard({
  title,
  value,
  unit,
  icon,
  trend,
}: MetricCardProps) {
  const TrendIcon = trend >= 0 ? TrendingUp : TrendingDown;
  const trendColor = trend >= 0 ? 'text-green-500' : 'text-red-500';
  const Icon = iconMap[icon];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {value} <span className="text-base font-normal text-muted-foreground">{unit}</span>
        </div>
        <p className={cn('text-xs text-muted-foreground flex items-center', trendColor)}>
          <TrendIcon className="mr-1 h-3 w-3" />
          {trend >= 0 ? '+' : ''}
          {trend.toFixed(2)}% from last hour
        </p>
      </CardContent>
    </Card>
  );
}
