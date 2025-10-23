import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  Index,
  JoinColumn,
} from "typeorm";
import { Job } from "./Job";

@Entity()
@Index(["jobId", "timestamp"])
export class Metric {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column("int")
  jobId!: number;

  @ManyToOne(() => Job, (job) => job.metrics)
  @JoinColumn({ name: "jobId" })
  job!: Job;

  @Column("timestamptz")
  timestamp!: Date;

  @Column("varchar", { nullable: true })
  hostname?: string;

  @Column("int", { nullable: true })
  cpuCores?: number;

  @Column("float", { nullable: true })
  cpuUsagePercent?: number;

  @Column("bigint", { nullable: true })
  memoryTotalBytes?: string;

  @Column("bigint", { nullable: true })
  memoryUsedBytes?: string;

  @Column("float", { nullable: true })
  memoryUsagePercent?: number;

  @Column("float", { nullable: true })
  diskUsagePercent?: number;

  @Column("bigint", { nullable: true })
  networkRxBytes?: string;

  @Column("bigint", { nullable: true })
  networkTxBytes?: string;

  @Column("text", { nullable: true })
  topProcesses?: string; // JSON string

  @Column("text")
  rawPayload!: string; // Full JSON payload

  @CreateDateColumn()
  createdAt!: Date;
}
