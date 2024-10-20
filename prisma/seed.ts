import { PrismaClient } from '@prisma/client'
import { parse } from 'csv-parse/sync'
import fs from 'fs'
import slugify from 'slugify'

const prisma = new PrismaClient()

function createBackpackData(record: Record<string, string>): any {
  if (!record.name || typeof record.name !== 'string') {
    console.warn('Skipping record due to missing or invalid name:', JSON.stringify(record))
    return null
  }

  const slug = slugify(record.name, { lower: true, strict: true, remove: /[*+~.()'"!:@]/g })

  const parseNumber = (value: string | null | undefined) => {
    if (value === null || value === undefined || value === '') return null
    const parsed = parseFloat(value.replace(/[^\d.-]/g, ''))
    return isNaN(parsed) ? null : parsed
  }

  let expands: boolean | null = null
  let expandedVolume: number | null = null

  if (record.expands === 'Y') {
    expands = true
  } else if (record.expands === 'N') {
    expands = false
  } else {
    const num = parseNumber(record.expands)
    if (num !== null) {
      expands = true
      expandedVolume = num
    } else {
      expands = null
      expandedVolume = null
    }
  }

  const backpackData = {
    name: record.name,
    slug,
    link: record.link || null,
    image: record.image || `/images/${slug}.png`,
    price: parseNumber(record.price),
    volume: parseNumber(record.volume),
    openingType: record.opening || null,
    carryOnCompliance: parseNumber(record['carry-on compliance']),
    weightToVolume: record['weight / volume'] || null,
    heightCm: parseNumber(record.heightcm),
    widthCm: parseNumber(record.widthcm),
    depthCm: parseNumber(record.depthcm),
    weightKg: parseNumber(record.weightKg),
    heightIn: parseNumber(record.heightIn),
    widthIn: parseNumber(record.widthIn),
    depthIn: parseNumber(record.depthIn),
    weightLb: parseNumber(record.weightLb),
    compartments: parseNumber(record.compartments),
    laptopSize: record['laptop size'] || null,
    laptopAccess: record['laptop access'] || null,
    passport: record.passport || null,
    waterBottle: record['water bottle'] || null,
    organizer: record.organizer || null,
    shoe: record.shoe || null,
    hydration: record.hydration || record.hydratation || null, // Handle possible typo
    aesthetic: record.aesthetic || null,
    expands,
    expandedVolume,
    compression: parseNumber(record.compression),
    frame: record.frame || null,
    waterResist: record['water resist'] === 'Y',
    rainfly: record.rainfly === 'Y',
    molle: record.molle || null,
    selfStand: record['self-stand'] === 'Y',
    lashPoints: parseNumber(record['lash points']),
    backpack: record.backpack === 'Y',
    shoulder: record.shoulder === 'Y',
    hipBelt: record['hip belt'] || null,
    sternum: record.sternum || null,
    loadLifters: record['load lifters'] === 'Y',
    handles: parseNumber(record.handles),
    passThrough: record['pass through'] === 'Y',
    material: record.material || null,
    notes: record.notes || null,
    verified: record.verified || null,
    discontinued: record.discontinued === 'Y' || record.discontined === 'Y', // Handle possible typo
  }

  return backpackData
}

async function main() {
  console.log('Starting import process...')
  const csvData = fs.readFileSync('One Bag Backpacks list - bags.csv', 'utf8')

  const records = parse(csvData, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  })

  console.log(`Parsed ${records.length} records from CSV`)

  let processedCount = 0
  let errorCount = 0

  for (const record of records) {
    try {
      const backpackData = createBackpackData(record)
      if (backpackData) {
        await prisma.backpack.upsert({
          where: { name: backpackData.name },
          update: backpackData,
          create: backpackData,
        })
        processedCount++
      }
    } catch (error) {
      console.error(`Error processing record:`, JSON.stringify(record), error)
      errorCount++
    }
  }

  console.log(`Import completed. Processed ${processedCount} records. Errors: ${errorCount}`)

  // --- New Code Starts Here ---
  console.log('Starting airline compatibility import...')

  const airlineCsvData = fs.readFileSync('One Bag Backpacks list - airline compatibility.csv', 'utf8')
  const airlineRecords = parse(airlineCsvData, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  })

  console.log(`Parsed ${airlineRecords.length} airline compatibility records from CSV`)

  for (const record of airlineRecords) {
    const backpackName = record.name
    if (!backpackName) continue

    const backpack = await prisma.backpack.findUnique({ where: { name: backpackName } })
    if (!backpack) {
      console.warn(`Backpack not found: ${backpackName}`)
      continue
    }

    // Remove existing airline compatibilities for this backpack
    await prisma.airlineCompatibility.deleteMany({
      where: { backpackId: backpack.id },
    })

    const airlineCompatibilities = []

    for (const [key, value] of Object.entries(record as Record<string, string>)) {
      if (key === 'name' || key === 'carry-on compliance' || key.trim() === '') continue

      const airlineName = key.trim()
      const isCompatible = value.trim() === '✔'

      // Skip if the airline name or value is empty
      if (!airlineName || !value.trim()) continue

      airlineCompatibilities.push({
        airlineName,
        isCompatible,
      })
    }

    // Create new airline compatibilities
    for (const compatibility of airlineCompatibilities) {
      try {
        await prisma.airlineCompatibility.create({
          data: {
            backpackId: backpack.id,
            airlineName: compatibility.airlineName,
            isCompatible: compatibility.isCompatible,
          },
        })
      } catch (error) {
        console.error(
          `Error creating airline compatibility for ${backpackName} and airline ${compatibility.airlineName}:`,
          error
        )
      }
    }
  }

  console.log('Airline compatibility import completed.')
  // --- New Code Ends Here ---
}

main()
  .catch((e) => {
    console.error('Error during import:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })