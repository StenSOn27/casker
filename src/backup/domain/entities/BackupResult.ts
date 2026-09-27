import { v4 as uuidv4 } from 'uuid';
import type { DatabaseConnectionProps } from '../value-objects/ConnectionConfig.js';

type Status = 'success' | 'failed';
type DriverType = DatabaseConnectionProps['type'];

export class BackupResult {
  private readonly id: string;
  private readonly driverType: DriverType;
  private readonly filePath: string;
  private readonly sizeBytes: number;
  private readonly status: Status;
  private readonly errorMessage?: string | undefined = undefined;
  private readonly createdAt: Date;

  constructor(
    driverType: DriverType,
    filePath: string,
    sizeBytes: number,
    status: Status,
    errorMessage?: string,
  ) {
    this.id = uuidv4();
    this.driverType = driverType;
    this.filePath = filePath;
    this.sizeBytes = sizeBytes;
    this.status = status;
    this.errorMessage = errorMessage;
    this.createdAt = new Date();
  }
}
