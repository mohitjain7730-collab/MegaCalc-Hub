'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Info, Shield, TrendingUp, Landmark, ArrowRightLeft } from 'lucide-react';
import Link from 'next/link';
import { convertMaterialMassVolume, MATERIAL_UNITS, WEIGHT_UNITS, VOLUME_UNITS, MATERIAL_DENSITIES } from '@/lib/converters';

const unitGroups = [
  { label: 'Weight/Mass', units: WEIGHT_UNITS },
  { label: 'Volume', units: VOLUME_UNITS },
];

const formSchema = z.object({
  value: z.number().optional(),
  material: z.string().min(1, "Please select a material"),
  fromUnit: z.string().min(1),
  toUnit: z.string().min(1),
});

type FormValues = z.infer<typeof formSchema>;

export default function MaterialConverter() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      value: undefined,
      material: 'water',
      fromUnit: 'kilogram',
      toUnit: 'liter',
    },
  });

  const { watch, setValue } = form;
  const watchedValues = watch();

  useEffect(() => {
    if (watchedValues.value !== undefined && watchedValues.fromUnit && watchedValues.toUnit && watchedValues.material) {
      try {
        const conversionResult = convertMaterialMassVolume(watchedValues.value, watchedValues.fromUnit, watchedValues.toUnit, watchedValues.material);
        setResult(conversionResult);
      } catch (error) {
        setResult(null);
        console.error(error);
      }
    } else {
      setResult(null);
    }
  }, [watchedValues]);

  const swapUnits = () => {
    const from = watchedValues.fromUnit;
    const to = watchedValues.toUnit;
    setValue('fromUnit', to);
    setValue('toUnit', from);
  };
  
  const fromUnitType = WEIGHT_UNITS.some(u => u.value === watchedValues.fromUnit) ? 'mass' : 'volume';
  const toUnitType = WEIGHT_UNITS.some(u => u.value === watchedValues.toUnit) ? 'mass' : 'volume';

  const getUnitLabel = (unitValue: string) => {
    const allUnits = [...WEIGHT_UNITS, ...VOLUME_UNITS];
    return allUnits.find(u => u.value === unitValue)?.label || unitValue;
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Material Weight ↔ Volume Converter
          </CardTitle>
          <CardDescription>
            Convert between weight and volume for common materials based on their density.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
              <FormField
                control={form.control}
                name="material"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Material</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a material" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {MATERIAL_UNITS.map(u => <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <FormField
                  control={form.control}
                  name="value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Value</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 10" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fromUnit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>From</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select unit" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {unitGroups.map(group => (
                            <SelectGroup key={group.label}>
                              <SelectLabel>{group.label}</SelectLabel>
                              {group.units.map(u => <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>)}
                            </SelectGroup>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="toUnit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>To</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select unit" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {unitGroups.map(group => (
                             <SelectGroup key={group.label}>
                              <SelectLabel>{group.label}</SelectLabel>
                              {group.units.map(u => <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>)}
                            </SelectGroup>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="button" variant="outline" onClick={swapUnits} disabled={fromUnitType === toUnitType}>
                <ArrowRightLeft className="mr-2 h-4 w-4" /> Swap Units
              </Button>
               {fromUnitType === toUnitType && (
                <p className="text-sm text-destructive">Please select one weight unit and one volume unit to convert.</p>
              )}
            </form>
          </Form>

          {result !== null && watchedValues.value !== undefined && fromUnitType !== toUnitType && (
            <div className="mt-8 pt-6 border-t">
              <p className="text-center text-lg text-muted-foreground">Result</p>
              <p className="text-center text-4xl font-bold text-primary mt-2">
                {result.toPrecision(6)}
              </p>
              <p className="text-center text-sm text-muted-foreground mt-1">
                {watchedValues.value} {getUnitLabel(watchedValues.fromUnit)} of {MATERIAL_UNITS.find(m => m.value === watchedValues.material)?.label.toLowerCase()} = {result.toPrecision(6)} {getUnitLabel(watchedValues.toUnit)}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" />Understanding the Converter</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>This tool converts between an object's weight (mass) and its volume, a calculation that depends entirely on the substance's density. A kilogram of steel takes up much less space than a kilogram of flour.</p>
            <p>The converter uses standard average densities for each material. Note that real-world densities can vary based on factors like temperature, pressure, and purity.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" />Formula Used</CardTitle></CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <div>
              <h4 className="font-semibold text-foreground mb-2">Core Conversion Formulas</h4>
              <p>The relationship between mass, volume, and density is the key:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1 font-mono text-xs">
                <li>Volume = Mass / Density</li>
                <li>Mass = Volume × Density</li>
              </ul>
              <p className="mt-2">This calculator first converts the input unit to a base of kilograms or cubic meters, applies the appropriate density, and then converts to the target unit.</p>
            </div>
          </CardContent>
        </Card>


        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Landmark className="h-5 w-5" />Related Converters</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 text-sm text-primary">
                <li><Link href="/category/conversions/square-miles-to-square-kilometers-converter" className="hover:underline">Square Miles To Square Kilometers Converter</Link></li>
                <li><Link href="/category/conversions/area-converter" className="hover:underline">Area Converter</Link></li>
                <li><Link href="/category/conversions/pascals-to-bars-converter" className="hover:underline">Pascals To Bars Converter</Link></li>
                <li><Link href="/category/conversions/centimeters-to-inches-converter" className="hover:underline">Centimeters To Inches Converter</Link></li>
                <li><Link href="/category/conversions/kilometers-to-miles-converter" className="hover:underline">Kilometers To Miles Converter</Link></li>
            </ul>
          </CardContent>
        </Card>
        
        <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg">
            <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">Material Densities</h1>
            <p className="text-lg italic">Density is the measure of mass per unit of volume. Below are the approximate densities used by this calculator.</p>
            
            <div className="overflow-x-auto mt-4">
                <table className="w-full text-left border-collapse">
                    <thead><tr className="bg-muted"><th className="p-4 border">Material</th><th className="p-4 border">Approximate Density (kg/m³)</th></tr></thead>
                    <tbody>
                        {MATERIAL_UNITS.map(material => (
                             <tr key={material.value}><td className="p-4 border font-semibold">{material.label}</td><td className="p-4 border">{MATERIAL_DENSITIES[material.value]} kg/m³</td></tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" />Frequently Asked Questions</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">Why can't I convert a kilogram of feathers to liters directly?</h4>
                <p className="text-muted-foreground">The conversion between mass (kilograms) and volume (liters) depends on density. A liter of water weighs one kilogram, but a liter of feathers weighs much less. Without knowing the material, the conversion is impossible.</p>
            </div>
            <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">Are these densities always accurate?</h4>
                <p className="text-muted-foreground">The densities used here are standard averages. The actual density of a material like "sand" or "gravel" can vary significantly depending on its composition, moisture content, and how tightly it's packed.</p>
            </div>
             <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">Why is water a common benchmark?</h4>
                <p className="text-muted-foreground">Water has a density of approximately 1,000 kg/m³, which means 1 liter of water has a mass of exactly 1 kilogram (and 1 mL has a mass of 1 gram). This simple 1:1 relationship in the metric system makes it an excellent reference point.</p>
            </div>
            <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">How does temperature affect density?</h4>
                <p className="text-muted-foreground">For most materials, density decreases as temperature increases because the material expands. The values used in this calculator assume standard room temperature.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
