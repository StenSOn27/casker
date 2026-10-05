import { v4 as uuidv4 } from 'uuid';
import type { DatabaseConnectionProps } from '../value-objects/ConnectionConfig.js';

export type Status = 'success' | 'failed';
export type DriverType = DatabaseConnectionProps['type'];

export class BackupResult {
  private readonly id: string;
  private readonly driverType: DriverType;
  private readonly filePath: string;
  private readonly sizeBytes: number;
  private readonly status: Status;
  private readonly name: string;
  private readonly errorMessage?: string | undefined = undefined;
  private readonly createdAt: Date;

  private constructor(
    id: string,
    driverType: DriverType,
    filePath: string,
    sizeBytes: number,
    status: Status,
    name: string,
    createdAt: Date,
    errorMessage?: string,
  ) {
    this.id = id;
    this.driverType = driverType;
    this.filePath = filePath;
    this.sizeBytes = sizeBytes;
    this.status = status;
    this.name = name;
    this.errorMessage = errorMessage;
    this.createdAt = createdAt;
  }

  static create(
    driverType: DriverType,
    filePath: string,
    sizeBytes: number,
    status: Status,
    name: string,
    errorMessage?: string,
  ): BackupResult {
    return new BackupResult(
      uuidv4(),
      driverType,
      filePath,
      sizeBytes,
      status,
      name,
      new Date(),
      errorMessage,
    );
  }

  static reconstitute(
    id: string,
    driverType: DriverType,
    filePath: string,
    sizeBytes: number,
    status: Status,
    name: string,
    createdAt: Date,
    errorMessage?: string,
  ): BackupResult {
    return new BackupResult(
      id,
      driverType,
      filePath,
      sizeBytes,
      status,
      name,
      createdAt,
      errorMessage,
    );
  }

  getId(): string {
    return this.id;
  }

  getDriverType(): DriverType {
    return this.driverType;
  }

  getFilePath(): string {
    return this.filePath;
  }

  getSizeBytes(): number {
    return this.sizeBytes;
  }

  getStatus(): Status {
    return this.status;
  }

  getErrorMessage(): string | undefined {
    return this.errorMessage;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getName(): string {
    return this.name;
  }
}
