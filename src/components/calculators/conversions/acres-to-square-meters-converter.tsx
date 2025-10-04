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
  acres: z.coerce.number().positive('Must be a positive number'),
});

type FormValues = z.infer<typeof formSchema>;

const ACRES_TO_SQ_METERS = 4046.86;

export default function AcresToSquareMetersConverter() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      acres: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    setResult(values.acres * ACRES_TO_SQ_METERS);
  };

  const conversionTable = [
    { acres: 1, sqMeters: 1 * ACRES_TO_SQ_METERS },
    { acres: 2, sqMeters: 2 * ACRES_TO_SQ_METERS },
    { acres: 5, sqMeters: 5 * ACRES_TO_SQ_METERS },
    { acres: 10, sqMeters: 10 * ACRES_TO_SQ_METERS },
  ];

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="acres"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Acres</FormLabel>
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
            <p className="text-3xl font-bold text-center">{result.toLocaleString(undefined, {maximumFractionDigits: 2})} m²</p>
          </CardContent>
        </Card>
      )}
      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold mb-2">Formula & Explanation</h3>
          <div className="text-muted-foreground space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-1">Formula</h4>
              <p className='font-mono p-2 bg-muted rounded-md'>Square Meters = Acres × 4046.86</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Step-by-step explanation</h4>
              <p>One acre is defined as exactly 4,046.8564224 square meters. This calculator uses the rounded value of 4046.86 for simplicity. To convert acres to square meters, you simply multiply the number of acres by this conversion factor. For example, a 2-acre plot of land is 2 × 4046.86 = 8093.72 square meters.</p>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Conversion Table</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Acres</TableHead>
                <TableHead className="text-right">Square Meters (m²)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {conversionTable.map((item) => (
                <TableRow key={item.acres}>
                  <TableCell>{item.acres}</TableCell>
                  <TableCell className="text-right">{item.sqMeters.toLocaleString(undefined, {maximumFractionDigits: 2})}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">FAQ</h3>
          <div className="text-muted-foreground space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-1">What is an acre?</h4>
              <p>An acre is a unit of land area used in the imperial and US customary systems. It was originally defined as the amount of land a yoke of oxen could plow in one day.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Is an acre bigger than a hectare?</h4>
              <p>No, a hectare is larger. A hectare is 10,000 square meters, while an acre is only about 4,047 square meters. One hectare is approximately 2.47 acres.</p>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Related Converters</h3>
          <div className="space-y-2">
            <p><Link href="/category/conversions/square-meters-to-acres-converter" className="text-primary underline">Square Meters to Acres Converter</Link></p>
            <p><Link href="/category/conversions/hectares-to-acres-converter" className="text-primary underline">Hectares to Acres Converter</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
