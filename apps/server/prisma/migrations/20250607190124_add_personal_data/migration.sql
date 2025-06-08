/*
  Warnings:

  - Made the column `email` on table `user` required. This step will fail if there are existing NULL values in that column.
  - Made the column `password` on table `user` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `user` MODIFY `email` VARCHAR(191) NOT NULL,
    MODIFY `password` TEXT NOT NULL;

-- CreateTable
CREATE TABLE `PersonalData` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `firstName` VARCHAR(191) NULL,
    `middleName` VARCHAR(191) NULL,
    `lastName` VARCHAR(191) NULL,
    `phoneNumber` VARCHAR(191) NULL,
    `address` VARCHAR(191) NULL,
    `city` VARCHAR(191) NULL,
    `zipCode` VARCHAR(191) NULL,
    `country` VARCHAR(191) NULL,
    `birthDate` DATETIME(3) NULL,
    `canUserEdit` BOOLEAN NOT NULL DEFAULT true,
    `gender` ENUM('MALE', 'FEMALE', 'OTHER') NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `PersonalData_userId_key`(`userId`),
    INDEX `PersonalData_userId_idx`(`userId`),
    INDEX `PersonalData_firstName_lastName_idx`(`firstName`, `lastName`),
    INDEX `PersonalData_phoneNumber_idx`(`phoneNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `PersonalData` ADD CONSTRAINT `PersonalData_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
