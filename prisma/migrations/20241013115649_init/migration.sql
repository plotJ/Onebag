-- CreateTable
CREATE TABLE "Backpack" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "carryOnCompliance" DOUBLE PRECISION NOT NULL,
    "dimensions" TEXT,
    "volume" DOUBLE PRECISION,
    "weight" DOUBLE PRECISION,
    "price" DOUBLE PRECISION,
    "brand" TEXT,
    "laptopSize" TEXT,
    "numCompartments" INTEGER,
    "openingType" TEXT,
    "material" TEXT,
    "aesthetic" TEXT,
    "features" TEXT[],
    "pockets" TEXT[],
    "imageUrl" TEXT,

    CONSTRAINT "Backpack_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AirlineCompatibility" (
    "backpackId" TEXT NOT NULL,
    "airlineName" TEXT NOT NULL,
    "isCompatible" BOOLEAN NOT NULL,

    CONSTRAINT "AirlineCompatibility_pkey" PRIMARY KEY ("backpackId","airlineName")
);

-- AddForeignKey
ALTER TABLE "AirlineCompatibility" ADD CONSTRAINT "AirlineCompatibility_backpackId_fkey" FOREIGN KEY ("backpackId") REFERENCES "Backpack"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
