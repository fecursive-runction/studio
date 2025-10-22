
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
  FlaskConical,
} from 'lucide-react';
import { AlertFeed } from '@/components/dashboard/alert-feed';
import { TemperatureChart } from '@/components/dashboard/temperature-chart';
import { QualityScoreGauge } from '@/components/dashboard/quality-score-gauge';
import { Skeleton } from '@/components/ui/skeleton';
import { useState, useEffect, useRef } from 'react';
import { getLiveMetrics, getAiAlerts, getMetricsHistory } from '@/app/actions';


type MetricsData = {
    kilnTemperature: number;
    feedRate: number;
    lsf: number;
    cao: number;
    sio2: number;
    al2o3: number;
    fe2o3: number;
};

type Alert = {
    id: string;
    timestamp: Date;
    severity: 'CRITICAL' | 'WARNING';
    message: string;
};

type ChartDataPoint = {
  time: string;
  temperature: number;
};

const MAX_CHART_POINTS = 50;

export default function DashboardPage() {
  const [metricsData, setMetricsData] = useState<MetricsData | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const isInitialMount = useRef(true);

  // Set up the interval to trigger data ingestion (but not fetching)
  useEffect(() => {
    const ingestData = async () => {
      try {
        await fetch('/api/ingest', { method: 'POST' });
      } catch (e) {
        console.error("Failed to ingest data:", e);
      }
    };
    const interval = setInterval(ingestData, 5000);
    return () => clearInterval(interval);
  }, []);


  // Set up an interval to fetch fresh data for the dashboard
  useEffect(() => {
    const fetchAndSetData = async () => {
        try {
            if (isInitialMount.current) {
                // On initial load, fetch the full history to populate the chart
                const [data, aiAlerts, history] = await Promise.all([
                    getLiveMetrics(),
                    getAiAlerts(),
                    getMetricsHistory(),
                ]);
                if (data) setMetricsData(data);
                if (aiAlerts) setAlerts(aiAlerts as Alert[]);
                if (history) {
                    const transformedChartData = history
                        .map((metric: any) => ({
                            time: new Date(metric.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                            temperature: metric.kiln_temp,
                        }))
                        .reverse(); // Chronological order
                    setChartData(transformedChartData.slice(-MAX_CHART_POINTS));
                }
            } else {
                // On subsequent polls, only fetch the latest metric and alerts
                const [data, aiAlerts] = await Promise.all([
                    getLiveMetrics(),
                    getAiAlerts(),
                ]);

                if (data) {
                    setMetricsData(data);
                    // Append the new data point to the chart
                    setChartData(prevData => {
                        const newDataPoint = {
                            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                            temperature: data.kilnTemperature,
                        };
                        const updatedData = [...prevData, newDataPoint];
                        // Keep the chart data array from growing indefinitely
                        return updatedData.slice(-MAX_CHART_POINTS);
                    });
                }
                if (aiAlerts) {
                    setAlerts(aiAlerts as Alert[]);
                }
            }
        } catch(e) {
            console.error("Failed to fetch dashboard data", e);
        } finally {
            if (loading) {
              setLoading(false);
              isInitialMount.current = false;
            }
        }
    };
    
    fetchAndSetData(); // Fetch immediately on mount
    const interval = setInterval(fetchAndSetData, 5000); // Poll every 5 seconds for fresh data

    return () => clearInterval(interval); // Cleanup on unmount
  }, [loading]);


  return (
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {loading || !metricsData ? (
              Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32" />)
          ) : (
              <>
                  <MetricCard
                      title="Kiln Temperature"
                      value={(metricsData.kilnTemperature || 0).toFixed(1)}
                      unit="°C"
                      icon="Thermometer"
                  />
                  <MetricCard
                      title="Feed Rate"
                      value={(metricsData.feedRate || 0).toFixed(1)}
                      unit="TPH"
                      icon="Zap"
                  />
                    <MetricCard
                      title="Lime Saturation (LSF)"
                      value={(metricsData.lsf || 0).toFixed(1)}
                      unit="%"
                      icon="FlaskConical"
                  />
                  <MetricCard
                      title="CaO"
                      value={(metricsData.cao || 0).toFixed(2)}
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
                {loading || !metricsData ? (
                    <Skeleton className="h-[200px]" />
                ) : (
                    <QualityScoreGauge value={metricsData.lsf || 0} maxValue={105} idealMin={94} idealMax={98} label="LSF" />
                )}
              </CardContent>
            </Card>
            <AlertFeed alerts={alerts} liveMetrics={metricsData} />
          </div>
        </div>
      </main>
  );
}
