import { PrismaClient } from '@prisma/client'
import { parse } from 'csv-parse/sync'
import fs from 'fs'
import slugify from 'slugify'

const prisma = new PrismaClient()

const BATCH_SIZE = 100

async function loadAirlineCompatibility() {
  const csvData = fs.readFileSync('One Bag Backpacks list - airline compatibility.csv', 'utf8')
  
  const records = parse(csvData, {
    columns: true,
    skip_empty_lines: true,
    trim: true
  })

  const compatibilityMap = new Map()

  for (const record of records) {
    const backpackName = record.name
    delete record.name // Remove the backpack name from the record

    const compatibilities = Object.entries(record).map(([airline, compatible]) => ({
      airlineName: airline,
      isCompatible: compatible === '✔'
    }))

    compatibilityMap.set(backpackName, compatibilities)
  }

  return compatibilityMap
}

async function main() {
  console.log('Starting import process...')
  const csvData = fs.readFileSync('One Bag Backpacks list - bags.csv', 'utf8')
  
  const records = parse(csvData, {
    columns: true,
    skip_empty_lines: true,
    trim: true
  })

  console.log(`Parsed ${records.length} records from CSV`)

  const airlineCompatibilityMap = await loadAirlineCompatibility()

  let batch: any[] = []
  let processedCount = 0
  let errorCount = 0

  for (const record of records) {
    try {
      if (!record.name || record.name.trim() === '') {
        console.warn('Skipping record with empty name:', JSON.stringify(record))
        continue
      }

      const backpackData = createBackpackData(record)
      
      // Add airline compatibility data
      const compatibilities = airlineCompatibilityMap.get(record.name) || []
      backpackData.airlineCompatibilities = {
        create: compatibilities
      }

      batch.push(backpackData)

      if (batch.length >= BATCH_SIZE) {
        await processBatch(batch)
        processedCount += batch.length
        batch = []
      }
    } catch (error) {
      console.error(`Error processing record:`, JSON.stringify(record), error)
      errorCount++
    }
  }

  if (batch.length > 0) {
    await processBatch(batch)
    processedCount += batch.length
  }

  console.log(`Import completed. Processed ${processedCount} records. Errors: ${errorCount}`)
}

function createBackpackData(record: any): any {
  if (!record.B || typeof record.B !== 'string') {
    console.warn('Skipping record due to missing or invalid name:', JSON.stringify(record));
    return null;
  }

  const slug = slugify(record.B, { lower: true, strict: true, remove: /[*+~.()'"!:@]/g });

  const parseNumber = (value: string | null | undefined) => {
    if (value === null || value === undefined || value === '') return null;
    const parsed = parseFloat(value);
    return isNaN(parsed) ? null : parsed;
  };

  const parseWeight = (value: string | null | undefined) => {
    if (value === null || value === undefined || value === '') return null;
    const parsed = parseFloat(value.replace(/[^\d.]/g, ''));
    return isNaN(parsed) ? null : parsed;
  };

  const backpackData = {
    name: record.B,
    slug,
    link: record.C || null,
    image: `/images/${slug}.png`,
    price: parseNumber(record.D?.replace('$', '')),
    volume: parseNumber(record.E),
    openingType: record.F || null,
    carryOnCompliance: parseNumber(record.G?.replace('%', '')),
    weightToVolume: record.H || null,
    heightCm: parseNumber(record.I),
    widthCm: parseNumber(record.J),
    depthCm: parseNumber(record.K),
    weightKg: parseWeight(record.L),
    heightIn: parseNumber(record.M),
    widthIn: parseNumber(record.N),
    depthIn: parseNumber(record.O),
    weightLb: parseWeight(record.P),
    compartments: parseNumber(record.Q),
    laptopSize: record.R || null,
    laptopAccess: record.S || null,
    passport: record.T || null,
    waterBottle: record.U || null,
    organizer: record.V || null,
    shoe: record.W || null,
    hydration: record.X || null,
    aesthetic: record.Y || null,
    expands: record.Z === 'Y' ? true : (parseNumber(record.Z) || null),
    compression: parseNumber(record.AA),
    frame: record.AB || null,
    waterResist: record.AC === 'Y',
    rainfly: record.AD === 'Y',
    molle: record.AE || null,
    selfStand: record.AF === 'Y',
    lashPoints: parseNumber(record.AG),
    backpack: record.AH === 'Y',
    shoulder: record.AI === 'Y',
    hipBelt: record.AJ || null,
    sternum: record.AK || null,
    loadLifters: record.AL === 'Y',
    handles: parseNumber(record.AM),
    passThrough: record.AN === 'Y',
    material: record.AO || null,
    notes: record.AP || null,
    verified: record.AQ || null,
    discontinued: record.AR === 'Y',
  };

  console.log(`Created backpack data for ${record.B}:`, JSON.stringify(backpackData, null, 2));

  return backpackData;
}

async function processBatch(batch: any[]) {
  for (const backpackData of batch) {
    try {
      await prisma.backpack.upsert({
        where: { name: backpackData.name },
        update: backpackData,
        create: backpackData,
      })
      console.log(`Successfully processed backpack: ${backpackData.name}`)
    } catch (error) {
      console.error(`Error processing backpack ${backpackData.name}:`, error)
    }
  }
  console.log(`Processed batch of ${batch.length} records`)
}

main()
  .catch((e) => {
    console.error('Error during import:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })