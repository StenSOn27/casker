import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class BackupResultModel {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  driverType!: string;

  @Column()
  filePath!: string;

  @Column()
  sizeBytes!: number;

  @Column()
  status!: string;

  @Column()
  errorMessage?: string | undefined;

  @CreateDateColumn()
  created_at!: Date;
}
