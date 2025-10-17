import React from 'react';
import { Box, Text } from '@chakra-ui/react';
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
import { MetricChartData } from '../types';

interface MetricsChartProps {
  data: MetricChartData[];
}

const MetricsChart: React.FC<MetricsChartProps> = ({ data }) => {
  if (data.length === 0) {
    return (
      <Box textAlign="center" py={8}>
        <Text color="gray.500">No metrics data available</Text>
      </Box>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="timestamp"
          tickFormatter={(value) => {
            const date = new Date(value);
            return date.toLocaleTimeString();
          }}
        />
        <YAxis />
        <Tooltip
          labelFormatter={(value) => new Date(value).toLocaleString()}
          formatter={(value: number) => value.toFixed(2)}
        />
        <Legend />
        <Line type="monotone" dataKey="cpu" stroke="#8884d8" name="CPU %" />
        <Line type="monotone" dataKey="memory" stroke="#82ca9d" name="Memory %" />
        <Line type="monotone" dataKey="disk" stroke="#ffc658" name="Disk %" />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default MetricsChart;
