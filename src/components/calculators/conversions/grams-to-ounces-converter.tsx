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
  grams: z.coerce.number().positive('Must be a positive number'),
});

type FormValues = z.infer<typeof formSchema>;

const GRAMS_TO_OUNCES = 0.035274;

export default function GramsToOuncesConverter() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      grams: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    setResult(values.grams * GRAMS_TO_OUNCES);
  };

  const conversionTable = [
    { grams: 1, ounces: 1 * GRAMS_TO_OUNCES },
    { grams: 100, ounces: 100 * GRAMS_TO_OUNCES },
    { grams: 28.35, ounces: 28.35 * GRAMS_TO_OUNCES },
    { grams: 500, ounces: 500 * GRAMS_TO_OUNCES },
  ];

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="grams"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Grams (g)</FormLabel>
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
            <p className="text-3xl font-bold text-center">{result.toFixed(4)} oz</p>
          </CardContent>
        </Card>
      )}
      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold mb-2">Formula & Explanation</h3>
          <div className="text-muted-foreground space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-1">Formula</h4>
              <p className='font-mono p-2 bg-muted rounded-md'>Ounces = Grams × 0.035274</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Step-by-step explanation</h4>
              <p>One avoirdupois ounce is defined as approximately 28.3495 grams. To convert from grams to ounces, you divide the mass in grams by 28.3495, which is equivalent to multiplying by approximately 0.035274.</p>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Conversion Table</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Grams (g)</TableHead>
                <TableHead className="text-right">Ounces (oz)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {conversionTable.map((item) => (
                <TableRow key={item.grams}>
                  <TableCell>{item.grams}</TableCell>
                  <TableCell className="text-right">{item.ounces.toFixed(4)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">FAQ</h3>
          <div className="text-muted-foreground space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-1">How many grams are in an ounce?</h4>
              <p>There are approximately 28.35 grams in one avoirdupois ounce.</p>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Related Converters</h3>
          <div className="space-y-2">
            <p><Link href="/category/conversions/ounces-to-grams-converter" className="text-primary underline">Ounces to Grams Converter</Link></p>
            <p><Link href="/category/conversions/kilograms-to-pounds-converter" className="text-primary underline">Kilograms to Pounds Converter</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
