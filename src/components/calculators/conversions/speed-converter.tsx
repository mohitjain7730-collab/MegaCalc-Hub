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
import { Gauge, Info, Shield, TrendingUp, Landmark, ArrowRightLeft } from 'lucide-react';
import Link from 'next/link';
import { convertSpeed, SPEED_UNITS } from '@/lib/converters';

const formSchema = z.object({
  value: z.number().optional(),
  fromUnit: z.string().min(1),
  toUnit: z.string().min(1),
});

type FormValues = z.infer<typeof formSchema>;

export default function SpeedConverter() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      value: undefined,
      fromUnit: 'kilometers-per-hour',
      toUnit: 'miles-per-hour',
    },
  });

  const { watch, setValue } = form;
  const watchedValues = watch();

  useEffect(() => {
    if (watchedValues.value !== undefined && watchedValues.fromUnit && watchedValues.toUnit) {
      const conversionResult = convertSpeed(watchedValues.value, watchedValues.fromUnit, watchedValues.toUnit);
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
            <Gauge className="h-5 w-5" />
            Speed Converter
          </CardTitle>
          <CardDescription>
            Convert between different units of speed, such as kph, mph, and knots.
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select unit" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {SPEED_UNITS.map(u => <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>)}
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
                          {SPEED_UNITS.map(u => <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>)}
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
                {watchedValues.value} {SPEED_UNITS.find(u => u.value === watchedValues.fromUnit)?.label.split(' ')[0]} = {result.toPrecision(6)} {SPEED_UNITS.find(u => u.value === watchedValues.toUnit)?.label.split(' ')[0]}
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
            <p>Speed is the rate at which an object covers distance. This tool facilitates quick and accurate conversions between various units of speed, including metric, imperial, and specialized maritime/aviation units.</p>
            <p>The converter standardizes all inputs to a base unit of meters per second (m/s), the SI derived unit for speed, before converting to the target unit. This ensures high precision for all calculations.</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" />Formula Used</CardTitle></CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <div>
              <h4 className="font-semibold text-foreground mb-2">Standardized Conversion Process</h4>
              <p>To maintain accuracy, all conversions use meters per second (m/s) as a common base unit.</p>
              <ol className="list-decimal pl-5 mt-2 space-y-2">
                  <li><strong className="text-foreground">Convert to m/s:</strong> The input value is first converted to meters per second by multiplying it by its specific conversion factor. <br /><span className="font-mono text-xs">Value in m/s = Input Value × Conversion Factor to m/s</span></li>
                  <li><strong className="text-foreground">Convert to Target Unit:</strong> The m/s value is then converted to the final unit by dividing it by the target unit's conversion factor. <br /><span className="font-mono text-xs">Final Value = Value in m/s / Target Unit's Conversion Factor</span></li>
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
                <li><Link href="/category/conversions/joules-to-kilojoules-converter" className="hover:underline">Joules To Kilojoules Converter</Link></li>
                <li><Link href="/category/conversions/watts-to-foot-pounds-per-second-converter" className="hover:underline">Watts To Foot Pounds Per Second Converter</Link></li>
                <li><Link href="/category/conversions/seconds-to-minutes-converter" className="hover:underline">Seconds To Minutes Converter</Link></li>
                <li><Link href="/category/conversions/acres-to-hectares-converter" className="hover:underline">Acres To Hectares Converter</Link></li>
                <li><Link href="/category/conversions/calories-to-joules-converter" className="hover:underline">Calories To Joules Converter</Link></li>
            </ul>
          </CardContent>
        </Card>
        
        <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg">
            <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">A Guide to Units of Speed</h1>
            <p className="text-lg italic">Speed measures how quickly an object is moving. Different units are preferred in different contexts, from road travel to aviation and science.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Metric vs. Imperial and Others</h2>
            <div className="overflow-x-auto mt-4">
                <table className="w-full text-left border-collapse">
                    <thead><tr className="bg-muted"><th className="p-4 border">Unit</th><th className="p-4 border">Abbreviation</th><th className="p-4 border">Primary Use Case</th></tr></thead>
                    <tbody>
                        <tr><td className="p-4 border font-semibold">Meters per second</td><td className="p-4 border">m/s</td><td className="p-4 border">The standard SI unit for speed, used universally in scientific contexts.</td></tr>
                        <tr><td className="p-4 border font-semibold">Kilometers per hour</td><td className="p-4 border">kph or km/h</td><td className="p-4 border">Standard for road speeds in most countries worldwide.</td></tr>
                        <tr><td className="p-4 border font-semibold">Miles per hour</td><td className="p-4 border">mph</td><td className="p-4 border">Standard for road speeds in the United States, the United Kingdom, and a few other countries.</td></tr>
                        <tr><td className="p-4 border font-semibold">Feet per second</td><td className="p-4 border">fps or ft/s</td><td className="p-4 border">Used in some engineering and physics applications, especially in the US.</td></tr>
                        <tr><td className="p-4 border font-semibold">Knot</td><td className="p-4 border">kn or kt</td><td className="p-4 border">Defined as one nautical mile per hour. It is the standard unit of speed in aviation, maritime, and meteorological contexts.</td></tr>
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
                        <tr><td className="p-4 border">1 Meter per second (m/s)</td><td className="p-4 border">Kilometers per hour (kph)</td><td className="p-4 border">3.6 kph</td></tr>
                        <tr><td className="p-4 border">60 Miles per hour (mph)</td><td className="p-4 border">Kilometers per hour (kph)</td><td className="p-4 border">~96.56 kph</td></tr>
                        <tr><td className="p-4 border">100 Kilometers per hour (kph)</td><td className="p-4 border">Miles per hour (mph)</td><td className="p-4 border">~62.14 mph</td></tr>
                        <tr><td className="p-4 border">1 Knot (kn)</td><td className="p-4 border">Miles per hour (mph)</td><td className="p-4 border">~1.151 mph</td></tr>
                        <tr><td className="p-4 border">1 Knot (kn)</td><td className="p-4 border">Kilometers per hour (kph)</td><td className="p-4 border">1.852 kph</td></tr>
                        <tr><td className="p-4 border">1 Mile per hour (mph)</td><td className="p-4 border">Feet per second (fps)</td><td className="p-4 border">~1.467 fps</td></tr>
                        <tr><td className="p-4 border">Speed of Sound (in air)</td><td className="p-4 border">Meters per second</td><td className="p-4 border">~343 m/s</td></tr>
                        <tr><td className="p-4 border">Speed of Light (in vacuum)</td><td className="p-4 border">Kilometers per second</td><td className="p-4 border">~299,792 km/s</td></tr>
                    </tbody>
                </table>
            </div>
        </section>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" />Frequently Asked Questions</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">What is a "knot"?</h4>
                <p className="text-muted-foreground">A knot is a unit of speed equal to one nautical mile per hour. A nautical mile is based on the Earth's circumference, making it ideal for navigation, as it directly relates to latitude and longitude. One knot is about 1.151 mph.</p>
            </div>
             <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">Is there a difference between kph and km/h?</h4>
                <p className="text-muted-foreground">No, they are different abbreviations for the same unit: kilometers per hour. While "km/h" is the official SI abbreviation, "kph" is commonly used informally in many countries.</p>
            </div>
             <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">What is the difference between speed and velocity?</h4>
                <p className="text-muted-foreground">In everyday language, they are used interchangeably. In physics, they are different. Speed is a scalar quantity (how fast you are going), while velocity is a vector quantity (how fast you are going and in what direction).</p>
            </div>
            <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">What is Mach number?</h4>
                <p className="text-muted-foreground">Mach number is the ratio of an object's speed to the speed of sound in the surrounding medium. Mach 1 is the speed of sound, Mach 2 is twice the speed of sound, and so on. It's not a unit of speed itself, as the speed of sound changes with temperature and altitude.</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" />Summary</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">The Speed Converter is an indispensable tool for anyone who needs to work with different units of velocity. It is perfect for travelers, pilots, sailors, engineers, and students, providing fast and accurate translations between metric, imperial, and nautical speed units.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
