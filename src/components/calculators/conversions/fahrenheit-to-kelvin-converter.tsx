
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

export default function FahrenheitToKelvinConverter() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fahrenheit: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    setResult((values.fahrenheit - 32) * 5/9 + 273.15);
  };

  const conversionTable = [
    { fahrenheit: 212, kelvin: (212 - 32) * 5/9 + 273.15 },
    { fahrenheit: 98.6, kelvin: (98.6 - 32) * 5/9 + 273.15 },
    { fahrenheit: 32, kelvin: (32 - 32) * 5/9 + 273.15 },
    { fahrenheit: -459.67, kelvin: (-459.67 - 32) * 5/9 + 273.15 },
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
            <p className="text-3xl font-bold text-center">{result.toFixed(2)} K</p>
          </CardContent>
        </Card>
      )}
      <div className="space-y-8" data-orientation="vertical">
        <div>
          <h3 className="text-lg font-semibold mb-2">Formula & Explanation</h3>
          <div className="text-muted-foreground space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-1">Formula</h4>
              <p className='font-mono p-2 bg-muted rounded-md'>K = (°F - 32) × 5/9 + 273.15</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Step-by-step explanation</h4>
              <p>To convert from Fahrenheit to Kelvin, you first convert Fahrenheit to Celsius by subtracting 32 and multiplying by 5/9. Then, you convert the Celsius temperature to Kelvin by adding 273.15.</p>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Conversion Table</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fahrenheit (°F)</TableHead>
                <TableHead className="text-right">Kelvin (K)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {conversionTable.map((item) => (
                <TableRow key={item.fahrenheit}>
                  <TableCell>{item.fahrenheit}</TableCell>
                  <TableCell className="text-right">{item.kelvin.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Related Converters</h3>
          <div className="space-y-2">
            <p><Link href="/category/conversions/kelvin-to-fahrenheit-converter" className="text-primary underline">Kelvin to Fahrenheit Converter</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}

    