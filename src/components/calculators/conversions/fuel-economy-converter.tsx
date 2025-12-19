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
import { Fuel, Info, Shield, TrendingUp, Landmark, ArrowRightLeft } from 'lucide-react';
import Link from 'next/link';
import { convertFuelEconomy, FUEL_ECONOMY_UNITS } from '@/lib/converters';

const formSchema = z.object({
  value: z.number().optional(),
  fromUnit: z.string().min(1),
  toUnit: z.string().min(1),
});

type FormValues = z.infer<typeof formSchema>;

export default function FuelEconomyConverter() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      value: undefined,
      fromUnit: 'mpg-us',
      toUnit: 'liters-per-100km',
    },
  });

  const { watch, setValue } = form;
  const watchedValues = watch();

  useEffect(() => {
    if (watchedValues.value !== undefined && watchedValues.fromUnit && watchedValues.toUnit) {
      const conversionResult = convertFuelEconomy(watchedValues.value, watchedValues.fromUnit, watchedValues.toUnit);
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
            <Fuel className="h-5 w-5" />
            Fuel Economy Converter
          </CardTitle>
          <CardDescription>
            Convert between MPG, L/100km, and other fuel efficiency units.
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
                        <Input type="number" placeholder="e.g., 30" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
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
                          {FUEL_ECONOMY_UNITS.map(u => <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>)}
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
                          {FUEL_ECONOMY_UNITS.map(u => <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>)}
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
                {watchedValues.value} {FUEL_ECONOMY_UNITS.find(u => u.value === watchedValues.fromUnit)?.label} = {result.toPrecision(6)} {FUEL_ECONOMY_UNITS.find(u => u.value === watchedValues.toUnit)?.label}
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
            <p>Fuel economy is measured differently around the world. In North America, it's "distance per volume" (e.g., Miles per Gallon). In Europe and elsewhere, it's "volume per distance" (e.g., Liters per 100km). This tool bridges the gap.</p>
            <p>Note the inverse relationship: higher MPG is better, while lower L/100km is better.</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" />Formula Used</CardTitle></CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <div>
              <h4 className="font-semibold text-foreground mb-2">Standardized Conversion Process</h4>
              <p>All conversions use Liters per 100km as a common base unit. The formulas are not simple multiplication, as they involve division.</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li className="font-mono text-xs">L/100km = 235.214 / MPG (US)</li>
                <li className="font-mono text-xs">L/100km = 282.481 / MPG (Imperial)</li>
                <li className="font-mono text-xs">L/100km = 100 / (km/L)</li>
              </ul>
            </div>
          </CardContent>
        </Card>


        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Landmark className="h-5 w-5" />Related Converters</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 text-sm text-primary">
                <li><Link href="/category/conversions/hectares-to-square-kilometers-converter" className="hover:underline">Hectares To Square Kilometers Converter</Link></li>
                <li><Link href="/category/conversions/acres-to-hectares-converter" className="hover:underline">Acres To Hectares Converter</Link></li>
                <li><Link href="/category/conversions/joules-to-calories-converter" className="hover:underline">Joules To Calories Converter</Link></li>
                <li><Link href="/category/conversions/height-converter" className="hover:underline">Height Converter</Link></li>
                <li><Link href="/category/conversions/psi-to-kpa-converter" className="hover:underline">Psi To Kpa Converter</Link></li>
            </ul>
          </CardContent>
        </Card>
        
        <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg">
            <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">A Guide to Fuel Economy Units</h1>
            <p className="text-lg italic">Understanding fuel efficiency ratings is key to comparing vehicles and estimating fuel costs.</p>

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
                        <tr><td className="p-4 border">25 MPG (US)</td><td className="p-4 border">L/100km</td><td className="p-4 border">~9.4 L/100km</td></tr>
                        <tr><td className="p-4 border">40 MPG (US)</td><td className="p-4 border">L/100km</td><td className="p-4 border">~5.9 L/100km</td></tr>
                        <tr><td className="p-4 border">8 L/100km</td><td className="p-4 border">MPG (US)</td><td className="p-4 border">~29.4 MPG</td></tr>
                        <tr><td className="p-4 border">1 Imperial Gallon</td><td className="p-4 border">US Gallons</td><td className="p-4 border">~1.2 US Gallons</td></tr>
                    </tbody>
                </table>
            </div>
        </section>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" />Frequently Asked Questions</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">Why is MPG higher with an Imperial gallon?</h4>
                <p className="text-muted-foreground">The Imperial gallon is about 20% larger than the US gallon. Since you can travel further on a larger gallon of fuel, the MPG (Imperial) figure will be higher for the same car.</p>
            </div>
            <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">Why do some countries use L/100km?</h4>
                <p className="text-muted-foreground">The L/100km metric directly measures fuel consumed over a standard distance, which can make it easier to calculate fuel costs for a trip. A lower number is better, which is the opposite of MPG.</p>
            </div>
             <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">How does driving style affect fuel economy?</h4>
                <p className="text-muted-foreground">Aggressive driving (hard acceleration and braking) can lower your fuel economy by 15-30% at highway speeds and 10-40% in stop-and-go traffic. Smooth driving saves fuel.</p>
            </div>
            <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">Does using air conditioning affect MPG?</h4>
                <p className="text-muted-foreground">Yes, using your car's air conditioning is one of the biggest drains on fuel economy and can reduce it by up to 25%, especially on short trips.</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" />Summary</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">The Fuel Economy Converter is a vital tool for car buyers, travelers, and fleet managers, allowing for easy and accurate comparison of vehicle efficiency ratings from different regions of the world.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
