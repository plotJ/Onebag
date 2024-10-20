import { NextResponse } from 'next/server'
import prisma from '../../../lib/prisma'

export async function GET() {
  try {
    const airlines = await prisma.airlineCompatibility.findMany({
      distinct: ['airlineName'],
      select: { airlineName: true }
    })
    return NextResponse.json(airlines.map((a: { airlineName: string }) => a.airlineName))
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching airlines' }, { status: 500 })
  }
}