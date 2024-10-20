import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'

type BackpackInput = {
  name: string;
  slug: string;
  image?: string;
  price?: number;
  volume?: number;
  openingType?: string;
  carryOnCompliance: number;
  weightToVolume?: string;
  heightCm?: number;
  widthCm?: number;
  depthCm?: number;
  weightKg?: number;
  heightIn?: number;
  widthIn?: number;
  depthIn?: number;
  weightLb?: number;
  compartments?: number;
  laptopSize?: string;
  laptopAccess?: string;
  passport?: string;
  waterBottle?: string;
  organizer?: string;
  shoe?: string;
  hydration?: string;
  aesthetic?: string;
  expands?: boolean;
  compression?: number;
  frame?: string;
  waterResist?: boolean;
  rainfly?: boolean;
  molle?: string;
  selfStand?: boolean;
  lashPoints?: number;
  backpack?: boolean;
  shoulder?: boolean;
  hipBelt?: string;
  sternum?: string;
  loadLifters?: boolean;
  handles?: number;
  passThrough?: boolean;
  material?: string;
  notes?: string;
  verified?: string;
  discontinued?: boolean;
  airlineCompatibilities: {
    airlineName: string;
    isCompatible: boolean;
  }[];
}

export async function GET() {
  try {
    console.log('Fetching backpacks from database...')
    const backpacks = await prisma.backpack.findMany({
      include: { airlineCompatibilities: true }
    })
    console.log(`Fetched ${backpacks.length} backpacks`)
    return NextResponse.json(backpacks)
  } catch (error) {
    console.error('Error fetching backpacks:', error)
    return NextResponse.json({ error: 'Error fetching backpacks' }, { status: 500 })
  }
}


export async function POST(request: Request) {
  try {
    const body = await request.json() as BackpackInput
    
    const backpack = await prisma.backpack.create({
      data: {
        ...body,
        airlineCompatibilities: {
          create: body.airlineCompatibilities
        }
      },
      include: { airlineCompatibilities: true }
    })
    return NextResponse.json(backpack)
  } catch (error) {
    console.error('Error creating backpack:', error)
    return NextResponse.json({ error: 'Error creating backpack' }, { status: 500 })
  }
}