'use client'

import React, { useState, useEffect } from "react"
import { useRouter } from 'next/navigation'
import { Search, Sliders, ShoppingBag, ChevronDown, ChevronUp, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface Backpack {
  id: string;
  name: string;
  image?: string;
  slug: string;
  volume?: number;
  price?: number;
  weight?: number;
  dimensions?: string;
  weightKg?: number;
  weightLb?: number;
  heightCm?: number;
  widthCm?: number;
  depthCm?: number;
  heightIn?: number;
  widthIn?: number;
  depthIn?: number;
  carryOnCompliance?: number;
  brand?: string;
  laptopSize?: string;
  numCompartments?: number;
  openingType?: string;
  material?: string;
  aesthetic?: string;
  features?: string[];
  pockets?: string[];
  imageUrl?: string;
  airlineCompatibilities?: { airlineName: string; isCompatible: boolean }[];
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
  const [selectedBackpack, setSelectedBackpack] = useState<Backpack | null>(null)


  // Define the filters with correct keys
  const [filters, setFilters] = useState({
    brand: 'Any',
    priceRange: [0, 1000] as [number, number],
    volumeRange: [0, 70] as [number, number],
    dimensions: 'Any',
    weightRange: [0, 10] as [number, number],
    laptopSize: 'Any',
    compartmentsRange: [0, 10] as [number, number],
    openingType: 'Any',
    material: 'Any',
    aesthetic: 'Any',
    features: [] as string[],
    pockets: [] as string[],
    airlineCompatibility: 'Any',
  });

  const [defaultFilters, setDefaultFilters] = useState(filters);

  // Map display names to filter keys
  const filterKeyMap: { [key: string]: keyof typeof filters } = {
    'Brand': 'brand',
    'Price': 'priceRange',
    'Volume': 'volumeRange',
    'Weight': 'weightRange',
    'Dimensions': 'dimensions',
    'Laptop Size': 'laptopSize',
    'Number of Compartments': 'compartmentsRange',
    'Opening Type': 'openingType',
    'Material': 'material',
    'Aesthetic': 'aesthetic',
    'Airline Compatibility': 'airlineCompatibility',
    // For checkboxes:
    'Features': 'features',
    'Pockets': 'pockets',
  };

  const handleBackpackClick = (backpack: Backpack) => {
    setSelectedBackpack(backpack)
  }


  const toggleUnits = () => setUseMetric(!useMetric)

  const getUniqueValues = <T extends keyof Backpack>(backpacks: Backpack[], key: T): string[] => {
    const values = backpacks.map(b => b[key]);
    return Array.from(new Set(values.flatMap(v =>
      typeof v === 'string' ? [v] :
      Array.isArray(v) ? v.filter((item): item is string => typeof item === 'string') :
      []
    ))).filter(Boolean);
  };

  const getFeatures = (backpacks: Backpack[]): string[] => {
    return getUniqueValues(backpacks, 'features');
  };

  const getPockets = (backpacks: Backpack[]): string[] => {
    return getUniqueValues(backpacks, 'pockets');
  }

  // Move applyFilters above useEffect to avoid "Cannot find name 'applyFilters'" error
  const applyFilters = () => {
    return backpacks.filter(backpack => {
      const nameMatch = backpack.name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false;

      const price = backpack.price ?? 0;
      const volume = backpack.volume ?? 0;
      const weight = (useMetric ? backpack.weightKg : backpack.weightLb) ?? 0;
      const numCompartments = backpack.numCompartments ?? 0;

      const passesBrandFilter = filters.brand === 'Any' || (backpack.brand ?? 'Any') === filters.brand;
      const passesPriceFilter = price >= filters.priceRange[0] && price <= filters.priceRange[1];
      const passesVolumeFilter = volume >= filters.volumeRange[0] && volume <= filters.volumeRange[1];
      const passesWeightFilter = weight >= filters.weightRange[0] && weight <= filters.weightRange[1];
      const passesDimensionsFilter = filters.dimensions === 'Any' || (backpack.dimensions ?? 'Any') === filters.dimensions;
      const passesLaptopSizeFilter = filters.laptopSize === 'Any' || (backpack.laptopSize ?? 'Any') === filters.laptopSize;
      const passesCompartmentsFilter = numCompartments >= filters.compartmentsRange[0] && numCompartments <= filters.compartmentsRange[1];
      const passesOpeningTypeFilter = filters.openingType === 'Any' || (backpack.openingType ?? 'Any') === filters.openingType;
      const passesMaterialFilter = filters.material === 'Any' || (backpack.material ?? 'Any') === filters.material;
      const passesAestheticFilter = filters.aesthetic === 'Any' || (backpack.aesthetic ?? 'Any') === filters.aesthetic;
      const passesFeaturesFilter = filters.features.length === 0 || filters.features.every(f => backpack.features?.includes(f));
      const passesPocketsFilter = filters.pockets.length === 0 || filters.pockets.every(p => backpack.pockets?.includes(p));
      const passesAirlineFilter = filters.airlineCompatibility === 'Any' ||
        backpack.airlineCompatibilities?.some(ac => ac.airlineName === filters.airlineCompatibility && ac.isCompatible);

      return (
        nameMatch &&
        passesBrandFilter &&
        passesPriceFilter &&
        passesVolumeFilter &&
        passesWeightFilter &&
        passesDimensionsFilter &&
        passesLaptopSizeFilter &&
        passesCompartmentsFilter &&
        passesOpeningTypeFilter &&
        passesMaterialFilter &&
        passesAestheticFilter &&
        passesFeaturesFilter &&
        passesPocketsFilter &&
        passesAirlineFilter
      );
    });
  };

  const handleSearch = () => {
    setFilteredBackpacks(applyFilters());
  }

  const resetFilters = () => {
    setFilters(defaultFilters);
    setFilteredBackpacks(backpacks);
  };

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
    // Update filters when backpacks data is loaded
    if (backpacks.length > 0) {
      const maxPrice = Math.max(...backpacks.map(b => b.price ?? 0));
      const maxVolume = Math.max(...backpacks.map(b => b.volume ?? 0));
      const maxWeight = Math.max(...backpacks.map(b => (useMetric ? b.weightKg : b.weightLb) ?? 0));
      const maxCompartments = Math.max(...backpacks.map(b => b.numCompartments ?? 0));

      const updatedFilters = {
        ...filters,
        priceRange: [0, maxPrice] as [number, number],
        volumeRange: [0, maxVolume] as [number, number],
        weightRange: [0, maxWeight] as [number, number],
        compartmentsRange: [0, maxCompartments] as [number, number],
      };

      setFilters(updatedFilters);
      setDefaultFilters(updatedFilters);
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

  // Updated renderFilter function
  const renderFilter = (name: string, type: string, options: string[] | null = null) => {
    const filterKey = filterKeyMap[name] as keyof typeof filters;
    if (!filterKey) {
      console.warn(`Filter key for "${name}" not found.`);
      return null;
    }

    const isRangeFilter = type === "range";
    const rangeValue = isRangeFilter ? (filters[filterKey] as [number, number]) : null;

    if (type === "range" && rangeValue) {
      let step = 1;
      if (filterKey === "weightRange") {
        step = 0.1;
      } else if (filterKey === "priceRange") {
        step = 10;
      } else if (filterKey === "volumeRange") {
        step = 1;
      } else if (filterKey === "compartmentsRange") {
        step = 1;
      }

      const max = Math.max(...backpacks.map(b => {
        const val = (b[filterKey as keyof Backpack] as number) ?? 0;
        return val;
      }), rangeValue[1]);

      return (
        <div className="mb-4">
          <Label className="mb-2">{name}</Label>
          <div className="space-y-2">
            <Slider
              value={rangeValue}
              max={max}
              step={step}
              onValueChange={(value) => {
                setFilters(prev => ({ ...prev, [filterKey]: value as [number, number] }));
              }}
              min={0}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{rangeValue[0].toFixed(1)}</span>
              <span>{rangeValue[1].toFixed(1)}</span>
            </div>
          </div>
        </div>
      )
    }

    if (type === "select") {
      return (
        <div className="mb-4">
          <Label className="mb-2">{name}</Label>
          <Select
            value={filters[filterKey] as string}
            onValueChange={(value) => setFilters({ ...filters, [filterKey]: value })}
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
        </div>
      )
    }

    return null;
  }

  const renderCheckboxGroup = (title: string, options: string[]) => {
    const filterKey = filterKeyMap[title] as keyof typeof filters;

    if (!filterKey) {
      console.warn(`Filter key for "${title}" not found.`);
      return null;
    }

    return (
      <div className="mb-4">
        <h3 className="font-semibold mb-2">{title}</h3>
        <div className="grid grid-cols-2 gap-2">
          {options.map((option) => (
            <div key={option} className="flex items-center space-x-2">
              <Checkbox
                id={option}
                checked={(filters[filterKey] as string[]).includes(option)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setFilters({
                      ...filters,
                      [filterKey]: [...(filters[filterKey] as string[]), option]
                    })
                  } else {
                    setFilters({
                      ...filters,
                      [filterKey]: (filters[filterKey] as string[]).filter(item => item !== option)
                    })
                  }
                }}
              />
              <Label htmlFor={option}>{option}</Label>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const placeholderImage = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg=="

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* ... (keep all the existing JSX up to the results section) */}

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
          filteredBackpacks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBackpacks.map((backpack) => (
                <Dialog key={backpack.id}>
                  <DialogTrigger asChild>
                    <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="w-full pb-[100%] relative overflow-hidden rounded-md">
                          <img
                            src={backpack.image || placeholderImage}
                            alt={backpack.name}
                            className="absolute inset-0 w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = placeholderImage;
                            }}
                          />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <h3 className="font-semibold text-lg mb-2">{backpack.name}</h3>
                        <p className="text-muted-foreground mb-2">{backpack.volume ?? 'N/A'}L | ${backpack.price ?? 'N/A'}</p>
                        <p className="text-muted-foreground mb-2">
                          {useMetric
                            ? `${backpack.weightKg ? backpack.weightKg.toFixed(2) : 'N/A'} kg | ${backpack.heightCm}x${backpack.widthCm}x${backpack.depthCm} cm`
                            : `${backpack.weightLb ? backpack.weightLb.toFixed(2) : 'N/A'} lbs | ${backpack.heightIn}x${backpack.widthIn}x${backpack.depthIn} in`
                          }
                        </p>
                        <p className="text-muted-foreground mb-2">Carry-on Compliance: {backpack.carryOnCompliance ?? 'N/A'}%</p>
                      </CardContent>
                    </Card>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl">
                    <DialogHeader>
                      <DialogTitle>{backpack.name}</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="w-full pb-[100%] relative overflow-hidden rounded-md">
                        <img
                          src={backpack.image || placeholderImage}
                          alt={backpack.name}
                          className="absolute inset-0 w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = placeholderImage;
                          }}
                        />
                      </div>
                      <div>
                        <p className="text-lg font-semibold mb-2">${backpack.price ?? 'N/A'}</p>
                        <p className="mb-2">Volume: {backpack.volume ?? 'N/A'}L</p>
                        <p className="mb-2">
                          Weight: {useMetric
                            ? `${backpack.weightKg ? backpack.weightKg.toFixed(2) : 'N/A'} kg`
                            : `${backpack.weightLb ? backpack.weightLb.toFixed(2) : 'N/A'} lbs`
                          }
                        </p>
                        <p className="mb-2">
                          Dimensions: {useMetric
                            ? `${backpack.heightCm}x${backpack.widthCm}x${backpack.depthCm} cm`
                            : `${backpack.heightIn}x${backpack.widthIn}x${backpack.depthIn} in`
                          }
                        </p>
                        <p className="mb-2">Carry-on Compliance: {backpack.carryOnCompliance ?? 'N/A'}%</p>
                        <p className="mb-2">Laptop Size: {backpack.laptopSize ?? 'N/A'}</p>
                        <p className="mb-2">Number of Compartments: {backpack.numCompartments ?? 'N/A'}</p>
                        <p className="mb-2">Opening Type: {backpack.openingType ?? 'N/A'}</p>
                        <p className="mb-2">Material: {backpack.material ?? 'N/A'}</p>
                        <p className="mb-2">Aesthetic: {backpack.aesthetic ?? 'N/A'}</p>
                        {backpack.features && backpack.features.length > 0 && (
                          <div className="mb-2">
                            <p className="font-semibold">Features:</p>
                            <ul className="list-disc list-inside">
                              {backpack.features.map((feature, index) => (
                                <li key={index}>{feature}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {backpack.pockets && backpack.pockets.length > 0 && (
                          <div className="mb-2">
                            <p className="font-semibold">Pockets:</p>
                            <ul className="list-disc list-inside">
                              {backpack.pockets.map((pocket, index) => (
                                <li key={index}>{pocket}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="mt-4 text-lg">No backpacks found matching your criteria.</p>
            </div>
          )
        )}
      </div>
    </div>
  )
}