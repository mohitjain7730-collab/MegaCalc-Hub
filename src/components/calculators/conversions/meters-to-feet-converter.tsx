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
  meters: z.coerce.number().positive('Must be a positive number'),
});

type FormValues = z.infer<typeof formSchema>;

const METERS_TO_FEET = 3.28084;

export default function MetersToFeetConverter() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      meters: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    setResult(values.meters * METERS_TO_FEET);
  };

  const conversionTable = [
    { meters: 1, feet: 1 * METERS_TO_FEET },
    { meters: 5, feet: 5 * METERS_TO_FEET },
    { meters: 10, feet: 10 * METERS_TO_FEET },
    { meters: 25, feet: 25 * METERS_TO_FEET },
    { meters: 50, feet: 50 * METERS_TO_FEET },
    { meters: 100, feet: 100 * METERS_TO_FEET },
  ];

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="meters"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Meters (m)</FormLabel>
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
            <p className="text-3xl font-bold text-center">{result.toFixed(2)} ft</p>
          </CardContent>
        </Card>
      )}
      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold mb-2">Formula & Explanation</h3>
          <div className="text-muted-foreground space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-1">Formula</h4>
              <p className='font-mono p-2 bg-muted rounded-md'>Feet = Meters × 3.28084</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Step-by-step explanation</h4>
              <p>The international foot is defined as exactly 0.3048 meters. To convert meters to feet, you divide by 0.3048, which is the same as multiplying by its reciprocal (approximately 3.28084). For example, a 10-meter diving platform is 10 × 3.28084 ≈ 32.81 feet high.</p>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Conversion Table</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Meters (m)</TableHead>
                <TableHead className="text-right">Feet (ft)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {conversionTable.map((item) => (
                <TableRow key={item.meters}>
                  <TableCell>{item.meters}</TableCell>
                  <TableCell className="text-right">{item.feet.toFixed(2)}</TableCell>
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
            <p><Link href="/category/conversions/feet-to-meters-converter" className="text-primary underline">Feet to Meters Converter</Link></p>
            <p><Link href="/category/conversions/centimeters-to-inches-converter" className="text-primary underline">Centimeters to Inches Converter</Link></p>
            <p><Link href="/category/conversions/meters-to-yards-converter" className="text-primary underline">Meters to Yards Converter</Link></p>
          </div>
        </div>
        <section
          className="space-y-4 text-muted-foreground leading-relaxed"
          itemScope
          itemType="https://schema.org/Article"
        >
          <meta itemProp="headline" content="Meters to Feet Converter – Practical Guide (SI vs Imperial)" />
          <meta itemProp="author" content="MegaCalc Hub Team" />
          <meta itemProp="about" content="Learn when to convert meters to feet, accuracy and rounding rules, SI prefixes, and common use cases in construction, travel, and sports." />

          <h3 itemProp="name" className="text-lg font-semibold text-foreground">Meters to Feet: A Practical Guide</h3>
          <p itemProp="description">Convert <strong>meters (m)</strong> to <strong>feet (ft)</strong> with confidence. This guide covers measurement tips, rounding, and real‑world applications without repeating the formula or table above.</p>

          <h4 className="font-semibold text-foreground">When to use meters → feet</h4>
          <ul className="list-disc ml-6 space-y-1">
            <li>Construction drawings or building codes expressed in imperial units.</li>
            <li>Outdoor recreation descriptions (trail elevations, cliff heights) in feet.</li>
            <li>Aviation/sports content that references altitude or field dimensions in feet.</li>
          </ul>

          <h4 className="font-semibold text-foreground">Accuracy and rounding</h4>
          <ul className="list-disc ml-6 space-y-1">
            <li>Engineering: round to the same <strong>significant figures</strong> as your source measurement.</li>
            <li>Everyday use: 1 m ≈ 3.28 ft (quick mental check: 10 m ≈ 32.8 ft).</li>
            <li>Documentation: state units and whether values are <strong>approximate</strong> or exact.</li>
          </ul>

          <h4 className="font-semibold text-foreground">SI prefixes refresher</h4>
          <p>Common metric scales you may encounter before conversion: millimeter (mm, 10⁻³ m), centimeter (cm, 10⁻² m), kilometer (km, 10³ m). Convert to meters first, then to feet.</p>

          <h4 className="font-semibold text-foreground">Common pitfalls</h4>
          <ul className="list-disc ml-6 space-y-1">
            <li>Confusing <strong>feet</strong> with <strong>meters</strong> in mixed specifications—always label numbers.</li>
            <li>Mixing <strong>ft</strong> and <strong>ft′/in″</strong> notation—stick to one format per document.</li>
            <li>Rounding too early in multi‑step conversions; round at the end.</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
