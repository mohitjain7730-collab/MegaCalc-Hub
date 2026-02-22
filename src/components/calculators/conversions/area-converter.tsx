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
import { Square, Info, Shield, TrendingUp, Landmark, ArrowRightLeft } from 'lucide-react';
import Link from 'next/link';
import { convertArea, AREA_UNITS } from '@/lib/converters';

const formSchema = z.object({
  value: z.number().optional(),
  fromUnit: z.string().min(1),
  toUnit: z.string().min(1),
});

type FormValues = z.infer<typeof formSchema>;

export default function AreaConverter() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      value: undefined,
      fromUnit: 'square-meter',
      toUnit: 'square-foot',
    },
  });

  const { watch, setValue } = form;
  const watchedValues = watch();

  useEffect(() => {
    if (watchedValues.value !== undefined && watchedValues.fromUnit && watchedValues.toUnit) {
      const conversionResult = convertArea(watchedValues.value, watchedValues.fromUnit, watchedValues.toUnit);
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
      const newResult = convertArea(currentValue, to, from);
      setValue('value', result ?? undefined);
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Square className="h-5 w-5" />
            Area Converter
          </CardTitle>
          <CardDescription>
            Easily convert between different units of area.
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
                          {AREA_UNITS.map(u => <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>)}
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
                          {AREA_UNITS.map(u => <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>)}
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
                {watchedValues.value} {AREA_UNITS.find(u => u.value === watchedValues.fromUnit)?.label.split(' ')[0]} = {result.toPrecision(6)} {AREA_UNITS.find(u => u.value === watchedValues.toUnit)?.label.split(' ')[0]}
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
            <p>This tool helps you convert between various metric and imperial units of area. Whether you're a real estate professional, a student, or a farmer, this converter simplifies area calculations for land, property, and scientific purposes.</p>
            <p>The conversion process is standardized by converting the input value to a base unit (square meters) before converting it to the desired output unit, ensuring high accuracy.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" />Formula Used</CardTitle></CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <div>
              <h4 className="font-semibold text-foreground mb-2">Standardized Conversion</h4>
              <p>To maintain precision, all conversions use the square meter as an intermediate base unit.</p>
              <ol className="list-decimal pl-5 mt-2 space-y-2">
                <li><strong className="text-foreground">Convert to Square Meters:</strong> The input value is first converted to square meters. <br /><span className="font-mono text-xs">Value in m² = Input Value × Conversion Factor to m²</span></li>
                <li><strong className="text-foreground">Convert to Target Unit:</strong> The value in square meters is then converted to the final unit. <br /><span className="font-mono text-xs">Final Value = Value in m² / Target Unit's Conversion Factor from m²</span></li>
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
              <li><Link href="/miles-per-hour-to-kilometers-per-hour-converter" className="hover:underline">Miles Per Hour To Kilometers Per Hour Converter</Link></li>
              <li><Link href="/watts-to-megawatts-converter" className="hover:underline">Watts To Megawatts Converter</Link></li>
              <li><Link href="/fathoms-to-meters-converter" className="hover:underline">Fathoms To Meters Converter</Link></li>
              <li><Link href="/belt-size-converter" className="hover:underline">Belt Size Converter</Link></li>
              <li><Link href="/square-feet-to-square-yards-converter" className="hover:underline">Square Feet To Square Yards Converter</Link></li>
            </ul>
          </CardContent>
        </Card>

        <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg">
          <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">A Guide to Units of Area</h1>
          <p className="text-lg italic">Area measures the extent of a two-dimensional surface. Different units are used depending on the scale, from tiny electronic components to vast tracts of land.</p>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">The Metric System (SI)</h2>
          <p>The metric system's area units are derived directly from its length units, making them logical and easy to scale.</p>
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left border-collapse">
              <thead><tr className="bg-muted"><th className="p-4 border">Unit</th><th className="p-4 border">Abbreviation</th><th className="p-4 border">Relation to Square Meter</th><th className="p-4 border">Primary Use Case</th></tr></thead>
              <tbody>
                <tr><td className="p-4 border font-semibold">Square Millimeter</td><td className="p-4 border">mm²</td><td className="p-4 border">1 millionth of a m² (10<sup>-6</sup>)</td><td className="p-4 border">Scientific measurements, small engineering parts.</td></tr>
                <tr><td className="p-4 border font-semibold">Square Centimeter</td><td className="p-4 border">cm²</td><td className="p-4 border">1 ten-thousandth of a m² (10<sup>-4</sup>)</td><td className="p-4 border">Medical imaging, chemistry, small-scale crafts.</td></tr>
                <tr><td className="p-4 border font-semibold">Square Meter</td><td className="p-4 border">m²</td><td className="p-4 border">Base Unit</td><td className="p-4 border">Measuring room size, small property.</td></tr>
                <tr><td className="p-4 border font-semibold">Hectare</td><td className="p-4 border">ha</td><td className="p-4 border">10,000 m²</td><td className="p-4 border">Land measurement for agriculture and forestry.</td></tr>
                <tr><td className="p-4 border font-semibold">Square Kilometer</td><td className="p-4 border">km²</td><td className="p-4 border">1,000,000 m²</td><td className="p-4 border">Geographical areas, city sizes, country territories.</td></tr>
              </tbody>
            </table>
          </div>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">The Imperial and U.S. Customary Systems</h2>
          <p>These units are commonly used for land and property in the United States and other select regions.</p>
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left border-collapse">
              <thead><tr className="bg-muted"><th className="p-4 border">Unit</th><th className="p-4 border">Abbreviation</th><th className="p-4 border">Relation to Others</th><th className="p-4 border">Primary Use Case</th></tr></thead>
              <tbody>
                <tr><td className="p-4 border font-semibold">Square Inch</td><td className="p-4 border">in²</td><td className="p-4 border">1/144 of a square foot</td><td className="p-4 border">Material science, small mechanical parts.</td></tr>
                <tr><td className="p-4 border font-semibold">Square Foot</td><td className="p-4 border">ft²</td><td className="p-4 border">144 square inches</td><td className="p-4 border">Real estate (residential and commercial property size).</td></tr>
                <tr><td className="p-4 border font-semibold">Square Yard</td><td className="p-4 border">yd²</td><td className="p-4 border">9 square feet</td><td className="p-4 border">Fabric, carpeting, landscaping.</td></tr>
                <tr><td className="p-4 border font-semibold">Acre</td><td className="p-4 border">ac</td><td className="p-4 border">43,560 square feet</td><td className="p-4 border">Standard unit for large plots of land.</td></tr>
                <tr><td className="p-4 border font-semibold">Square Mile</td><td className="p-4 border">mi²</td><td className="p-4 border">640 acres</td><td className="p-4 border">Large-scale geographical and rural areas.</td></tr>
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
                <tr><td className="p-4 border">1 Square Foot</td><td className="p-4 border">Square Inches</td><td className="p-4 border">144 in²</td></tr>
                <tr><td className="p-4 border">1 Square Meter</td><td className="p-4 border">Square Feet</td><td className="p-4 border">~10.764 ft²</td></tr>
                <tr><td className="p-4 border">1 Square Yard</td><td className="p-4 border">Square Feet</td><td className="p-4 border">9 ft²</td></tr>
                <tr><td className="p-4 border">1 Acre</td><td className="p-4 border">Square Feet</td><td className="p-4 border">43,560 ft²</td></tr>
                <tr><td className="p-4 border">1 Acre</td><td className="p-4 border">Hectares</td><td className="p-4 border">~0.4047 ha</td></tr>
                <tr><td className="p-4 border">1 Hectare</td><td className="p-4 border">Acres</td><td className="p-4 border">~2.471 ac</td></tr>
                <tr><td className="p-4 border">1 Square Mile</td><td className="p-4 border">Acres</td><td className="p-4 border">640 ac</td></tr>
                <tr><td className="p-4 border">1 Square Kilometer</td><td className="p-4 border">Hectares</td><td className="p-4 border">100 ha</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" />Frequently Asked Questions</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">What is a hectare?</h4>
              <p className="text-muted-foreground">A hectare (ha) is a metric unit of area equal to 10,000 square meters. It is commonly used for measuring land. One hectare is equivalent to about 2.47 acres.</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">How big is an acre?</h4>
              <p className="text-muted-foreground">An acre is an imperial unit of land area equal to 43,560 square feet. It's often visualized as being roughly the size of an American football field without the end zones.</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Is &quot;square foot&quot; the same as &quot;foot square&quot;?</h4>
              <p className="text-muted-foreground">No, they are different. A &quot;square foot&quot; is a unit of area (1 foot by 1 foot). A &quot;foot square&quot; describes a shape, meaning a square that is 1 foot on each side. While a 1-foot square has an area of 1 square foot, a 2-foot square has an area of 4 square feet.</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Why is the SI unit for area the square meter?</h4>
              <p className="text-muted-foreground">The square meter (m²) is a derived SI unit. Since the base SI unit for length is the meter, the unit for area is naturally derived from it by squaring it. This maintains consistency within the metric system.</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" />Summary</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">The Area Converter provides a fast and reliable way to switch between different metric and imperial units of area. It is an indispensable tool for anyone involved in real estate, agriculture, construction, or scientific research.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
