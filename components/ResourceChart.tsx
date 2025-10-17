import React from 'react';
import type { ResourceUsage } from '../types';
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

interface ResourceChartProps {
  data: ResourceUsage[];
  onHover: (timestamp: number | null) => void;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-3 bg-primary border border-slate-600 rounded-lg shadow-xl text-sm">
        <p className="label font-bold text-neutral mb-2">{`Time: ${new Date(label).toLocaleTimeString()}`}</p>
        {payload.map((p: any) => (
            <p key={p.dataKey} style={{ color: p.stroke }}>{`${p.name}: ${p.value.toFixed(2)}${p.unit || ''}`}</p>
        ))}
      </div>
    );
  }
  return null;
};

// A sub-component for individual charts to keep code DRY
const IndividualChart = ({ title, data, lines, unit, domain, onHover }: any) => (
    <div className="bg-base-100 p-4 rounded-lg border border-slate-700">
        <h4 className="text-lg font-semibold text-neutral mb-4 text-center">{title}</h4>
        <ResponsiveContainer width="100%" height={250}>
            <LineChart 
                data={data}
                margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                // FIX: Explicitly type `e` as `any` to resolve a typing issue where the inferred type `MouseHandlerDataParam` lacks the `activePayload` property.
                onMouseMove={(e: any) => {
                    if (e.activePayload && e.activePayload.length > 0) {
                        onHover(e.activePayload[0].payload.timestamp);
                    }
                }}
                onMouseLeave={() => onHover(null)}
            >
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis 
                    dataKey="time" 
                    stroke="#94a3b8" 
                    tick={{ fill: '#94a3b8', fontSize: 10 }} 
                    unit="s"
                />
                <YAxis 
                    stroke="#94a3b8" 
                    tick={{ fill: '#94a3b8', fontSize: 10 }}
                    unit={unit}
                    domain={domain}
                    width={40}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                {lines.map((line: any) => (
                    <Line key={line.dataKey} type="monotone" dataKey={line.dataKey} name={line.name} stroke={line.stroke} strokeWidth={2} dot={false} unit={unit} />
                ))}
            </LineChart>
        </ResponsiveContainer>
    </div>
);


const ResourceChart: React.FC<ResourceChartProps> = ({ data, onHover }) => {
  const startTime = data.length > 0 ? data[0].timestamp : 0;
  const formattedData = data.map(d => ({
    ...d,
    time: (d.timestamp - startTime) / 1000,
  }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <IndividualChart 
            title="CPU Usage"
            data={formattedData}
            lines={[{ dataKey: 'cpu', name: 'CPU', stroke: '#22d3ee'}]}
            unit="%"
            domain={[0, 100]}
            onHover={onHover}
        />
        <IndividualChart 
            title="Memory Usage"
            data={formattedData}
            lines={[{ dataKey: 'memory', name: 'Memory', stroke: '#a78bfa'}]}
            unit=" MB"
            onHover={onHover}
        />
        <IndividualChart 
            title="Disk Usage"
            data={formattedData}
            lines={[{ dataKey: 'disk', name: 'Disk', stroke: '#4ade80'}]}
            unit="%"
            domain={[0, 100]}
            onHover={onHover}
        />
        <IndividualChart 
            title="Network I/O"
            data={formattedData}
            lines={[
                { dataKey: 'networkIn', name: 'In', stroke: '#fb923c'},
                { dataKey: 'networkOut', name: 'Out', stroke: '#facc15'}
            ]}
            unit=" MB/s"
            onHover={onHover}
        />
    </div>
  );
};

export default ResourceChart;