import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateCommentsTable1795581000000 implements MigrationInterface {
    name = 'CreateCommentsTable1795581000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE \`comments\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`body\` text NOT NULL,
                \`article_id\` int NOT NULL,
                \`author_id\` int NOT NULL,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                INDEX \`IDX_comments_article_id\` (\`article_id\`),
                INDEX \`IDX_comments_author_id\` (\`author_id\`),
                PRIMARY KEY (\`id\`),
                CONSTRAINT \`FK_comments_article\` FOREIGN KEY (\`article_id\`) REFERENCES \`articles\` (\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION,
                CONSTRAINT \`FK_comments_author\` FOREIGN KEY (\`author_id\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
            ) ENGINE=InnoDB
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`comments\` DROP FOREIGN KEY \`FK_comments_author\``);
        await queryRunner.query(`ALTER TABLE \`comments\` DROP FOREIGN KEY \`FK_comments_article\``);
        await queryRunner.query(`DROP INDEX \`IDX_comments_author_id\` ON \`comments\``);
        await queryRunner.query(`DROP INDEX \`IDX_comments_article_id\` ON \`comments\``);
        await queryRunner.query(`DROP TABLE \`comments\``);
    }
}
