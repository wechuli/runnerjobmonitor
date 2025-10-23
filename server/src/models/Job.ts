import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from "typeorm";
import { Installation } from "./Installation";
import { Metric } from "./Metric";

@Entity()
export class Job {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column("varchar", { unique: true })
  githubJobId!: string;

  @Column("varchar")
  githubRunId!: string;

  @Column("varchar")
  name!: string;

  @Column("varchar")
  status!: string; // queued, in_progress, completed

  @Column("varchar", { nullable: true })
  conclusion?: string; // success, failure, cancelled, skipped

  @Column("varchar")
  repository!: string;

  @Column("varchar", { nullable: true })
  branch?: string;

  @Column("varchar", { nullable: true })
  commitHash?: string;

  @Column("varchar", { nullable: true })
  workflowName?: string;

  @Column("varchar", { nullable: true })
  runnerName?: string;

  @Column("varchar", { nullable: true })
  runnerOs?: string;

  @Column("varchar", { nullable: true })
  runnerArch?: string;

  @Column("timestamptz", { nullable: true })
  startedAt?: Date;

  @Column("timestamptz", { nullable: true })
  completedAt?: Date;

  @Column("varchar", { nullable: true })
  logUrl?: string;

  @Column("int")
  installationId!: number;

  @ManyToOne(() => Installation, (installation) => installation.jobs)
  @JoinColumn({ name: "installationId" })
  installation!: Installation;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToMany(() => Metric, (metric) => metric.job)
  metrics!: Metric[];
}
