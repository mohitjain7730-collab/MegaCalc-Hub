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
import { Hammer, Info, Shield, TrendingUp, Landmark, ArrowRightLeft } from 'lucide-react';
import Link from 'next/link';
import { convertForce, FORCE_UNITS } from '@/lib/converters';

const formSchema = z.object({
  value: z.number().optional(),
  fromUnit: z.string().min(1),
  toUnit: z.string().min(1),
});

type FormValues = z.infer<typeof formSchema>;

export default function ForceConverter() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      value: undefined,
      fromUnit: 'newton',
      toUnit: 'pound-force',
    },
  });

  const { watch, setValue } = form;
  const watchedValues = watch();

  useEffect(() => {
    if (watchedValues.value !== undefined && watchedValues.fromUnit && watchedValues.toUnit) {
      const conversionResult = convertForce(watchedValues.value, watchedValues.fromUnit, watchedValues.toUnit);
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
            <Hammer className="h-5 w-5" />
            Force Converter
          </CardTitle>
          <CardDescription>
            Convert between newtons, dyne, and other units of force.
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
                          {FORCE_UNITS.map(u => <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>)}
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
                          {FORCE_UNITS.map(u => <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>)}
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
                {watchedValues.value} {FORCE_UNITS.find(u => u.value === watchedValues.fromUnit)?.label.split(' ')[0]} = {result.toPrecision(6)} {FORCE_UNITS.find(u => u.value === watchedValues.toUnit)?.label.split(' ')[0]}
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
            <p>Force is an influence that can change the motion of an object. This tool helps you convert between the different units used to measure force in physics and engineering.</p>
            <p>All conversions use the newton (N), the SI unit of force, as a base reference to ensure accuracy.</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" />Formula Used</CardTitle></CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <div>
              <h4 className="font-semibold text-foreground mb-2">Standardized Conversion Process</h4>
              <p>To ensure accuracy, all conversions use the newton (N) as a common base unit.</p>
              <ol className="list-decimal pl-5 mt-2 space-y-2">
                  <li><strong className="text-foreground">Convert to Newtons:</strong> The input value is converted to newtons by multiplying it by its conversion factor. <br /><span className="font-mono text-xs">Value in Newtons = Input Value × Conversion Factor to Newtons</span></li>
                  <li><strong className="text-foreground">Convert to Target Unit:</strong> The newton value is then converted to the desired final unit by dividing it by the target unit's conversion factor. <br /><span className="font-mono text-xs">Final Value = Value in Newtons / Target Unit's Conversion Factor</span></li>
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
                <li><Link href="/conversions/micrometers-to-millimeters-converter" className="hover:underline">Micrometers To Millimeters Converter</Link></li>
                <li><Link href="/conversions/construction-converter" className="hover:underline">Construction Converter</Link></li>
                <li><Link href="/conversions/torque-converter" className="hover:underline">Torque Converter</Link></li>
                <li><Link href="/conversions/kilocalories-to-joules-converter" className="hover:underline">Kilocalories To Joules Converter</Link></li>
                <li><Link href="/conversions/seconds-to-minutes-converter" className="hover:underline">Seconds To Minutes Converter</Link></li>
            </ul>
          </CardContent>
        </Card>
        
        <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg">
            <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">A Guide to Units of Force</h1>
            <p className="text-lg italic">Force is defined by Newton's second law of motion: Force = Mass × Acceleration (F=ma). Different systems have evolved to measure this fundamental concept.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Common Force Units</h2>
            <div className="overflow-x-auto mt-4">
                <table className="w-full text-left border-collapse">
                    <thead><tr className="bg-muted"><th className="p-4 border">Unit</th><th className="p-4 border">Abbreviation</th><th className="p-4 border">Definition & Context</th></tr></thead>
                    <tbody>
                        <tr><td className="p-4 border font-semibold">Newton</td><td className="p-4 border">N</td><td className="p-4 border">The SI unit of force. It's the force required to accelerate a 1 kg mass at 1 m/s². The universal standard in science.</td></tr>
                        <tr><td className="p-4 border font-semibold">Dyne</td><td className="p-4 border">dyn</td><td className="p-4 border">An older, smaller unit from the CGS (centimeter-gram-second) system. 1 N = 100,000 dyn.</td></tr>
                        <tr><td className="p-4 border font-semibold">Pound-force</td><td className="p-4 border">lbf</td><td className="p-4 border">The gravitational force exerted on a mass of one pound. Common in US engineering and everyday contexts.</td></tr>
                        <tr><td className="p-4 border font-semibold">Kilogram-force (Kilopond)</td><td className="p-4 border">kgf or kp</td><td className="p-4 border">The gravitational force exerted on a mass of one kilogram. Largely obsolete but still seen in some older texts or specific contexts.</td></tr>
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
                        <tr><td className="p-4 border">1 Newton (N)</td><td className="p-4 border">Pound-force (lbf)</td><td className="p-4 border">~0.2248 lbf</td></tr>
                        <tr><td className="p-4 border">1 Pound-force (lbf)</td><td className="p-4 border">Newtons (N)</td><td className="p-4 border">~4.448 N</td></tr>
                        <tr><td className="p-4 border">1 Kilogram-force (kgf)</td><td className="p-4 border">Newtons (N)</td><td className="p-4 border">~9.807 N</td></tr>
                        <tr><td className="p-4 border">1 Newton (N)</td><td className="p-4 border">Dynes</td><td className="p-4 border">100,000 dyn</td></tr>
                    </tbody>
                </table>
            </div>
        </section>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" />Frequently Asked Questions</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">What is the difference between a pound (lb) and a pound-force (lbf)?</h4>
                <p className="text-muted-foreground">A pound (lb) is a unit of mass, while a pound-force (lbf) is the unit of force exerted by gravity on an object with a one-pound mass. On Earth, the two values are numerically similar, which is why they are often used interchangeably in non-scientific contexts. However, they are fundamentally different physical quantities.</p>
            </div>
            <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">What is a Newton (N)?</h4>
                <p className="text-muted-foreground">A newton is the SI unit of force. It is defined as the force required to accelerate a mass of one kilogram at a rate of one meter per second squared (1 N = 1 kg·m/s²). An apple falling from a tree exerts about 1 newton of force.</p>
            </div>
            <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">Is force the same as pressure?</h4>
                <p className="text-muted-foreground">No. Force is a total influence on an object, while pressure is that force distributed over an area (Pressure = Force / Area). A sharp needle can create very high pressure with very little force because the area is tiny.</p>
            </div>
            <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">What is a kilopond or kilogram-force?</h4>
                <p className="text-muted-foreground">A kilogram-force (kgf) or kilopond (kp) is an older, non-SI unit of force. It's the force that gravity exerts on a one-kilogram mass. Since gravity varies slightly across the Earth, the newton is preferred for precise scientific work. 1 kgf is approximately 9.8 N.</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" />Summary</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">The Force Converter is a vital tool for students, physicists, and engineers who need to work with different units of force. It provides quick and reliable conversions between the SI and imperial/US customary systems.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
