import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateFavoritesTable1795580000000 implements MigrationInterface {
    name = 'CreateFavoritesTable1795580000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE \`favorites\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`user_id\` int NOT NULL,
                \`article_id\` int NOT NULL,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                UNIQUE INDEX \`IDX_favorites_user_article\` (\`user_id\`, \`article_id\`),
                PRIMARY KEY (\`id\`),
                CONSTRAINT \`FK_favorites_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION,
                CONSTRAINT \`FK_favorites_article\` FOREIGN KEY (\`article_id\`) REFERENCES \`articles\` (\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
            ) ENGINE=InnoDB
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`favorites\` DROP FOREIGN KEY \`FK_favorites_article\``);
        await queryRunner.query(`ALTER TABLE \`favorites\` DROP FOREIGN KEY \`FK_favorites_user\``);
        await queryRunner.query(`DROP INDEX \`IDX_favorites_user_article\` ON \`favorites\``);
        await queryRunner.query(`DROP TABLE \`favorites\``);
    }
}
