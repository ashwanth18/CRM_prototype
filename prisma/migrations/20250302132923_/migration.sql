/*
  Warnings:

  - The values [RESOLVED,REJECTED,CLOSED] on the enum `CaseStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `assignedAt` on the `CaseProvider` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `CaseProvider` table. All the data in the column will be lost.
  - You are about to drop the column `address` on the `ClientProfile` table. All the data in the column will be lost.
  - You are about to drop the column `agreement` on the `ClientProfile` table. All the data in the column will be lost.
  - You are about to drop the column `companyProfile` on the `ClientProfile` table. All the data in the column will be lost.
  - You are about to drop the column `nameCard` on the `ClientProfile` table. All the data in the column will be lost.
  - You are about to drop the column `address` on the `Provider` table. All the data in the column will be lost.
  - You are about to drop the column `contactPerson` on the `Provider` table. All the data in the column will be lost.
  - You are about to drop the column `country` on the `Provider` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `Provider` table. All the data in the column will be lost.
  - You are about to drop the column `phoneNumber` on the `Provider` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `CaseTypeProviderType` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CaseTypeRequirement` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `location` to the `Case` table without a default value. This is not possible if the table is not empty.
  - Added the required column `requiredAssistance` to the `Case` table without a default value. This is not possible if the table is not empty.
  - Added the required column `symptoms` to the `Case` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Case` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `CaseProvider` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `CaseProvider` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `type` on the `Provider` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "CasePriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- AlterEnum
BEGIN;
CREATE TYPE "CaseStatus_new" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
ALTER TABLE "Case" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Case" ALTER COLUMN "status" TYPE "CaseStatus_new" USING ("status"::text::"CaseStatus_new");
ALTER TYPE "CaseStatus" RENAME TO "CaseStatus_old";
ALTER TYPE "CaseStatus_new" RENAME TO "CaseStatus";
DROP TYPE "CaseStatus_old";
ALTER TABLE "Case" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- DropForeignKey
ALTER TABLE "Case" DROP CONSTRAINT "Case_assignedToId_fkey";

-- DropForeignKey
ALTER TABLE "CaseTypeProviderType" DROP CONSTRAINT "CaseTypeProviderType_caseTypeId_fkey";

-- DropForeignKey
ALTER TABLE "CaseTypeRequirement" DROP CONSTRAINT "CaseTypeRequirement_caseTypeId_fkey";

-- DropForeignKey
ALTER TABLE "ClientProfile" DROP CONSTRAINT "ClientProfile_userId_fkey";

-- DropForeignKey
ALTER TABLE "EmployeeProfile" DROP CONSTRAINT "EmployeeProfile_userId_fkey";

-- DropIndex
DROP INDEX "CaseProvider_caseId_providerId_key";

-- AlterTable
ALTER TABLE "Case" ADD COLUMN     "currentMedications" TEXT,
ADD COLUMN     "location" TEXT NOT NULL,
ADD COLUMN     "medicalHistory" TEXT,
ADD COLUMN     "priority" "CasePriority" NOT NULL DEFAULT 'MEDIUM',
ADD COLUMN     "requiredAssistance" TEXT NOT NULL,
ADD COLUMN     "symptoms" TEXT NOT NULL,
ADD COLUMN     "title" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "CaseProvider" DROP COLUMN "assignedAt",
DROP COLUMN "role",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "status" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "ClientProfile" DROP COLUMN "address",
DROP COLUMN "agreement",
DROP COLUMN "companyProfile",
DROP COLUMN "nameCard";

-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "description" TEXT;

-- AlterTable
ALTER TABLE "Provider" DROP COLUMN "address",
DROP COLUMN "contactPerson",
DROP COLUMN "country",
DROP COLUMN "email",
DROP COLUMN "phoneNumber",
DROP COLUMN "type",
ADD COLUMN     "type" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "emailVerified" TIMESTAMP(3),
ADD COLUMN     "image" TEXT,
ALTER COLUMN "name" DROP NOT NULL;

-- DropTable
DROP TABLE "CaseTypeProviderType";

-- DropTable
DROP TABLE "CaseTypeRequirement";

-- DropEnum
DROP TYPE "ProviderType";

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE INDEX "Case_createdById_idx" ON "Case"("createdById");

-- CreateIndex
CREATE INDEX "Case_clientId_idx" ON "Case"("clientId");

-- CreateIndex
CREATE INDEX "Case_assignedToId_idx" ON "Case"("assignedToId");

-- CreateIndex
CREATE INDEX "Case_caseTypeId_idx" ON "Case"("caseTypeId");

-- CreateIndex
CREATE INDEX "CaseHistory_caseId_idx" ON "CaseHistory"("caseId");

-- CreateIndex
CREATE INDEX "CaseHistory_userId_idx" ON "CaseHistory"("userId");

-- CreateIndex
CREATE INDEX "CaseProvider_caseId_idx" ON "CaseProvider"("caseId");

-- CreateIndex
CREATE INDEX "CaseProvider_providerId_idx" ON "CaseProvider"("providerId");

-- CreateIndex
CREATE INDEX "Document_caseId_idx" ON "Document"("caseId");

-- CreateIndex
CREATE INDEX "Document_uploadedById_idx" ON "Document"("uploadedById");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientProfile" ADD CONSTRAINT "ClientProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeProfile" ADD CONSTRAINT "EmployeeProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Case" ADD CONSTRAINT "Case_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
