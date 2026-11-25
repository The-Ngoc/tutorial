import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateArticlesAndTagsTable1795579000000 implements MigrationInterface {
    name = 'CreateArticlesAndTagsTable1795579000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE \`tags\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`name\` varchar(255) NOT NULL,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                UNIQUE INDEX \`IDX_tags_name\` (\`name\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB
        `);

        await queryRunner.query(`
            CREATE TABLE \`articles\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`slug\` varchar(255) NOT NULL,
                \`title\` varchar(255) NOT NULL,
                \`description\` varchar(255) NOT NULL,
                \`body\` text NOT NULL,
                \`author_id\` int NOT NULL,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                UNIQUE INDEX \`IDX_articles_slug\` (\`slug\`),
                PRIMARY KEY (\`id\`),
                CONSTRAINT \`FK_articles_author\` FOREIGN KEY (\`author_id\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
            ) ENGINE=InnoDB
        `);

        await queryRunner.query(`
            CREATE TABLE \`article_tags\` (
                \`article_id\` int NOT NULL,
                \`tag_id\` int NOT NULL,
                INDEX \`IDX_article_tags_article_id\` (\`article_id\`),
                INDEX \`IDX_article_tags_tag_id\` (\`tag_id\`),
                PRIMARY KEY (\`article_id\`, \`tag_id\`),
                CONSTRAINT \`FK_article_tags_article\` FOREIGN KEY (\`article_id\`) REFERENCES \`articles\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
                CONSTRAINT \`FK_article_tags_tag\` FOREIGN KEY (\`tag_id\`) REFERENCES \`tags\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
            ) ENGINE=InnoDB
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`article_tags\` DROP FOREIGN KEY \`FK_article_tags_tag\``);
        await queryRunner.query(`ALTER TABLE \`article_tags\` DROP FOREIGN KEY \`FK_article_tags_article\``);
        await queryRunner.query(`DROP INDEX \`IDX_article_tags_tag_id\` ON \`article_tags\``);
        await queryRunner.query(`DROP INDEX \`IDX_article_tags_article_id\` ON \`article_tags\``);
        await queryRunner.query(`DROP TABLE \`article_tags\``);

        await queryRunner.query(`ALTER TABLE \`articles\` DROP FOREIGN KEY \`FK_articles_author\``);
        await queryRunner.query(`DROP INDEX \`IDX_articles_slug\` ON \`articles\``);
        await queryRunner.query(`DROP TABLE \`articles\``);

        await queryRunner.query(`DROP INDEX \`IDX_tags_name\` ON \`tags\``);
        await queryRunner.query(`DROP TABLE \`tags\``);
    }
}
