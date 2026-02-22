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
import { convertPressure, PRESSURE_UNITS } from '@/lib/converters';

const formSchema = z.object({
  value: z.number().optional(),
  fromUnit: z.string().min(1),
  toUnit: z.string().min(1),
});

type FormValues = z.infer<typeof formSchema>;

export default function PressureConverter() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      value: undefined,
      fromUnit: 'psi',
      toUnit: 'bar',
    },
  });

  const { watch, setValue } = form;
  const watchedValues = watch();

  useEffect(() => {
    if (watchedValues.value !== undefined && watchedValues.fromUnit && watchedValues.toUnit) {
      const conversionResult = convertPressure(watchedValues.value, watchedValues.fromUnit, watchedValues.toUnit);
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
            Pressure Converter
          </CardTitle>
          <CardDescription>
            Convert between pascals, bars, psi, and other pressure units.
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
                        <Input type="number" placeholder="e.g., 14.7" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
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
                          {PRESSURE_UNITS.map(u => <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>)}
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
                          {PRESSURE_UNITS.map(u => <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>)}
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
                {watchedValues.value} {PRESSURE_UNITS.find(u => u.value === watchedValues.fromUnit)?.label.split(' ')[0]} = {result.toPrecision(6)} {PRESSURE_UNITS.find(u => u.value === watchedValues.toUnit)?.label.split(' ')[0]}
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
            <p>Pressure is the force applied perpendicular to the surface of an object per unit area. This tool helps convert between units used in meteorology, engineering, and everyday applications like tire pressure.</p>
            <p>All conversions use the pascal (Pa), the SI unit of pressure, as a base reference to ensure accuracy.</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" />Formula Used</CardTitle></CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <div>
              <h4 className="font-semibold text-foreground mb-2">Standardized Conversion Process</h4>
              <p>To ensure accuracy, all conversions use the pascal (Pa) as a common base unit.</p>
              <ol className="list-decimal pl-5 mt-2 space-y-2">
                  <li><strong className="text-foreground">Convert to Pascals:</strong> The input value is converted to pascals by multiplying it by its conversion factor. <br /><span className="font-mono text-xs">Value in Pascals = Input Value × Conversion Factor to Pascals</span></li>
                  <li><strong className="text-foreground">Convert to Target Unit:</strong> The pascal value is then converted to the desired final unit by dividing it by the target unit's conversion factor. <br /><span className="font-mono text-xs">Final Value = Value in Pascals / Target Unit's Conversion Factor</span></li>
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
                <li><Link href="/kilojoules-to-joules-converter" className="hover:underline">Kilojoules To Joules Converter</Link></li>
                <li><Link href="/meters-per-second-to-knots-converter" className="hover:underline">Meters Per Second To Knots Converter</Link></li>
                <li><Link href="/btu-to-kwh-converter" className="hover:underline">Btu To Kwh Converter</Link></li>
                <li><Link href="/hours-to-minutes-converter" className="hover:underline">Hours To Minutes Converter</Link></li>
                <li><Link href="/chemical-concentration-converter" className="hover:underline">Chemical Concentration Converter</Link></li>
            </ul>
          </CardContent>
        </Card>
        
        <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg">
            <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">A Guide to Units of Pressure</h1>
            <p className="text-lg italic">Pressure is force distributed over an area. The units we use vary widely by industry and region.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Common Pressure Units</h2>
            <div className="overflow-x-auto mt-4">
                <table className="w-full text-left border-collapse">
                    <thead><tr className="bg-muted"><th className="p-4 border">Unit</th><th className="p-4 border">Abbreviation</th><th className="p-4 border">Definition & Context</th></tr></thead>
                    <tbody>
                        <tr><td className="p-4 border font-semibold">Pascal</td><td className="p-4 border">Pa</td><td className="p-4 border">The SI unit of pressure, equal to one newton per square meter. It is a very small unit, so kilopascals (kPa) are often used.</td></tr>
                        <tr><td className="p-4 border font-semibold">Bar</td><td className="p-4 border">bar</td><td className="p-4 border">Exactly 100,000 pascals. Very close to atmospheric pressure, making it a convenient unit in meteorology and for tire pressure in metric countries.</td></tr>
                        <tr><td className="p-4 border font-semibold">Pounds per square inch</td><td className="p-4 border">psi</td><td className="p-4 border">An imperial unit defined as the pressure from one pound-force applied to an area of one square inch. Standard for tire pressure in the US.</td></tr>
                        <tr><td className="p-4 border font-semibold">Standard Atmosphere</td><td className="p-4 border">atm</td><td className="p-4 border">Defined as the average atmospheric pressure at sea level on Earth, equal to 101,325 Pa. Used in chemistry and physics.</td></tr>
                        <tr><td className="p-4 border font-semibold">Torr</td><td className="p-4 border">Torr</td><td className="p-4 border">Defined as 1/760 of a standard atmosphere. Named after Evangelista Torricelli, it's used for measuring vacuums.</td></tr>
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
                        <tr><td className="p-4 border">1 Bar</td><td className="p-4 border">Pascals (Pa)</td><td className="p-4 border">100,000 Pa</td></tr>
                        <tr><td className="p-4 border">1 Bar</td><td className="p-4 border">Pounds per square inch (psi)</td><td className="p-4 border">~14.504 psi</td></tr>
                        <tr><td className="p-4 border">1 Pound per square inch (psi)</td><td className="p-4 border">Pascals (Pa)</td><td className="p-4 border">~6,895 Pa</td></tr>
                        <tr><td className="p-4 border">1 Standard Atmosphere (atm)</td><td className="p-4 border">Pounds per square inch (psi)</td><td className="p-4 border">~14.696 psi</td></tr>
                         <tr><td className="p-4 border">1 Standard Atmosphere (atm)</td><td className="p-4 border">Bar</td><td className="p-4 border">~1.013 bar</td></tr>
                    </tbody>
                </table>
            </div>
        </section>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" />Frequently Asked Questions</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">What is atmospheric pressure?</h4>
                <p className="text-muted-foreground">Atmospheric pressure is the pressure exerted by the weight of the atmosphere. At sea level, this pressure is about 1 atm, 1.013 bar, or 14.7 psi. It's the baseline we experience every day.</p>
            </div>
            <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">What is 'gauge pressure' vs. 'absolute pressure'?</h4>
                <p className="text-muted-foreground">Absolute pressure is measured relative to a perfect vacuum (0 psi). Gauge pressure is measured relative to the surrounding atmospheric pressure. A tire pressure gauge reading 32 psi is showing gauge pressure; its absolute pressure is 32 psi + ~14.7 psi = 46.7 psi.</p>
            </div>
            <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">Why is Torr used for vacuums?</h4>
                <p className="text-muted-foreground">The Torr unit is very small (1 atm = 760 Torr), making it convenient for measuring very low pressures found in vacuum systems. It's named after Evangelista Torricelli, who invented the barometer.</p>
            </div>
            <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">Why do meteorologists use millibars?</h4>
                <p className="text-muted-foreground">A millibar (mbar) is one-thousandth of a bar. Since 1 bar is very close to 1 atmosphere, millibars provide a convenient scale for reporting the small variations in atmospheric pressure that drive weather patterns. 1 mbar is equal to 1 hectopascal (hPa), another common meteorological unit.</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" />Summary</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">The Pressure Converter is an essential tool for engineers, divers, meteorologists, and hobbyists who need to convert between different pressure measurement systems. It simplifies complex relationships between SI, imperial, and other specialized units.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
