import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Photo {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column("varchar")
  name!: string;

  @Column("text")
  description!: string;

  @Column("varchar")
  filename!: string;

  @Column("int")
  views!: number;

  @Column("boolean")
  isPublished!: boolean;
}
