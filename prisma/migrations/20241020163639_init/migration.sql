-- CreateTable
CREATE TABLE "Backpack" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "link" TEXT,
    "image" TEXT,
    "price" DOUBLE PRECISION,
    "volume" DOUBLE PRECISION,
    "openingType" TEXT,
    "carryOnCompliance" DOUBLE PRECISION NOT NULL,
    "weightToVolume" TEXT,
    "heightCm" DOUBLE PRECISION,
    "widthCm" DOUBLE PRECISION,
    "depthCm" DOUBLE PRECISION,
    "weightKg" DOUBLE PRECISION,
    "heightIn" DOUBLE PRECISION,
    "widthIn" DOUBLE PRECISION,
    "depthIn" DOUBLE PRECISION,
    "weightLb" DOUBLE PRECISION,
    "compartments" INTEGER,
    "laptopSize" TEXT,
    "laptopAccess" TEXT,
    "passport" TEXT,
    "waterBottle" TEXT,
    "organizer" TEXT,
    "shoe" TEXT,
    "hydration" TEXT,
    "aesthetic" TEXT,
    "expands" BOOLEAN,
    "expandedVolume" DOUBLE PRECISION,
    "compression" INTEGER,
    "frame" TEXT,
    "waterResist" BOOLEAN,
    "rainfly" BOOLEAN,
    "molle" TEXT,
    "selfStand" BOOLEAN,
    "lashPoints" INTEGER,
    "backpack" BOOLEAN,
    "shoulder" BOOLEAN,
    "hipBelt" TEXT,
    "sternum" TEXT,
    "loadLifters" BOOLEAN,
    "handles" INTEGER,
    "passThrough" BOOLEAN,
    "material" TEXT,
    "notes" TEXT,
    "verified" TEXT,
    "discontinued" BOOLEAN,

    CONSTRAINT "Backpack_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AirlineCompatibility" (
    "backpackId" TEXT NOT NULL,
    "airlineName" TEXT NOT NULL,
    "isCompatible" BOOLEAN NOT NULL,

    CONSTRAINT "AirlineCompatibility_pkey" PRIMARY KEY ("backpackId","airlineName")
);

-- CreateIndex
CREATE UNIQUE INDEX "Backpack_name_key" ON "Backpack"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Backpack_slug_key" ON "Backpack"("slug");

-- AddForeignKey
ALTER TABLE "AirlineCompatibility" ADD CONSTRAINT "AirlineCompatibility_backpackId_fkey" FOREIGN KEY ("backpackId") REFERENCES "Backpack"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
