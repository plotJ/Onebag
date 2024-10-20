import React from 'react';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import {
  Star,
  Briefcase,
  Weight,
  Maximize,
  Laptop,
  Grid,
  DoorOpen,
  Palette,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import Image from 'next/image';

interface AirlineCompatibility {
  airlineName: string;
  isCompatible: boolean;
}

async function getBackpack(slug: string) {
  const backpack = await prisma.backpack.findUnique({
    where: { slug },
    include: { airlineCompatibilities: true },
  });

  if (!backpack) notFound();
  return backpack;
}

export default async function BackpackPage({
  params,
}: {
  params: { slug: string };
}) {
  const backpack = await getBackpack(params.slug);

  const renderMeasurement = (
    metric: number | null,
    imperial: number | null,
    unit: string
  ) => {
    if (metric === null || imperial === null) return 'N/A';
    return `${metric} ${unit} / ${imperial.toFixed(2)} ${
      unit === 'kg' ? 'lbs' : 'in'
    }`;
  };

  const placeholderImage =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==';

  return (
    <div className="container mx-auto p-4 space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="relative group">
            <Image
              src={backpack.image || placeholderImage}
              alt={backpack.name}
              width={800}
              height={800}
              placeholder="blur"
              blurDataURL={placeholderImage}
              className="w-full h-auto object-cover rounded-lg shadow-lg transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <Button variant="secondary" size="lg" className="font-bold">
                View Larger
              </Button>
            </div>
          </div>
          <Card className="bg-gradient-to-br from-primary to-primary-foreground text-primary-foreground">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-4">Airline Compatibility Score</h2>
              <Progress value={backpack.carryOnCompliance} className="h-6 mb-2" />
              <p className="text-4xl font-bold">{backpack.carryOnCompliance}%</p>
            </CardContent>
          </Card>
        </div>
        <div className="space-y-6">
          <div>
            <h1 className="text-4xl font-bold mb-2">{backpack.name}</h1>
            <p className="text-3xl font-semibold text-primary">
              ${backpack.price?.toFixed(2) || 'N/A'}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <TooltipProvider>
              {[
                { icon: Briefcase, label: 'Volume', value: backpack.volume ? `${backpack.volume}L` : 'N/A' },
                { icon: Weight, label: 'Weight', value: renderMeasurement(backpack.weightKg, backpack.weightLb, 'kg') },
                { icon: Maximize, label: 'Dimensions', value: backpack.heightCm && backpack.widthCm && backpack.depthCm ? `${backpack.heightCm} x ${backpack.widthCm} x ${backpack.depthCm} cm` : 'N/A' },
                { icon: Laptop, label: 'Laptop Size', value: backpack.laptopSize || 'N/A' },
              ].map((item, index) => (
                <Tooltip key={index}>
                  <TooltipTrigger asChild>
                    <Card className="transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                      <CardContent className="flex items-center p-4">
                        <item.icon className="w-8 h-8 mr-3 text-primary" />
                        <div>
                          <p className="text-sm text-muted-foreground">{item.label}</p>
                          <p className="font-semibold">{item.value}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>View details about {item.label.toLowerCase()}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </TooltipProvider>
          </div>
          <Card className="bg-secondary">
            <CardContent className="p-6 space-y-4">
              {[
                { icon: Grid, label: 'Compartments', value: backpack.compartments ?? 'N/A' },
                { icon: DoorOpen, label: 'Opening Type', value: backpack.openingType || 'N/A' },
                { icon: Star, label: 'Material', value: backpack.material || 'N/A' },
                { icon: Palette, label: 'Aesthetic', value: backpack.aesthetic || 'N/A' },
              ].map((item, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <item.icon className="w-6 h-6 text-primary" />
                  <span className="font-semibold">{item.label}:</span>
                  <span>{item.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>
          {backpack.link && (
            <Button asChild className="w-full" size="lg">
              <Link href={backpack.link} target="_blank" rel="noopener noreferrer">
                View Product <ExternalLink className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>
      </div>
      <div className="mt-12">
        <h2 className="text-3xl font-bold mb-6">Airline Compatibility</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {backpack.airlineCompatibilities.map(
            (compatibility: AirlineCompatibility) => (
              <Badge
                key={compatibility.airlineName}
                variant={compatibility.isCompatible ? 'default' : 'secondary'}
                className="text-sm p-3 flex items-center justify-center"
              >
                {compatibility.isCompatible ? '✓' : '✗'} {compatibility.airlineName}
              </Badge>
            )
          )}
        </div>
      </div>
    </div>
  );
}