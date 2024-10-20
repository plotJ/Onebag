import React from 'react';
import { notFound } from 'next/navigation'
import prisma from '@/lib/prisma'
import { Star, Briefcase, Weight, Maximize, Laptop, Grid, DoorOpen, Palette } from 'lucide-react'
import Link from 'next/link'
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

interface AirlineCompatibility {
  airlineName: string;
  isCompatible: boolean;
}

async function getBackpack(slug: string) {
  const backpack = await prisma.backpack.findUnique({
    where: { slug },
    include: { airlineCompatibilities: true }
  })
  
  if (!backpack) notFound()
  return backpack
}

export default async function BackpackPage({ params }: { params: { slug: string } }) {
  const backpack = await getBackpack(params.slug)

  const renderMeasurement = (metric: number | null, imperial: number | null, unit: string) => {
    if (metric === null || imperial === null) return 'N/A';
    return `${metric} ${unit} / ${imperial.toFixed(2)} ${unit === 'kg' ? 'lbs' : 'in'}`
  }

  return (
    <div className="container mx-auto p-4 space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <img src={backpack.image || "/placeholder.svg?height=400&width=400"} alt={backpack.name} className="w-full h-auto rounded-lg shadow-lg" />
          <div className="bg-primary text-primary-foreground p-4 rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-2">Airline Compatibility Score</h2>
            <Progress value={backpack.carryOnCompliance} className="h-4 mb-2" />
            <p className="text-3xl font-bold">{backpack.carryOnCompliance}%</p>
          </div>
        </div>
        <div className="space-y-6">
          <h1 className="text-4xl font-bold">{backpack.name}</h1>
          <p className="text-3xl font-semibold">${backpack.price?.toFixed(2) || 'N/A'}</p>
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="flex items-center p-4">
                <Briefcase className="w-6 h-6 mr-2" />
                <div>
                  <p className="text-sm text-muted-foreground">Volume</p>
                  <p className="font-semibold">{backpack.volume ? `${backpack.volume}L` : 'N/A'}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center p-4">
                <Weight className="w-6 h-6 mr-2" />
                <div>
                  <p className="text-sm text-muted-foreground">Weight</p>
                  <p className="font-semibold">{renderMeasurement(backpack.weightKg, backpack.weightLb, 'kg')}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center p-4">
                <Maximize className="w-6 h-6 mr-2" />
                <div>
                  <p className="text-sm text-muted-foreground">Dimensions</p>
                  <p className="font-semibold">
                    {backpack.heightCm && backpack.widthCm && backpack.depthCm ? 
                      `${backpack.heightCm} x ${backpack.widthCm} x ${backpack.depthCm} cm` : 'N/A'}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center p-4">
                <Laptop className="w-6 h-6 mr-2" />
                <div>
                  <p className="text-sm text-muted-foreground">Laptop Size</p>
                  <p className="font-semibold">{backpack.laptopSize || 'N/A'}</p>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="space-y-2">
            <p className="flex items-center"><Grid className="w-5 h-5 mr-2" /> <span className="font-semibold mr-2">Compartments:</span> {backpack.compartments || 'N/A'}</p>
            <p className="flex items-center"><DoorOpen className="w-5 h-5 mr-2" /> <span className="font-semibold mr-2">Opening Type:</span> {backpack.openingType || 'N/A'}</p>
            <p className="flex items-center"><Star className="w-5 h-5 mr-2" /> <span className="font-semibold mr-2">Material:</span> {backpack.material || 'N/A'}</p>
            <p className="flex items-center"><Palette className="w-5 h-5 mr-2" /> <span className="font-semibold mr-2">Aesthetic:</span> {backpack.aesthetic || 'N/A'}</p>
            
{backpack.link && (
  <Link href={backpack.link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
    View Product
  </Link>
)}
          </div>
        </div>
      </div>
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Airline Compatibility</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {backpack.airlineCompatibilities.map((compatibility: AirlineCompatibility) => (
            <Badge key={compatibility.airlineName} variant={compatibility.isCompatible ? "default" : "secondary"} className="text-sm p-2">
              {compatibility.isCompatible ? "✓" : "✗"} {compatibility.airlineName}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  )
}