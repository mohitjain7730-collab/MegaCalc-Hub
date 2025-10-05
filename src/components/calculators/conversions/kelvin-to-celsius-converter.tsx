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

export default function KelvinToCelsiusConverter() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      kelvin: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    setResult(values.kelvin - 273.15);
  };

  const conversionTable = [
    { kelvin: 373.15, celsius: 373.15 - 273.15 },
    { kelvin: 310.15, celsius: 310.15 - 273.15 },
    { kelvin: 273.15, celsius: 273.15 - 273.15 },
    { kelvin: 0, celsius: 0 - 273.15 },
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
            <p className="text-3xl font-bold text-center">{result.toFixed(2)} °C</p>
          </CardContent>
        </Card>
      )}
      <div className="space-y-8" data-orientation="vertical">
        <div>
          <h3 className="text-lg font-semibold mb-2">Formula & Explanation</h3>
          <div className="text-muted-foreground space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-1">Formula</h4>
              <p className='font-mono p-2 bg-muted rounded-md'>°C = K - 273.15</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Step-by-step explanation</h4>
              <p>The size of one degree Celsius is the same as one Kelvin. To convert from Kelvin to Celsius, you simply subtract 273.15.</p>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Conversion Table</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kelvin (K)</TableHead>
                <TableHead className="text-right">Celsius (°C)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {conversionTable.map((item) => (
                <TableRow key={item.kelvin}>
                  <TableCell>{item.kelvin}</TableCell>
                  <TableCell className="text-right">{item.celsius.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Related Converters</h3>
          <div className="space-y-2">
            <p><Link href="/category/conversions/celsius-to-kelvin-converter" className="text-primary underline">Celsius to Kelvin Converter</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
