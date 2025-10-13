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
  nm: z.coerce.number().positive('Must be a positive number'),
});

type FormValues = z.infer<typeof formSchema>;

const NM_TO_METERS = 1e-9;

export default function NanometersToMetersConverter() {
  const [result, setResult] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nm: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const meters = values.nm * NM_TO_METERS;
    setResult(meters.toExponential(2));
  };

  const conversionTable = [
    { nm: 1, m: (1 * NM_TO_METERS).toExponential(2) },
    { nm: 400, m: (400 * NM_TO_METERS).toExponential(2) }, // Violet light
    { nm: 700, m: (700 * NM_TO_METERS).toExponential(2) }, // Red light
    { nm: 1000, m: (1000 * NM_TO_METERS).toExponential(2) },
  ];

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="nm"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nanometers (nm)</FormLabel>
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
            <p className="text-3xl font-bold text-center">{result} m</p>
          </CardContent>
        </Card>
      )}
      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold mb-2">Formula & Explanation</h3>
          <div className="text-muted-foreground space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-1">Formula</h4>
              <p className='font-mono p-2 bg-muted rounded-md'>Meters = Nanometers × 10⁻⁹</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Step-by-step explanation</h4>
              <p>A nanometer (nm) is one billionth of a meter. To convert nanometers to meters, you divide by one billion (1,000,000,000) or multiply by 10⁻⁹. For example, the wavelength of green light is about 550 nm, which is 550 × 10⁻⁹ = 5.5 x 10⁻⁷ meters.</p>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Conversion Table</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nanometers (nm)</TableHead>
                <TableHead className="text-right">Meters (m)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {conversionTable.map((item) => (
                <TableRow key={item.nm}>
                  <TableCell>{item.nm}</TableCell>
                  <TableCell className="text-right">{item.m}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">FAQ</h3>
          <div className="text-muted-foreground space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-1">What is a nanometer?</h4>
              <p>A nanometer is a unit of length in the metric system, equal to one billionth of a meter (1×10⁻⁹ m). It is commonly used in nanotechnology, semiconductor manufacturing, and for measuring wavelengths of light.</p>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Related Converters</h3>
          <div className="space-y-2">
            <p><Link href="/category/conversions/micrometers-to-millimeters-converter" className="text-primary underline">Micrometers to Millimeters Converter</Link></p>
          </div>
        </div>
        <section
          className="space-y-4 text-muted-foreground leading-relaxed"
          itemScope
          itemType="https://schema.org/Article"
        >
          <meta itemProp="headline" content="Nanometers to Meters – Semiconductor & Photonics Guide" />
          <meta itemProp="author" content="MegaCalc Hub Team" />
          <meta itemProp="about" content="Reporting nm-scale measurements with exponential notation, rounding, and context for chips and photonics." />

          <h3 itemProp="name" className="text-lg font-semibold text-foreground">Reporting nano-scale values</h3>
          <p itemProp="description">When numbers are extremely small, display meters in scientific notation to preserve readability and precision (e.g., 550 nm = 5.50×10⁻⁷ m).</p>

          <ul className="list-disc ml-6 space-y-1">
            <li>Keep at least <strong>2–3 significant figures</strong> for nm measurements.</li>
            <li>For spectra, include the medium (vacuum/air) if relevant.</li>
            <li>Document instrument calibration and uncertainty where applicable.</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
