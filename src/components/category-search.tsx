
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, Construction } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Calculator } from '@/lib/calculators';

interface CategorySearchProps {
  calculators: Calculator[];
  categoryName: string;
  categorySlug: string;
}

export function CategorySearch({ calculators, categoryName, categorySlug }: CategorySearchProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCalculators = calculators.filter(
    (calc) =>
      calc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      calc.description.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const lengthConverters = filteredCalculators.filter(calc => [
    'meters-to-feet-converter', 'feet-to-meters-converter', 'centimeters-to-inches-converter', 
    'inches-to-centimeters-converter', 'millimeters-to-inches-converter', 'inches-to-millimeters-converter', 
    'meters-to-yards-converter', 'yards-to-meters-converter', 'miles-to-kilometers-converter', 
    'kilometers-to-miles-converter', 'nautical-miles-to-kilometers-converter', 'kilometers-to-nautical-miles-converter', 
    'micrometers-to-millimeters-converter', 'nanometers-to-meters-converter', 'light-years-to-kilometers-converter', 
    'parsecs-to-light-years-converter', 'astronomical-units-to-kilometers-converter', 'fathoms-to-meters-converter', 
    'chains-to-meters-converter', 'rods-to-feet-converter'
  ].includes(calc.slug));
  
  const areaConverters = filteredCalculators.filter(calc => [
    'square-meters-to-square-feet-converter', 'square-feet-to-square-meters-converter', 
    'square-kilometers-to-square-miles-converter', 'square-miles-to-square-kilometers-converter', 
    'acres-to-square-meters-converter', 'square-meters-to-acres-converter', 'hectares-to-acres-converter', 
    'acres-to-hectares-converter', 'square-yards-to-square-feet-converter', 'square-feet-to-square-yards-converter', 
    'square-inches-to-square-centimeters-converter', 'square-centimeters-to-square-inches-converter', 
    'square-miles-to-acres-converter', 'acres-to-square-miles-converter', 'square-meters-to-square-yards-converter', 
    'square-yards-to-square-meters-converter', 'square-centimeters-to-square-meters-converter', 
    'square-meters-to-square-centimeters-converter', 'hectares-to-square-kilometers-converter', 'square-kilometers-to-hectares-converter'
  ].includes(calc.slug));

  const volumeConverters = filteredCalculators.filter(calc => [
    'liters-to-gallons-converter',
    'gallons-to-liters-converter',
    'milliliters-to-cups-converter',
    'cups-to-milliliters-converter',
    'pints-to-liters-converter',
    'liters-to-pints-converter',
    'quarts-to-liters-converter',
    'liters-to-quarts-converter',
    'cubic-meters-to-liters-converter',
    'liters-to-cubic-meters-converter',
    'cubic-feet-to-gallons-converter',
    'gallons-to-cubic-feet-converter',
    'cubic-inches-to-milliliters-converter',
    'milliliters-to-cubic-inches-converter',
    'tablespoons-to-milliliters-converter',
    'milliliters-to-tablespoons-converter',
    'teaspoons-to-milliliters-converter',
    'milliliters-to-teaspoons-converter',
    'ounces-to-milliliters-converter',
    'milliliters-to-ounces-converter',
  ].includes(calc.slug));

  const weightMassConverters = filteredCalculators.filter(calc => [
    'kilograms-to-pounds-converter',
    'pounds-to-kilograms-converter',
    'grams-to-ounces-converter',
    'ounces-to-grams-converter',
    'milligrams-to-grams-converter',
    'grams-to-milligrams-converter',
    'kilograms-to-ounces-converter',
    'ounces-to-kilograms-converter',
    'stones-to-pounds-converter',
    'pounds-to-stones-converter',
    'tons-metric-to-pounds-converter',
    'pounds-to-tons-metric-converter',
    'short-tons-us-to-metric-tons-converter',
    'metric-tons-to-short-tons-us-converter',
    'micrograms-to-milligrams-converter',
    'milligrams-to-micrograms-converter',
    'carats-to-grams-converter',
    'grams-to-carats-converter',
    'kilograms-to-stones-converter',
    'stones-to-kilograms-converter',
  ].includes(calc.slug));

  const speedConverters = filteredCalculators.filter(calc => 
    [
      'kilometers-per-hour-to-miles-per-hour-converter',
      'miles-per-hour-to-kilometers-per-hour-converter',
      'meters-per-second-to-kilometers-per-hour-converter',
      'kilometers-per-hour-to-meters-per-second-converter',
      'miles-per-hour-to-meters-per-second-converter',
      'meters-per-second-to-miles-per-hour-converter',
      'feet-per-second-to-meters-per-second-converter',
      'meters-per-second-to-feet-per-second-converter',
      'knots-to-kilometers-per-hour-converter',
      'kilometers-per-hour-to-knots-converter',
      'knots-to-miles-per-hour-converter',
      'miles-per-hour-to-knots-converter',
      'mach-number-to-kilometers-per-hour-converter',
      'kilometers-per-hour-to-mach-number-converter',
      'mach-number-to-miles-per-hour-converter',
      'miles-per-hour-to-mach-number-converter',
      'meters-per-second-to-knots-converter',
      'knots-to-meters-per-second-converter',
      'feet-per-second-to-miles-per-hour-converter',
      'miles-per-hour-to-feet-per-second-converter',
    ].includes(calc.slug)
  );

  const timeConverters = filteredCalculators.filter(calc => 
    [
      'seconds-to-minutes-converter',
      'minutes-to-seconds-converter',
      'minutes-to-hours-converter',
      'hours-to-minutes-converter',
      'hours-to-days-converter',
      'days-to-hours-converter',
      'days-to-weeks-converter',
      'weeks-to-days-converter',
      'weeks-to-months-converter',
      'months-to-weeks-converter',
      'months-to-years-converter',
      'years-to-months-converter',
      'seconds-to-hours-converter',
      'hours-to-seconds-converter',
      'seconds-to-days-converter',
      'days-to-seconds-converter',
      'seconds-to-weeks-converter',
      'weeks-to-seconds-converter',
      'minutes-to-days-converter',
      'days-to-minutes-converter',
    ].includes(calc.slug)
  );

  const pressureConverters = filteredCalculators.filter(calc => 
    [
      'pascals-to-atmospheres-converter',
      'atmospheres-to-pascals-converter',
      'pascals-to-bars-converter',
      'bars-to-pascals-converter',
      'pascals-to-psi-converter',
      'psi-to-pascals-converter',
      'atmospheres-to-bars-converter',
      'bars-to-atmospheres-converter',
      'atmospheres-to-psi-converter',
      'psi-to-atmospheres-converter',
      'bars-to-psi-converter',
      'psi-to-bars-converter',
      'torr-to-pascals-converter',
      'pascals-to-torr-converter',
      'torr-to-atmospheres-converter',
      'atmospheres-to-torr-converter',
      'kpa-to-psi-converter',
      'psi-to-kpa-converter',
      'mmhg-to-bars-converter',
      'bars-to-mmhg-converter'
    ].includes(calc.slug)
  );

  const energyConverters = filteredCalculators.filter(calc => 
    [
      'joules-to-kilojoules-converter',
      'kilojoules-to-joules-converter',
      'joules-to-calories-converter',
      'calories-to-joules-converter',
      'joules-to-kilocalories-converter',
      'kilocalories-to-joules-converter',
      'joules-to-watt-hours-converter',
      'watt-hours-to-joules-converter',
      'kwh-to-joules-converter',
      'joules-to-kwh-converter',
      'calories-to-kilocalories-converter',
      'kilocalories-to-calories-converter',
      'btu-to-joules-converter',
      'joules-to-btu-converter',
      'kwh-to-btu-converter',
      'btu-to-kwh-converter',
      'electronvolts-to-joules-converter',
      'joules-to-electronvolts-converter',
      'foot-pounds-to-joules-converter',
      'joules-to-foot-pounds-converter',
    ].includes(calc.slug)
  );
  
  const powerConverters = filteredCalculators.filter(calc => 
    [
      'watts-to-kilowatts-converter',
      'kilowatts-to-watts-converter',
      'watts-to-megawatts-converter',
      'megawatts-to-watts-converter',
      'kilowatts-to-megawatts-converter',
      'megawatts-to-kilowatts-converter',
      'watts-to-horsepower-converter',
      'horsepower-to-watts-converter',
      'kilowatts-to-horsepower-converter',
      'horsepower-to-kilowatts-converter',
      'watts-to-dbm-converter',
      'dbm-to-watts-converter',
      'watts-to-btu-per-hour-converter',
      'btu-per-hour-to-watts-converter',
      'kilowatts-to-btu-per-hour-converter',
      'btu-per-hour-to-kilowatts-converter',
      'ergs-per-second-to-watts-converter',
      'watts-to-ergs-per-second-converter',
      'foot-pounds-per-second-to-watts-converter',
      'watts-to-foot-pounds-per-second-converter',
    ].includes(calc.slug)
  );

  const shoeSizeConverters = filteredCalculators.filter(calc => 
    [
      // No calculators here yet, but this sets up the section
    ].includes(calc.slug)
  );

  const otherCalculators = filteredCalculators.filter(calc => 
    !lengthConverters.find(c => c.id === calc.id) && 
    !areaConverters.find(c => c.id === calc.id) &&
    !volumeConverters.find(c => c.id === calc.id) &&
    !weightMassConverters.find(c => c.id === calc.id) &&
    !speedConverters.find(c => c.id === calc.id) &&
    !timeConverters.find(c => c.id === calc.id) &&
    !pressureConverters.find(c => c.id === calc.id) &&
    !energyConverters.find(c => c.id === calc.id) &&
    !powerConverters.find(c => c.id === calc.id) &&
    !shoeSizeConverters.find(c => c.id === calc.id)
  );

  const renderCalculatorGrid = (calcs: Calculator[], categorySlug: string, noResultsMessage: string) => (
    calcs.length > 0 ? (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {calcs.map((calc) => (
          <Link href={`/category/${categorySlug}/${calc.slug}`} key={calc.id} className="group block h-full">
            <Card className="h-full transition-all duration-200 ease-in-out group-hover:shadow-lg group-hover:-translate-y-1 group-hover:border-primary/50">
              <CardHeader>
                <CardTitle className="text-lg">{calc.name}</CardTitle>
                <CardDescription className="pt-1">{calc.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    ) : <p className="text-muted-foreground">{noResultsMessage}</p>
  );

  return (
    <>
      <div className="relative mb-8">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder={`Search in ${categoryName}...`}
          className="w-full pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {filteredCalculators.length > 0 ? (
        <div className="space-y-12">
            {categorySlug === 'conversions' ? (
                <>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-foreground mb-6">Length Conversions</h2>
                        {renderCalculatorGrid(lengthConverters, categorySlug, "No length converters found.")}
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-foreground mb-6">Area Conversions</h2>
                        {renderCalculatorGrid(areaConverters, categorySlug, "No area converters found.")}
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-foreground mb-6">Volume Conversions</h2>
                        {renderCalculatorGrid(volumeConverters, categorySlug, "No volume converters found.")}
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-foreground mb-6">Weight/Mass Conversions</h2>
                        {renderCalculatorGrid(weightMassConverters, categorySlug, "No weight/mass converters found.")}
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-foreground mb-6">Speed Conversions</h2>
                        {renderCalculatorGrid(speedConverters, categorySlug, "No speed converters found.")}
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-foreground mb-6">Time conversion</h2>
                        {renderCalculatorGrid(timeConverters, categorySlug, "No time converters found.")}
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-foreground mb-6">Pressure conversion</h2>
                        {renderCalculatorGrid(pressureConverters, categorySlug, "No pressure converters found.")}
                    </div>
                     <div>
                        <h2 className="text-2xl font-bold tracking-tight text-foreground mb-6">Energy Conversions</h2>
                        {renderCalculatorGrid(energyConverters, categorySlug, "No energy converters found.")}
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-foreground mb-6">Power Conversions</h2>
                        {renderCalculatorGrid(powerConverters, categorySlug, "No power converters found.")}
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-foreground mb-6">Other useful conversions</h2>
                        {renderCalculatorGrid(shoeSizeConverters, categorySlug, "No other useful converters found.")}
                    </div>
                </>
            ) : null}

            {otherCalculators.length > 0 && (
                 <div>
                    {categorySlug === 'conversions' && <div className="my-8"/>}
                    {renderCalculatorGrid(otherCalculators, categorySlug, "")}
                </div>
            )}
        </div>
      ) : (
        <Card className="w-full text-center shadow-md mt-8">
          <CardContent className="p-8">
              <Construction className="mx-auto h-16 w-16 mb-6 text-primary" strokeWidth={1.5} />
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                {calculators.length > 0 ? 'No Calculators Found' : 'Calculators Coming Soon'}
              </h2>
              <p className="text-lg text-muted-foreground">
                 {calculators.length > 0 
                  ? `Your search for "${searchQuery}" did not match any calculators in this category.`
                  : `Individual calculators for the ${categoryName} category are being built.`
                 }
              </p>
          </CardContent>
        </Card>
      )}
    </>
  );
}
