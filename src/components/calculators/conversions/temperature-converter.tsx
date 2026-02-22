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
import { Thermometer, Info, Shield, TrendingUp, Landmark, ArrowRightLeft } from 'lucide-react';
import Link from 'next/link';
import { convertTemperature, TEMPERATURE_UNITS } from '@/lib/converters';

const formSchema = z.object({
  value: z.number().optional(),
  fromUnit: z.string().min(1),
  toUnit: z.string().min(1),
});

type FormValues = z.infer<typeof formSchema>;

export default function TemperatureConverter() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      value: undefined,
      fromUnit: 'celsius',
      toUnit: 'fahrenheit',
    },
  });

  const { watch, setValue } = form;
  const watchedValues = watch();

  useEffect(() => {
    if (watchedValues.value !== undefined && watchedValues.fromUnit && watchedValues.toUnit) {
      const conversionResult = convertTemperature(watchedValues.value, watchedValues.fromUnit, watchedValues.toUnit);
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
      const newResult = convertTemperature(currentValue, to, from);
      setValue('value', result ?? undefined);
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Thermometer className="h-5 w-5" />
            Temperature Converter
          </CardTitle>
          <CardDescription>
            Convert between Celsius, Fahrenheit, and Kelvin.
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
                        <Input type="number" placeholder="e.g., 32" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
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
                          {TEMPERATURE_UNITS.map(u => <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>)}
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
                          {TEMPERATURE_UNITS.map(u => <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>)}
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
                {result.toPrecision(4)}
              </p>
               <p className="text-center text-sm text-muted-foreground mt-1">
                {watchedValues.value}° {TEMPERATURE_UNITS.find(u => u.value === watchedValues.fromUnit)?.label.split(' ')[0]} = {result.toPrecision(4)}° {TEMPERATURE_UNITS.find(u => u.value === watchedValues.toUnit)?.label.split(' ')[0]}
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
            <p>Temperature is a fundamental physical quantity that expresses hot and cold. It is a proportional measure of the average kinetic energy of the random motions of the constituent particles of matter. This converter simplifies switching between the three most common temperature scales.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" />Formulas Used</CardTitle></CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
             <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead><tr className="bg-muted"><th className="p-4 border">From</th><th className="p-4 border">To</th><th className="p-4 border">Formula</th></tr></thead>
                <tbody>
                  <tr><td className="p-4 border font-semibold">Celsius</td><td className="p-4 border font-semibold">Fahrenheit</td><td className="p-4 border font-mono text-xs">(°C × 9/5) + 32</td></tr>
                  <tr><td className="p-4 border font-semibold">Fahrenheit</td><td className="p-4 border font-semibold">Celsius</td><td className="p-4 border font-mono text-xs">(°F - 32) × 5/9</td></tr>
                  <tr><td className="p-4 border font-semibold">Celsius</td><td className="p-4 border font-semibold">Kelvin</td><td className="p-4 border font-mono text-xs">°C + 273.15</td></tr>
                  <tr><td className="p-4 border font-semibold">Kelvin</td><td className="p-4 border font-semibold">Celsius</td><td className="p-4 border font-mono text-xs">K - 273.15</td></tr>
                  <tr><td className="p-4 border font-semibold">Fahrenheit</td><td className="p-4 border font-semibold">Kelvin</td><td className="p-4 border font-mono text-xs">(°F - 32) × 5/9 + 273.15</td></tr>
                  <tr><td className="p-4 border font-semibold">Kelvin</td><td className="p-4 border font-semibold">Fahrenheit</td><td className="p-4 border font-mono text-xs">(K - 273.15) × 9/5 + 32</td></tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Landmark className="h-5 w-5" />Related Converters</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 text-sm text-primary">
                <li><Link href="/light-years-to-kilometers-converter" className="hover:underline">Light Years To Kilometers Converter</Link></li>
                <li><Link href="/minutes-to-hours-converter" className="hover:underline">Minutes To Hours Converter</Link></li>
                <li><Link href="/joules-to-kilojoules-converter" className="hover:underline">Joules To Kilojoules Converter</Link></li>
                <li><Link href="/calories-to-joules-converter" className="hover:underline">Calories To Joules Converter</Link></li>
                <li><Link href="/psi-to-atmospheres-converter" className="hover:underline">Psi To Atmospheres Converter</Link></li>
            </ul>
          </CardContent>
        </Card>

        <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg">
          <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">A Guide to Temperature Scales</h1>
          <p className="text-lg italic">The three major temperature scales—Celsius, Fahrenheit, and Kelvin—each have unique origins and applications that make them suitable for different contexts.</p>
          
          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Celsius (°C)</h2>
          <p>The Celsius scale is part of the metric system and is the standard for most of the world. It is based on the freezing and boiling points of water, with 0°C being the freezing point and 100°C being the boiling point at one standard atmosphere of pressure. Its intuitive reference points make it ideal for everyday weather, cooking, and scientific work not requiring an absolute scale.</p>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Fahrenheit (°F)</h2>
          <p>Primarily used in the United States and a few other countries, the Fahrenheit scale was developed by Daniel Gabriel Fahrenheit. He set 0°F as the freezing point of a brine solution and initially used human body temperature as an upper reference point. On this scale, water freezes at 32°F and boils at 212°F. While less common globally, its smaller degree increments are sometimes preferred for describing ambient weather temperatures with more perceived precision.</p>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Kelvin (K)</h2>
          <p>The Kelvin scale is the base unit of thermodynamic temperature in the International System of Units (SI). It is an absolute scale, meaning its zero point, 0 K, is absolute zero—the theoretical point at which all thermal motion ceases. Because it lacks negative numbers, Kelvin is the standard for scientific and engineering applications, particularly in fields like thermodynamics, astronomy, and materials science. A change of one Kelvin is equivalent to a change of one degree Celsius.</p>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Common Conversions at a Glance</h2>
          <div className="overflow-x-auto mt-4">
              <table className="w-full text-left border-collapse">
                  <thead>
                      <tr className="bg-muted">
                          <th className="p-4 border">Common Reference</th>
                          <th className="p-4 border">Celsius</th>
                          <th className="p-4 border">Fahrenheit</th>
                      </tr>
                  </thead>
                  <tbody>
                      <tr><td className="p-4 border">Absolute Zero</td><td className="p-4 border">-273.15°C</td><td className="p-4 border">-459.67°F</td></tr>
                      <tr><td className="p-4 border">Water Freezes</td><td className="p-4 border">0°C</td><td className="p-4 border">32°F</td></tr>
                      <tr><td className="p-4 border">Room Temperature</td><td className="p-4 border">20-22°C</td><td className="p-4 border">68-72°F</td></tr>
                      <tr><td className="p-4 border">Human Body Temperature</td><td className="p-4 border">37°C</td><td className="p-4 border">98.6°F</td></tr>
                      <tr><td className="p-4 border">Water Boils</td><td className="p-4 border">100°C</td><td className="p-4 border">212°F</td></tr>
                  </tbody>
              </table>
          </div>
        </section>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" />Frequently Asked Questions</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">What is absolute zero?</h4>
              <p className="text-muted-foreground">Absolute zero is the lowest possible temperature, where nothing could be colder and no heat energy remains in a substance. It is 0 K on the Kelvin scale, -273.15°C on the Celsius scale, and -459.67°F on the Fahrenheit scale. It is the point where particles have minimal vibrational motion.</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Why isn't Kelvin measured in degrees?</h4>
              <p className="text-muted-foreground">Unlike Celsius and Fahrenheit, Kelvin is an absolute scale with a true zero point. It measures thermodynamic temperature directly. For this reason, it is referred to simply as "Kelvin" (K), not "degrees Kelvin." A change of 1 K is the same magnitude as a change of 1°C.</p>
            </div>
             <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Is there a point where Celsius and Fahrenheit are equal?</h4>
              <p className="text-muted-foreground">Yes, the Celsius and Fahrenheit scales meet at -40 degrees. So, -40°C is equal to -40°F. It's the only point where the two scales intersect.</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Which temperature scale is used in science?</h4>
              <p className="text-muted-foreground">For scientific work, the Kelvin (K) scale is the standard because it is an absolute scale. However, Celsius is also widely used in many scientific contexts, especially when absolute temperature is not required, as the degree size is the same as Kelvin.</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" />Summary</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">The Temperature Converter is a simple yet essential utility for accurately converting between Celsius, Fahrenheit, and Kelvin. It is a vital tool for scientists, engineers, travelers, and anyone needing to interpret or communicate temperature data across different systems.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
