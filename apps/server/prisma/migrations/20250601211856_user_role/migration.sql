/*
  Warnings:

  - The values [JUDGE] on the enum `User_role` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `user` MODIFY `role` ENUM('ROOT', 'SYSTEM', 'ADMIN', 'MODERATOR', 'USER', 'GUEST') NOT NULL DEFAULT 'USER';
