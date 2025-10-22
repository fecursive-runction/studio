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
import { historicalTemperatureData } from '@/lib/data';
import { TemperatureChart } from '@/components/dashboard/temperature-chart';
import { QualityScoreGauge } from '@/components/dashboard/quality-score-gauge';
import { Skeleton } from '@/components/ui/skeleton';
import { useState, useEffect } from 'react';
import { getLiveMetrics, getAiAlerts } from '@/app/actions';


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
    severity: 'CRITICAL' | 'WARNING' | 'INFO' | 'RESOLVED';
    message: string;
    icon: 'AlertTriangle' | 'Info' | 'ShieldCheck';
};


export default function DashboardPage() {
  const [metricsData, setMetricsData] = useState<MetricsData | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

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


  // Fetch data once on component mount
  useEffect(() => {
    const fetchAndSetData = async () => {
        setLoading(true);
        try {
            const data = await getLiveMetrics();
            if (data) {
                setMetricsData(data);
                const aiAlerts = await getAiAlerts();
                if (aiAlerts) {
                    setAlerts(aiAlerts);
                }
            }
        } catch(e) {
            console.error("Failed to fetch metrics or alerts", e);
        } finally {
            setLoading(false);
        }
    };
    fetchAndSetData();
  }, []);


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
                        value={(metricsData.kilnTemperature || 0).toFixed(1)}
                        unit="°C"
                        icon="Thermometer"
                    />
                    <MetricCard
                        title="Feed Rate"
                        value={(metricsData.feedRate || 0).toFixed(1)}
                        unit="TPH"
                        icon="Gauge"
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
