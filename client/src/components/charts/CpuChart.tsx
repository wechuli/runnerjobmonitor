import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { MetricDataPoint } from "@/types";

interface CpuChartProps {
  data: MetricDataPoint[];
}

export const CpuChart = ({ data }: CpuChartProps) => {
  console.log("CpuChart received data:", data);
  console.log("First data point structure:", data[0]);

  const chartData = data.map((point) => {
    // Handle both ISO format and space-separated format
    const timestamp = point.timestamp.includes("T")
      ? point.timestamp
      : point.timestamp.replace(" ", "T");

    return {
      time: new Date(timestamp).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }),
      cpu: point.system.cpu.current_usage.usage_percent,
    };
  });

  console.log("CpuChart chartData:", chartData);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        data={chartData}
        margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.3} />
        <XAxis
          dataKey="time"
          stroke="#64748b"
          fontSize={12}
          tickLine={false}
          axisLine={{ stroke: "#e2e8f0" }}
        />
        <YAxis
          stroke="#64748b"
          fontSize={12}
          tickLine={false}
          axisLine={{ stroke: "#e2e8f0" }}
          domain={[0, 100]}
          label={{
            value: "CPU %",
            angle: -90,
            position: "insideLeft",
            style: { fill: "#64748b" },
          }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
            color: "#0f172a",
          }}
          labelStyle={{
            color: "#0f172a",
            fontWeight: 600,
          }}
          itemStyle={{ color: "#3b82f6" }}
        />
        <Line
          type="monotone"
          dataKey="cpu"
          stroke="#3b82f6"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: "#3b82f6" }}
          name="CPU %"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
