'use client';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { MetricCard } from '@/components/dashboard/metric-card';
import {
  LineChart,
  BarChart,
} from 'lucide-react';
import { AlertFeed } from '@/components/dashboard/alert-feed';
import { alerts as mockAlerts, liveMetrics, historicalTemperatureData } from '@/lib/data';
import { TemperatureChart } from '@/components/dashboard/temperature-chart';
import { QualityScoreGauge } from '@/components/dashboard/quality-score-gauge';
import { Skeleton } from '@/components/ui/skeleton';
import { useState, useEffect } from 'react';


export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
        setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const chartData = historicalTemperatureData.map((d, i) => i % 36 === 0 ? d : ({...d, time: ''}));

  return (
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
            {isLoading ? (
                <>
                    <Skeleton className="h-32" />
                    <Skeleton className="h-32" />
                    <Skeleton className="h-32" />
                    <Skeleton className="h-32" />
                </>
            ) : (
                <>
                    <MetricCard
                        title="Kiln Temperature"
                        value={liveMetrics.kiln_temp.toFixed(1)}
                        unit="°C"
                        icon="Thermometer"
                        trend={liveMetrics.kiln_temp_trend || 0}
                    />
                    <MetricCard
                        title="Feed Rate"
                        value={liveMetrics.feed_rate.toFixed(1)}
                        unit="TPH"
                        icon="Gauge"
                        trend={liveMetrics.feed_rate_trend || 0}
                    />
                    <MetricCard
                        title="Energy Consumption"
                        value={liveMetrics.energy_kwh.toFixed(1)}
                        unit="kWh/t"
                        icon="Zap"
                        trend={liveMetrics.energy_kwh_trend || 0}
                    />
                    <MetricCard
                        title="Clinker Quality"
                        value={liveMetrics.quality_score.toFixed(3)}
                        unit="Score"
                        icon="Award"
                        trend={liveMetrics.quality_score_trend || 0}
                    />
                </>
            )}
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-7">
          <Card className="lg:col-span-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="h-5 w-5 text-muted-foreground" />
                Kiln Temperature (Last 24h)
              </CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              {isLoading ? (
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
                  <BarChart className="h-5 w-5 text-muted-foreground" />
                  Live Quality Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                    <Skeleton className="h-[200px]" />
                ) : (
                    <QualityScoreGauge value={liveMetrics.quality_score} />
                )}
              </CardContent>
            </Card>
            <AlertFeed alerts={mockAlerts.map(a => ({...a, timestamp: new Date(a.timestamp)}))} />
          </div>
        </div>
      </main>
  );
}
