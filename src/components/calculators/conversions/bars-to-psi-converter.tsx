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

const BAR_TO_PSI = 14.5038;

export default function BarsToPsiConverter() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { bars: undefined },
  });

  const onSubmit = (values: FormValues) => {
    setResult(values.bars * BAR_TO_PSI);
  };

  const conversionTable = [
    { bar: 1, psi: 1 * BAR_TO_PSI },
    { bar: 2, psi: 2 * BAR_TO_PSI },
    { bar: 10, psi: 10 * BAR_TO_PSI },
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
            <p className="text-3xl font-bold text-center">{result.toFixed(2)} psi</p>
          </CardContent>
        </Card>
      )}
      <div>
        <h3 className="text-lg font-semibold mb-2">Formula & Explanation</h3>
        <div className="text-muted-foreground space-y-4">
          <p className='font-mono p-2 bg-muted rounded-md'>psi = bar × 14.5038</p>
          <p>Multiply the pressure in bars by 14.5038 to get the pressure in pounds per square inch.</p>
        </div>
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2">Use Cases</h3>
        <p className="text-muted-foreground">Often used in automotive and industrial contexts to convert metric pressure units (bar) to the imperial unit (psi) common in the US.</p>
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2">Conversion Table</h3>
        <Table>
          <TableHeader><TableRow><TableHead>Bars (bar)</TableHead><TableHead className="text-right">PSI</TableHead></TableRow></TableHeader>
          <TableBody>
            {conversionTable.map((item) => (
              <TableRow key={item.bar}>
                <TableCell>{item.bar}</TableCell>
                <TableCell className="text-right">{item.psi.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
       <div>
          <h3 className="text-lg font-semibold mb-2">Related Converters</h3>
          <div className="space-y-2">
            <p><Link href="/category/conversions/psi-to-bars-converter" className="text-primary underline">PSI to Bars Converter</Link></p>
          </div>
        </div>
    </div>
  );
}
