import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class BackupResultModel {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar' })
  driverType!: string;

  @Column({ type: 'varchar' })
  filePath!: string;

  @Column({ type: 'bigint' })
  sizeBytes!: number;

  @Column({ type: 'varchar' })
  status!: string;

  @Column({ type: 'varchar' })
  name!: string;

  @Column({ type: 'varchar', nullable: true })
  errorMessage?: string | undefined;

  @CreateDateColumn({ type: 'datetime' })
  created_at!: Date;
}
