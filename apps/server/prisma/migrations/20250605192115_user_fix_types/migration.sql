-- DropIndex
DROP INDEX `User_username_idx` ON `user`;

-- AlterTable
ALTER TABLE `user` MODIFY `name` TEXT NULL,
    MODIFY `username` TEXT NULL,
    MODIFY `email` VARCHAR(320) NULL;
