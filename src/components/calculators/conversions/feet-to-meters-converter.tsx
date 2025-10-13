'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRightLeft } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Link from 'next/link';

const formSchema = z.object({
  feet: z.coerce.number().positive('Must be a positive number'),
});

type FormValues = z.infer<typeof formSchema>;

const FEET_TO_METERS = 0.3048;

export default function FeetToMetersConverter() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      feet: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    setResult(values.feet * FEET_TO_METERS);
  };

  const conversionTable = [
    { feet: 1, meters: 1 * FEET_TO_METERS },
    { feet: 5, meters: 5 * FEET_TO_METERS },
    { feet: 10, meters: 10 * FEET_TO_METERS },
    { feet: 50, meters: 50 * FEET_TO_METERS },
    { feet: 100, meters: 100 * FEET_TO_METERS },
  ];

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="feet"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Feet (ft)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} value={field.value ?? ''} onChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Convert</Button>
        </form>
      </Form>
      {result !== null && (
        <Card className="mt-8">
          <CardHeader>
            <div className='flex items-center gap-4'>
              <ArrowRightLeft className="h-8 w-8 text-primary" />
              <CardTitle>Conversion Result</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-center">{result.toFixed(2)} m</p>
          </CardContent>
        </Card>
      )}
      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold mb-2">Formula & Explanation</h3>
          <div className="text-muted-foreground space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-1">Formula</h4>
              <p className='font-mono p-2 bg-muted rounded-md'>Meters = Feet × 0.3048</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Step-by-step explanation</h4>
              <p>The international foot is defined as exactly 0.3048 meters. To convert from feet to meters, you simply multiply the number of feet by this conversion factor. For example, a 6-foot-tall person is 6 × 0.3048 = 1.8288 meters tall.</p>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Conversion Table</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Feet (ft)</TableHead>
                <TableHead className="text-right">Meters (m)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {conversionTable.map((item) => (
                <TableRow key={item.feet}>
                  <TableCell>{item.feet}</TableCell>
                  <TableCell className="text-right">{item.meters.toFixed(3)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">FAQ</h3>
          <div className="text-muted-foreground space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-1">How many feet are in a meter?</h4>
              <p>There are approximately 3.28084 feet in one meter.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Why do the US and UK use different units?</h4>
              <p>The US primarily uses the imperial system (inches, feet, pounds), a system inherited from the British Empire. While the UK has officially adopted the metric system (meters, grams), imperial units are still commonly used in everyday life. Most of the world uses the metric system for its simplicity and base-ten structure.</p>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Related Converters</h3>
          <div className="space-y-2">
            <p><Link href="/category/conversions/meters-to-feet-converter" className="text-primary underline">Meters to Feet Converter</Link></p>
            <p><Link href="/category/conversions/inches-to-centimeters-converter" className="text-primary underline">Inches to Centimeters Converter</Link></p>
            <p><Link href="/category/conversions/yards-to-meters-converter" className="text-primary underline">Yards to Meters Converter</Link></p>
          </div>
        </div>
        <section
          className="space-y-4 text-muted-foreground leading-relaxed"
          itemScope
          itemType="https://schema.org/Article"
        >
          <meta itemProp="headline" content="Feet to Meters Converter – Accurate Metric Conversions" />
          <meta itemProp="author" content="MegaCalc Hub Team" />
          <meta itemProp="about" content="Best practices for converting feet and inches to meters and centimeters, including rounding, precision and documentation tips." />

          <h3 itemProp="name" className="text-lg font-semibold text-foreground">Feet to Meters: Best Practices</h3>
          <p itemProp="description">When working across imperial and metric systems, keep conversions clear and reproducible. This section complements the formula above with practical guidance.</p>

          <h4 className="font-semibold text-foreground">Working with feet and inches</h4>
          <ul className="list-disc ml-6 space-y-1">
            <li>Normalize measurements first: <span className="font-mono">total_inches = ft × 12 + in</span>; then convert to meters.</li>
            <li>For architectural specs, retain <strong>two to three decimals</strong> in meters unless drawings require more.</li>
            <li>Document source and converted units to avoid ambiguity in teams.</li>
          </ul>

          <h4 className="font-semibold text-foreground">Quick checks</h4>
          <ul className="list-disc ml-6 space-y-1">
            <li>3 ft ≈ 0.91 m, 6 ft ≈ 1.83 m, 10 ft ≈ 3.05 m.</li>
            <li>1 in = 2.54 cm exactly; 1 ft = 0.3048 m exactly.</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
