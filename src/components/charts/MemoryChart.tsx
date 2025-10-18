import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { MetricDataPoint } from '@/types';

interface MemoryChartProps {
  data: MetricDataPoint[];
}

export const MemoryChart = ({ data }: MemoryChartProps) => {
  const chartData = data.map((point) => ({
    time: new Date(point.timestamp.replace(' ', 'T')).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit',
      hour12: false 
    }),
    memory: point.system.memory.usage_percent,
  }));

  const borderColor = getComputedStyle(document.documentElement).getPropertyValue('--border').trim();
  const mutedForegroundColor = getComputedStyle(document.documentElement).getPropertyValue('--muted-foreground').trim();
  const popoverColor = getComputedStyle(document.documentElement).getPropertyValue('--popover').trim();
  const popoverForegroundColor = getComputedStyle(document.documentElement).getPropertyValue('--popover-foreground').trim();
  const chart2Color = getComputedStyle(document.documentElement).getPropertyValue('--chart-2').trim();

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={borderColor} opacity={0.3} />
        <XAxis
          dataKey="time"
          fill={mutedForegroundColor}
          fontSize={12}
          tickLine={false}
          axisLine={{ stroke: borderColor }}
        />
        <YAxis
          fill={mutedForegroundColor}
          fontSize={12}
          tickLine={false}
          axisLine={{ stroke: borderColor }}
          domain={[0, 100]}
          label={{ 
            value: 'Memory %', 
            angle: -90, 
            position: 'insideLeft',
            style: { fill: mutedForegroundColor }
          }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: popoverColor,
            border: `1px solid ${borderColor}`,
            borderRadius: '8px',
            color: popoverForegroundColor,
          }}
          labelStyle={{ color: popoverForegroundColor, fontWeight: 600 }}
          itemStyle={{ color: chart2Color }}
        />
        <Area
          type="monotone"
          dataKey="memory"
          stroke={chart2Color}
          fill={chart2Color}
          fillOpacity={0.3}
          strokeWidth={2}
          name="Memory %"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};
