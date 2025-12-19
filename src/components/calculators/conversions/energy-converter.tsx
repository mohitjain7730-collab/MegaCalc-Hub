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
import { Flame, Info, Shield, TrendingUp, Landmark, ArrowRightLeft } from 'lucide-react';
import Link from 'next/link';
import { convertEnergy, ENERGY_UNITS } from '@/lib/converters';

const formSchema = z.object({
  value: z.number().optional(),
  fromUnit: z.string().min(1),
  toUnit: z.string().min(1),
});

type FormValues = z.infer<typeof formSchema>;

export default function EnergyConverter() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      value: undefined,
      fromUnit: 'joule',
      toUnit: 'calorie',
    },
  });

  const { watch, setValue } = form;
  const watchedValues = watch();

  useEffect(() => {
    if (watchedValues.value !== undefined && watchedValues.fromUnit && watchedValues.toUnit) {
      const conversionResult = convertEnergy(watchedValues.value, watchedValues.fromUnit, watchedValues.toUnit);
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
            <Flame className="h-5 w-5" />
            Energy Converter
          </CardTitle>
          <CardDescription>
            Convert between Joules, Calories, kWh, and other units of energy.
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
                          {ENERGY_UNITS.map(u => <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>)}
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
                          {ENERGY_UNITS.map(u => <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>)}
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
                {watchedValues.value} {ENERGY_UNITS.find(u => u.value === watchedValues.fromUnit)?.label.split(' ')[0]} = {result.toPrecision(6)} {ENERGY_UNITS.find(u => u.value === watchedValues.toUnit)?.label.split(' ')[0]}
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
            <p>Energy, the capacity to do work, is measured in various units depending on the context. This converter simplifies the translation between units used in physics, nutrition, and everyday life, such as electricity consumption.</p>
            <p>The standard scientific unit of energy is the Joule. All conversions in this tool use the Joule as a base reference to ensure accuracy across different scales, from the energy in food to the output of a power plant.</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" />Formula Used</CardTitle></CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <div>
              <h4 className="font-semibold text-foreground mb-2">Standardized Conversion Process</h4>
              <p>To ensure accuracy, all conversions use the Joule (J) as a common base unit.</p>
              <ol className="list-decimal pl-5 mt-2 space-y-2">
                  <li><strong className="text-foreground">Convert to Joules:</strong> The input value is first converted to Joules by multiplying it by its specific conversion factor. <br /><span className="font-mono text-xs">Value in Joules = Input Value × Conversion Factor to Joules</span></li>
                  <li><strong className="text-foreground">Convert to Target Unit:</strong> The value in Joules is then converted to the desired final unit by dividing it by the target unit's conversion factor. <br /><span className="font-mono text-xs">Final Value = Value in Joules / Target Unit's Conversion Factor</span></li>
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
                <li><Link href="/category/conversions/kilometers-per-hour-to-miles-per-hour-converter" className="hover:underline">Kilometers Per Hour To Miles Per Hour Converter</Link></li>
                <li><Link href="/category/conversions/watts-to-foot-pounds-per-second-converter" className="hover:underline">Watts To Foot Pounds Per Second Converter</Link></li>
                <li><Link href="/category/conversions/joules-to-foot-pounds-converter" className="hover:underline">Joules To Foot Pounds Converter</Link></li>
                <li><Link href="/category/conversions/angle-converter" className="hover:underline">Angle Converter</Link></li>
                <li><Link href="/category/conversions/pressure-converter" className="hover:underline">Pressure Converter</Link></li>
            </ul>
          </CardContent>
        </Card>
        
        <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg">
            <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">A Guide to Units of Energy</h1>
            <p className="text-lg italic">From the food we eat to the electricity that powers our homes, energy is everywhere. Different fields of science and industry have developed specific units to measure it.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Common Energy Units</h2>
            <div className="overflow-x-auto mt-4">
                <table className="w-full text-left border-collapse">
                    <thead><tr className="bg-muted"><th className="p-4 border">Unit</th><th className="p-4 border">Abbreviation</th><th className="p-4 border">Definition & Context</th></tr></thead>
                    <tbody>
                        <tr><td className="p-4 border font-semibold">Joule</td><td className="p-4 border">J</td><td className="p-4 border">The SI (International System) unit of energy. One joule is the work done when a force of one newton is applied over one meter. It is the fundamental unit for scientific work.</td></tr>
                        <tr><td className="p-4 border font-semibold">Kilojoule</td><td className="p-4 border">kJ</td><td className="p-4 border">1,000 Joules. Often used on nutritional labels in many countries.</td></tr>
                        <tr><td className="p-4 border font-semibold">Calorie (thermochemical)</td><td className="p-4 border">cal</td><td className="p-4 border">The energy needed to raise the temperature of 1 gram of water by 1°C. Used in chemistry and physics. 1 cal ≈ 4.184 J.</td></tr>
                        <tr><td className="p-4 border font-semibold">Kilocalorie (Food Calorie)</td><td className="p-4 border">kcal or Cal</td><td className="p_4 border">1,000 calories. This is the "Calorie" commonly seen on food nutrition labels in the U.S. and other regions. 1 Cal = 1 kcal.</td></tr>
                        <tr><td className="p-4 border font-semibold">Kilowatt-hour</td><td className="p-4 border">kWh</td><td className="p-4 border">The energy consumed by a 1,000-watt (1kW) device running for one hour. This is the standard unit for residential and commercial electricity bills. 1 kWh = 3.6 million Joules.</td></tr>
                        <tr><td className="p-4 border font-semibold">British Thermal Unit</td><td className="p-4 border">BTU</td><td className="p-4 border">The energy needed to raise the temperature of one pound of water by 1°F. Used in heating, ventilation, and air conditioning (HVAC) industries. 1 BTU ≈ 1,055 Joules.</td></tr>
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
                        <tr><td className="p-4 border">1 Calorie (kcal)</td><td className="p-4 border">Joules</td><td className="p-4 border">~4,184 J</td></tr>
                        <tr><td className="p-4 border">1 Kilowatt-hour (kWh)</td><td className="p-4 border">Joules</td><td className="p-4 border">3,600,000 J</td></tr>
                        <tr><td className="p-4 border">1 British Thermal Unit (BTU)</td><td className="p-4 border">Joules</td><td className="p-4 border">~1,055 J</td></tr>
                        <tr><td className="p-4 border">1 Kilowatt-hour (kWh)</td><td className="p-4 border">Calories (kcal)</td><td className="p-4 border">~860 kcal</td></tr>
                        <tr><td className="p-4 border">1 Kilowatt-hour (kWh)</td><td className="p-4 border">BTU</td><td className="p-4 border">~3,412 BTU</td></tr>
                        <tr><td className="p-4 border">1 Gallon of Gasoline</td><td className="p-4 border">kWh</td><td className="p-4 border">~33.7 kWh</td></tr>
                        <tr><td className="p-4 border">1 Barrel of Oil</td><td className="p-4 border">kWh</td><td className="p-4 border">~1,700 kWh</td></tr>
                    </tbody>
                </table>
            </div>
        </section>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" />Frequently Asked Questions</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">What is the difference between a "calorie" and a "Calorie"?</h4>
                <p className="text-muted-foreground">This is a common point of confusion. A "small calorie" (cal) is a scientific unit. The "large Calorie" (Cal, with a capital C), also known as a kilocalorie (kcal), is used for food energy. 1 Calorie (food) = 1,000 calories (scientific) = 1 kcal.</p>
            </div>
            <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">Is energy the same as power?</h4>
                <p className="text-muted-foreground">No. Energy is the capacity to do work, while power is the rate at which energy is used or transferred. For example, a light bulb has a power rating in Watts (Joules per second), and the total energy it uses over time is measured in kilowatt-hours (kWh).</p>
            </div>
            <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">What is a BTU?</h4>
                <p className="text-muted-foreground">A British Thermal Unit (BTU) is a unit of heat energy. It is defined as the amount of heat required to raise the temperature of one pound of water by one degree Fahrenheit. It's commonly used in the US for air conditioners and heating systems.</p>
            </div>
            <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">How are kilowatt-hours (kWh) used?</h4>
                <p className="text-muted-foreground">The kilowatt-hour is the standard unit of energy used on electricity bills. It represents the total energy consumed by an appliance over a period. For example, a 1,000-watt appliance running for one hour consumes 1 kWh of energy.</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" />Summary</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">The Energy Converter is a versatile tool for translating between the various units used to measure energy. It's essential for students, engineers, nutritionists, and anyone needing to compare energy values across different domains like physics, food science, and electricity.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
