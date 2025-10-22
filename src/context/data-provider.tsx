
'use client';

import { createContext, useState, useEffect, useRef, ReactNode } from 'react';
import { getLiveMetrics, getAiAlerts, getMetricsHistory } from '@/app/actions';

type MetricsData = {
    kilnTemperature: number;
    feedRate: number;
    lsf: number;
    cao: number;
    sio2: number;
    al2o3: number;
    fe2o3: number;
    c3s: number;
    c2s: number;
    c3a: number;
    c4af: number;
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

type MetricsHistory = any[];

interface DataContextProps {
  liveMetrics: MetricsData | null;
  alerts: Alert[];
  chartData: ChartDataPoint[];
  metricsHistory: MetricsHistory;
  loading: boolean;
}

export const DataContext = createContext<DataContextProps>({
  liveMetrics: null,
  alerts: [],
  chartData: [],
  metricsHistory: [],
  loading: true,
});

const MAX_CHART_POINTS = 50;

export function DataProvider({ children }: { children: ReactNode }) {
  const [liveMetrics, setLiveMetrics] = useState<MetricsData | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [metricsHistory, setMetricsHistory] = useState<MetricsHistory>([]);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const isInitialMount = useRef(true);

  // Set up the interval to trigger data ingestion
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

  // Set up an interval to fetch fresh data for the entire app
  useEffect(() => {
    const fetchAndSetData = async () => {
        try {
            if (isInitialMount.current) {
                // On initial load, fetch the full history to populate everything
                const [data, aiAlerts, history] = await Promise.all([
                    getLiveMetrics(),
                    getAiAlerts(),
                    getMetricsHistory(),
                ]);
                if (data) setLiveMetrics(data as MetricsData);
                if (aiAlerts) setAlerts(aiAlerts as Alert[]);
                if (history) {
                    setMetricsHistory(history as MetricsHistory);
                    const transformedChartData = history
                        .map((metric: any) => ({
                            time: new Date(metric.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                            temperature: metric.kiln_temp,
                        }))
                        .reverse(); // Chronological order
                    setChartData(transformedChartData.slice(-MAX_CHART_POINTS));
                }
            } else {
                // On subsequent polls, fetch everything to keep the app in sync
                 const [data, aiAlerts, history] = await Promise.all([
                    getLiveMetrics(),
                    getAiAlerts(),
                    getMetricsHistory(),
                ]);

                if (data) {
                    setLiveMetrics(data as MetricsData);
                    // Append the new data point to the chart
                    setChartData(prevData => {
                        const newDataPoint = {
                            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                            temperature: data.kilnTemperature,
                        };
                        const updatedData = [...prevData, newDataPoint];
                        return updatedData.slice(-MAX_CHART_POINTS);
                    });
                }
                if (aiAlerts) {
                    setAlerts(aiAlerts as Alert[]);
                }
                if (history) {
                    setMetricsHistory(history as MetricsHistory);
                }
            }
        } catch(e) {
            console.error("Failed to fetch dashboard data", e);
        } finally {
            if (isInitialMount.current) {
              setLoading(false);
              isInitialMount.current = false;
            }
        }
    };
    
    fetchAndSetData(); // Fetch immediately on mount
    const interval = setInterval(fetchAndSetData, 5000); // Poll every 5 seconds

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  const value = {
    liveMetrics,
    alerts,
    chartData,
    metricsHistory,
    loading,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}
