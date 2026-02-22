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
import { Beaker, Info, Shield, TrendingUp, Landmark, ArrowRightLeft } from 'lucide-react';
import Link from 'next/link';
import { convertVolume, VOLUME_UNITS } from '@/lib/converters';

const formSchema = z.object({
  value: z.number().optional(),
  fromUnit: z.string().min(1),
  toUnit: z.string().min(1),
});

type FormValues = z.infer<typeof formSchema>;

export default function VolumeConverter() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      value: undefined,
      fromUnit: 'liter',
      toUnit: 'us-gallon',
    },
  });

  const { watch, setValue } = form;
  const watchedValues = watch();

  useEffect(() => {
    if (watchedValues.value !== undefined && watchedValues.fromUnit && watchedValues.toUnit) {
      const conversionResult = convertVolume(watchedValues.value, watchedValues.fromUnit, watchedValues.toUnit);
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
      const newResult = convertVolume(currentValue, to, from);
      setValue('value', result ?? undefined);
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Beaker className="h-5 w-5" />
            Volume Converter
          </CardTitle>
          <CardDescription>
            Easily convert between different metric and imperial units of volume.
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select unit" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {VOLUME_UNITS.map(u => <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>)}
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
                          {VOLUME_UNITS.map(u => <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>)}
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
                {watchedValues.value} {VOLUME_UNITS.find(u => u.value === watchedValues.fromUnit)?.label.split(' ')[0]} = {result.toPrecision(6)} {VOLUME_UNITS.find(u => u.value === watchedValues.toUnit)?.label.split(' ')[0]}
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
            <p>This tool allows for seamless conversion between various metric, US, and Imperial units of volume. Whether you're a chef converting recipe measurements, a scientist working with solutions, or someone figuring out gas mileage, this converter simplifies volume calculations.</p>
            <p>All conversions are standardized by first converting the input value to liters, ensuring accuracy across different systems.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" />Formula Used</CardTitle></CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <div>
              <h4 className="font-semibold text-foreground mb-2">Standardized Conversion</h4>
              <p>To ensure precision, all conversions use the liter as an intermediate base unit.</p>
              <ol className="list-decimal pl-5 mt-2 space-y-2">
                <li><strong className="text-foreground">Convert to Liters:</strong> The input value is first converted to liters. <br /><span className="font-mono text-xs">Value in Liters = Input Value × Conversion Factor to Liters</span></li>
                <li><strong className="text-foreground">Convert to Target Unit:</strong> The value in liters is then converted to the final unit. <br /><span className="font-mono text-xs">Final Value = Value in Liters / Target Unit's Conversion Factor from Liters</span></li>
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
                <li><Link href="/atmospheres-to-torr-converter" className="hover:underline">Atmospheres To Torr Converter</Link></li>
                <li><Link href="/meters-per-second-to-knots-converter" className="hover:underline">Meters Per Second To Knots Converter</Link></li>
                <li><Link href="/gallons-to-cubic-feet-converter" className="hover:underline">Gallons To Cubic Feet Converter</Link></li>
                <li><Link href="/weight-and-mass-converter" className="hover:underline">Weight And Mass Converter</Link></li>
                <li><Link href="/bars-to-psi-converter" className="hover:underline">Bars To Psi Converter</Link></li>
            </ul>
          </CardContent>
        </Card>

        <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg">
          <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">A Guide to Units of Volume</h1>
          <p className="text-lg italic">Volume is the measure of three-dimensional space occupied by a substance. Different systems for measuring volume have evolved, primarily the metric, US customary, and British imperial systems.</p>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">The Metric System (SI)</h2>
          <p>Based on the liter, the metric system is the global standard for science, medicine, and most countries' daily use.</p>
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left border-collapse">
              <thead><tr className="bg-muted"><th className="p-4 border">Unit</th><th className="p-4 border">Abbreviation</th><th className="p-4 border">Relation to Liter</th><th className="p-4 border">Primary Use Case</th></tr></thead>
              <tbody>
                <tr><td className="p-4 border font-semibold">Milliliter</td><td className="p-4 border">mL</td><td className="p-4 border">1/1,000 of a Liter</td><td className="p-4 border">Cooking, chemistry, medicine dosage.</td></tr>
                <tr><td className="p-4 border font-semibold">Liter</td><td className="p-4 border">L</td><td className="p-4 border">Base Unit</td><td className="p-4 border">Beverages, fuel, everyday liquid quantities.</td></tr>
                <tr><td className="p-4 border font-semibold">Cubic Meter</td><td className="p-4 border">m³</td><td className="p-4 border">1,000 Liters</td><td className="p-4 border">Large-scale industrial and environmental volumes.</td></tr>
              </tbody>
            </table>
          </div>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">The U.S. Customary System</h2>
          <p>Used primarily in the United States, this system has units that can be confusingly similar in name to the Imperial system but differ in size.</p>
           <div className="overflow-x-auto mt-4">
            <table className="w-full text-left border-collapse">
              <thead><tr className="bg-muted"><th className="p-4 border">Unit</th><th className="p-4 border">Abbreviation</th><th className="p-4 border">Relation to Others</th><th className="p-4 border">Primary Use Case</th></tr></thead>
              <tbody>
                <tr><td className="p-4 border font-semibold">US Fluid Ounce</td><td className="p-4 border">fl-oz</td><td className="p-4 border">1/128 of a US Gallon</td><td className="p-4 border">Cooking, beverages.</td></tr>
                <tr><td className="p-4 border font-semibold">US Cup</td><td className="p-4 border">c</td><td className="p-4 border">8 US fl-oz</td><td className="p-4 border">Cooking and baking.</td></tr>
                <tr><td className="p-4 border font-semibold">US Pint</td><td className="p-4 border">pt</td><td className="p-4 border">16 US fl-oz (2 cups)</td><td className="p-4 border">Beverages (e.g., beer).</td></tr>
                <tr><td className="p-4 border font-semibold">US Quart</td><td className="p-4 border">qt</td><td className="p-4 border">32 US fl-oz (2 pints)</td><td className="p-4 border">Milk, motor oil.</td></tr>
                <tr><td className="p-4 border font-semibold">US Gallon</td><td className="p-4 border">gal</td><td className="p-4 border">128 US fl-oz (4 quarts)</td><td className="p-4 border">Fuel, large containers of liquids.</td></tr>
              </tbody>
            </table>
          </div>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">The British Imperial System</h2>
          <p>While the UK has largely metricated, Imperial units are still used in some contexts. Note the difference in sizes compared to US units.</p>
           <div className="overflow-x-auto mt-4">
            <table className="w-full text-left border-collapse">
              <thead><tr className="bg-muted"><th className="p-4 border">Unit</th><th className="p-4 border">Abbreviation</th><th className="p-4 border">Relation to Others</th><th className="p-4 border">Primary Use Case</th></tr></thead>
              <tbody>
                <tr><td className="p-4 border font-semibold">Imperial Fluid Ounce</td><td className="p-4 border">fl-oz</td><td className="p-4 border">1/160 of an Imperial Gallon</td><td className="p-4 border">Cocktails, perfumes.</td></tr>
                <tr><td className="p-4 border font-semibold">Imperial Pint</td><td className="p-4 border">pt</td><td className="p-4 border">20 Imperial fl-oz</td><td className="p-4 border">Draught beer and cider, milk.</td></tr>
                <tr><td className="p-4 border font-semibold">Imperial Quart</td><td className="p-4 border">qt</td><td className="p-4 border">40 Imperial fl-oz (2 pints)</td><td className="p-4 border">Less common, some large liquid containers.</td></tr>
                <tr><td className="p-4 border font-semibold">Imperial Gallon</td><td className="p-4 border">gal</td><td className="p-4 border">160 Imperial fl-oz (4 quarts)</td><td className="p-4 border">Fuel economy (MPG) in the UK.</td></tr>
              </tbody>
            </table>
          </div>

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
                      <tr><td className="p-4 border">1 Liter</td><td className="p-4 border">US Gallons</td><td className="p-4 border">~0.264 gal</td></tr>
                      <tr><td className="p-4 border">1 US Gallon</td><td className="p-4 border">Liters</td><td className="p-4 border">~3.785 L</td></tr>
                      <tr><td className="p-4 border">1 Imperial Gallon</td><td className="p-4 border">Liters</td><td className="p-4 border">~4.546 L</td></tr>
                      <tr><td className="p-4 border">1 US Pint</td><td className="p-4 border">US Fluid Ounces</td><td className="p-4 border">16 US fl-oz</td></tr>
                      <tr><td className="p-4 border">1 Imperial Pint</td><td className="p-4 border">Imperial Fluid Ounces</td><td className="p-4 border">20 Imp fl-oz</td></tr>
                      <tr><td className="p-4 border">1 US Fluid Ounce</td><td className="p-4 border">Milliliters</td><td className="p-4 border">~29.57 mL</td></tr>
                      <tr><td className="p-4 border">1 Cubic Meter</td><td className="p-4 border">Liters</td><td className="p-4 border">1,000 L</td></tr>
                  </tbody>
              </table>
          </div>
        </section>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" />Frequently Asked Questions</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">What is the difference between a US gallon and an Imperial gallon?</h4>
              <p className="text-muted-foreground">An Imperial gallon is about 20% larger than a US gallon. The Imperial gallon is approximately 4.546 liters, while the US gallon is approximately 3.785 liters. This is a common source of confusion, especially for fuel efficiency ratings.</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Is a fluid ounce the same as a regular ounce?</h4>
              <p className="text-muted-foreground">No. A fluid ounce is a unit of volume, while a regular (avoirdupois) ounce is a unit of weight/mass. For water, one US fluid ounce weighs approximately 1.04 regular ounces, so they are close but not interchangeable.</p>
            </div>
            <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">What is the difference between a US pint and an Imperial pint?</h4>
                <p className="text-muted-foreground">An Imperial pint (568 mL) is about 20% larger than a US liquid pint (473 mL). This is why a pint of beer in a British pub is larger than one in the US.</p>
            </div>
            <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">How is a liter defined?</h4>
                <p className="text-muted-foreground">A liter is a metric unit of volume. It is defined as a special name for a cubic decimeter (1 L = 1 dm³). This also means 1,000 liters is equal to one cubic meter.</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" />Summary</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">The Volume Converter provides a fast and reliable way to switch between a wide range of metric, US, and Imperial units. It is an indispensable tool for anyone in cooking, engineering, chemistry, or international trade.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
