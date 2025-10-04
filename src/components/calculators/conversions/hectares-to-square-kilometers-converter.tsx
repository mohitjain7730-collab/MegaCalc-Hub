
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
  hectares: z.number().positive('Must be a positive number'),
});

type FormValues = z.infer<typeof formSchema>;

const HECTARES_TO_SQ_KM = 0.01;

export default function HectaresToSquareKilometersConverter() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      hectares: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    setResult(values.hectares * HECTARES_TO_SQ_KM);
  };

  const conversionTable = [
    { hectares: 1, sqKm: 1 * HECTARES_TO_SQ_KM },
    { hectares: 10, sqKm: 10 * HECTARES_TO_SQ_KM },
    { hectares: 100, sqKm: 100 * HECTARES_TO_SQ_KM },
    { hectares: 1000, sqKm: 1000 * HECTARES_TO_SQ_KM },
  ];

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="hectares"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hectares (ha)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))} />
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
            <p className="text-3xl font-bold text-center">{result.toFixed(2)} km²</p>
          </CardContent>
        </Card>
      )}
      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold mb-2">Formula & Explanation</h3>
          <div className="text-muted-foreground space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-1">Formula</h4>
              <p className='font-mono p-2 bg-muted rounded-md'>Square Kilometers = Hectares × 0.01</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Step-by-step explanation</h4>
              <p>One square kilometer is equal to 100 hectares. Therefore, to convert hectares to square kilometers, you simply divide the number of hectares by 100 (or multiply by 0.01). For example, a 500-hectare park is equal to 500 / 100 = 5 square kilometers.</p>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Conversion Table</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Hectares (ha)</TableHead>
                <TableHead className="text-right">Square Kilometers (km²)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {conversionTable.map((item) => (
                <TableRow key={item.hectares}>
                  <TableCell>{item.hectares}</TableCell>
                  <TableCell className="text-right">{item.sqKm.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">FAQ</h3>
          <div className="text-muted-foreground space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-1">What is a hectare?</h4>
              <p>A hectare is a metric unit of area, defined as 10,000 square meters. It is commonly used for measuring land.</p>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Related Converters</h3>
          <div className="space-y-2">
            <p><Link href="/category/conversions/square-kilometers-to-hectares-converter" className="text-primary underline">Square Kilometers to Hectares Converter</Link></p>
            <p><Link href="/category/conversions/hectares-to-acres-converter" className="text-primary underline">Hectares to Acres Converter</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
