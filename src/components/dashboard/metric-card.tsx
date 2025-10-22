'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Thermometer, Zap, FlaskConical, Beaker, Component } from 'lucide-react';
import React from 'react';

const iconMap = {
  Thermometer,
  Zap, // Changed from Gauge
  FlaskConical,
  Beaker,
  Component,
};

type MetricCardProps = {
  title: string;
  value: string;
  unit: string;
  icon: keyof typeof iconMap;
  description?: string;
};

export function MetricCard({
  title,
  value,
  unit,
  icon,
  description
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
          {description || 'Live data'}
        </p>
      </CardContent>
    </Card>
  );
}

    