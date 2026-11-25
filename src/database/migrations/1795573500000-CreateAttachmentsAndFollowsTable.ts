import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateAttachmentsAndFollowsTable1795573500000 implements MigrationInterface {
    name = 'CreateAttachmentsAndFollowsTable1795573500000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE \`attachments\` (
                \`id\` varchar(36) NOT NULL,
                \`attachable_type\` varchar(255) NOT NULL,
                \`attachable_id\` varchar(255) NOT NULL,
                \`url\` varchar(255) NOT NULL,
                \`file_name\` varchar(255) NOT NULL,
                \`file_type\` varchar(255) NOT NULL,
                \`file_size\` int NOT NULL,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                INDEX \`IDX_attachments_attachable\` (\`attachable_type\`, \`attachable_id\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB
        `);

        await queryRunner.query(`
            CREATE TABLE \`follows\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`follower_id\` int NOT NULL,
                \`following_id\` int NOT NULL,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                UNIQUE INDEX \`IDX_follows_follower_following\` (\`follower_id\`, \`following_id\`),
                PRIMARY KEY (\`id\`),
                CONSTRAINT \`FK_follows_follower\` FOREIGN KEY (\`follower_id\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION,
                CONSTRAINT \`FK_follows_following\` FOREIGN KEY (\`following_id\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
            ) ENGINE=InnoDB
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`follows\` DROP FOREIGN KEY \`FK_follows_following\``);
        await queryRunner.query(`ALTER TABLE \`follows\` DROP FOREIGN KEY \`FK_follows_follower\``);
        await queryRunner.query(`DROP INDEX \`IDX_follows_follower_following\` ON \`follows\``);
        await queryRunner.query(`DROP TABLE \`follows\``);
        await queryRunner.query(`DROP INDEX \`IDX_attachments_attachable\` ON \`attachments\``);
        await queryRunner.query(`DROP TABLE \`attachments\``);
    }
}
