import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { MetricDataPoint } from '@/types';

interface CpuChartProps {
  data: MetricDataPoint[];
}

export const CpuChart = ({ data }: CpuChartProps) => {
  const chartData = data.map((point) => ({
    time: new Date(point.timestamp.replace(' ', 'T')).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit',
      hour12: false 
    }),
    cpu: point.system.cpu.usage_percent,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" opacity={0.3} />
        <XAxis
          dataKey="time"
          className="fill-muted-foreground"
          fontSize={12}
          tickLine={false}
          axisLine={{ stroke: 'hsl(var(--border))' }}
        />
        <YAxis
          className="fill-muted-foreground"
          fontSize={12}
          tickLine={false}
          axisLine={{ stroke: 'hsl(var(--border))' }}
          domain={[0, 100]}
          label={{ 
            value: 'CPU %', 
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
          itemStyle={{ color: 'hsl(var(--chart-1))' }}
        />
        <Line
          type="monotone"
          dataKey="cpu"
          stroke="hsl(var(--chart-1))"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: 'hsl(var(--chart-1))' }}
          name="CPU %"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
