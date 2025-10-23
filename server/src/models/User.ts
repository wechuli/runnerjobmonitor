import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { Installation } from "./Installation";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column("varchar", { unique: true })
  githubId!: string;

  @Column("varchar")
  username!: string;

  @Column("varchar", { nullable: true })
  email?: string;

  @Column("varchar", { nullable: true })
  avatarUrl?: string;

  @Column("varchar", { nullable: true })
  accessToken?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToMany(() => Installation, (installation) => installation.user)
  installations!: Installation[];
}
