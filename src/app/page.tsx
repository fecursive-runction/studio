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
import { getLiveMetrics } from '@/app/actions';


type MetricsData = {
    kilnTemperature?: number;
    feedRate?: number;
    energyConsumption?: number;
    clinkerQualityScore?: number;
};

export default function DashboardPage() {
  const [metricsData, setMetricsData] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(true);

  // Set up the interval to trigger data ingestion and fetching
  useEffect(() => {
    // Function to ingest new data
    const ingestData = async () => {
      await fetch('/api/ingest', { method: 'POST' });
    };

    // Function to fetch the latest data for the UI
    const fetchAndSetMetrics = async () => {
        try {
            const data = await getLiveMetrics();
            if (data) {
                setMetricsData({
                    kilnTemperature: data.kilnTemperature,
                    feedRate: data.feedRate,
                    energyConsumption: data.energyConsumption,
                    clinkerQualityScore: data.clinkerQualityScore,
                });
            }
        } catch(e) {
            console.error("Failed to fetch metrics", e);
        } finally {
            if (loading) {
                setLoading(false);
            }
        }
    };

    // Run both immediately on mount
    const initialLoad = async () => {
        await ingestData();
        await fetchAndSetMetrics();
    }
    initialLoad();

    // Then run them on an interval
    const interval = setInterval(() => {
        ingestData();
        fetchAndSetMetrics();
    }, 5000); // every 5 seconds

    // Clean up interval on component unmount
    return () => {
      clearInterval(interval);
    };
  }, [loading]); // Depend on loading to ensure the finally block runs correctly once


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
                        value={(metricsData?.kilnTemperature || 0).toFixed(1)}
                        unit="°C"
                        icon="Thermometer"
                    />
                    <MetricCard
                        title="Feed Rate"
                        value={(metricsData?.feedRate || 0).toFixed(1)}
                        unit="TPH"
                        icon="Gauge"
                    />
                    <MetricCard
                        title="Energy Consumption"
                        value={(metricsData?.energyConsumption || 0).toFixed(1)}
                        unit="kWh/t"
                        icon="Zap"
                    />
                    <MetricCard
                        title="Clinker Quality"
                        value={(metricsData?.clinkerQualityScore || 0).toFixed(3)}
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
                    <QualityScoreGauge value={metricsData?.clinkerQualityScore || 0} />
                )}
              </CardContent>
            </Card>
            <AlertFeed alerts={mockAlerts.map(a => ({...a, timestamp: new Date(a.timestamp)}))} />
          </div>
        </div>
      </main>
  );
}
