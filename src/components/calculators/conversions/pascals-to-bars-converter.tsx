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
  pascals: z.coerce.number().positive('Must be a positive number'),
});

type FormValues = z.infer<typeof formSchema>;

const PA_TO_BAR = 1 / 100000;

export default function PascalsToBarsConverter() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { pascals: undefined },
  });

  const onSubmit = (values: FormValues) => {
    setResult(values.pascals * PA_TO_BAR);
  };

  const conversionTable = [
    { pa: 1, bar: 1 * PA_TO_BAR },
    { pa: 1000, bar: 1000 * PA_TO_BAR },
    { pa: 100000, bar: 1 },
    { pa: 101325, bar: 1.01325 },
  ];

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="pascals"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pascals (Pa)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
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
            <p className="text-3xl font-bold text-center">{result.toFixed(5)} bar</p>
          </CardContent>
        </Card>
      )}
      <div>
        <h3 className="text-lg font-semibold mb-2">Formula & Explanation</h3>
        <div className="text-muted-foreground space-y-4">
          <p className='font-mono p-2 bg-muted rounded-md'>bar = Pa / 100,000</p>
          <p>One bar is defined as 100,000 Pascals. To convert Pascals to bars, you divide by 100,000.</p>
        </div>
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2">Example Conversions</h3>
        <p>Standard atmospheric pressure (101,325 Pa) is equal to `101325 / 100000 = 1.01325 bar`.</p>
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2">Use Cases</h3>
        <p className="text-muted-foreground">The bar is a convenient unit for meteorology and diving, while the Pascal is the standard SI unit.</p>
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2">Conversion Table</h3>
        <Table>
          <TableHeader><TableRow><TableHead>Pascals (Pa)</TableHead><TableHead className="text-right">Bars (bar)</TableHead></TableRow></TableHeader>
          <TableBody>
            {conversionTable.map((item) => (
              <TableRow key={item.pa}>
                <TableCell>{item.pa.toLocaleString()}</TableCell>
                <TableCell className="text-right">{item.bar.toFixed(5)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
       <div>
          <h3 className="text-lg font-semibold mb-2">Related Converters</h3>
          <div className="space-y-2">
            <p><Link href="/category/conversions/bars-to-pascals-converter" className="text-primary underline">Bars to Pascals Converter</Link></p>
          </div>
        </div>
    </div>
  );
}
