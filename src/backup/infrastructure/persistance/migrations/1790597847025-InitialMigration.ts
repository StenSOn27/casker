import type { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialMigration1790597847025 implements MigrationInterface {
  name = 'InitialMigration1790597847025';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "backup_result_model" ("id" varchar PRIMARY KEY NOT NULL, "driverType" varchar NOT NULL, "filePath" varchar NOT NULL, "sizeBytes" bigint NOT NULL, "status" varchar NOT NULL, "errorMessage" varchar, "created_at" datetime NOT NULL DEFAULT (datetime('now')))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "backup_result_model"`);
  }
}
