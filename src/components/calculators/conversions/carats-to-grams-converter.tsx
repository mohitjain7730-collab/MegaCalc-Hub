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
  carats: z.coerce.number().positive('Must be a positive number'),
});

type FormValues = z.infer<typeof formSchema>;

const CARATS_TO_GRAMS = 0.2;

export default function CaratsToGramsConverter() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      carats: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    setResult(values.carats * CARATS_TO_GRAMS);
  };

  const conversionTable = [
    { carats: 1, grams: 1 * CARATS_TO_GRAMS },
    { carats: 5, grams: 5 * CARATS_TO_GRAMS },
    { carats: 10, grams: 10 * CARATS_TO_GRAMS },
    { carats: 50, grams: 50 * CARATS_TO_GRAMS },
  ];

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="carats"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Carats (ct)</FormLabel>
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
              <p className='font-mono p-2 bg-muted rounded-md'>Grams = Carats × 0.2</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Step-by-step explanation</h4>
              <p>The metric carat is internationally defined as exactly 200 milligrams, or 0.2 grams. To convert carats to grams, you simply multiply the number of carats by 0.2. For example, a 5-carat diamond weighs 5 × 0.2 = 1 gram.</p>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Conversion Table</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Carats (ct)</TableHead>
                <TableHead className="text-right">Grams (g)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {conversionTable.map((item) => (
                <TableRow key={item.carats}>
                  <TableCell>{item.carats}</TableCell>
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
              <h4 className="font-semibold text-foreground mb-1">What is a carat?</h4>
              <p>The carat is a unit of mass used for measuring gemstones and pearls. It's important not to confuse it with "karat," which is a measure of gold purity.</p>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Related Converters</h3>
          <div className="space-y-2">
            <p><Link href="/category/conversions/grams-to-carats-converter" className="text-primary underline">Grams to Carats Converter</Link></p>
            <p><Link href="/category/conversions/grams-to-ounces-converter" className="text-primary underline">Grams to Ounces Converter</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
