ALTER TABLE `users` ADD COLUMN `deleted_at` DATETIME(3) NULL,
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

UPDATE `users` SET `updated_at` = `created_at`;

ALTER TABLE `users` ALTER COLUMN `updated_at` DROP DEFAULT;
