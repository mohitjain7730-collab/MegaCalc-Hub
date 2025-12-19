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
import { ChefHat, Info, Shield, TrendingUp, Landmark, ArrowRightLeft } from 'lucide-react';
import Link from 'next/link';
import { convertCooking, COOKING_UNITS } from '@/lib/converters';

const formSchema = z.object({
  value: z.number().optional(),
  fromUnit: z.string().min(1),
  toUnit: z.string().min(1),
});

type FormValues = z.infer<typeof formSchema>;

export default function CookingConverter() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      value: undefined,
      fromUnit: 'us-cup',
      toUnit: 'milliliter',
    },
  });

  const { watch, setValue } = form;
  const watchedValues = watch();

  useEffect(() => {
    if (watchedValues.value !== undefined && watchedValues.fromUnit && watchedValues.toUnit) {
      const conversionResult = convertCooking(watchedValues.value, watchedValues.fromUnit, watchedValues.toUnit);
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

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChefHat className="h-5 w-5" />
            Cooking & Kitchen Units Converter
          </CardTitle>
          <CardDescription>
            Convert between teaspoons, tablespoons, cups, and other kitchen units.
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
                        <Input type="number" placeholder="e.g., 1" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
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
                          {COOKING_UNITS.map(u => <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>)}
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
                          {COOKING_UNITS.map(u => <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>)}
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
                {watchedValues.value} {COOKING_UNITS.find(u => u.value === watchedValues.fromUnit)?.label.split(' ')[1]} = {result.toPrecision(6)} {COOKING_UNITS.find(u => u.value === watchedValues.toUnit)?.label.split(' ')[1]}
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
            <p>Cooking conversions can be tricky, especially when switching between metric and imperial systems. This tool simplifies the process by providing quick and accurate conversions for common kitchen volume measurements.</p>
            <p>All conversions use the liter as a base unit to ensure consistency. Note that these are for volume, not weight. The weight of a cup of flour is different from a cup of sugar.</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" />Formula Used</CardTitle></CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <div>
              <h4 className="font-semibold text-foreground mb-2">Standardized Conversion Process</h4>
              <p>To ensure accuracy, all conversions use the liter as a common base unit, based on standard US definitions for kitchen measurements.</p>
              <ol className="list-decimal pl-5 mt-2 space-y-2">
                  <li><strong className="text-foreground">Convert to Liters:</strong> The input value is converted to liters by multiplying it by its conversion factor.</li>
                  <li><strong className="text-foreground">Convert to Target Unit:</strong> The liter value is then converted to the desired final unit by dividing it by the target unit's conversion factor.</li>
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
                <li><Link href="/category/conversions/days-to-seconds-converter" className="hover:underline">Days To Seconds Converter</Link></li>
                <li><Link href="/category/conversions/horsepower-to-watts-converter" className="hover:underline">Horsepower To Watts Converter</Link></li>
                <li><Link href="/category/conversions/atmospheres-to-torr-converter" className="hover:underline">Atmospheres To Torr Converter</Link></li>
                <li><Link href="/category/conversions/horsepower-to-kilowatts-converter" className="hover:underline">Horsepower To Kilowatts Converter</Link></li>
                <li><Link href="/category/conversions/meters-per-second-to-kilometers-per-hour-converter" className="hover:underline">Meters Per Second To Kilometers Per Hour Converter</Link></li>
            </ul>
          </CardContent>
        </Card>
        
        <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg">
            <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">A Guide to Kitchen Units</h1>
            <p className="text-lg italic">Accurate measurements are the key to successful baking and cooking. This guide covers common volume units found in recipes around the world.</p>
            
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
                        <tr><td className="p-4 border">1 US Tablespoon</td><td className="p-4 border">US Teaspoons</td><td className="p-4 border">3 tsp</td></tr>
                        <tr><td className="p-4 border">1 US Cup</td><td className="p-4 border">US Tablespoons</td><td className="p-4 border">16 tbsp</td></tr>
                        <tr><td className="p-4 border">1 US Cup</td><td className="p-4 border">US Fluid Ounces</td><td className="p-4 border">8 fl-oz</td></tr>
                        <tr><td className="p-4 border">1 US Cup</td><td className="p-4 border">Milliliters</td><td className="p-4 border">~237 mL</td></tr>
                         <tr><td className="p-4 border">1 US Pint</td><td className="p-4 border">US Cups</td><td className="p-4 border">2 cups</td></tr>
                    </tbody>
                </table>
            </div>
        </section>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" />Frequently Asked Questions</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">What is the difference between a fluid ounce and a dry ounce?</h4>
                <p className="text-muted-foreground">A fluid ounce is a measure of volume, while a regular (avoirdupois) ounce is a measure of weight. They are not interchangeable. This converter deals only with volume (fluid ounces).</p>
            </div>
            <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">Are US, UK, and Australian cups the same?</h4>
                <p className="text-muted-foreground">No, they are different. A US cup is ~237 mL. A UK (or Imperial) cup is 284 mL. An Australian cup is 250 mL. This converter uses the US standard cup.</p>
            </div>
            <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">What's the best way to measure flour?</h4>
                <p className="text-muted-foreground">For baking, measuring by weight (grams) is far more accurate than measuring by volume (cups). The amount of flour in a cup can vary significantly depending on how you pack it. If you must use cups, the standard method is to fluff the flour, spoon it into the cup, and level it off without packing it down.</p>
            </div>
            <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">Is a "coffee cup" a standard cup?</h4>
                <p className="text-muted-foreground">No. A "cup" of coffee is typically only about 6 fluid ounces, which is smaller than the standard US measurement of 8 fluid ounces for a cup.</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" />Summary</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">The Cooking Converter is an essential tool for any home cook or professional chef, simplifying recipe conversions between metric and US customary units to ensure your creations turn out perfectly every time.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
