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
import { Cuboid, Info, Shield, TrendingUp, Landmark, ArrowRightLeft } from 'lucide-react';
import Link from 'next/link';
import { convertDensity, DENSITY_UNITS } from '@/lib/converters';

const formSchema = z.object({
  value: z.number().optional(),
  fromUnit: z.string().min(1),
  toUnit: z.string().min(1),
});

type FormValues = z.infer<typeof formSchema>;

export default function DensityConverter() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      value: undefined,
      fromUnit: 'g-per-cubic-cm',
      toUnit: 'lb-per-cubic-foot',
    },
  });

  const { watch, setValue } = form;
  const watchedValues = watch();

  useEffect(() => {
    if (watchedValues.value !== undefined && watchedValues.fromUnit && watchedValues.toUnit) {
      const conversionResult = convertDensity(watchedValues.value, watchedValues.fromUnit, watchedValues.toUnit);
      setResult(conversionResult);
    } else {
      setResult(null);
    }
  }, [watchedValues]);

  const swapUnits = () => {
    const from = watchedValues.fromUnit;
    const to = watchedValues.toUnit;
    const currentValue = watchedValues.value;

    setValue('fromUnit', to);
    setValue('toUnit', from);
    
    if (currentValue !== undefined) {
      setValue('value', result ?? undefined);
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cuboid className="h-5 w-5" />
            Density Converter
          </CardTitle>
          <CardDescription>
            Convert between different units of density like kg/m³ and lb/ft³.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <FormField
                  control={form.control}
                  name="value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Value</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 1000" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select unit" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {DENSITY_UNITS.map(u => <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>)}
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select unit" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {DENSITY_UNITS.map(u => <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>)}
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
                {watchedValues.value} {DENSITY_UNITS.find(u => u.value === watchedValues.fromUnit)?.label.split(' ')[0]} = {result.toPrecision(6)} {DENSITY_UNITS.find(u => u.value === watchedValues.toUnit)?.label.split(' ')[0]}
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
            <p>Density is a measure of mass per unit of volume. It's a fundamental property of matter that describes how tightly packed a substance is. This tool helps convert between metric and imperial units of density.</p>
            <p>All conversions use the kilogram per cubic meter (kg/m³), the SI unit of density, as a base reference to ensure accuracy.</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" />Formula Used</CardTitle></CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <div>
              <h4 className="font-semibold text-foreground mb-2">Standardized Conversion Process</h4>
              <p>To ensure accuracy, all conversions use the kilogram per cubic meter (kg/m³) as a common base unit.</p>
              <ol className="list-decimal pl-5 mt-2 space-y-2">
                  <li><strong className="text-foreground">Convert to kg/m³:</strong> The input value is converted to kg/m³ by multiplying it by its conversion factor. <br /><span className="font-mono text-xs">Value in kg/m³ = Input Value × Conversion Factor to kg/m³</span></li>
                  <li><strong className="text-foreground">Convert to Target Unit:</strong> The kg/m³ value is then converted to the desired final unit by dividing it by the target unit's conversion factor. <br /><span className="font-mono text-xs">Final Value = Value in kg/m³ / Target Unit's Conversion Factor</span></li>
              </ol>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Landmark className="h-5 w-5" />Related Converters</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 text-sm text-primary">
                <li><Link href="/miles-per-hour-to-feet-per-second-converter" className="hover:underline">Miles Per Hour To Feet Per Second Converter</Link></li>
                <li><Link href="/body-measurement-to-cloth-size-converter" className="hover:underline">Body Measurement To Cloth Size Converter</Link></li>
                <li><Link href="/nanometers-to-meters-converter" className="hover:underline">Nanometers To Meters Converter</Link></li>
                <li><Link href="/temperature-converter" className="hover:underline">Temperature Converter</Link></li>
                <li><Link href="/square-yards-to-square-feet-converter" className="hover:underline">Square Yards To Square Feet Converter</Link></li>
            </ul>
          </CardContent>
        </Card>
        
        <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg">
            <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">A Guide to Units of Density</h1>
            <p className="text-lg italic">Density tells us whether an object will float or sink. It is mass divided by volume.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Common Density Units</h2>
            <div className="overflow-x-auto mt-4">
                <table className="w-full text-left border-collapse">
                    <thead><tr className="bg-muted"><th className="p-4 border">Unit</th><th className="p-4 border">Abbreviation</th><th className="p-4 border">Definition & Context</th></tr></thead>
                    <tbody>
                        <tr><td className="p-4 border font-semibold">Kilogram per cubic meter</td><td className="p-4 border">kg/m³</td><td className="p-4 border">The SI derived unit of density. Used in science and engineering.</td></tr>
                        <tr><td className="p-4 border font-semibold">Gram per cubic centimeter</td><td className="p-4 border">g/cm³ or g/mL</td><td className="p-4 border">A common metric unit. The density of water is very close to 1 g/cm³, which makes it a convenient reference.</td></tr>
                        <tr><td className="p-4 border font-semibold">Pound per cubic foot</td><td className="p-4 border">lb/ft³</td><td className="p-4 border">An imperial/US customary unit used in engineering and material science in the US.</td></tr>
                        <tr><td className="p-4 border font-semibold">Pound per cubic inch</td><td className="p-4 border">lb/in³</td><td className="p-4 border">A smaller imperial/US customary unit for very dense materials.</td></tr>
                    </tbody>
                </table>
            </div>
            
            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Common Conversions at a Glance</h2>
            <div className="overflow-x-auto mt-4">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-muted">
                            <th className="p-4 border">Substance</th>
                            <th className="p-4 border">Density (g/cm³)</th>
                            <th className="p-4 border">Density (lb/ft³)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr><td className="p-4 border">Water</td><td className="p-4 border">~1</td><td className="p-4 border">~62.4</td></tr>
                        <tr><td className="p-4 border">Aluminum</td><td className="p-4 border">~2.7</td><td className="p-4 border">~168.5</td></tr>
                        <tr><td className="p-4 border">Lead</td><td className="p-4 border">~11.34</td><td className="p-4 border">~708</td></tr>
                        <tr><td className="p-4 border">1 g/cm³</td><td className="p-4 border">---</td><td className="p-4 border">~62.43 lb/ft³</td></tr>
                    </tbody>
                </table>
            </div>
        </section>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" />Frequently Asked Questions</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">Why is the density of water 1 g/cm³?</h4>
                <p className="text-muted-foreground">This is not a coincidence. The gram was originally defined as the mass of one cubic centimeter of water at its maximum density (at 4°C). This makes 1 g/cm³ (or 1 g/mL) a very convenient reference point for the metric system.</p>
            </div>
            <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">How does temperature affect density?</h4>
                <p className="text-muted-foreground">Generally, as you heat a substance, its particles move faster and spread out, causing it to expand and its density to decrease. Conversely, cooling a substance usually increases its density. Water is a famous exception, as it becomes less dense when it freezes into ice.</p>
            </div>
            <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">Is density the same as weight?</h4>
                <p className="text-muted-foreground">No. Weight is the force of gravity on an object (mass × gravity), while density is the object's mass contained within a specific volume (mass / volume). A large, light object can have the same mass (and weight) as a small, heavy object, but they will have very different densities.</p>
            </div>
            <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">What is the densest element?</h4>
                <p className="text-muted-foreground">Under standard conditions, Osmium (Os) is the densest naturally occurring element, with a density of about 22.59 g/cm³. It's closely followed by Iridium (Ir). A shoebox-sized container of Osmium would weigh over 500 pounds (about 227 kg)!</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" />Summary</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">The Density Converter is an essential tool for scientists, engineers, and students. It allows for quick and accurate conversions between different units of density, bridging the gap between metric and imperial systems.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
