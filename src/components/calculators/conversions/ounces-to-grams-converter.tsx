
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
  ounces: z.coerce.number().positive('Must be a positive number'),
});

type FormValues = z.infer<typeof formSchema>;

const OUNCES_TO_GRAMS = 28.3495;

export default function OuncesToGramsConverter() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ounces: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    setResult(values.ounces * OUNCES_TO_GRAMS);
  };

  const conversionTable = [
    { ounces: 1, grams: 1 * OUNCES_TO_GRAMS },
    { ounces: 8, grams: 8 * OUNCES_TO_GRAMS },
    { ounces: 16, grams: 16 * OUNCES_TO_GRAMS },
    { ounces: 35.274, grams: 35.274 * OUNCES_TO_GRAMS },
  ];

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="ounces"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ounces (oz)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} onChange={field.onChange} />
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
            <p className="text-3xl font-bold text-center">{result.toFixed(2)} g</p>
          </CardContent>
        </Card>
      )}
      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold mb-2">Formula & Explanation</h3>
          <div className="text-muted-foreground space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-1">Formula</h4>
              <p className='font-mono p-2 bg-muted rounded-md'>Grams = Ounces × 28.3495</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Step-by-step explanation</h4>
              <p>One avoirdupois ounce is internationally defined as approximately 28.3495 grams. To convert from ounces to grams, you simply multiply the mass in ounces by this conversion factor.</p>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Conversion Table</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ounces (oz)</TableHead>
                <TableHead className="text-right">Grams (g)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {conversionTable.map((item) => (
                <TableRow key={item.ounces}>
                  <TableCell>{item.ounces}</TableCell>
                  <TableCell className="text-right">{item.grams.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">FAQ</h3>
          <div className="text-muted-foreground space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-1">How many ounces in a pound?</h4>
              <p>There are 16 avoirdupois ounces in one avoirdupois pound.</p>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Related Converters</h3>
          <div className="space-y-2">
            <p><Link href="/category/conversions/grams-to-ounces-converter" className="text-primary underline">Grams to Ounces Converter</Link></p>
            <p><Link href="/category/conversions/pounds-to-kilograms-converter" className="text-primary underline">Pounds to Kilograms Converter</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
