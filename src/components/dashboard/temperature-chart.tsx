'use client';

import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import {
  ChartContainer,
  ChartTooltipContent,
  ChartTooltip,
} from '@/components/ui/chart';

type TemperatureChartProps = {
  data: { time: string; temperature: number }[];
};

const chartConfig = {
  temperature: {
    label: "Temperature",
    color: "hsl(var(--primary))",
  },
};

export function TemperatureChart({ data }: TemperatureChartProps) {
  return (
    <ChartContainer config={chartConfig} className="h-[350px] w-full">
      <LineChart
        data={data}
        margin={{
          left: 12,
          right: 12,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="time"
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          domain={['dataMin - 20', 'dataMax + 20']}
          tickFormatter={(value) => `${value}°C`}
        />
        <Tooltip
          cursor={{ stroke: 'hsl(var(--accent))', strokeWidth: 2, strokeDasharray: '3 3' }}
          content={<ChartTooltipContent />}
        />
        <Line
          type="monotone"
          dataKey="temperature"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ChartContainer>
  );
}
