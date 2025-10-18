import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { MetricChartData } from '@/types';

interface MemoryChartProps {
  data: MetricChartData[];
}

const MemoryChart: React.FC<MemoryChartProps> = ({ data }) => {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        No memory metrics data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="timestamp"
          tickFormatter={(value) => {
            const date = new Date(value);
            return date.toLocaleTimeString();
          }}
          className="text-xs"
        />
        <YAxis 
          label={{ value: 'Memory Usage (%)', angle: -90, position: 'insideLeft' }}
          className="text-xs"
        />
        <Tooltip
          labelFormatter={(value) => new Date(value).toLocaleString()}
          formatter={(value: number) => [`${value.toFixed(2)}%`, 'Memory']}
          contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
        />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="memory" 
          stroke="hsl(142.1 76.2% 36.3%)" 
          strokeWidth={2}
          name="Memory %" 
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default MemoryChart;
