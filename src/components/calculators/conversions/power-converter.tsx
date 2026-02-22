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
import { Zap, Info, Shield, TrendingUp, Landmark, ArrowRightLeft } from 'lucide-react';
import Link from 'next/link';
import { convertPower, POWER_UNITS } from '@/lib/converters';

const formSchema = z.object({
  value: z.number().optional(),
  fromUnit: z.string().min(1),
  toUnit: z.string().min(1),
});

type FormValues = z.infer<typeof formSchema>;

export default function PowerConverter() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      value: undefined,
      fromUnit: 'kilowatt',
      toUnit: 'horsepower-mechanical',
    },
  });

  const { watch, setValue } = form;
  const watchedValues = watch();

  useEffect(() => {
    if (watchedValues.value !== undefined && watchedValues.fromUnit && watchedValues.toUnit) {
      const conversionResult = convertPower(watchedValues.value, watchedValues.fromUnit, watchedValues.toUnit);
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
            <Zap className="h-5 w-5" />
            Power Converter
          </CardTitle>
          <CardDescription>
            Convert between watts, horsepower, and other units of power.
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
                          {POWER_UNITS.map(u => <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>)}
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
                          {POWER_UNITS.map(u => <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>)}
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
                {watchedValues.value} {POWER_UNITS.find(u => u.value === watchedValues.fromUnit)?.label.split(' ')[0]} = {result.toPrecision(6)} {POWER_UNITS.find(u => u.value === watchedValues.toUnit)?.label.split(' ')[0]}
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
            <p>Power is the rate at which energy is transferred or converted. This tool helps you convert between different units of power, from the watts used in electrical appliances to the horsepower of a car engine.</p>
            <p>All conversions use the watt (W), the SI unit of power, as a base reference to ensure accuracy.</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" />Formula Used</CardTitle></CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <div>
              <h4 className="font-semibold text-foreground mb-2">Standardized Conversion Process</h4>
              <p>To ensure accuracy, all conversions use the watt (W) as a common base unit.</p>
              <ol className="list-decimal pl-5 mt-2 space-y-2">
                  <li><strong className="text-foreground">Convert to Watts:</strong> The input value is converted to watts by multiplying it by its conversion factor. <br /><span className="font-mono text-xs">Value in Watts = Input Value × Conversion Factor to Watts</span></li>
                  <li><strong className="text-foreground">Convert to Target Unit:</strong> The watt value is then converted to the desired final unit by dividing it by the target unit's conversion factor. <br /><span className="font-mono text-xs">Final Value = Value in Watts / Target Unit's Conversion Factor</span></li>
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
                <li><Link href="/cubic-inches-to-milliliters-converter" className="hover:underline">Cubic Inches To Milliliters Converter</Link></li>
                <li><Link href="/kilometers-to-miles-converter" className="hover:underline">Kilometers To Miles Converter</Link></li>
                <li><Link href="/watts-to-horsepower-converter" className="hover:underline">Watts To Horsepower Converter</Link></li>
                <li><Link href="/stones-to-pounds-converter" className="hover:underline">Stones To Pounds Converter</Link></li>
                <li><Link href="/pounds-to-stones-converter" className="hover:underline">Pounds To Stones Converter</Link></li>
            </ul>
          </CardContent>
        </Card>
        
        <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg">
            <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">A Guide to Units of Power</h1>
            <p className="text-lg italic">Power quantifies the rate of energy transfer. Different units are used in various fields like physics, engineering, and everyday life.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Common Power Units</h2>
            <div className="overflow-x-auto mt-4">
                <table className="w-full text-left border-collapse">
                    <thead><tr className="bg-muted"><th className="p-4 border">Unit</th><th className="p-4 border">Abbreviation</th><th className="p-4 border">Definition & Context</th></tr></thead>
                    <tbody>
                        <tr><td className="p-4 border font-semibold">Watt</td><td className="p-4 border">W</td><td className="p-4 border">The SI unit of power, equal to one joule per second. Used for electrical power, light bulbs, etc.</td></tr>
                        <tr><td className="p-4 border font-semibold">Kilowatt</td><td className="p-4 border">kW</td><td className="p-4 border">1,000 watts. Used for household appliances, electric motors, and small engines.</td></tr>
                        <tr><td className="p-4 border font-semibold">Megawatt</td><td className="p-4 border">MW</td><td className="p-4 border">1 million watts. Used to measure the output of power plants.</td></tr>
                        <tr><td className="p-4 border font-semibold">Horsepower (Mechanical)</td><td className="p-4 border">hp</td><td className="p-4 border">~745.7 watts. The traditional unit for the output of engines and motors, particularly in the US.</td></tr>
                        <tr><td className="p-4 border font-semibold">Horsepower (Metric)</td><td className="p-4 border">PS, cv</td><td className="p-4 border">~735.5 watts. A similar unit to mechanical horsepower, but slightly smaller. Often used in Europe and Asia for engine power.</td></tr>
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
                        <tr><td className="p-4 border">1 Kilowatt (kW)</td><td className="p-4 border">Watts</td><td className="p-4 border">1,000 W</td></tr>
                        <tr><td className="p-4 border">1 Horsepower (mechanical)</td><td className="p-4 border">Watts</td><td className="p-4 border">~745.7 W</td></tr>
                        <tr><td className="p-4 border">1 Kilowatt (kW)</td><td className="p-4 border">Horsepower (mechanical)</td><td className="p-4 border">~1.341 hp</td></tr>
                        <tr><td className="p-4 border">1 Horsepower (metric)</td><td className="p-4 border">Watts</td><td className="p-4 border">~735.5 W</td></tr>
                    </tbody>
                </table>
            </div>
        </section>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" />Frequently Asked Questions</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">What is the difference between mechanical and metric horsepower?</h4>
                <p className="text-muted-foreground">They are two different definitions for horsepower. Mechanical horsepower is based on the work done by a horse as estimated by James Watt and is slightly larger (~745.7W). Metric horsepower (often abbreviated as PS) is defined as 75 kilogram-meters per second and is slightly smaller (~735.5W). Mechanical horsepower is more common in the US and UK.</p>
            </div>
            <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">Is power the same as energy?</h4>
                <p className="text-muted-foreground">No. Power is the rate at which energy is used. Energy is the total amount of work done. For example, a 100-watt light bulb uses 100 joules of energy every second. If you leave it on for an hour, it consumes 100 watt-hours of energy.</p>
            </div>
            <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">What does 'kilowatt' mean?</h4>
                <p className="text-muted-foreground">A kilowatt (kW) is simply 1,000 watts. The prefix "kilo-" is a standard metric prefix denoting a factor of one thousand. It's a more convenient unit for measuring the power of larger items like car engines or home appliances.</p>
            </div>
            <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">How was horsepower originally defined?</h4>
                <p className="text-muted-foreground">James Watt, an 18th-century inventor, determined that a draft horse could lift 550 pounds at a rate of one foot per second. This rate of work became the definition of one horsepower (hp). It was a marketing tool to compare his steam engines to the horses they were replacing.</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" />Summary</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">The Power Converter is an essential tool for engineers, electricians, auto enthusiasts, and anyone needing to convert between different units of power. It simplifies the relationship between electrical, mechanical, and metric power measurements.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
