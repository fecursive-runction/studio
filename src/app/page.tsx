
'use client';
import { useContext } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { MetricCard } from '@/components/dashboard/metric-card';
import {
  LineChart,
  FlaskConical,
} from 'lucide-react';
import { AlertFeed } from '@/components/dashboard/alert-feed';
import { TemperatureChart } from '@/components/dashboard/temperature-chart';
import { QualityScoreGauge } from '@/components/dashboard/quality-score-gauge';
import { Skeleton } from '@/components/ui/skeleton';
import { DataContext } from '@/context/data-provider';


export default function DashboardPage() {
  const { liveMetrics, alerts, chartData, loading } = useContext(DataContext);
 
  return (
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {loading || !liveMetrics ? (
              Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32" />)
          ) : (
              <>
                  <MetricCard
                      title="Kiln Temperature"
                      value={(liveMetrics.kilnTemperature || 0).toFixed(1)}
                      unit="°C"
                      icon="Thermometer"
                  />
                  <MetricCard
                      title="Feed Rate"
                      value={(liveMetrics.feedRate || 0).toFixed(1)}
                      unit="TPH"
                      icon="Zap"
                  />
                    <MetricCard
                      title="Lime Saturation (LSF)"
                      value={(liveMetrics.lsf || 0).toFixed(1)}
                      unit="%"
                      icon="FlaskConical"
                  />
                  <MetricCard
                      title="CaO"
                      value={(liveMetrics.cao || 0).toFixed(2)}
                      unit="%"
                      icon="FlaskConical"
                  />
              </>
          )}
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-7">
          <Card className="lg:col-span-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="h-5 w-5 text-muted-foreground" />
                Kiln Temperature (Live)
              </CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              {loading ? (
                <Skeleton className="h-[350px]" />
              ) : (
                <TemperatureChart data={chartData} />
              )}
            </CardContent>
          </Card>
          <div className="grid gap-4 lg:col-span-3 lg:grid-cols-1">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FlaskConical className="h-5 w-5 text-muted-foreground" />
                  Live LSF
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading || !liveMetrics ? (
                    <Skeleton className="h-[200px]" />
                ) : (
                    <QualityScoreGauge value={liveMetrics.lsf || 0} maxValue={105} idealMin={94} idealMax={98} label="LSF" />
                )}
              </CardContent>
            </Card>
            <AlertFeed alerts={alerts} liveMetrics={liveMetrics} />
          </div>
        </div>
        <Card>
            <CardHeader>
                <CardTitle>Clinker Phases (Bogue)</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {loading || !liveMetrics ? (
              Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32" />)
          ) : (
            <>
                <MetricCard
                    title="C₃S (Alite)"
                    value={(liveMetrics.c3s || 0).toFixed(1)}
                    unit="%"
                    icon="Component"
                    description="Early strength"
                />
                <MetricCard
                    title="C₂S (Belite)"
                    value={(liveMetrics.c2s || 0).toFixed(1)}
                    unit="%"
                    icon="Component"
                    description="Late strength"
                />
                <MetricCard
                    title="C₃A (Aluminate)"
                    value={(liveMetrics.c3a || 0).toFixed(1)}
                    unit="%"
                    icon="Component"
                    description="Flash set/Heat"
                />
                <MetricCard
                    title="C₄AF (Ferrite)"
                    value={(liveMetrics.c4af || 0).toFixed(1)}
                    unit="%"
                    icon="Component"
                    description="Reduces heat"
                />
            </>
            )}
            </CardContent>
        </Card>
      </main>
  );
}
