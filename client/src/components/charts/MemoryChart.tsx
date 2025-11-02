import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { MetricDataPoint } from "@/types";

interface MemoryChartProps {
  data: MetricDataPoint[];
}

const formatBytes = (bytes: number): string => {
  const gb = bytes / (1024 * 1024 * 1024);
  return `${gb.toFixed(2)} GB`;
};

export const MemoryChart = ({ data }: MemoryChartProps) => {
  const chartData = data.map((point) => {
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
      memory: point.system.memory.usage_percent,
      used: point.system.memory.used_bytes,
      total: point.system.memory.total_bytes,
    };
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
            padding: "8px 12px",
            color: "#0f172a",
          }}
        >
          <p style={{ fontWeight: 600, marginBottom: "4px" }}>{label}</p>
          <p style={{ color: "#10b981", margin: 0 }}>
            Memory: {payload[0].value.toFixed(1)}%
          </p>
          <p style={{ color: "#64748b", fontSize: "12px", margin: 0 }}>
            {formatBytes(payload[0].payload.used)} /{" "}
            {formatBytes(payload[0].payload.total)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart
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
            value: "Memory %",
            angle: -90,
            position: "insideLeft",
            style: { fill: "#64748b" },
          }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="memory"
          stroke="#10b981"
          fill="#10b981"
          fillOpacity={0.3}
          strokeWidth={2}
          name="Memory %"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};
