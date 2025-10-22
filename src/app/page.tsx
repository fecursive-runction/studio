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
import { alerts as mockAlerts, historicalTemperatureData } from '@/lib/data';
import { TemperatureChart } from '@/components/dashboard/temperature-chart';
import { QualityScoreGauge } from '@/components/dashboard/quality-score-gauge';
import { Skeleton } from '@/components/ui/skeleton';
import { useState, useEffect } from 'react';

export default function DashboardPage() {
  const [metricsData, setMetricsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLiveMetrics = async () => {
      try {
        const response = await fetch('/api/metrics/live');
        if (response.ok) {
          const data = await response.json();
          setMetricsData(data);
        }
      } catch (error) {
        console.error('Failed to fetch live metrics:', error);
      } finally {
        // Only set loading to false after the first fetch completes
        if (loading) {
          setLoading(false);
        }
      }
    };

    // Immediately trigger the first fetch for live metrics and data ingestion
    fetchLiveMetrics();
    fetch('/api/ingest', { method: 'POST' });
    
    // Set up intervals for subsequent updates
    const dataFetchInterval = setInterval(fetchLiveMetrics, 5000);
    const dataIngestInterval = setInterval(() => {
      fetch('/api/ingest', { method: 'POST' });
    }, 5000);

    // Clean up intervals on component unmount
    return () => {
      clearInterval(dataIngestInterval);
      clearInterval(dataFetchInterval);
    };
  }, [loading]); // Rerunning on loading change is fine for the initial load pattern.

  const chartData = historicalTemperatureData;

  return (
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
            {loading || !metricsData ? (
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
                        value={(metricsData?.kiln_temp || 0).toFixed(1)}
                        unit="°C"
                        icon="Thermometer"
                    />
                    <MetricCard
                        title="Feed Rate"
                        value={(metricsData?.feed_rate || 0).toFixed(1)}
                        unit="TPH"
                        icon="Gauge"
                    />
                    <MetricCard
                        title="Energy Consumption"
                        value={(metricsData?.energy_kwh_per_ton || 0).toFixed(1)}
                        unit="kWh/t"
                        icon="Zap"
                    />
                    <MetricCard
                        title="Clinker Quality"
                        value={(metricsData?.clinker_quality_score || 0).toFixed(3)}
                        unit="Score"
                        icon="Award"
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
                <TemperatureChart data={chartData} />
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
                {loading || !metricsData ? (
                    <Skeleton className="h-[200px]" />
                ) : (
                    <QualityScoreGauge value={metricsData?.clinker_quality_score || 0} />
                )}
              </CardContent>
            </Card>
            <AlertFeed alerts={mockAlerts.map(a => ({...a, timestamp: new Date(a.timestamp)}))} />
          </div>
        </div>
      </main>
  );
}
