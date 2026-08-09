-- DropForeignKey
ALTER TABLE `tasks` DROP FOREIGN KEY `tasks_user_id_fkey`;

-- DropIndex
DROP INDEX `tasks_user_id_done_idx` ON `tasks`;

-- CreateIndex
CREATE INDEX `tasks_user_id_done_created_at_idx` ON `tasks`(`user_id`, `done`, `created_at`);

-- AddForeignKey
ALTER TABLE `tasks` ADD CONSTRAINT `tasks_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
