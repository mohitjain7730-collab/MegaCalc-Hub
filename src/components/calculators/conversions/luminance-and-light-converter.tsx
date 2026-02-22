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
import { Sun, Info, Shield, TrendingUp, Landmark, ArrowRightLeft } from 'lucide-react';
import Link from 'next/link';
import { convertLuminance, LUMINANCE_UNITS } from '@/lib/converters';

const formSchema = z.object({
  value: z.number().optional(),
  fromUnit: z.string().min(1),
  toUnit: z.string().min(1),
});

type FormValues = z.infer<typeof formSchema>;

export default function LuminanceConverter() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      value: undefined,
      fromUnit: 'candela-per-square-meter',
      toUnit: 'foot-lambert',
    },
  });

  const { watch, setValue } = form;
  const watchedValues = watch();

  useEffect(() => {
    if (watchedValues.value !== undefined && watchedValues.fromUnit && watchedValues.toUnit) {
      const conversionResult = convertLuminance(watchedValues.value, watchedValues.fromUnit, watchedValues.toUnit);
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
            <Sun className="h-5 w-5" />
            Luminance Converter
          </CardTitle>
          <CardDescription>
            Convert between candela/m², nits, lamberts, and other light units.
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
                        <Input type="number" placeholder="e.g., 300" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
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
                          {LUMINANCE_UNITS.map(u => <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>)}
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
                          {LUMINANCE_UNITS.map(u => <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>)}
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
                {watchedValues.value} {LUMINANCE_UNITS.find(u => u.value === watchedValues.fromUnit)?.label.split(' ')[0]} = {result.toPrecision(6)} {LUMINANCE_UNITS.find(u => u.value === watchedValues.toUnit)?.label.split(' ')[0]}
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
            <p>Luminance is a photometric measure of the luminous intensity per unit area of light travelling in a given direction. It describes the amount of light that passes through, is emitted from, or is reflected from a particular area, and falls within a given solid angle.</p>
            <p>All conversions use candela per square meter (cd/m²), the SI unit, as a base reference to ensure accuracy.</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" />Formula Used</CardTitle></CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <div>
              <h4 className="font-semibold text-foreground mb-2">Standardized Conversion Process</h4>
              <p>To ensure accuracy, all conversions use the candela/square meter (cd/m²) as a common base unit.</p>
              <ol className="list-decimal pl-5 mt-2 space-y-2">
                  <li><strong className="text-foreground">Convert to cd/m²:</strong> The input value is converted to cd/m² by multiplying it by its conversion factor.</li>
                  <li><strong className="text-foreground">Convert to Target Unit:</strong> The cd/m² value is then converted to the desired final unit by dividing it by the target unit's conversion factor.</li>
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
                <li><Link href="/fuel-economy-converter" className="hover:underline">Fuel Economy Converter</Link></li>
                <li><Link href="/watts-to-btu-per-hour-converter" className="hover:underline">Watts To Btu Per Hour Converter</Link></li>
                <li><Link href="/bars-to-mmhg-converter" className="hover:underline">Bars To Mmhg Converter</Link></li>
                <li><Link href="/acres-to-square-miles-converter" className="hover:underline">Acres To Square Miles Converter</Link></li>
                <li><Link href="/kilograms-to-stones-converter" className="hover:underline">Kilograms To Stones Converter</Link></li>
            </ul>
          </CardContent>
        </Card>
        
        <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg">
            <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">A Guide to Units of Luminance</h1>
            <p className="text-lg italic">Luminance describes the "brightness" of a surface, crucial for display technology, lighting design, and astronomy.</p>
            
            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Common Luminance Units</h2>
            <div className="overflow-x-auto mt-4">
                <table className="w-full text-left border-collapse">
                    <thead><tr className="bg-muted"><th className="p-4 border">Unit</th><th className="p-4 border">Definition & Context</th></tr></thead>
                    <tbody>
                        <tr><td className="p-4 border font-semibold">Candela/m² (or Nit)</td><td className="p-4 border">The SI unit of luminance. It measures luminous intensity per unit area. "Nit" is a non-SI name for the same unit (1 nit = 1 cd/m²), commonly used for display brightness.</td></tr>
                        <tr><td className="p-4 border font-semibold">Lambert (L)</td><td className="p-4 border">An older, CGS unit of luminance. 1 Lambert = 1/π candela/cm². Rarely used today.</td></tr>
                        <tr><td className="p-4 border font-semibold">Foot-lambert (fL)</td><td className="p-4 border">An imperial unit of luminance, used in the US film and display industries. It's the luminance of a surface emitting or reflecting one lumen per square foot.</td></tr>
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
                        <tr><td className="p-4 border">1 Candela/m²</td><td className="p-4 border">Nit</td><td className="p-4 border">1 nit</td></tr>
                        <tr><td className="p-4 border">1 Candela/m²</td><td className="p-4 border">Foot-lambert (fL)</td><td className="p-4 border">~0.29 fL</td></tr>
                        <tr><td className="p-4 border">1 Foot-lambert (fL)</td><td className="p-4 border">Candela/m²</td><td className="p-4 border">~3.426 cd/m²</td></tr>
                    </tbody>
                </table>
            </div>
        </section>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" />Frequently Asked Questions</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">What is the difference between Luminance and Illuminance?</h4>
                <p className="text-muted-foreground">Luminance is the light emitted from a surface (like a screen), measured in nits or cd/m². Illuminance is the light falling onto a surface, measured in lux or foot-candles. Think of luminance as "brightness" and illuminance as "light level."</p>
            </div>
            <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">What does 'nits' on a TV or phone spec sheet mean?</h4>
                <p className="text-muted-foreground">"Nits" is a common term for candela per square meter (cd/m²) and measures the brightness of a display. A higher nit value means a brighter screen, which is better for viewing in bright environments or for HDR content.</p>
            </div>
            <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">What is a good nit value for a display?</h4>
                <p className="text-muted-foreground">A typical laptop screen has 200-300 nits. For HDR (High Dynamic Range) content, TVs and monitors often aim for peak brightness levels of 600 to over 1000 nits.</p>
            </div>
            <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">What is a foot-lambert?</h4>
                <p className="text-muted-foreground">The foot-lambert (fL) is a unit of luminance used in the American film and cinema industry. The standard brightness for a commercial movie theater screen is 16 fL.</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" />Summary</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">The Luminance Converter is a specialized tool for professionals in display technology, lighting design, and video production, enabling easy conversions between metric and imperial units of light intensity.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
