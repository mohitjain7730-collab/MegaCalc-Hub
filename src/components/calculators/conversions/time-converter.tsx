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
import { Timer, Info, Shield, TrendingUp, Landmark, ArrowRightLeft } from 'lucide-react';
import Link from 'next/link';
import { convertTime, TIME_UNITS } from '@/lib/converters';

const formSchema = z.object({
  value: z.number().optional(),
  fromUnit: z.string().min(1),
  toUnit: z.string().min(1),
});

type FormValues = z.infer<typeof formSchema>;

export default function TimeConverter() {
  const [result, setResult] =useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      value: undefined,
      fromUnit: 'day',
      toUnit: 'hour',
    },
  });

  const { watch, setValue } = form;
  const watchedValues = watch();

  useEffect(() => {
    if (watchedValues.value !== undefined && watchedValues.fromUnit && watchedValues.toUnit) {
      const conversionResult = convertTime(watchedValues.value, watchedValues.fromUnit, watchedValues.toUnit);
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
            <Timer className="h-5 w-5" />
            Time Converter
          </CardTitle>
          <CardDescription>
            Convert between seconds, minutes, hours, days, and other units of time.
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
                        <Input type="number" placeholder="e.g., 24" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
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
                          {TIME_UNITS.map(u => <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>)}
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
                          {TIME_UNITS.map(u => <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>)}
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
                {watchedValues.value} {TIME_UNITS.find(u => u.value === watchedValues.fromUnit)?.label.split(' ')[0]} = {result.toPrecision(6)} {TIME_UNITS.find(u => u.value === watchedValues.toUnit)?.label.split(' ')[0]}
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
            <p>Time is a fundamental dimension of our universe, and we measure its passage using a wide variety of units. This converter allows for easy translation between these units, from fractions of a second to years.</p>
            <p>For consistency and accuracy, all time units are first converted to a base unit of seconds before being converted to the final target unit. Note that units like "month" and "year" use average values (e.g., 30.44 days for a month).</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" />Formula Used</CardTitle></CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <div>
              <h4 className="font-semibold text-foreground mb-2">Standardized Conversion Process</h4>
              <p>To ensure precision, all conversions use the second as a common base unit.</p>
              <ol className="list-decimal pl-5 mt-2 space-y-2">
                  <li><strong className="text-foreground">Convert to Seconds:</strong> The input value is converted to seconds by multiplying it by its conversion factor. <br /><span className="font-mono text-xs">Value in Seconds = Input Value × Conversion Factor to Seconds</span></li>
                  <li><strong className="text-foreground">Convert to Target Unit:</strong> The value in seconds is then converted to the final unit by dividing it by the target unit's conversion factor. <br /><span className="font-mono text-xs">Final Value = Value in Seconds / Target Unit's Conversion Factor</span></li>
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
                <li><Link href="/conversions/square-inches-to-square-centimeters-converter" className="hover:underline">Square Inches To Square Centimeters Converter</Link></li>
                <li><Link href="/conversions/miles-per-hour-to-meters-per-second-converter" className="hover:underline">Miles Per Hour To Meters Per Second Converter</Link></li>
                <li><Link href="/conversions/days-to-seconds-converter" className="hover:underline">Days To Seconds Converter</Link></li>
                <li><Link href="/conversions/seconds-to-hours-converter" className="hover:underline">Seconds To Hours Converter</Link></li>
                <li><Link href="/conversions/joules-to-foot-pounds-converter" className="hover:underline">Joules To Foot Pounds Converter</Link></li>
            </ul>
          </CardContent>
        </Card>
        
        <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg">
            <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">A Guide to Units of Time</h1>
            <p className="text-lg italic">Time is measured from the infinitesimally small to the cosmically large. Our common units are rooted in the Earth's rotation and orbit around the Sun.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Standard Time Units</h2>
            <div className="overflow-x-auto mt-4">
                <table className="w-full text-left border-collapse">
                    <thead><tr className="bg-muted"><th className="p-4 border">Unit</th><th className="p-4 border">Abbreviation</th><th className="p-4 border">Definition</th></tr></thead>
                    <tbody>
                        <tr><td className="p-4 border font-semibold">Nanosecond</td><td className="p-4 border">ns</td><td className="p-4 border">One billionth of a second. Used in computing (e.g., RAM speed) and physics.</td></tr>
                        <tr><td className="p-4 border font-semibold">Microsecond</td><td className="p-4 border">μs</td><td className="p-4 border">One millionth of a second. Used in electronics and high-speed photography.</td></tr>
                        <tr><td className="p-4 border font-semibold">Millisecond</td><td className="p-4 border">ms</td><td className="p-4 border">One thousandth of a second. Common in measuring network latency (ping).</td></tr>
                        <tr><td className="p-4 border font-semibold">Second</td><td className="p-4 border">s</td><td className="p-4 border">The SI base unit for time.</td></tr>
                        <tr><td className="p-4 border font-semibold">Minute</td><td className="p-4 border">min</td><td className="p-4 border">60 seconds.</td></tr>
                        <tr><td className="p-4 border font-semibold">Hour</td><td className="p-4 border">hr</td><td className="p-4 border">60 minutes.</td></tr>
                        <tr><td className="p-4 border font-semibold">Day</td><td className="p-4 border">d</td><td className="p-4 border">24 hours.</td></tr>
                        <tr><td className="p-4 border font-semibold">Week</td><td className="p-4 border">wk</td><td className="p-4 border">7 days.</td></tr>
                        <tr><td className="p-4 border font-semibold">Month</td><td className="p-4 border">mo</td><td className="p-4 border">Average of 30.44 days. Used for general estimations.</td></tr>
                        <tr><td className="p-4 border font-semibold">Year</td><td className="p-4 border">yr</td><td className="p-4 border">Average of 365.24 days to account for leap years.</td></tr>
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
                        <tr><td className="p-4 border">1 Minute</td><td className="p-4 border">Seconds</td><td className="p-4 border">60 s</td></tr>
                        <tr><td className="p-4 border">1 Hour</td><td className="p-4 border">Minutes</td><td className="p-4 border">60 min</td></tr>
                        <tr><td className="p-4 border">1 Hour</td><td className="p-4 border">Seconds</td><td className="p-4 border">3,600 s</td></tr>
                        <tr><td className="p-4 border">1 Day</td><td className="p-4 border">Minutes</td><td className="p-4 border">1,440 min</td></tr>
                        <tr><td className="p-4 border">1 Week</td><td className="p-4 border">Hours</td><td className="p-4 border">168 hr</td></tr>
                        <tr><td className="p-4 border">1 Year</td><td className="p-4 border">Days</td><td className="p-4 border">~365.24 d</td></tr>
                    </tbody>
                </table>
            </div>
        </section>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" />Frequently Asked Questions</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">Why is a month ~30.44 days?</h4>
                <p className="text-muted-foreground">A year has approximately 365.24 days. Dividing this by 12 (the number of months) gives an average month length of about 30.44 days. This average is used for conversions to provide a reasonable estimate.</p>
            </div>
             <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">What is the SI unit for time?</h4>
                <p className="text-muted-foreground">The base unit for time in the International System of Units (SI) is the second (s). It is defined by the electronic transition frequency of a cesium-133 atom.</p>
            </div>
             <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">What is a leap year?</h4>
                <p className="text-muted-foreground">A leap year occurs every 4 years to keep our calendar aligned with the Earth's revolutions around the Sun. An extra day, February 29th, is added. A year is a leap year if it is divisible by 4, except for end-of-century years, which must be divisible by 400.</p>
            </div>
            <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">How is a "second" officially defined?</h4>
                <p className="text-muted-foreground">The second is scientifically defined as the duration of 9,192,631,770 periods of the radiation corresponding to the transition between the two hyperfine levels of the ground state of the caesium-133 atom. This provides an extremely precise and stable standard.</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" />Summary</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">The Time Converter is a fundamental utility for anyone needing to switch between different scales of time measurement. It's useful for project planning, scientific calculations, cooking, and everyday scheduling, providing quick and accurate results for a wide range of units.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
