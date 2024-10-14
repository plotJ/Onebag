'use client'

import React, { useState, useEffect } from "react"
import { useRouter } from 'next/navigation'
import { Search, Sliders, ShoppingBag, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"


interface Backpack {
  id: string;
  name: string;
  slug: string;
  image?: string;
  carryOnCompliance: number;
  dimensions: string;
  volume: number;
  weight: number;
  price: number;
  brand: string;
  laptopSize: string;
  numCompartments: number;
  openingType: string;
  material: string;
  aesthetic: string;
  features: string[];
  pockets: string[];
  imageUrl: string;
  airlineCompatibilities: { airlineName: string; isCompatible: boolean }[];
}

export default function OptimizedBackpackSelector() {
    const [useMetric, setUseMetric] = useState(true)
    const router = useRouter()
    const [isFilterExpanded, setIsFilterExpanded] = useState(true)
    const [isLoading, setIsLoading] = useState(false)
    const [backpacks, setBackpacks] = useState<Backpack[]>([])
    const [airlines, setAirlines] = useState<string[]>([])

    const handleBackpackClick = (slug: string) => {
        router.push(`/backpack/${slug}`)
      }
    

  useEffect(() => {
    fetchBackpacks()
    fetchAirlines()
  }, [])

  const fetchBackpacks = async () => {
    setIsLoading(true)
    try {
      console.log('Fetching backpacks...')
      const response = await fetch('/api/backpacks')
      console.log('Response status:', response.status)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      console.log('Fetched backpacks:', data)
      setBackpacks(data)
    } catch (error) {
      console.error('Error fetching backpacks:', error)
    } finally {
      setIsLoading(false)
    }
  }
  
  const fetchAirlines = async () => {
    try {
      const response = await fetch('/api/airlines')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json() as string[]
      setAirlines(data)
    } catch (error) {
      console.error('Error fetching airlines:', error)
    }
  }

  const toggleUnits = () => setUseMetric(!useMetric)

  const renderFilter = (name: string, type: string, options: string[] | null = null) => (
    <div className="mb-4">
      <Label className="mb-2">{name}</Label>
      {type === "select" && (
        <Select>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Any" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any</SelectItem>
            {options && options.map((opt) => (
              <SelectItem key={opt} value={opt}>
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      {type === "range" && (
        <div className="space-y-2">
          <Slider defaultValue={[0, 100]} max={100} step={1} />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Min</span>
            <span>Max</span>
          </div>
        </div>
      )}
    </div>
  )

  
  const placeholderImage = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==";


  const renderCheckboxGroup = (title: string, options: string[]) => (
    <div className="mb-4">
      <h3 className="font-semibold mb-2">{title}</h3>
      <div className="grid grid-cols-2 gap-2">
        {options.map((option) => (
          <div key={option} className="flex items-center space-x-2">
            <Checkbox id={option} />
            <Label htmlFor={option}>{option}</Label>
          </div>
        ))}
      </div>
    </div>
  )

  const handleSearch = () => {
    fetchBackpacks()
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <h1 className="text-4xl font-bold text-center">Onebag Backpack Finder Tool</h1>

      <div className="flex items-center space-x-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <Input type="text" placeholder="Search backpacks..." className="pl-10" />
        </div>
        <Button onClick={handleSearch}>Search</Button>
      </div>

      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => setIsFilterExpanded(!isFilterExpanded)}>
          <Sliders className="mr-2 h-4 w-4" />
          {isFilterExpanded ? "Hide Filters" : "Show Filters"}
          {isFilterExpanded ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />}
        </Button>
        <div className="flex items-center space-x-2">
          <Label htmlFor="unit-toggle">Metric</Label>
          <Switch id="unit-toggle" checked={useMetric} onCheckedChange={toggleUnits} />
          <Label htmlFor="unit-toggle">Imperial</Label>
        </div>
      </div>

      {isFilterExpanded && (
        <Card>
          <CardHeader>
            <CardTitle>Select Desired Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {renderFilter("Brand", "select", Array.from(new Set(backpacks.map(b => b.brand))))}
              {renderFilter("Price", "range")}
              {renderFilter("Volume", "range")}
              {renderFilter(`Weight (${useMetric ? "kg" : "lbs"})`, "range")}
              {renderFilter(`Dimensions (${useMetric ? "cm" : "in"})`, "select")}
              {renderFilter("Laptop Size", "select", Array.from(new Set(backpacks.map(b => b.laptopSize))))}
              {renderFilter("Number of Compartments", "range")}
              {renderFilter("Opening Type", "select", Array.from(new Set(backpacks.map(b => b.openingType))))}
              {renderFilter("Material", "select", Array.from(new Set(backpacks.map(b => b.material))))}
              {renderFilter("Aesthetic", "select", Array.from(new Set(backpacks.map(b => b.aesthetic))))}
              {renderCheckboxGroup("Features", Array.from(new Set(backpacks.flatMap(b => b.features))))}
              {renderCheckboxGroup("Pockets", Array.from(new Set(backpacks.flatMap(b => b.pockets))))}
              {renderFilter("Airline Compatibility", "select", airlines)}
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={handleSearch}>
              Apply Filters
            </Button>
          </CardFooter>
        </Card>
      )}

      <div>
        <h2 className="text-2xl font-semibold mb-4 flex items-center">
          <ShoppingBag className="mr-2" /> Results
        </h2>
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-lg">Loading results...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {backpacks.map((backpack) => (
              <Card key={backpack.id} onClick={() => handleBackpackClick(backpack.slug)}>
                <CardHeader>
                <img 
  src={backpack.image || placeholderImage} 
  alt={backpack.name} 
  className="w-full h-48 object-cover rounded-md"
  onError={(e) => {
    (e.target as HTMLImageElement).src = placeholderImage;
  }}
/>
                </CardHeader>
                <CardContent>
                  <h3 className="font-semibold text-lg mb-2">{backpack.name}</h3>
                  <p className="text-muted-foreground mb-2">{backpack.volume}L | ${backpack.price}</p>
                  <p className="text-muted-foreground mb-2">
                    {useMetric ? `${backpack.weight} kg | ${backpack.dimensions}` : `${(backpack.weight * 2.20462).toFixed(2)} lbs | ${backpack.dimensions}`}
                  </p>
                  <p className="text-muted-foreground mb-2">Carry-on Compliance: {backpack.carryOnCompliance}%</p>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">View Details</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}