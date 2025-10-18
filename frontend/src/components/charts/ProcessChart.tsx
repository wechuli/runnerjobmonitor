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

  const borderColor = getComputedStyle(document.documentElement).getPropertyValue('--border').trim();
  const mutedForegroundColor = getComputedStyle(document.documentElement).getPropertyValue('--muted-foreground').trim();
  const popoverColor = getComputedStyle(document.documentElement).getPropertyValue('--popover').trim();
  const popoverForegroundColor = getComputedStyle(document.documentElement).getPropertyValue('--popover-foreground').trim();
  const foregroundColor = getComputedStyle(document.documentElement).getPropertyValue('--foreground').trim();
  const chart4Color = getComputedStyle(document.documentElement).getPropertyValue('--chart-4').trim();
  const chart5Color = getComputedStyle(document.documentElement).getPropertyValue('--chart-5').trim();

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
            value: 'Process %', 
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
        />
        <Legend 
          wrapperStyle={{ 
            color: foregroundColor,
            paddingTop: '10px'
          }}
        />
        <Line
          type="monotone"
          dataKey="cpu"
          stroke={chart4Color}
          strokeWidth={2}
          dot={false}
          name="CPU %"
          activeDot={{ r: 4, fill: chart4Color }}
        />
        <Line
          type="monotone"
          dataKey="memory"
          stroke={chart5Color}
          strokeWidth={2}
          dot={false}
          name="Memory %"
          activeDot={{ r: 4, fill: chart5Color }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
