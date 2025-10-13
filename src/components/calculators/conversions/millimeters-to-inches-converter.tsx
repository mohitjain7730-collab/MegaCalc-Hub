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
  mm: z.coerce.number().positive('Must be a positive number'),
});

type FormValues = z.infer<typeof formSchema>;

const MM_TO_INCHES = 0.0393701;

export default function MillimetersToInchesConverter() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      mm: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    setResult(values.mm * MM_TO_INCHES);
  };

  const conversionTable = [
    { mm: 1, inches: 1 * MM_TO_INCHES },
    { mm: 10, inches: 10 * MM_TO_INCHES },
    { mm: 25.4, inches: 25.4 * MM_TO_INCHES }, // 1 inch
    { mm: 100, inches: 100 * MM_TO_INCHES },
  ];

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="mm"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Millimeters (mm)</FormLabel>
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
            <p className="text-3xl font-bold text-center">{result.toFixed(3)} inches</p>
          </CardContent>
        </Card>
      )}
      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold mb-2">Formula & Explanation</h3>
          <div className="text-muted-foreground space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-1">Formula</h4>
              <p className='font-mono p-2 bg-muted rounded-md'>Inches = Millimeters × 0.0393701</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Step-by-step explanation</h4>
              <p>One inch is defined as exactly 25.4 millimeters. To convert millimeters to inches, you divide the millimeter value by 25.4, which is the same as multiplying by its reciprocal (approximately 0.0393701). For example, a 10mm wrench is 10 × 0.0393701 ≈ 0.39 inches wide.</p>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Conversion Table</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Millimeters (mm)</TableHead>
                <TableHead className="text-right">Inches (in)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {conversionTable.map((item) => (
                <TableRow key={item.mm}>
                  <TableCell>{item.mm}</TableCell>
                  <TableCell className="text-right">{item.inches.toFixed(3)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">FAQ</h3>
          <div className="text-muted-foreground space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-1">How many millimeters are in an inch?</h4>
              <p>There are exactly 25.4 millimeters in one inch.</p>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Related Converters</h3>
          <div className="space-y-2">
            <p><Link href="/category/conversions/inches-to-millimeters-converter" className="text-primary underline">Inches to Millimeters Converter</Link></p>
            <p><Link href="/category/conversions/centimeters-to-inches-converter" className="text-primary underline">Centimeters to Inches Converter</Link></p>
          </div>
        </div>
        <section
          className="space-y-4 text-muted-foreground leading-relaxed"
          itemScope
          itemType="https://schema.org/Article"
        >
          <meta itemProp="headline" content="Millimeters to Inches – Engineering Notes" />
          <meta itemProp="author" content="MegaCalc Hub Team" />
          <meta itemProp="about" content="Guidelines for converting mm to inches for machining, tolerances, and CAD documentation without losing precision." />

          <h3 itemProp="name" className="text-lg font-semibold text-foreground">Converting for manufacturing</h3>
          <p itemProp="description">When producing imperial drawings from metric designs, keep numeric integrity from CAD to shop floor.</p>

          <h4 className="font-semibold text-foreground">Tips</h4>
          <ul className="list-disc ml-6 space-y-1">
            <li>Do calculations in <strong>mm</strong>, then display inches only at the final step.</li>
            <li>Show tolerances in the same unit as the dimension to avoid misinterpretation.</li>
            <li>For fractional‑inch outputs (e.g., 3/8 in), convert decimals to the nearest common fraction only when required.</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
