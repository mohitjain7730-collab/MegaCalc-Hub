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
import { Scale, Info, Shield, TrendingUp, Landmark, ArrowRightLeft } from 'lucide-react';
import Link from 'next/link';
import { convertWeight, WEIGHT_UNITS } from '@/lib/converters';

const formSchema = z.object({
  value: z.number().optional(),
  fromUnit: z.string().min(1),
  toUnit: z.string().min(1),
});

type FormValues = z.infer<typeof formSchema>;

export default function WeightAndMassConverter() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      value: undefined,
      fromUnit: 'kilogram',
      toUnit: 'pound',
    },
  });

  const { watch, setValue } = form;
  const watchedValues = watch();

  useEffect(() => {
    if (watchedValues.value !== undefined && watchedValues.fromUnit && watchedValues.toUnit) {
      const conversionResult = convertWeight(watchedValues.value, watchedValues.fromUnit, watchedValues.toUnit);
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
      const newResult = convertWeight(currentValue, to, from);
      setValue('value', result ?? undefined);
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5" />
            Weight & Mass Converter
          </CardTitle>
          <CardDescription>
            Seamlessly convert between various units of weight and mass.
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
                        <Input type="number" placeholder="e.g., 5" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
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
                          {WEIGHT_UNITS.map(u => <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>)}
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
                          {WEIGHT_UNITS.map(u => <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>)}
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
                {watchedValues.value} {WEIGHT_UNITS.find(u => u.value === watchedValues.fromUnit)?.label.split(' ')[0]} = {result.toPrecision(6)} {WEIGHT_UNITS.find(u => u.value === watchedValues.toUnit)?.label.split(' ')[0]}
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
            <p>This tool allows you to convert between a wide variety of metric and imperial units for weight and mass. From tiny milligrams used in science to large tons used in industry, this converter has you covered.</p>
            <p>It works by first converting your input value to a standard base unit (kilograms) and then to your desired output unit. This two-step process ensures all conversions are accurate.</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" />Formula Used</CardTitle></CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <div>
              <h4 className="font-semibold text-foreground mb-2">Standardized Conversion Process</h4>
              <p>To ensure accuracy across different unit systems, all conversions use the kilogram (kg) as a common base unit.</p>
              <ol className="list-decimal pl-5 mt-2 space-y-2">
                  <li><strong className="text-foreground">Convert to Kilograms:</strong> The initial value is converted to kilograms by multiplying it by its specific conversion factor. <br /><span className="font-mono text-xs">Value in kg = Input Value × Conversion Factor to kg</span></li>
                  <li><strong className="text-foreground">Convert to Target Unit:</strong> The kilogram value is then converted to the desired final unit by dividing it by the target unit's conversion factor. <br /><span className="font-mono text-xs">Final Value = Value in kg / Target Unit's Conversion Factor</span></li>
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
                <li><Link href="/category/conversions/square-miles-to-square-kilometers-converter" className="hover:underline">Square Miles To Square Kilometers Converter</Link></li>
                <li><Link href="/category/conversions/square-kilometers-to-hectares-converter" className="hover:underline">Square Kilometers To Hectares Converter</Link></li>
                <li><Link href="/category/conversions/bars-to-pascals-converter" className="hover:underline">Bars To Pascals Converter</Link></li>
                <li><Link href="/category/conversions/electrical-converter" className="hover:underline">Electrical Converter</Link></li>
                <li><Link href="/category/conversions/btu-to-kwh-converter" className="hover:underline">Btu To Kwh Converter</Link></li>
            </ul>
          </CardContent>
        </Card>

        <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg">
            <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">A Guide to Units of Weight and Mass</h1>
            <p className="text-lg italic">Mass is the measure of how much matter is in an object, while weight is the measure of the force of gravity on that object. While scientifically distinct, these terms are often used interchangeably in daily life. This guide explores the common units used to measure them.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">The Metric System (SI)</h2>
            <p>Based on the kilogram, the metric system is used globally in science and commerce due to its simplicity and scalability.</p>
            <div className="overflow-x-auto mt-4">
                <table className="w-full text-left border-collapse">
                    <thead><tr className="bg-muted"><th className="p-4 border">Unit</th><th className="p-4 border">Abbreviation</th><th className="p-4 border">Relation to Gram</th><th className="p-4 border">Primary Use Case</th></tr></thead>
                    <tbody>
                        <tr><td className="p-4 border font-semibold">Milligram</td><td className="p-4 border">mg</td><td className="p-4 border">1/1,000 of a gram</td><td className="p-4 border">Pharmaceutical dosages, chemical measurements.</td></tr>
                        <tr><td className="p-4 border font-semibold">Gram</td><td className="p-4 border">g</td><td className="p-4 border">Base Unit</td><td className="p-4 border">Cooking ingredients, food packaging, postage.</td></tr>
                        <tr><td className="p-4 border font-semibold">Kilogram</td><td className="p-4 border">kg</td><td className="p-4 border">1,000 grams</td><td className="p-4 border">Human body weight, bulk goods, scientific standard.</td></tr>
                        <tr><td className="p-4 border font-semibold">Metric Tonne</td><td className="p-4 border">t</td><td className="p-4 border">1,000 kilograms</td><td className="p-4 border">Industrial shipping, measuring heavy vehicles.</td></tr>
                    </tbody>
                </table>
            </div>

            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">The Imperial and U.S. Customary Systems</h2>
            <p>These systems are primarily used in the United States for consumer goods, body weight, and some trade applications.</p>
            <div className="overflow-x-auto mt-4">
                 <table className="w-full text-left border-collapse">
                    <thead><tr className="bg-muted"><th className="p-4 border">Unit</th><th className="p-4 border">Abbreviation</th><th className="p-4 border">Relation to Others</th><th className="p-4 border">Primary Use Case</th></tr></thead>
                    <tbody>
                        <tr><td className="p-4 border font-semibold">Ounce</td><td className="p-4 border">oz</td><td className="p-4 border">1/16 of a pound</td><td className="p-4 border">Food products, small packaged goods.</td></tr>
                        <tr><td className="p-4 border font-semibold">Pound</td><td className="p-4 border">lb</td><td className="p-4 border">16 ounces</td><td className="p-4 border">Human body weight, groceries.</td></tr>
                        <tr><td className="p-4 border font-semibold">Stone</td><td className="p-4 border">st</td><td className="p-4 border">14 pounds</td><td className="p-4 border">Primarily in the UK and Ireland for body weight.</td></tr>
                        <tr><td className="p-4 border font-semibold">Short Ton (US)</td><td className="p-4 border">ton</td><td className="p-4 border">2,000 pounds</td><td className="p-4 border">Used in the US for measuring cars, coal, etc.</td></tr>
                        <tr><td className="p-4 border font-semibold">Long Ton (UK)</td><td className="p-4 border">ton</td><td className="p-4 border">2,240 pounds</td><td className="p-4 border">Historically used in the UK, now less common.</td></tr>
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
                        <tr><td className="p-4 border">1 Ounce</td><td className="p-4 border">Grams</td><td className="p-4 border">~28.35 g</td></tr>
                        <tr><td className="p-4 border">1 Pound</td><td className="p-4 border">Grams</td><td className="p-4 border">~453.6 g</td></tr>
                        <tr><td className="p-4 border">1 Pound</td><td className="p-4 border">Ounces</td><td className="p-4 border">16 oz</td></tr>
                        <tr><td className="p-4 border">1 Kilogram</td><td className="p-4 border">Pounds</td><td className="p-4 border">~2.205 lb</td></tr>
                        <tr><td className="p-4 border">1 Gram</td><td className="p-4 border">Ounces</td><td className="p-4 border">~0.035 oz</td></tr>
                        <tr><td className="p-4 border">1 Stone</td><td className="p-4 border">Pounds</td><td className="p-4 border">14 lb</td></tr>
                        <tr><td className="p-4 border">1 Metric Tonne</td><td className="p-4 border">Kilograms</td><td className="p-4 border">1,000 kg</td></tr>
                        <tr><td className="p-4 border">1 Short Ton (US)</td><td className="p-4 border">Pounds</td><td className="p-4 border">2,000 lb</td></tr>
                    </tbody>
                </table>
            </div>
        </section>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" />Frequently Asked Questions</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">What is the difference between mass and weight?</h4>
                <p className="text-muted-foreground">Mass is the amount of matter in an object and is constant everywhere. Weight is the gravitational force acting on that mass, which changes depending on where you are (e.g., on the Moon, your weight would be less, but your mass remains the same). Kilograms and pounds are technically units of mass and force respectively, but are used interchangeably for weight in everyday language.</p>
            </div>
            <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">Why are there two types of tons?</h4>
                <p className="text-muted-foreground">The "short ton" (2,000 lbs) is standard in the United States. The "long ton" (2,240 lbs) is a British imperial unit. The metric "tonne" (1,000 kg or ~2,204.6 lbs) is the international standard. This converter uses all three to avoid confusion.</p>
            </div>
            <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">What is a "stone" and where is it used?</h4>
                <p className="text-muted-foreground">The stone is a unit of mass equal to 14 pounds. It is still commonly used in the United Kingdom and Ireland to measure human body weight. For example, a person might say they weigh "11 stone 4" (11 stone and 4 pounds).</p>
            </div>
            <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">Is an ounce of gold the same as an ounce of feathers?</h4>
                <p className="text-muted-foreground">It depends on the ounce! Feathers are weighed using the standard (avoirdupois) ounce (about 28.35 grams). Precious metals like gold are weighed using the troy ounce (about 31.1 grams). So, a troy ounce of gold is heavier than a standard ounce of feathers.</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" />Summary</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">The Weight and Mass Converter is a versatile tool designed for accuracy and ease of use. It's an essential utility for professionals in shipping, science, and culinary arts, as well as for everyday tasks like converting body weight or grocery measurements.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
