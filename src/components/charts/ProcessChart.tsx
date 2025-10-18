import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { MetricDataPoint } from '@/types';

interface ProcessChartProps {
  data: MetricDataPoint[];
}

export const ProcessChart = ({ data }: ProcessChartProps) => {
  const chartData = data.map((point) => {
    const topProcess = point.system.top_processes[0];
    return {
      time: new Date(point.timestamp).toLocaleTimeString(),
      cpu: topProcess?.cpu || 0,
      memory: topProcess?.mem || 0,
    };
  });

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis
          dataKey="time"
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickLine={false}
        />
        <YAxis
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickLine={false}
          domain={[0, 100]}
          label={{ value: 'Process Usage (%)', angle: -90, position: 'insideLeft' }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
          }}
          labelStyle={{ color: 'hsl(var(--foreground))' }}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="cpu"
          stroke="hsl(var(--chart-4))"
          strokeWidth={2}
          dot={false}
          name="CPU %"
          activeDot={{ r: 4 }}
        />
        <Line
          type="monotone"
          dataKey="memory"
          stroke="hsl(var(--chart-5))"
          strokeWidth={2}
          dot={false}
          name="Memory %"
          activeDot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
