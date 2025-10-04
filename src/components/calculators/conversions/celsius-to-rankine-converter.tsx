
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
  celsius: z.coerce.number(),
});

type FormValues = z.infer<typeof formSchema>;

export default function CelsiusToRankineConverter() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      celsius: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    setResult((values.celsius * 9/5) + 491.67);
  };

  const conversionTable = [
    { celsius: 100, rankine: (100 * 9/5) + 491.67 },
    { celsius: 0, rankine: (0 * 9/5) + 491.67 },
    { celsius: -273.15, rankine: (-273.15 * 9/5) + 491.67 },
  ];

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="celsius"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Celsius (°C)</FormLabel>
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
              <p className='font-mono p-2 bg-muted rounded-md'>°R = (°C × 9/5) + 491.67</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Step-by-step explanation</h4>
              <p>To convert Celsius to Rankine, first convert Celsius to Fahrenheit by multiplying by 9/5 and adding 32. Then, convert Fahrenheit to Rankine by adding 459.67. The combined formula simplifies to multiplying Celsius by 9/5 and adding 491.67.</p>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Conversion Table</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Celsius (°C)</TableHead>
                <TableHead className="text-right">Rankine (°R)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {conversionTable.map((item) => (
                <TableRow key={item.celsius}>
                  <TableCell>{item.celsius}</TableCell>
                  <TableCell className="text-right">{item.rankine.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Related Converters</h3>
          <div className="space-y-2">
            <p><Link href="/category/conversions/rankine-to-celsius-converter" className="text-primary underline">Rankine to Celsius Converter</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}

    