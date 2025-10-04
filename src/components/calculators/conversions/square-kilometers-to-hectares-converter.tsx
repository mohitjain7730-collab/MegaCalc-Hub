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
  sqKm: z.coerce.number().positive('Must be a positive number'),
});

type FormValues = z.infer<typeof formSchema>;

const SQ_KM_TO_HECTARES = 100;

export default function SquareKilometersToHectaresConverter() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sqKm: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    setResult(values.sqKm * SQ_KM_TO_HECTARES);
  };

  const conversionTable = [
    { sqKm: 1, hectares: 1 * SQ_KM_TO_HECTARES },
    { sqKm: 5, hectares: 5 * SQ_KM_TO_HECTARES },
    { sqKm: 10, hectares: 10 * SQ_KM_TO_HECTARES },
    { sqKm: 50, hectares: 50 * SQ_KM_TO_HECTARES },
  ];

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="sqKm"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Square Kilometers (km²)</FormLabel>
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
            <p className="text-3xl font-bold text-center">{result.toLocaleString()} ha</p>
          </CardContent>
        </Card>
      )}
      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold mb-2">Formula & Explanation</h3>
          <div className="text-muted-foreground space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-1">Formula</h4>
              <p className='font-mono p-2 bg-muted rounded-md'>Hectares = Square Kilometers × 100</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Step-by-step explanation</h4>
              <p>A square kilometer is an area of 1,000 meters by 1,000 meters (1,000,000 m²). A hectare is an area of 100 meters by 100 meters (10,000 m²). Therefore, there are exactly 100 hectares in one square kilometer. To convert, you simply multiply the number of square kilometers by 100.</p>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Conversion Table</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Square Kilometers (km²)</TableHead>
                <TableHead className="text-right">Hectares (ha)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {conversionTable.map((item) => (
                <TableRow key={item.sqKm}>
                  <TableCell>{item.sqKm}</TableCell>
                  <TableCell className="text-right">{item.hectares.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Related Converters</h3>
          <div className="space-y-2">
            <p><Link href="/category/conversions/hectares-to-square-kilometers-converter" className="text-primary underline">Hectares to Square Kilometers Converter</Link></p>
            <p><Link href="/category/conversions/hectares-to-acres-converter" className="text-primary underline">Hectares to Acres Converter</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
