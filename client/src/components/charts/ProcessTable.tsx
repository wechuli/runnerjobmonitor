import { useState } from "react";
import type { MetricDataPoint } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ProcessTableProps {
  data: MetricDataPoint[];
}

export const ProcessTable = ({ data }: ProcessTableProps) => {
  const [selectedTime, setSelectedTime] = useState(data.length - 1);

  // Get the latest snapshot
  const currentSnapshot = data[selectedTime];
  const processes = currentSnapshot?.system.top_processes || [];
  const totalCores = currentSnapshot?.system.cpu.cores || 1;

  // Calculate process frequency across all snapshots
  const processFrequency = new Map<string, number>();
  data.forEach((point) => {
    point.system.top_processes.forEach((proc) => {
      const key = proc.command.split(" ")[0]; // Get base command
      processFrequency.set(key, (processFrequency.get(key) || 0) + 1);
    });
  });

  const formatCommand = (cmd: string) => {
    // Extract meaningful part of command
    const parts = cmd.split("/");
    const baseName = parts[parts.length - 1] || cmd;
    return baseName.length > 40 ? baseName.slice(0, 40) + "..." : baseName;
  };

  const getResourceBadge = (value: number, type: "cpu" | "memory") => {
    let variant: "default" | "secondary" | "destructive" | "outline" =
      "secondary";

    if (type === "cpu") {
      if (value > 50) variant = "destructive";
      else if (value > 25) variant = "default";
    } else {
      if (value > 70) variant = "destructive";
      else if (value > 40) variant = "default";
    }

    return variant;
  };

  const timeSlider = () => {
    const timestamps = data.map((point) => {
      const timestamp = point.timestamp.includes("T")
        ? point.timestamp
        : point.timestamp.replace(" ", "T");
      return new Date(timestamp).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });
    });

    return (
      <div className="mb-4 p-4 bg-muted/50 rounded-lg">
        <div className="flex items-center gap-3 mb-2">
          <Activity className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Time Snapshot</span>
          <Badge variant="outline">{timestamps[selectedTime]}</Badge>
        </div>
        <input
          type="range"
          min="0"
          max={data.length - 1}
          value={selectedTime}
          onChange={(e) => setSelectedTime(Number(e.target.value))}
          className="w-full h-2 bg-primary/20 rounded-lg appearance-none cursor-pointer accent-primary"
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>{timestamps[0]}</span>
          <span>{timestamps[timestamps.length - 1]}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-3">
      {/* Compact Header with Time Slider */}
      <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
        <div className="flex items-center gap-2 min-w-fit">
          <Activity className="h-4 w-4 text-muted-foreground" />
          <Badge variant="outline" className="text-xs">
            {(() => {
              const timestamp = data[selectedTime].timestamp.includes("T")
                ? data[selectedTime].timestamp
                : data[selectedTime].timestamp.replace(" ", "T");
              return new Date(timestamp).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: false,
              });
            })()}
          </Badge>
        </div>
        <input
          type="range"
          min="0"
          max={data.length - 1}
          value={selectedTime}
          onChange={(e) => setSelectedTime(Number(e.target.value))}
          className="flex-1 h-2 bg-primary/20 rounded-lg appearance-none cursor-pointer accent-primary"
        />
        <div className="flex gap-3 text-xs text-muted-foreground">
          <span>{totalCores} cores</span>
          <span className="text-purple-500 font-medium">
            {processes.reduce((sum, p) => sum + p.cpu, 0).toFixed(0)}% CPU
          </span>
          <span className="text-pink-500 font-medium">
            {processes.reduce((sum, p) => sum + p.mem, 0).toFixed(1)}% RAM
          </span>
        </div>
      </div>

      {/* Compact Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">PID</TableHead>
              <TableHead>Process</TableHead>
              <TableHead className="w-[100px] text-right">CPU %</TableHead>
              <TableHead className="w-[120px]">CPU Usage</TableHead>
              <TableHead className="w-[100px] text-right">RAM %</TableHead>
              <TableHead className="w-[120px]">RAM Usage</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {processes.slice(0, 5).map((process, idx) => {
              const baseCmd = process.command.split(" ")[0];
              const frequency = processFrequency.get(baseCmd) || 0;
              const frequencyPercent = (frequency / data.length) * 100;

              return (
                <TableRow key={`${process.pid}-${idx}`}>
                  <TableCell className="font-mono text-xs">
                    {process.pid}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span
                        className="font-mono text-xs truncate max-w-[300px]"
                        title={process.command}
                      >
                        {formatCommand(process.command)}
                      </span>
                      {frequencyPercent > 50 && (
                        <Badge variant="secondary" className="text-[10px] h-4">
                          Frequent
                        </Badge>
                      )}
                    </div>
                    {process.user && (
                      <span className="text-[10px] text-muted-foreground">
                        {process.user}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge
                      variant={getResourceBadge(process.cpu, "cpu")}
                      className="text-xs"
                    >
                      {process.cpu.toFixed(1)}%
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-purple-500 transition-all"
                          style={{ width: `${Math.min(process.cpu, 100)}%` }}
                        />
                      </div>
                      {process.cpu > 100 && (
                        <span className="text-[9px] text-muted-foreground">
                          {(process.cpu / 100).toFixed(1)} cores
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge
                      variant={getResourceBadge(process.mem, "memory")}
                      className="text-xs"
                    >
                      {process.mem.toFixed(1)}%
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-pink-500 transition-all"
                        style={{ width: `${Math.min(process.mem, 100)}%` }}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
