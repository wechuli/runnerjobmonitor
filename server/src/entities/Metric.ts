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

  @Column()
  jobId!: number;

  @ManyToOne(() => Job, (job) => job.metrics)
  @JoinColumn({ name: "jobId" })
  job!: Job;

  @Column({ type: "timestamptz" })
  timestamp!: Date;

  @Column({ nullable: true })
  hostname?: string;

  @Column({ nullable: true, type: "int" })
  cpuCores?: number;

  @Column({ nullable: true, type: "float" })
  cpuUsagePercent?: number;

  @Column({ nullable: true, type: "bigint" })
  memoryTotalBytes?: string;

  @Column({ nullable: true, type: "bigint" })
  memoryUsedBytes?: string;

  @Column({ nullable: true, type: "float" })
  memoryUsagePercent?: number;

  @Column({ nullable: true, type: "float" })
  diskUsagePercent?: number;

  @Column({ nullable: true, type: "bigint" })
  networkRxBytes?: string;

  @Column({ nullable: true, type: "bigint" })
  networkTxBytes?: string;

  @Column({ nullable: true, type: "text" })
  topProcesses?: string; // JSON string

  @Column({ type: "text" })
  rawPayload!: string; // Full JSON payload

  @CreateDateColumn()
  createdAt!: Date;
}
