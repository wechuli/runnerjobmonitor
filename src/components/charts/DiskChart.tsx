import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { MetricDataPoint } from '@/types';

interface DiskChartProps {
  data: MetricDataPoint[];
}

export const DiskChart = ({ data }: DiskChartProps) => {
  const chartData = data.map((point) => ({
    time: new Date(point.timestamp.replace(' ', 'T')).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit',
      hour12: false 
    }),
    disk: point.system.disk[0]?.use_percentage || 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
        <XAxis
          dataKey="time"
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickLine={false}
          axisLine={{ stroke: 'hsl(var(--border))' }}
        />
        <YAxis
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickLine={false}
          axisLine={{ stroke: 'hsl(var(--border))' }}
          domain={[0, 100]}
          label={{ 
            value: 'Disk Usage (%)', 
            angle: -90, 
            position: 'insideLeft',
            style: { fill: 'hsl(var(--muted-foreground))' }
          }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--popover))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
            color: 'hsl(var(--popover-foreground))',
          }}
          labelStyle={{ color: 'hsl(var(--popover-foreground))', fontWeight: 600 }}
          itemStyle={{ color: 'hsl(var(--popover-foreground))' }}
        />
        <Line
          type="monotone"
          dataKey="disk"
          stroke="hsl(var(--chart-3))"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: 'hsl(var(--chart-3))' }}
          name="Disk %"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
