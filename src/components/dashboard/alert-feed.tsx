'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Bell, AlertTriangle, Info, ShieldCheck } from 'lucide-react';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';
import type { LucideProps } from 'lucide-react';

const iconMap = {
  AlertTriangle,
  Info,
  ShieldCheck,
};

type Alert = {
  id: string;
  timestamp: Date;
  severity: 'CRITICAL' | 'WARNING' | 'INFO' | 'RESOLVED';
  message: string;
  icon: keyof typeof iconMap;
};

const severityStyles = {
  CRITICAL: 'bg-red-500 border-red-500 text-white',
  WARNING: 'bg-yellow-400 border-yellow-400 text-black',
  INFO: 'bg-blue-500 border-blue-500 text-white',
  RESOLVED: 'bg-green-500 border-green-500 text-white',
};

const severityIconStyles = {
    CRITICAL: 'text-red-500',
    WARNING: 'text-yellow-500',
    INFO: 'text-blue-500',
    RESOLVED: 'text-green-500',
  };

export function AlertFeed({ alerts }: { alerts: Alert[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-muted-foreground" />
          Alert Feed
        </CardTitle>
        <CardDescription>Live alerts from the plant floor.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {alerts.map((alert, index) => {
            const Icon = iconMap[alert.icon];
            return (
              <div key={index} className="flex items-start gap-4">
                <div className={cn("mt-1 flex h-8 w-8 items-center justify-center rounded-full", severityIconStyles[alert.severity], 'bg-opacity-10')}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium leading-none">
                      {alert.message}
                    </p>
                    <Badge
                      variant="outline"
                      className={cn('text-xs', severityStyles[alert.severity])}
                    >
                      {alert.severity}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {alert.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            );
        })}
        </div>
      </CardContent>
    </Card>
  );
}
