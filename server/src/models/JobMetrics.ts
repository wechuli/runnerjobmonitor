import mongoose, { Schema, Document } from "mongoose";

// Define interfaces for the nested structures
export interface IRepository {
  name: string;
  url: string;
}

export interface IGithubContext {
  user: string;
  repositories: IRepository[];
}

export interface ISystemInfo {
  hostname: string;
  kernel: string;
  uptime_seconds: number;
}

export interface ICpuLoad {
  avg_1min: number;
  avg_5min: number;
  avg_15min: number;
}

export interface ICpuCurrentUsage {
  usage_percent: number;
}

export interface ICpu {
  cores: number;
  model: string;
  load: ICpuLoad;
  current_usage: ICpuCurrentUsage;
}

export interface IMemory {
  total_bytes: number;
  used_bytes: number;
  free_bytes: number;
  available_bytes: number;
  usage_percent: number;
}

export interface IDisk {
  filesystem: string;
  size_bytes: number;
  used_bytes: number;
  available_bytes: number;
  use_percentage: number;
  mounted_on: string;
}

export interface INetworkStats {
  rx_bytes: number;
  tx_bytes: number;
}

export interface INetwork {
  interface: string;
  state: string;
  stats: INetworkStats;
}

export interface ITopProcess {
  pid: number;
  cpu: number;
  mem: number;
  user: string;
  command: string;
}

export interface ISystem {
  info: ISystemInfo;
  cpu: ICpu;
  memory: IMemory;
  disk: IDisk[];
  network: INetwork[];
  top_processes: ITopProcess[];
}

export interface IJobMetrics extends Document {
  timestamp: string;
  job_uuid: string;
  github_context: IGithubContext;
  system: ISystem;
  createdAt: Date;
  updatedAt: Date;
}

// Define the schema
const JobMetricsSchema: Schema = new Schema(
  {
    timestamp: {
      type: String,
      required: true,
    },
    job_uuid: {
      type: String,
      required: true,
      index: true, // Create index on job_uuid
    },
    github_context: {
      user: {
        type: String,
        required: true,
      },
      repositories: [
        {
          name: {
            type: String,
            required: true,
          },
          url: {
            type: String,
            required: true,
          },
        },
      ],
    },
    system: {
      info: {
        hostname: String,
        kernel: String,
        uptime_seconds: Number,
      },
      cpu: {
        cores: Number,
        model: String,
        load: {
          avg_1min: Number,
          avg_5min: Number,
          avg_15min: Number,
        },
        current_usage: {
          usage_percent: Number,
        },
      },
      memory: {
        total_bytes: Number,
        used_bytes: Number,
        free_bytes: Number,
        available_bytes: Number,
        usage_percent: Number,
      },
      disk: [
        {
          filesystem: String,
          size_bytes: Number,
          used_bytes: Number,
          available_bytes: Number,
          use_percentage: Number,
          mounted_on: String,
        },
      ],
      network: [
        {
          interface: String,
          state: String,
          stats: {
            rx_bytes: Number,
            tx_bytes: Number,
          },
        },
      ],
      top_processes: [
        {
          pid: Number,
          cpu: Number,
          mem: Number,
          user: String,
          command: String,
        },
      ],
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  }
);

// Create compound index for better query performance
JobMetricsSchema.index({ job_uuid: 1, timestamp: -1 });
JobMetricsSchema.index({ "github_context.user": 1 });

export const JobMetrics = mongoose.model<IJobMetrics>(
  "JobMetrics",
  JobMetricsSchema
);
