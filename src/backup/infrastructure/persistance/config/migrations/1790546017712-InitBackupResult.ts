import type { MigrationInterface, QueryRunner } from 'typeorm';

export class InitBackupResult1790546017712 implements MigrationInterface {
  name = 'InitBackupResult1790546017712';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "backup_result_model" ("id" varchar PRIMARY KEY NOT NULL, "driverType" varchar NOT NULL, "filePath" varchar NOT NULL, "sizeBytes" integer NOT NULL, "status" varchar NOT NULL, "errorMessage" varchar NOT NULL, "created_at" datetime NOT NULL DEFAULT (datetime('now')))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "backup_result_model"`);
  }
}
