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
import { User } from "./User";
import { Job } from "./Job";

@Entity()
export class Installation {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column("varchar", { unique: true })
  githubInstallationId!: string;

  @Column("varchar")
  accountLogin!: string;

  @Column("varchar")
  accountType!: string; // "User" or "Organization"

  @Column("varchar", { nullable: true })
  avatarUrl?: string;

  @Column("int", { nullable: true })
  userId?: number;

  @ManyToOne(() => User, (user) => user.installations, { nullable: true })
  @JoinColumn({ name: "userId" })
  user?: User;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToMany(() => Job, (job) => job.installation)
  jobs!: Job[];
}
