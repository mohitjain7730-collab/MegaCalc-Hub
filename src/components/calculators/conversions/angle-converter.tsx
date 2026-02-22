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
import { Triangle, Info, Shield, TrendingUp, Landmark, ArrowRightLeft } from 'lucide-react';
import Link from 'next/link';
import { convertAngle, ANGLE_UNITS } from '@/lib/converters';

const formSchema = z.object({
  value: z.number().optional(),
  fromUnit: z.string().min(1),
  toUnit: z.string().min(1),
});

type FormValues = z.infer<typeof formSchema>;

export default function AngleConverter() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      value: undefined,
      fromUnit: 'degree',
      toUnit: 'radian',
    },
  });

  const { watch, setValue } = form;
  const watchedValues = watch();

  useEffect(() => {
    if (watchedValues.value !== undefined && watchedValues.fromUnit && watchedValues.toUnit) {
      const conversionResult = convertAngle(watchedValues.value, watchedValues.fromUnit, watchedValues.toUnit);
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
            <Triangle className="h-5 w-5" />
            Angle Converter
          </CardTitle>
          <CardDescription>
            Convert between degrees, radians, and other units of angle.
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
                        <Input type="number" placeholder="e.g., 180" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
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
                          {ANGLE_UNITS.map(u => <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>)}
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
                          {ANGLE_UNITS.map(u => <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>)}
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
                {watchedValues.value} {ANGLE_UNITS.find(u => u.value === watchedValues.fromUnit)?.label.split(' ')[0]} = {result.toPrecision(6)} {ANGLE_UNITS.find(u => u.value === watchedValues.toUnit)?.label.split(' ')[0]}
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
            <p>An angle is the figure formed by two rays sharing a common endpoint. This tool helps convert between different units used to measure angles, essential in geometry, trigonometry, navigation, and engineering.</p>
            <p>All conversions use radians as a base reference to ensure mathematical accuracy.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" />Formula Used</CardTitle></CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <div>
              <h4 className="font-semibold text-foreground mb-2">Standardized Conversion Process</h4>
              <p>To ensure accuracy, all conversions use the radian (rad) as a common base unit.</p>
              <ol className="list-decimal pl-5 mt-2 space-y-2">
                <li><strong className="text-foreground">Convert to Radians:</strong> The input value is converted to radians by multiplying it by its conversion factor.</li>
                <li><strong className="text-foreground">Convert to Target Unit:</strong> The radian value is then converted to the desired final unit by dividing it by the target unit&apos;s conversion factor.</li>
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
              <li><Link href="/belt-size-converter" className="hover:underline">Belt Size Converter</Link></li>
              <li><Link href="/joules-to-watt-hours-converter" className="hover:underline">Joules To Watt Hours Converter</Link></li>
              <li><Link href="/fuel-economy-converter" className="hover:underline">Fuel Economy Converter</Link></li>
              <li><Link href="/kilograms-to-stones-converter" className="hover:underline">Kilograms To Stones Converter</Link></li>
              <li><Link href="/days-to-hours-converter" className="hover:underline">Days To Hours Converter</Link></li>
            </ul>
          </CardContent>
        </Card>

        <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg">
          <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">A Guide to Units of Angle</h1>
          <p className="text-lg italic">Angles are a fundamental concept in mathematics and the physical world, describing the amount of rotation between two lines.</p>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Common Angle Units</h2>
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left border-collapse">
              <thead><tr className="bg-muted"><th className="p-4 border">Unit</th><th className="p-4 border">Definition & Context</th></tr></thead>
              <tbody>
                <tr><td className="p-4 border font-semibold">Degree (°)</td><td className="p-4 border">A full circle is divided into 360 degrees. This is the most common unit in everyday life and introductory geometry.</td></tr>
                <tr><td className="p-4 border font-semibold">Radian (rad)</td><td className="p-4 border">The standard unit of angular measure in mathematics. One radian is the angle subtended at the center of a circle by an arc that is equal in length to the radius. A full circle is 2π radians.</td></tr>
                <tr><td className="p-4 border font-semibold">Gradian (grad)</td><td className="p-4 border">A unit where a right angle is divided into 100 gradians, making a full circle 400 gradians. Used in some surveying and civil engineering contexts.</td></tr>
                <tr><td className="p-4 border font-semibold">Arcminute (′)</td><td className="p-4 border">1/60th of a degree. Used in astronomy and navigation for very small angles.</td></tr>
                <tr><td className="p-4 border font-semibold">Arcsecond (″)</td><td className="p-4 border">1/60th of an arcminute or 1/3600th of a degree. Used for extremely precise astronomical measurements.</td></tr>
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
                <tr><td className="p-4 border">360 Degrees</td><td className="p-4 border">Radians</td><td className="p-4 border">2π rad (~6.283 rad)</td></tr>
                <tr><td className="p-4 border">180 Degrees</td><td className="p-4 border">Radians</td><td className="p-4 border">π rad (~3.14159 rad)</td></tr>
                <tr><td className="p-4 border">1 Radian</td><td className="p-4 border">Degrees</td><td className="p-4 border">~57.3°</td></tr>
                <tr><td className="p-4 border">1 Degree</td><td className="p-4 border">Arcminutes</td><td className="p-4 border">60′</td></tr>
                <tr><td className="p-4 border">1 Degree</td><td className="p-4 border">Arcseconds</td><td className="p-4 border">3600″</td></tr>
                <tr><td className="p-4 border">Right Angle</td><td className="p-4 border">Degrees</td><td className="p-4 border">90°</td></tr>
                <tr><td className="p-4 border">Right Angle</td><td className="p-4 border">Radians</td><td className="p-4 border">π/2 rad</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" />Frequently Asked Questions</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Why use radians instead of degrees?</h4>
              <p className="text-muted-foreground">Radians are the natural unit for measuring angles in mathematics. They simplify many formulas in calculus and physics, such as those for derivatives of trigonometric functions and arc length. The 360 degrees in a circle is an arbitrary number inherited from ancient Babylonians.</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">What is a gradian?</h4>
              <p className="text-muted-foreground">The gradian is a unit of angle where a right angle is 100 grads and a full circle is 400 grads. It was introduced as part of the metric system&apos;s decimal-based approach but has not been widely adopted, though it is still used in some fields like surveying.</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">How small is an arcsecond?</h4>
              <p className="text-muted-foreground">An arcsecond is extremely small. It&apos;s 1/3600th of a degree. It&apos;s equivalent to the angle subtended by a US dime from a distance of about 2.5 miles (4 km).</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">What does &apos;subtend&apos; mean?</h4>
              <p className="text-muted-foreground">In geometry, an angle subtends an arc or line segment if the angle&apos;s two rays pass through the endpoints of the arc or segment. It&apos;s the angle &apos;created&apos; by looking at an object from a certain point.</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" />Summary</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">The Angle Converter is a fundamental tool for students, mathematicians, engineers, and astronomers. It provides quick and accurate conversions between the various units used to measure angles.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
