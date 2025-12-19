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
import { Waves, Info, Shield, TrendingUp, Landmark, ArrowRightLeft } from 'lucide-react';
import Link from 'next/link';
import { convertFlowRate, FLOW_RATE_UNITS } from '@/lib/converters';

const formSchema = z.object({
  value: z.number().optional(),
  fromUnit: z.string().min(1),
  toUnit: z.string().min(1),
});

type FormValues = z.infer<typeof formSchema>;

export default function FlowRateConverter() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      value: undefined,
      fromUnit: 'liter-per-second',
      toUnit: 'us-gallon-per-minute',
    },
  });

  const { watch, setValue } = form;
  const watchedValues = watch();

  useEffect(() => {
    if (watchedValues.value !== undefined && watchedValues.fromUnit && watchedValues.toUnit) {
      const conversionResult = convertFlowRate(watchedValues.value, watchedValues.fromUnit, watchedValues.toUnit);
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
            <Waves className="h-5 w-5" />
            Flow Rate Converter
          </CardTitle>
          <CardDescription>
            Convert between different units of fluid flow rate like L/s and GPM.
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
                          {FLOW_RATE_UNITS.map(u => <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>)}
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
                          {FLOW_RATE_UNITS.map(u => <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>)}
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
                {watchedValues.value} {FLOW_RATE_UNITS.find(u => u.value === watchedValues.fromUnit)?.label.split(' ')[0]} = {result.toPrecision(6)} {FLOW_RATE_UNITS.find(u => u.value === watchedValues.toUnit)?.label.split(' ')[0]}
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
            <p>Flow rate measures the volume of fluid that passes through a surface per unit time. This tool is crucial for engineers, plumbers, and scientists working with fluid dynamics.</p>
            <p>All conversions use cubic meters per second (m³/s), the SI unit, as a base reference to ensure accuracy.</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" />Formula Used</CardTitle></CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <div>
              <h4 className="font-semibold text-foreground mb-2">Standardized Conversion Process</h4>
              <p>To ensure accuracy, all conversions use the cubic meter per second (m³/s) as a common base unit.</p>
              <ol className="list-decimal pl-5 mt-2 space-y-2">
                  <li><strong className="text-foreground">Convert to m³/s:</strong> The input value is converted to m³/s by multiplying it by its conversion factor.</li>
                  <li><strong className="text-foreground">Convert to Target Unit:</strong> The m³/s value is then converted to the desired final unit by dividing it by the target unit's conversion factor.</li>
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
                <li><Link href="/category/conversions/parsecs-to-light-years-converter" className="hover:underline">Parsecs To Light Years Converter</Link></li>
                <li><Link href="/category/conversions/inches-to-millimeters-converter" className="hover:underline">Inches To Millimeters Converter</Link></li>
                <li><Link href="/category/conversions/force-converter" className="hover:underline">Force Converter</Link></li>
                <li><Link href="/category/conversions/cubic-feet-to-gallons-converter" className="hover:underline">Cubic Feet To Gallons Converter</Link></li>
                <li><Link href="/category/conversions/fuel-economy-converter" className="hover:underline">Fuel Economy Converter</Link></li>
            </ul>
          </CardContent>
        </Card>
        
        <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg">
            <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">A Guide to Units of Flow Rate</h1>
            <p className="text-lg italic">Understanding flow rate is essential for designing water systems, industrial processes, and HVAC systems.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Common Flow Rate Units</h2>
            <div className="overflow-x-auto mt-4">
                <table className="w-full text-left border-collapse">
                    <thead><tr className="bg-muted"><th className="p-4 border">Unit</th><th className="p-4 border">Abbreviation</th><th className="p-4 border">Definition & Context</th></tr></thead>
                    <tbody>
                        <tr><td className="p-4 border font-semibold">Cubic Meter per Second</td><td className="p-4 border">m³/s</td><td className="p-4 border">The SI derived unit. Used for large-scale flows like rivers.</td></tr>
                        <tr><td className="p-4 border font-semibold">Liter per Second</td><td className="p-4 border">L/s</td><td className="p-4 border">A common metric unit for smaller-scale flows. 1 m³/s = 1000 L/s.</td></tr>
                        <tr><td className="p-4 border font-semibold">US Gallons per Minute</td><td className="p-4 border">GPM</td><td className="p-4 border">Standard unit in the US for pumps, showerheads, and plumbing.</td></tr>
                        <tr><td className="p-4 border font-semibold">Imperial Gallons per Minute</td><td className="p-4 border">GPM</td><td className="p-4 border">Used in the UK and some other countries. An Imperial gallon is ~20% larger than a US gallon.</td></tr>
                         <tr><td className="p-4 border font-semibold">Cubic Feet per Minute</td><td className="p-4 border">CFM</td><td className="p-4 border">Commonly used in the US for airflow in HVAC systems and for gas flow.</td></tr>
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
                        <tr><td className="p-4 border">1 Cubic Meter/Second</td><td className="p-4 border">Liters/Second</td><td className="p-4 border">1,000 L/s</td></tr>
                        <tr><td className="p-4 border">1 US Gallon/Minute</td><td className="p-4 border">Liters/Second</td><td className="p-4 border">~0.063 L/s</td></tr>
                        <tr><td className="p-4 border">1 Liter/Second</td><td className="p-4 border">US Gallons/Minute</td><td className="p-4 border">~15.85 GPM</td></tr>
                    </tbody>
                </table>
            </div>
        </section>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" />Frequently Asked Questions</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">What does GPM mean?</h4>
                <p className="text-muted-foreground">GPM stands for Gallons Per Minute. It's a critical measurement for plumbing and irrigation, indicating how many gallons of water flow past a point in one minute. It's important to specify whether you mean US or Imperial gallons.</p>
            </div>
            <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">What does CFM mean?</h4>
                <p className="text-muted-foreground">CFM stands for Cubic Feet per Minute. It's a measurement of the volume of air or gas that moves in a minute. It's essential for sizing fans, air conditioners, and ventilation systems.</p>
            </div>
            <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">How is flow rate related to velocity?</h4>
                <p className="text-muted-foreground">Flow rate is the volume of fluid passing a point per unit time (e.g., m³/s), while velocity is the speed of the fluid at that point (e.g., m/s). They are related by the equation: Flow Rate = Area × Velocity, where Area is the cross-sectional area of the pipe or channel.</p>
            </div>
            <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">Why are there different gallons?</h4>
                <p className="text-muted-foreground">The US and Imperial systems evolved separately. The US gallon was based on an older English wine gallon, while the Imperial gallon was defined later. The Imperial gallon is about 20% larger than the US gallon.</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" />Summary</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">The Flow Rate Converter is an essential tool for engineers, HVAC technicians, plumbers, and anyone working with fluid systems. It simplifies conversions between metric and imperial units of fluid flow.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
