
'use client';

import * as React from 'react';
import Link from 'next/link';
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

type AlertFeedProps = {
  alerts: Alert[];
  liveMetrics: any;
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

export function AlertFeed({ alerts, liveMetrics }: AlertFeedProps) {
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const AlertItem = ({ alert }: { alert: Alert }) => {
    const Icon = iconMap[alert.icon];
    const isActionable = (alert.severity === 'CRITICAL' || alert.severity === 'WARNING') && liveMetrics;

    const content = (
        <div className={cn("flex items-start gap-4 p-2 rounded-lg", isActionable ? "hover:bg-muted cursor-pointer" : "")}>
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
              {isClient ? new Date(alert.timestamp).toLocaleTimeString() : ''}
            </p>
          </div>
        </div>
    );

    if (isActionable) {
        const query = new URLSearchParams({
            kilnTemperature: liveMetrics.kilnTemperature,
            feedRate: liveMetrics.feedRate,
            lsf: liveMetrics.lsf,
            cao: liveMetrics.cao,
            sio2: liveMetrics.sio2,
            al2o3: liveMetrics.al2o3,
            fe2o3: liveMetrics.fe2o3,
            trigger: 'true',
        });
      return (
        <Link href={`/optimize?${query.toString()}`} className="block">
          {content}
        </Link>
      );
    }

    return content;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-muted-foreground" />
          Alert Feed
        </CardTitle>
        <CardDescription>Live alerts from the plant floor. Critical alerts are clickable.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {alerts.map((alert) => (
              <AlertItem key={alert.id} alert={alert} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
