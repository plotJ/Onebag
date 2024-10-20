/*
  Warnings:

  - You are about to drop the column `brand` on the `Backpack` table. All the data in the column will be lost.
  - You are about to drop the column `dimensions` on the `Backpack` table. All the data in the column will be lost.
  - You are about to drop the column `features` on the `Backpack` table. All the data in the column will be lost.
  - You are about to drop the column `imageUrl` on the `Backpack` table. All the data in the column will be lost.
  - You are about to drop the column `numCompartments` on the `Backpack` table. All the data in the column will be lost.
  - You are about to drop the column `pockets` on the `Backpack` table. All the data in the column will be lost.
  - You are about to drop the column `weight` on the `Backpack` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `Backpack` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `Backpack` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `Backpack` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Backpack" DROP COLUMN "brand",
DROP COLUMN "dimensions",
DROP COLUMN "features",
DROP COLUMN "imageUrl",
DROP COLUMN "numCompartments",
DROP COLUMN "pockets",
DROP COLUMN "weight",
ADD COLUMN     "backpack" BOOLEAN,
ADD COLUMN     "compartments" INTEGER,
ADD COLUMN     "compression" INTEGER,
ADD COLUMN     "depthCm" DOUBLE PRECISION,
ADD COLUMN     "depthIn" DOUBLE PRECISION,
ADD COLUMN     "discontinued" BOOLEAN,
ADD COLUMN     "expands" BOOLEAN,
ADD COLUMN     "frame" TEXT,
ADD COLUMN     "handles" INTEGER,
ADD COLUMN     "heightCm" DOUBLE PRECISION,
ADD COLUMN     "heightIn" DOUBLE PRECISION,
ADD COLUMN     "hipBelt" TEXT,
ADD COLUMN     "hydration" TEXT,
ADD COLUMN     "image" TEXT,
ADD COLUMN     "laptopAccess" TEXT,
ADD COLUMN     "lashPoints" INTEGER,
ADD COLUMN     "loadLifters" BOOLEAN,
ADD COLUMN     "molle" TEXT,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "organizer" TEXT,
ADD COLUMN     "passThrough" BOOLEAN,
ADD COLUMN     "passport" TEXT,
ADD COLUMN     "rainfly" BOOLEAN,
ADD COLUMN     "selfStand" BOOLEAN,
ADD COLUMN     "shoe" TEXT,
ADD COLUMN     "shoulder" BOOLEAN,
ADD COLUMN     "slug" TEXT NOT NULL,
ADD COLUMN     "sternum" TEXT,
ADD COLUMN     "verified" TEXT,
ADD COLUMN     "waterBottle" TEXT,
ADD COLUMN     "waterResist" BOOLEAN,
ADD COLUMN     "weightKg" DOUBLE PRECISION,
ADD COLUMN     "weightLb" DOUBLE PRECISION,
ADD COLUMN     "weightToVolume" TEXT,
ADD COLUMN     "widthCm" DOUBLE PRECISION,
ADD COLUMN     "widthIn" DOUBLE PRECISION;

-- CreateIndex
CREATE UNIQUE INDEX "Backpack_name_key" ON "Backpack"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Backpack_slug_key" ON "Backpack"("slug");
