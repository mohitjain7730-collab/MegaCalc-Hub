'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Construction, Info, Shield, TrendingUp, Landmark, ArrowRightLeft } from 'lucide-react';
import Link from 'next/link';
import { convertLength, convertArea, convertVolume, LENGTH_UNITS, AREA_UNITS, VOLUME_UNITS } from '@/lib/converters';

const unitTypes = [
  { value: 'length', label: 'Length' },
  { value: 'area', label: 'Area' },
  { value: 'volume', label: 'Volume' },
];

const constructionUnits = {
  length: LENGTH_UNITS,
  area: AREA_UNITS,
  volume: VOLUME_UNITS,
};

const formSchema = z.object({
  unitType: z.string().min(1),
  value: z.number().optional(),
  fromUnit: z.string().min(1),
  toUnit: z.string().min(1),
});

type FormValues = z.infer<typeof formSchema>;

export default function ConstructionConverter() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      unitType: 'length',
      value: undefined,
      fromUnit: 'foot',
      toUnit: 'meter',
    },
  });

  const { watch, setValue } = form;
  const watchedValues = watch();

  useEffect(() => {
    if (watchedValues.value !== undefined && watchedValues.fromUnit && watchedValues.toUnit) {
      let conversionResult: number;
      switch (watchedValues.unitType) {
        case 'length':
          conversionResult = convertLength(watchedValues.value, watchedValues.fromUnit, watchedValues.toUnit);
          break;
        case 'area':
          conversionResult = convertArea(watchedValues.value, watchedValues.fromUnit, watchedValues.toUnit);
          break;
        case 'volume':
          conversionResult = convertVolume(watchedValues.value, watchedValues.fromUnit, watchedValues.toUnit);
          break;
        default:
          setResult(null);
          return;
      }
      setResult(conversionResult);
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

  const currentUnits = constructionUnits[watchedValues.unitType as keyof typeof constructionUnits] || [];

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Construction className="h-5 w-5" />
            Construction Units Converter
          </CardTitle>
          <CardDescription>
            Convert common units for length, area, and volume in construction.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
              <FormField
                control={form.control}
                name="unitType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Measurement Type</FormLabel>
                    <Select onValueChange={(value) => {
                      field.onChange(value);
                      setValue('value', undefined);
                      if (value === 'length') { setValue('fromUnit', 'foot'); setValue('toUnit', 'meter'); }
                      if (value === 'area') { setValue('fromUnit', 'square-foot'); setValue('toUnit', 'square-meter'); }
                      if (value === 'volume') { setValue('fromUnit', 'cubic-yard'); setValue('toUnit', 'cubic-meter'); }
                    }} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a measurement type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {unitTypes.map(u => <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>)}
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
                        <Input type="number" placeholder="e.g., 100" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
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
                          {currentUnits.map(u => <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>)}
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
                          {currentUnits.map(u => <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
               <Button type="button" variant="outline" onClick={swapUnits}>
                <ArrowRightLeft className="mr-2 h-4 w-4" /> Swap Units
              </Button>
            </form>
          </Form>

          {result !== null && watchedValues.value !== undefined && (
            <div className="mt-8 pt-6 border-t">
              <p className="text-center text-lg text-muted-foreground">Result</p>
              <p className="text-center text-4xl font-bold text-primary mt-2">
                {result.toPrecision(6)}
              </p>
              <p className="text-center text-sm text-muted-foreground mt-1">
                {watchedValues.value} {currentUnits.find(u => u.value === watchedValues.fromUnit)?.label} = {result.toPrecision(6)} {currentUnits.find(u => u.value === watchedValues.toUnit)?.label}
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
            <p>The Construction Units Converter is a specialized tool for professionals in building, engineering, and architecture. It simplifies the process of converting between metric and imperial units commonly used on job sites for length, area, and volume calculations.</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Landmark className="h-5 w-5" />Related Converters</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 text-sm text-primary">
                <li><Link href="/category/conversions/square-miles-to-acres-converter" className="hover:underline">Square Miles To Acres Converter</Link></li>
                <li><Link href="/category/conversions/kilowatts-to-watts-converter" className="hover:underline">Kilowatts To Watts Converter</Link></li>
                <li><Link href="/category/conversions/electrical-converter" className="hover:underline">Electrical Converter</Link></li>
                <li><Link href="/category/conversions/foot-pounds-to-joules-converter" className="hover:underline">Foot Pounds To Joules Converter</Link></li>
                <li><Link href="/category/conversions/gallons-to-liters-converter" className="hover:underline">Gallons To Liters Converter</Link></li>
            </ul>
          </CardContent>
        </Card>
        
        <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg">
            <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">A Guide to Construction Units</h1>
            <p className="text-lg italic">Precision is key in construction. This guide highlights the most common units and conversions encountered in the field.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Common Conversions at a Glance</h2>
            <div className="overflow-x-auto mt-4">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-muted">
                            <th className="p-4 border">From</th>
                            <th className="p-4 border">To</th>
                            <th className="p-4 border">Equivalent Value</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr><td className="p-4 border">1 Inch</td><td className="p-4 border">Millimeters</td><td className="p-4 border">25.4 mm</td></tr>
                        <tr><td className="p-4 border">1 Foot</td><td className="p-4 border">Inches</td><td className="p-4 border">12 in</td></tr>
                        <tr><td className="p-4 border">1 Yard</td><td className="p-4 border">Feet</td><td className="p-4 border">3 ft</td></tr>
                        <tr><td className="p-4 border">1 Square Yard</td><td className="p-4 border">Square Feet</td><td className="p-4 border">9 ft²</td></tr>
                        <tr><td className="p-4 border">1 Cubic Yard</td><td className="p-4 border">Cubic Feet</td><td className="p-4 border">27 ft³</td></tr>
                        <tr><td className="p-4 border">1 Acre</td><td className="p-4 border">Square Feet</td><td className="p-4 border">43,560 ft²</td></tr>
                    </tbody>
                </table>
            </div>
        </section>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" />Frequently Asked Questions</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">Why is "cubic yard" so common in construction?</h4>
                <p className="text-muted-foreground">The cubic yard is a standard unit for ordering materials like concrete, soil, and gravel. One cubic yard (27 cubic feet) is a manageable but substantial quantity for large projects.</p>
            </div>
            <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">What is a "board foot"?</h4>
                <p className="text-muted-foreground">A board foot is a specialized unit of volume for lumber, representing a piece of wood that is 1 foot long, 1 foot wide, and 1 inch thick. This calculator uses more general volume units.</p>
            </div>
            <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">How are roofs measured?</h4>
                <p className="text-muted-foreground">Roofing area is often measured in "squares," where one square equals 100 square feet. This simplifies calculations for materials like shingles.</p>
            </div>
            <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">What is rebar sizing?</h4>
                <p className="text-muted-foreground">In the US, rebar (reinforcing bar) size is specified by a number that corresponds to its diameter in eighths of an inch. For example, a #4 rebar is 4/8 or 1/2 inch in diameter.</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" />Summary</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">This converter is an indispensable on-the-job tool for construction managers, builders, and architects, ensuring accuracy and efficiency when dealing with mixed-unit plans and materials.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
