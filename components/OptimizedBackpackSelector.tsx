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
  image?: string;
  slug: string;
  volume: number;
  price: number;
  weight: number;
  dimensions: string;
  weightKg?: number;
  weightLb?: number;
  heightCm?: number;
  widthCm?: number;
  depthCm?: number;
  heightIn?: number;
  widthIn?: number;
  depthIn?: number;
  carryOnCompliance: number;
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
  const [filteredBackpacks, setFilteredBackpacks] = useState<Backpack[]>([]);
  const [airlines, setAirlines] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState("")

  const [filters, setFilters] = useState({
    brand: 'Any',
    priceRange: [0, 500],
    volumeRange: [0, 100],
    weightRange: [0, 14],
    dimensions: 'Any',
    laptopSize: 'Any',
    compartmentsRange: [0, 10],
    openingType: 'Any',
    material: 'Any',
    aesthetic: 'Any',
    features: [],
    pockets: [],
    airlineCompatibility: 'Any'
  });

  const handleBackpackClick = (slug: string) => {
    router.push(`/backpack/${slug}`)
  }

  useEffect(() => {
    fetchBackpacks()
    fetchAirlines()
  }, [])

  useEffect(() => {
    setFilteredBackpacks(applyFilters());
  }, [filters, backpacks, searchTerm, useMetric]);

  useEffect(() => {
    console.log('Backpacks:', backpacks);
    console.log('Filtered backpacks:', filteredBackpacks);
    console.log('Current filters:', filters);
  }, [backpacks, filteredBackpacks, filters]);

  useEffect(() => {
    if (backpacks.length > 0) {
      const maxPrice = Math.max(...backpacks.map(b => b.price));
      const maxVolume = Math.max(...backpacks.map(b => b.volume));
      const maxWeight = Math.max(...backpacks.map(b => (useMetric ? b.weightKg : b.weightLb) ?? 0));
      const maxCompartments = Math.max(...backpacks.map(b => b.numCompartments));
  
      setFilters(prevFilters => ({
        ...prevFilters,
        priceRange: [0, maxPrice] as [number, number],
        volumeRange: [0, maxVolume] as [number, number],
        weightRange: [0, maxWeight] as [number, number],
        compartmentsRange: [0, maxCompartments] as [number, number]
      }));
    }
  }, [backpacks, useMetric]);

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

  const getUniqueValues = <T extends keyof Backpack>(backpacks: Backpack[], key: T): string[] => {
    const values = backpacks.map(b => b[key]);
    return Array.from(new Set(values.flatMap(v => 
      typeof v === 'string' ? v : 
      Array.isArray(v) ? v.filter((item): item is string => typeof item === 'string') : 
      []
    ))).filter(Boolean);
  };
  

  const getFeatures = (backpacks: Backpack[]): string[] => {
    return getUniqueValues(backpacks, 'features');
  };
  
  const getPockets = (backpacks: Backpack[]): string[] => {
    return getUniqueValues(backpacks, 'pockets');
  };

  const renderFilter = (name: string, type: string, options: string[] | null = null) => {
    const filterKey = `${name.toLowerCase()}Range` as keyof typeof filters;
    const rangeValue = filters[filterKey];
  
    return (
      <div className="mb-4">
        <Label className="mb-2">{name}</Label>
        {type === "select" && (
          <Select 
            value={filters[name.toLowerCase() as keyof typeof filters] as string} 
            onValueChange={(value) => setFilters({...filters, [name.toLowerCase()]: value})}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Any" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Any">Any</SelectItem>
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
            <Slider
              defaultValue={Array.isArray(rangeValue) ? rangeValue : [0, 100]}
              max={100}
              step={1}
              onValueChange={(value) => setFilters({...filters, [filterKey]: value})}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{Array.isArray(rangeValue) ? rangeValue[0] : 0}</span>
              <span>{Array.isArray(rangeValue) ? rangeValue[1] : 100}</span>
            </div>
          </div>
        )}
      </div>
    )
  }

  const renderCheckboxGroup = (title: string, options: string[]) => (
    <div className="mb-4">
      <h3 className="font-semibold mb-2">{title}</h3>
      <div className="grid grid-cols-2 gap-2">
        {options.map((option) => (
          <div key={option} className="flex items-center space-x-2">
            <Checkbox 
              id={option} 
              checked={(filters[title.toLowerCase() as keyof typeof filters] as string[]).includes(option)}
              onCheckedChange={(checked) => {
                if (checked) {
                  setFilters({...filters, [title.toLowerCase()]: [...(filters[title.toLowerCase() as keyof typeof filters] as string[]), option]})
                } else {
                  setFilters({...filters, [title.toLowerCase()]: (filters[title.toLowerCase() as keyof typeof filters] as string[]).filter(item => item !== option)})
                }
              }}
            />
            <Label htmlFor={option}>{option}</Label>
          </div>
        ))}
      </div>
    </div>
  )

  const applyFilters = () => {
    return backpacks.filter(backpack => {
      const nameMatch = backpack.name.toLowerCase().includes(searchTerm.toLowerCase());
      return (
        nameMatch &&
        (filters.brand === 'Any' || backpack.brand === filters.brand) &&
        (filters.priceRange[0] <= backpack.price && backpack.price <= filters.priceRange[1]) &&
        (filters.volumeRange[0] <= backpack.volume && backpack.volume <= filters.volumeRange[1]) &&
        (filters.weightRange[0] <= ((useMetric ? backpack.weightKg : backpack.weightLb) ?? 0) && 
         ((useMetric ? backpack.weightKg : backpack.weightLb) ?? 0) <= filters.weightRange[1]) &&
        (filters.dimensions === 'Any' || backpack.dimensions === filters.dimensions) &&
        (filters.laptopSize === 'Any' || backpack.laptopSize === filters.laptopSize) &&
        (filters.compartmentsRange[0] <= backpack.numCompartments && backpack.numCompartments <= filters.compartmentsRange[1]) &&
        (filters.openingType === 'Any' || backpack.openingType === filters.openingType) &&
        (filters.material === 'Any' || backpack.material === filters.material) &&
        (filters.aesthetic === 'Any' || backpack.aesthetic === filters.aesthetic) &&
        (filters.features.length === 0 || filters.features.every(f => backpack.features?.includes(f))) &&
        (filters.pockets.length === 0 || filters.pockets.every(p => backpack.pockets?.includes(p))) &&
        (filters.airlineCompatibility === 'Any' || 
         backpack.airlineCompatibilities.some(ac => ac.airlineName === filters.airlineCompatibility && ac.isCompatible))
      );
    });
  };

  const handleSearch = () => {
    setFilteredBackpacks(applyFilters());
  }

  const placeholderImage = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==";

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <h1 className="text-4xl font-bold text-center">Onebag Backpack Finder Tool</h1>

      <div className="flex items-center space-x-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <Input 
            type="text" 
            placeholder="Search backpacks..." 
            className="pl-10" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
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
  {renderFilter("Brand", "select", getUniqueValues(backpacks, 'brand'))}
  {renderFilter("Price", "range")}
  {renderFilter("Volume", "range")}
  {renderFilter("Weight", "range")}
  {renderFilter("Dimensions", "select", getUniqueValues(backpacks, 'dimensions'))}
  {renderFilter("Laptop Size", "select", getUniqueValues(backpacks, 'laptopSize'))}
  {renderFilter("Number of Compartments", "range")}
  {renderFilter("Opening Type", "select", getUniqueValues(backpacks, 'openingType'))}
  {renderFilter("Material", "select", getUniqueValues(backpacks, 'material'))}
  {renderFilter("Aesthetic", "select", getUniqueValues(backpacks, 'aesthetic'))}
  {renderCheckboxGroup("Features", getFeatures(backpacks))}
  {renderCheckboxGroup("Pockets", getPockets(backpacks))}
  {renderFilter("Airline Compatibility", "select", airlines)}
</div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={() => setFilteredBackpacks(applyFilters())}>
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
            {filteredBackpacks.map((backpack) => (
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
                    {useMetric 
                      ? `${backpack.weightKg ? backpack.weightKg.toFixed(2) : 'N/A'} kg | ${backpack.heightCm}x${backpack.widthCm}x${backpack.depthCm} cm` 
                      : `${backpack.weightLb ? backpack.weightLb.toFixed(2) : 'N/A'} lbs | ${backpack.heightIn}x${backpack.widthIn}x${backpack.depthIn} in`
                    }
                  </p>
                  <p className="text-muted-foreground mb-2">Carry-on Compliance: {backpack.carryOnCompliance}%</p>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" onClick={() => handleBackpackClick(backpack.slug)}>View Details</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}