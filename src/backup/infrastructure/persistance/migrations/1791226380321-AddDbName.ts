import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDbName1791226380321 implements MigrationInterface {
  name = 'AddDbName1791226380321';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "temporary_backup_result_model" ("id" varchar PRIMARY KEY NOT NULL, "driverType" varchar NOT NULL, "filePath" varchar NOT NULL, "sizeBytes" bigint NOT NULL, "status" varchar NOT NULL, "errorMessage" varchar, "created_at" datetime NOT NULL DEFAULT (datetime('now')), "name" varchar NOT NULL)`,
    );
    await queryRunner.query(
      `INSERT INTO "temporary_backup_result_model"("id", "driverType", "filePath", "sizeBytes", "status", "errorMessage", "created_at") SELECT "id", "driverType", "filePath", "sizeBytes", "status", "errorMessage", "created_at" FROM "backup_result_model"`,
    );
    await queryRunner.query(`DROP TABLE "backup_result_model"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_backup_result_model" RENAME TO "backup_result_model"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "backup_result_model" RENAME TO "temporary_backup_result_model"`,
    );
    await queryRunner.query(
      `CREATE TABLE "backup_result_model" ("id" varchar PRIMARY KEY NOT NULL, "driverType" varchar NOT NULL, "filePath" varchar NOT NULL, "sizeBytes" bigint NOT NULL, "status" varchar NOT NULL, "errorMessage" varchar, "created_at" datetime NOT NULL DEFAULT (datetime('now')))`,
    );
    await queryRunner.query(
      `INSERT INTO "backup_result_model"("id", "driverType", "filePath", "sizeBytes", "status", "errorMessage", "created_at") SELECT "id", "driverType", "filePath", "sizeBytes", "status", "errorMessage", "created_at" FROM "temporary_backup_result_model"`,
    );
    await queryRunner.query(`DROP TABLE "temporary_backup_result_model"`);
  }
}
