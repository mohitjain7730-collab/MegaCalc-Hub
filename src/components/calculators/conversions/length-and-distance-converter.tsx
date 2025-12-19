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
import { Landmark, Info, Shield, TrendingUp, Ruler, ArrowRightLeft } from 'lucide-react';
import Link from 'next/link';
import { convertLength, LENGTH_UNITS } from '@/lib/converters';

const formSchema = z.object({
  value: z.number().optional(),
  fromUnit: z.string().min(1),
  toUnit: z.string().min(1),
});

type FormValues = z.infer<typeof formSchema>;

export default function LengthAndDistanceConverter() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      value: undefined,
      fromUnit: 'meter',
      toUnit: 'foot',
    },
  });

  const { watch, setValue } = form;
  const watchedValues = watch();

  useEffect(() => {
    if (watchedValues.value !== undefined && watchedValues.fromUnit && watchedValues.toUnit) {
      const conversionResult = convertLength(watchedValues.value, watchedValues.fromUnit, watchedValues.toUnit);
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
       const newResult = convertLength(currentValue, to, from);
       setValue('value', result ?? undefined); // Use the old result as the new value
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ruler className="h-5 w-5" />
            Length & Distance Converter
          </CardTitle>
          <CardDescription>
            Quickly convert between various units of length and distance.
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
                          {LENGTH_UNITS.map(u => <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>)}
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
                          {LENGTH_UNITS.map(u => <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>)}
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
                        {watchedValues.value} {LENGTH_UNITS.find(u => u.value === watchedValues.fromUnit)?.label.split(' ')[0]} = {result.toPrecision(6)} {LENGTH_UNITS.find(u => u.value === watchedValues.toUnit)?.label.split(' ')[0]}
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
            <p>This tool provides a quick and accurate way to convert between different units of length and distance. Whether you're working with metric, imperial, or specialized units like nautical miles, this converter simplifies the process.</p>
            <p>It works by converting the input value to a base unit (meters) and then converting that base unit to the desired output unit, ensuring precise conversions across all supported units.</p>
          </CardContent>
        </Card>

        <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" />Formula Used</CardTitle></CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <div>
                  <h4 className="font-semibold text-foreground mb-2">Two-Step Conversion</h4>
                  <p>To ensure accuracy and maintainability, all conversions follow a two-step process using the meter as a common base unit.</p>
                  <ol className="list-decimal pl-5 mt-2 space-y-2">
                      <li><strong className="text-foreground">Convert to Base Unit:</strong> The initial value is first converted to meters using its specific conversion factor. <br /><span className="font-mono text-xs">Value in Meters = Input Value * Conversion Factor to Meters</span></li>
                      <li><strong className="text-foreground">Convert to Target Unit:</strong> The value in meters is then converted to the desired final unit by dividing by the target unit's conversion factor. <br /><span className="font-mono text-xs">Final Value = Value in Meters / Target Unit's Conversion Factor</span></li>
                  </ol>
                  <p className="mt-2">This method prevents the need to maintain a massive table of direct conversions between every possible pair of units.</p>
              </div>
            </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Landmark className="h-5 w-5" />Related Converters</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 text-sm text-primary">
                <li><Link href="/category/conversions/cups-to-milliliters-converter" className="hover:underline">Cups To Milliliters Converter</Link></li>
                <li><Link href="/category/conversions/days-to-minutes-converter" className="hover:underline">Days To Minutes Converter</Link></li>
                <li><Link href="/category/conversions/milliliters-to-teaspoons-converter" className="hover:underline">Milliliters To Teaspoons Converter</Link></li>
                <li><Link href="/category/conversions/flow-rate-converter" className="hover:underline">Flow Rate Converter</Link></li>
                <li><Link href="/category/conversions/kilowatts-to-btu-per-hour-converter" className="hover:underline">Kilowatts To Btu Per Hour Converter</Link></li>
            </ul>
          </CardContent>
        </Card>
        
        <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg">
            <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">A Guide to Units of Length and Distance</h1>
            <p className="text-lg italic">From the microscopic to the astronomic, humanity has developed a vast array of units to measure distance. Understanding their origins and relationships is key to navigating science, industry, and everyday life.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">The Metric System (SI)</h2>
            <p>The International System of Units (SI) is the modern form of the metric system and is the most widely used system of measurement in the world. Its beauty lies in its base-10 structure, making conversions simple.</p>
            <div className="overflow-x-auto mt-4">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-muted">
                            <th className="p-4 border">Unit</th>
                            <th className="p-4 border">Abbreviation</th>
                            <th className="p-4 border">Relation to Meter</th>
                            <th className="p-4 border">Primary Use Case</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr><td className="p-4 border font-semibold">Nanometer</td><td className="p-4 border">nm</td><td className="p-4 border">1 billionth of a meter (10<sup>-9</sup> m)</td><td className="p-4 border">Nanotechnology, semiconductor manufacturing, microscopy.</td></tr>
                        <tr><td className="p-4 border font-semibold">Micron (Micrometer)</td><td className="p-4 border">μm</td><td className="p-4 border">1 millionth of a meter (10<sup>-6</sup> m)</td><td className="p-4 border">Biology (measuring cells), and industrial manufacturing for precision tolerances.</td></tr>
                        <tr><td className="p-4 border font-semibold">Millimeter</td><td className="p-4 border">mm</td><td className="p-4 border">1 thousandth of a meter (0.001 m)</td><td className="p-4 border">Small-scale engineering, crafts, and everyday small measurements.</td></tr>
                        <tr><td className="p-4 border font-semibold">Centimeter</td><td className="p-4 border">cm</td><td className="p-4 border">1 hundredth of a meter (0.01 m)</td><td className="p-4 border">Everyday measurements, body height, clothing sizes.</td></tr>
                        <tr><td className="p-4 border font-semibold">Meter</td><td className="p-4 border">m</td><td className="p-4 border">Base Unit</td><td className="p-4 border">Standard unit for room dimensions, track and field events, and general distance.</td></tr>
                        <tr><td className="p-4 border font-semibold">Kilometer</td><td className="p-4 border">km</td><td className="p-4 border">1,000 meters</td><td className="p-4 border">Measuring distances between cities and countries.</td></tr>
                    </tbody>
                </table>
            </div>

            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">The Imperial and U.S. Customary Systems</h2>
            <p>These systems originated in Britain and are still used officially in the United States and for specific purposes in other countries like the UK and Canada. Conversions are less straightforward than the metric system.</p>
            <div className="overflow-x-auto mt-4">
                 <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-muted">
                            <th className="p-4 border">Unit</th>
                            <th className="p-4 border">Abbreviation</th>
                            <th className="p-4 border">Relation to Others</th>
                            <th className="p-4 border">Primary Use Case</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr><td className="p-4 border font-semibold">Inch</td><td className="p-4 border">in</td><td className="p-4 border">1/12 of a foot</td><td className="p-4 border">Construction, engineering, screen sizes, and small measurements in the U.S.</td></tr>
                        <tr><td className="p-4 border font-semibold">Foot</td><td className="p-4 border">ft</td><td className="p-4 border">12 inches</td><td className="p-4 border">Human height, room dimensions, building heights, and short distances.</td></tr>
                        <tr><td className="p-4 border font-semibold">Yard</td><td className="p-4 border">yd</td><td className="p-4 border">3 feet</td><td className="p-4 border">Field sports (American football, soccer), fabric measurements.</td></tr>
                        <tr><td className="p-4 border font-semibold">Mile</td><td className="p-4 border">mi</td><td className="p-4 border">1,760 yards or 5,280 feet</td><td className="p-4 border">Road distances and travel in the U.S. and UK.</td></tr>
                    </tbody>
                </table>
            </div>
            
            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Specialized Units</h2>
            <div className="overflow-x-auto mt-4">
                 <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-muted">
                            <th className="p-4 border">Unit</th>
                            <th className="p-4 border">Abbreviation</th>
                            <th className="p-4 border">Definition</th>
                            <th className="p-4 border">Primary Use Case</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr><td className="p-4 border font-semibold">Nautical Mile</td><td className="p-4 border">nmi</td><td className="p-4 border">Exactly 1,852 meters. Based on one minute of arc of a great circle of the Earth.</td><td className="p-4 border">Used in maritime and aviation navigation for charting and speed (knots).</td></tr>
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
                        <tr><td className="p-4 border">1 Inch</td><td className="p-4 border">Centimeters</td><td className="p-4 border">2.54 cm</td></tr>
                        <tr><td className="p-4 border">1 Foot</td><td className="p-4 border">Centimeters</td><td className="p-4 border">30.48 cm</td></tr>
                        <tr><td className="p-4 border">1 Yard</td><td className="p-4 border">Meters</td><td className="p-4 border">0.9144 m</td></tr>
                        <tr><td className="p-4 border">1 Meter</td><td className="p-4 border">Inches</td><td className="p-4 border">~39.37 in</td></tr>
                        <tr><td className="p-4 border">1 Meter</td><td className="p-4 border">Feet</td><td className="p-4 border">~3.281 ft</td></tr>
                        <tr><td className="p-4 border">1 Kilometer</td><td className="p-4 border">Miles</td><td className="p-4 border">~0.621 mi</td></tr>
                        <tr><td className="p-4 border">1 Mile</td><td className="p-4 border">Kilometers</td><td className="p-4 border">~1.609 km</td></tr>
                        <tr><td className="p-4 border">1 Nautical Mile</td><td className="p-4 border">Kilometers</td><td className="p-4 border">1.852 km</td></tr>
                    </tbody>
                </table>
            </div>
        </section>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" />Frequently Asked Questions</CardTitle></CardHeader>
          <CardContent className="space-y-4">
             <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">What is the difference between a mile and a nautical mile?</h4>
                <p className="text-muted-foreground">A standard (statute) mile is 5,280 feet (about 1,609 meters). A nautical mile is slightly longer, at 1,852 meters (about 6,076 feet). The nautical mile is used for sea and air travel because it corresponds directly to the geographic coordinate system.</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">Why does the U.S. still use the imperial system?</h4>
                <p className="text-muted-foreground">The continued use of the U.S. customary system is due to historical reasons, cultural inertia, and the high cost of transitioning a large, industrialized nation to the metric system. While the metric system is standard in science, medicine, and the military, customary units remain prevalent in daily life and many industries.</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">What is the base unit for length in the SI system?</h4>
                <p className="text-muted-foreground">The base unit for length is the meter (m). All other metric units of length, like the kilometer or millimeter, are derived from the meter using prefixes that denote powers of ten.</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">How was the meter originally defined?</h4>
                <p className="text-muted-foreground">The meter was originally defined in the 18th century as one ten-millionth of the distance from the Earth's equator to the North Pole. Today, it is defined more precisely using the speed of light: the distance light travels in a vacuum in 1/299,792,458 of a second.</p>
              </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" />Summary</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>This Length and Distance Converter is a versatile tool for seamless conversion between a wide range of metric and imperial units. It provides instant and accurate results, making it essential for students, engineers, scientists, and anyone needing to work with different systems of measurement. The clear presentation and comprehensive guide make it both a practical utility and an educational resource.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
