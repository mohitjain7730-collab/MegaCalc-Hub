
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
  fahrenheit: z.coerce.number(),
});

type FormValues = z.infer<typeof formSchema>;

export default function FahrenheitToCelsiusConverter() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fahrenheit: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    setResult((values.fahrenheit - 32) * 5/9);
  };

  const conversionTable = [
    { fahrenheit: -40, celsius: (-40 - 32) * 5/9 },
    { fahrenheit: 32, celsius: (32 - 32) * 5/9 },
    { fahrenheit: 50, celsius: (50 - 32) * 5/9 },
    { fahrenheit: 68, celsius: (68 - 32) * 5/9 },
    { fahrenheit: 98.6, celsius: (98.6 - 32) * 5/9 },
    { fahrenheit: 212, celsius: (212 - 32) * 5/9 },
  ];

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="fahrenheit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fahrenheit (°F)</FormLabel>
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
              <p className='font-mono p-2 bg-muted rounded-md'>°C = (°F - 32) × 5/9</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Step-by-step explanation</h4>
              <p>To convert from Fahrenheit to Celsius, you first subtract 32 from the Fahrenheit temperature, and then multiply the result by 5/9. This accounts for the different starting points and interval scales of the two temperature systems.</p>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Conversion Table</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fahrenheit (°F)</TableHead>
                <TableHead className="text-right">Celsius (°C)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {conversionTable.map((item) => (
                <TableRow key={item.fahrenheit}>
                  <TableCell>{item.fahrenheit}</TableCell>
                  <TableCell className="text-right">{item.celsius.toFixed(1)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">FAQ</h3>
          <div className="text-muted-foreground space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-1">What's the formula to convert °F to °C?</h4>
              <p>The formula is (°F - 32) × 5/9 = °C.</p>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Related Converters</h3>
          <div className="space-y-2">
            <p><Link href="/category/conversions/celsius-to-fahrenheit-converter" className="text-primary underline">Celsius to Fahrenheit Converter</Link></p>
            <p><Link href="/category/conversions/fahrenheit-to-kelvin-converter" className="text-primary underline">Fahrenheit to Kelvin Converter</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
