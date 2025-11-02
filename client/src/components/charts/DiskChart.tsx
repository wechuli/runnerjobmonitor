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

interface DiskChartProps {
  data: MetricDataPoint[];
}

const formatBytes = (bytes: number): string => {
  const gb = bytes / (1024 * 1024 * 1024);
  return `${gb.toFixed(2)} GB`;
};

export const DiskChart = ({ data }: DiskChartProps) => {
  const chartData = data.map((point) => {
    const timestamp = point.timestamp.includes("T")
      ? point.timestamp
      : point.timestamp.replace(" ", "T");

    const diskInfo = point.system.disk[0];
    return {
      time: new Date(timestamp).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }),
      disk: diskInfo?.use_percentage || 0,
      used: diskInfo?.used_bytes || 0,
      total: diskInfo?.size_bytes || 0,
      filesystem: diskInfo?.filesystem || "N/A",
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
          <p style={{ color: "#f59e0b", margin: 0 }}>
            Disk: {payload[0].value.toFixed(1)}%
          </p>
          <p style={{ color: "#64748b", fontSize: "12px", margin: 0 }}>
            {formatBytes(payload[0].payload.used)} /{" "}
            {formatBytes(payload[0].payload.total)}
          </p>
          <p style={{ color: "#64748b", fontSize: "11px", margin: 0 }}>
            {payload[0].payload.filesystem}
          </p>
        </div>
      );
    }
    return null;
  };

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
            value: "Disk %",
            angle: -90,
            position: "insideLeft",
            style: { fill: "#64748b" },
          }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="disk"
          stroke="#f59e0b"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: "#f59e0b" }}
          name="Disk %"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
