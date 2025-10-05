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

export default function KelvinToReaumurConverter() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      kelvin: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    setResult((values.kelvin - 273.15) * 0.8);
  };

  const conversionTable = [
    { kelvin: 373.15, reaumur: (373.15 - 273.15) * 0.8 },
    { kelvin: 273.15, reaumur: (273.15 - 273.15) * 0.8 },
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
            <p className="text-3xl font-bold text-center">{result.toFixed(2)} °Ré</p>
          </CardContent>
        </Card>
      )}
      <div className="space-y-8" data-orientation="vertical">
        <div>
          <h3 className="text-lg font-semibold mb-2">Formula & Explanation</h3>
          <div className="text-muted-foreground space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-1">Formula</h4>
              <p className='font-mono p-2 bg-muted rounded-md'>°Ré = (K - 273.15) × 0.8</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Step-by-step explanation</h4>
              <p>First, convert Kelvin to Celsius by subtracting 273.15. Then, convert the Celsius value to Réaumur by multiplying by 0.8 (or 4/5).</p>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Conversion Table</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kelvin (K)</TableHead>
                <TableHead className="text-right">Réaumur (°Ré)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {conversionTable.map((item) => (
                <TableRow key={item.kelvin}>
                  <TableCell>{item.kelvin}</TableCell>
                  <TableCell className="text-right">{item.reaumur.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Related Converters</h3>
          <div className="space-y-2">
            <p><Link href="/category/conversions/reaumur-to-kelvin-converter" className="text-primary underline">Réaumur to Kelvin Converter</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
