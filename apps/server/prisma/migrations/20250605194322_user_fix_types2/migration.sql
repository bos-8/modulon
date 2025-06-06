/*
  Warnings:

  - You are about to alter the column `email` on the `user` table. The data in that column could be lost. The data in that column will be cast from `VarChar(320)` to `VarChar(191)`.

*/
-- AlterTable
ALTER TABLE `user` MODIFY `name` VARCHAR(191) NULL,
    MODIFY `username` VARCHAR(191) NULL,
    MODIFY `email` VARCHAR(191) NULL,
    MODIFY `password` VARCHAR(191) NULL;
