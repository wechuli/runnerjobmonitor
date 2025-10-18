import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { MetricDataPoint } from '@/types';

interface ProcessChartProps {
  data: MetricDataPoint[];
}

export const ProcessChart = ({ data }: ProcessChartProps) => {
  const chartData = data.map((point) => {
    const topProcess = point.system.top_processes[0];
    return {
      time: new Date(point.timestamp.replace(' ', 'T')).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit',
        hour12: false 
      }),
      cpu: topProcess?.cpu || 0,
      memory: topProcess?.mem || 0,
    };
  });

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
            value: 'Process %', 
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
        />
        <Legend 
          wrapperStyle={{ 
            color: 'hsl(var(--foreground))',
            paddingTop: '10px'
          }}
        />
        <Line
          type="monotone"
          dataKey="cpu"
          stroke="hsl(var(--chart-4))"
          strokeWidth={2}
          dot={false}
          name="CPU %"
          activeDot={{ r: 4, fill: 'hsl(var(--chart-4))' }}
        />
        <Line
          type="monotone"
          dataKey="memory"
          stroke="hsl(var(--chart-5))"
          strokeWidth={2}
          dot={false}
          name="Memory %"
          activeDot={{ r: 4, fill: 'hsl(var(--chart-5))' }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
