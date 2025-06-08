import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateInitialSchema1709123456789 implements MigrationInterface {
  name = 'CreateInitialSchema1709123456789';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "company" (
        "id" SERIAL NOT NULL,
        "name" character varying NOT NULL,
        "catchPhrase" character varying NOT NULL,
        "bs" character varying NOT NULL,
        CONSTRAINT "PK_company" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "address" (
        "id" SERIAL NOT NULL,
        "street" character varying NOT NULL,
        "suite" character varying NOT NULL,
        "city" character varying NOT NULL,
        "zipcode" character varying NOT NULL,
        "geo" character varying NOT NULL,
        CONSTRAINT "PK_address" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "user" (
        "id" SERIAL NOT NULL,
        "name" character varying NOT NULL,
        "username" character varying NOT NULL,
        "email" character varying NOT NULL,
        "phone" character varying NOT NULL,
        "website" character varying NOT NULL,
        "addressId" integer,
        "companyId" integer,
        CONSTRAINT "REL_user_address" UNIQUE ("addressId"),
        CONSTRAINT "REL_user_company" UNIQUE ("companyId"),
        CONSTRAINT "PK_user" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "user"
      ADD CONSTRAINT "FK_user_address"
      FOREIGN KEY ("addressId")
      REFERENCES "address"("id")
      ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "user"
      ADD CONSTRAINT "FK_user_company"
      FOREIGN KEY ("companyId")
      REFERENCES "company"("id")
      ON DELETE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_user_company"`);
    await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_user_address"`);
    await queryRunner.query(`DROP TABLE "user"`);
    await queryRunner.query(`DROP TABLE "address"`);
    await queryRunner.query(`DROP TABLE "company"`);
  }
} 