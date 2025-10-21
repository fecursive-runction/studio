'use client';

import { Pie, PieChart, ResponsiveContainer, Cell, Label } from 'recharts';

type QualityScoreGaugeProps = {
  value: number;
};

const MAX_SCORE = 1;

export function QualityScoreGauge({ value }: QualityScoreGaugeProps) {
  const percentage = (value / MAX_SCORE) * 100;
  const endAngle = 360 * (value / MAX_SCORE);

  const getColor = (val: number) => {
    if (val < 0.85) return 'hsl(var(--destructive))';
    if (val < 0.9) return '#f59e0b'; // warning yellow
    return 'hsl(var(--primary))';
  };

  const data = [
    { name: 'score', value: value },
    { name: 'remaining', value: MAX_SCORE - value },
  ];

  return (
    <div className="h-[200px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            startAngle={90}
            endAngle={-270}
            innerRadius="70%"
            outerRadius="85%"
            dataKey="value"
            stroke="none"
            cornerRadius={5}
          >
            <Cell fill={getColor(value)} />
            <Cell fill="hsl(var(--muted))" />
            <Label
              value={`${value.toFixed(3)}`}
              position="center"
              fill="hsl(var(--foreground))"
              className="text-3xl font-bold"
            />
            <Label
              value="Quality Score"
              position="center"
              fill="hsl(var(--muted-foreground))"
              dy={30}
              className="text-sm"
            />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
