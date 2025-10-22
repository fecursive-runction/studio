'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Thermometer, Gauge, Zap, Award } from 'lucide-react';
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
  trend?: number;
};

export function MetricCard({
  title,
  value,
  unit,
  icon,
}: MetricCardProps) {

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
        <p className={'text-xs text-muted-foreground flex items-center'}>
          Live data
        </p>
      </CardContent>
    </Card>
  );
}
