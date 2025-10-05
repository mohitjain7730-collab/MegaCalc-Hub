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
  bars: z.coerce.number().positive('Must be a positive number'),
});

type FormValues = z.infer<typeof formSchema>;

const BAR_TO_PA = 100000;

export default function BarsToPascalsConverter() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { bars: undefined },
  });

  const onSubmit = (values: FormValues) => {
    setResult(values.bars * BAR_TO_PA);
  };

  const conversionTable = [
    { bar: 1, pa: 1 * BAR_TO_PA },
    { bar: 1.01325, pa: 1.01325 * BAR_TO_PA }, // 1 atm
    { bar: 2, pa: 2 * BAR_TO_PA },
  ];

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="bars"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bars (bar)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value))} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Convert</Button>
        </form>
      </Form>
      {result !== null && (
        <Card>
          <CardHeader>
            <div className='flex items-center gap-4'>
              <ArrowRightLeft className="h-8 w-8 text-primary" />
              <CardTitle>Conversion Result</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-center">{result.toLocaleString()} Pa</p>
          </CardContent>
        </Card>
      )}
      <div>
        <h3 className="text-lg font-semibold mb-2">Formula & Explanation</h3>
        <div className="text-muted-foreground space-y-4">
          <p className='font-mono p-2 bg-muted rounded-md'>Pa = bar × 100,000</p>
          <p>Multiply the pressure in bars by 100,000 to get the pressure in Pascals.</p>
        </div>
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2">Example Conversions</h3>
        <p>A pressure of 2.5 bar in a tire is equal to `2.5 * 100000 = 250,000 Pa`.</p>
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2">Conversion Table</h3>
        <Table>
          <TableHeader><TableRow><TableHead>Bars (bar)</TableHead><TableHead className="text-right">Pascals (Pa)</TableHead></TableRow></TableHeader>
          <TableBody>
            {conversionTable.map((item) => (
              <TableRow key={item.bar}>
                <TableCell>{item.bar}</TableCell>
                <TableCell className="text-right">{item.pa.toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
       <div>
          <h3 className="text-lg font-semibold mb-2">Related Converters</h3>
          <div className="space-y-2">
            <p><Link href="/category/conversions/pascals-to-bars-converter" className="text-primary underline">Pascals to Bars Converter</Link></p>
          </div>
        </div>
    </div>
  );
}
