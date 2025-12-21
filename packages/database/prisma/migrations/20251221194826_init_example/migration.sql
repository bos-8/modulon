-- CreateEnum
CREATE TYPE "ExampleStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');

-- CreateTable
CREATE TABLE "ExampleItem" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "ExampleStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExampleItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ExampleItem_status_idx" ON "ExampleItem"("status");
