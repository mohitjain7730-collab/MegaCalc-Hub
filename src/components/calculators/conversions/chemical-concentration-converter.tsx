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
import { FlaskConical, Info, Shield, TrendingUp, Landmark, ArrowRightLeft } from 'lucide-react';
import Link from 'next/link';
import { convertChemicalConcentration, CHEMICAL_CONCENTRATION_UNITS } from '@/lib/converters';

const formSchema = z.object({
  value: z.number().optional(),
  fromUnit: z.string().min(1),
  toUnit: z.string().min(1),
});

type FormValues = z.infer<typeof formSchema>;

export default function ConcentrationConverter() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      value: undefined,
      fromUnit: 'moles-per-liter',
      toUnit: 'millimoles-per-liter',
    },
  });

  const { watch, setValue } = form;
  const watchedValues = watch();

  useEffect(() => {
    if (watchedValues.value !== undefined && watchedValues.fromUnit && watchedValues.toUnit) {
      const conversionResult = convertChemicalConcentration(watchedValues.value, watchedValues.fromUnit, watchedValues.toUnit);
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
            <FlaskConical className="h-5 w-5" />
            Chemical Concentration Converter
          </CardTitle>
          <CardDescription>
            Convert between molar, millimolar, and other concentration units.
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
                        <Input type="number" placeholder="e.g., 1" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
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
                          {CHEMICAL_CONCENTRATION_UNITS.map(u => <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>)}
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
                          {CHEMICAL_CONCENTRATION_UNITS.map(u => <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>)}
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
                {watchedValues.value} {CHEMICAL_CONCENTRATION_UNITS.find(u => u.value === watchedValues.fromUnit)?.label.split(' ')[0]} = {result.toPrecision(6)} {CHEMICAL_CONCENTRATION_UNITS.find(u => u.value === watchedValues.toUnit)?.label.split(' ')[0]}
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
            <p>Chemical concentration measures the amount of a substance (solute) dissolved in another substance (solvent). This tool focuses on molar concentration (molarity), which is fundamental in chemistry.</p>
            <p>All conversions use moles per liter (mol/L), also known as Molarity (M), as the base unit for accuracy.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" />Formula Used</CardTitle></CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <div>
              <h4 className="font-semibold text-foreground mb-2">Standardized Conversion Process</h4>
              <p>Conversions are based on metric prefixes related to the base unit of Moles/Liter (M).</p>
              <ul className="list-disc pl-5 mt-2 space-y-2">
                <li>1 Molar (M) = 1 mole/liter</li>
                <li>1 Millimolar (mM) = 0.001 moles/liter</li>
                <li>1 Micromolar (µM) = 0.000001 moles/liter</li>
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
              <li><Link href="/category/conversions/short-tons-us-to-metric-tons-converter" className="hover:underline">Short Tons Us To Metric Tons Converter</Link></li>
              <li><Link href="/category/conversions/seconds-to-days-converter" className="hover:underline">Seconds To Days Converter</Link></li>
              <li><Link href="/category/conversions/miles-per-hour-to-knots-converter" className="hover:underline">Miles Per Hour To Knots Converter</Link></li>
              <li><Link href="/category/conversions/construction-converter" className="hover:underline">Construction Converter</Link></li>
              <li><Link href="/category/conversions/electrical-converter" className="hover:underline">Electrical Converter</Link></li>
            </ul>
          </CardContent>
        </Card>

        <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg">
          <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">A Guide to Chemical Concentration</h1>
          <p className="text-lg italic">Molarity is a cornerstone of chemistry, essential for stoichiometry, solution preparation, and reaction kinetics.</p>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Common Concentration Units</h2>
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left border-collapse">
              <thead><tr className="bg-muted"><th className="p-4 border">Unit</th><th className="p-4 border">Definition</th></tr></thead>
              <tbody>
                <tr><td className="p-4 border font-semibold">Molarity (M)</td><td className="p-4 border">Moles of solute per liter of solution. The standard unit for concentration in chemistry.</td></tr>
                <tr><td className="p-4 border font-semibold">Millimolarity (mM)</td><td className="p-4 border">One-thousandth of a mole per liter. Used for more dilute solutions.</td></tr>
                <tr><td className="p-4 border font-semibold">Micromolarity (µM)</td><td className="p-4 border">One-millionth of a mole per liter. Used in biochemistry and for trace amounts.</td></tr>
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
                <tr><td className="p-4 border">1 Molar (M)</td><td className="p-4 border">Millimolar (mM)</td><td className="p-4 border">1,000 mM</td></tr>
                <tr><td className="p-4 border">1 Millimolar (mM)</td><td className="p-4 border">Micromolar (µM)</td><td className="p-4 border">1,000 µM</td></tr>
                <tr><td className="p-4 border">1 Molar (M)</td><td className="p-4 border">Micromolar (µM)</td><td className="p-4 border">1,000,000 µM</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" />Frequently Asked Questions</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">What is a mole?</h4>
              <p className="text-muted-foreground">A mole is a specific number of particles (atoms, molecules), defined as Avogadro&apos;s number, approximately 6.022 x 10²³. It&apos;s a convenient way for chemists to count atoms and molecules by weighing them.</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">What is molarity?</h4>
              <p className="text-muted-foreground">Molarity (M) is the most common unit of concentration. It is the number of moles of a substance (solute) dissolved in one liter of a solution.</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Why is temperature important for concentration?</h4>
              <p className="text-muted-foreground">Molarity is based on the volume of the solution, which can change with temperature (most liquids expand when heated). For highly precise work, chemists may use molality (moles of solute per kg of solvent), which is independent of temperature.</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" />Summary</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">This converter is an essential tool for students and professionals in chemistry, biology, and medicine, providing a quick way to convert between different scales of molar concentration.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
