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
  kelvin: z.coerce.number(),
});

type FormValues = z.infer<typeof formSchema>;

export default function KelvinToRankineConverter() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      kelvin: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    setResult(values.kelvin * 9/5);
  };

  const conversionTable = [
    { kelvin: 373.15, rankine: 373.15 * 9/5 },
    { kelvin: 273.15, rankine: 273.15 * 9/5 },
    { kelvin: 0, rankine: 0 * 9/5 },
  ];

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="kelvin"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kelvin (K)</FormLabel>
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
            <p className="text-3xl font-bold text-center">{result.toFixed(2)} °R</p>
          </CardContent>
        </Card>
      )}
      <div className="space-y-8" data-orientation="vertical">
        <div>
          <h3 className="text-lg font-semibold mb-2">Formula & Explanation</h3>
          <div className="text-muted-foreground space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-1">Formula</h4>
              <p className='font-mono p-2 bg-muted rounded-md'>°R = K × 9/5</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Step-by-step explanation</h4>
              <p>Both Kelvin and Rankine are absolute temperature scales, meaning their zero points are absolute zero. The only difference is the size of their degrees. To convert from Kelvin to Rankine, you simply multiply by 9/5 (or 1.8).</p>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Conversion Table</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kelvin (K)</TableHead>
                <TableHead className="text-right">Rankine (°R)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {conversionTable.map((item) => (
                <TableRow key={item.kelvin}>
                  <TableCell>{item.kelvin}</TableCell>
                  <TableCell className="text-right">{item.rankine.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Related Converters</h3>
          <div className="space-y-2">
            <p><Link href="/category/conversions/rankine-to-kelvin-converter" className="text-primary underline">Rankine to Kelvin Converter</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
