'use client';

import { Pie, PieChart, ResponsiveContainer, Cell, Label } from 'recharts';

type QualityScoreGaugeProps = {
  value: number;
  maxValue: number;
  idealMin: number;
  idealMax: number;
  label: string;
};

export function QualityScoreGauge({ value, maxValue, idealMin, idealMax, label }: QualityScoreGaugeProps) {
  
  const getColor = (val: number) => {
    if (val < idealMin || val > idealMax) return '#f59e0b'; // warning yellow
    return 'hsl(var(--primary))';
  };

  const data = [
    { name: 'score', value: value },
    { name: 'remaining', value: maxValue - value },
  ];

  return (
    <div className="h-[200px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            startAngle={180}
            endAngle={0}
            innerRadius="60%"
            outerRadius="85%"
            dataKey="value"
            stroke="none"
            cornerRadius={5}
          >
            <Cell fill={getColor(value)} />
            <Cell fill="hsl(var(--muted))" />
            <Label
              value={`${value.toFixed(1)}%`}
              position="center"
              fill="hsl(var(--foreground))"
              className="text-3xl font-bold"
              dy={-10}
            />
            <Label
              value={label}
              position="center"
              fill="hsl(var(--muted-foreground))"
              dy={15}
              className="text-sm"
            />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
