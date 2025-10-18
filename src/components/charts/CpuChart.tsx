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

  const borderColor = getComputedStyle(document.documentElement).getPropertyValue('--border').trim();
  const mutedForegroundColor = getComputedStyle(document.documentElement).getPropertyValue('--muted-foreground').trim();
  const popoverColor = getComputedStyle(document.documentElement).getPropertyValue('--popover').trim();
  const popoverForegroundColor = getComputedStyle(document.documentElement).getPropertyValue('--popover-foreground').trim();
  const chart1Color = getComputedStyle(document.documentElement).getPropertyValue('--chart-1').trim();

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
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
            value: 'CPU %', 
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
          itemStyle={{ color: chart1Color }}
        />
        <Line
          type="monotone"
          dataKey="cpu"
          stroke={chart1Color}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: chart1Color }}
          name="CPU %"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
