import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { MetricDataPoint } from "@/types";

interface ProcessChartProps {
  data: MetricDataPoint[];
}

export const ProcessChart = ({ data }: ProcessChartProps) => {
  const chartData = data.map((point) => {
    const timestamp = point.timestamp.includes("T")
      ? point.timestamp
      : point.timestamp.replace(" ", "T");

    const topProcess = point.system.top_processes[0];
    return {
      time: new Date(timestamp).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }),
      cpu: topProcess?.cpu || 0,
      memory: topProcess?.mem || 0,
      command: topProcess?.command || "N/A",
      pid: topProcess?.pid || 0,
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
          <p style={{ color: "#8b5cf6", margin: 0, fontSize: "14px" }}>
            CPU: {payload[0].value.toFixed(1)}%
          </p>
          <p style={{ color: "#ec4899", margin: 0, fontSize: "14px" }}>
            Memory: {payload[1].value.toFixed(1)}%
          </p>
          <p
            style={{
              color: "#64748b",
              fontSize: "12px",
              margin: "4px 0 0 0",
              fontFamily: "monospace",
              maxWidth: "200px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {payload[0].payload.command}
          </p>
          <p style={{ color: "#94a3b8", fontSize: "11px", margin: 0 }}>
            PID: {payload[0].payload.pid}
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
            value: "Process %",
            angle: -90,
            position: "insideLeft",
            style: { fill: "#64748b" },
          }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{
            color: "#0f172a",
            paddingTop: "10px",
          }}
        />
        <Line
          type="monotone"
          dataKey="cpu"
          stroke="#8b5cf6"
          strokeWidth={2}
          dot={false}
          name="CPU %"
          activeDot={{ r: 4, fill: "#8b5cf6" }}
        />
        <Line
          type="monotone"
          dataKey="memory"
          stroke="#ec4899"
          strokeWidth={2}
          dot={false}
          name="Memory %"
          activeDot={{ r: 4, fill: "#ec4899" }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
