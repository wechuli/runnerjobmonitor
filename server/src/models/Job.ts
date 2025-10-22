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

  @Column({ unique: true })
  githubJobId!: string;

  @Column()
  githubRunId!: string;

  @Column()
  name!: string;

  @Column()
  status!: string; // queued, in_progress, completed

  @Column({ nullable: true })
  conclusion?: string; // success, failure, cancelled, skipped

  @Column()
  repository!: string;

  @Column({ nullable: true })
  branch?: string;

  @Column({ nullable: true })
  commitHash?: string;

  @Column({ nullable: true })
  workflowName?: string;

  @Column({ nullable: true })
  runnerName?: string;

  @Column({ nullable: true })
  runnerOs?: string;

  @Column({ nullable: true })
  runnerArch?: string;

  @Column({ type: "timestamptz", nullable: true })
  startedAt?: Date;

  @Column({ type: "timestamptz", nullable: true })
  completedAt?: Date;

  @Column({ nullable: true })
  logUrl?: string;

  @Column()
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
