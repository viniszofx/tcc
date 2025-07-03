/*
  Warnings:

  - Added the required column `role` to the `user_profiles` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "user_profiles" ADD COLUMN     "role" TEXT NOT NULL;
