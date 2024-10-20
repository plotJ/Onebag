// app/api/airlines/route.ts

import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'

export async function GET() {
  try {
    const airlines = await prisma.airlineCompatibility.findMany({
      distinct: ['airlineName'],
      select: { airlineName: true },
    })
    const airlineNames = airlines.map((a) => a.airlineName)
    return NextResponse.json(airlineNames)
  } catch (error) {
    console.error('Error fetching airlines:', error)
    return NextResponse.json({ error: 'Error fetching airlines' }, { status: 500 })
  }
}
