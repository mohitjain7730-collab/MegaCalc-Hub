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
  acres: z.coerce.number().positive('Must be a positive number'),
});

type FormValues = z.infer<typeof formSchema>;

const ACRES_TO_SQ_MILES = 1 / 640;

export default function AcresToSquareMilesConverter() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      acres: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    setResult(values.acres * ACRES_TO_SQ_MILES);
  };

  const conversionTable = [
    { acres: 1, sqMiles: 1 * ACRES_TO_SQ_MILES },
    { acres: 100, sqMiles: 100 * ACRES_TO_SQ_MILES },
    { acres: 640, sqMiles: 640 * ACRES_TO_SQ_MILES },
    { acres: 1000, sqMiles: 1000 * ACRES_TO_SQ_MILES },
  ];

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="acres"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Acres</FormLabel>
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
            <p className="text-3xl font-bold text-center">{result.toFixed(4)} mi²</p>
          </CardContent>
        </Card>
      )}
      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold mb-2">Formula & Explanation</h3>
          <div className="text-muted-foreground space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-1">Formula</h4>
              <p className='font-mono p-2 bg-muted rounded-md'>Square Miles = Acres / 640</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Step-by-step explanation</h4>
              <p>A square mile is legally defined as containing exactly 640 acres. To convert acres to square miles, you simply divide the number of acres by 640. For example, a large ranch of 1280 acres is equal to 1280 / 640 = 2 square miles.</p>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Conversion Table</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Acres</TableHead>
                <TableHead className="text-right">Square Miles (mi²)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {conversionTable.map((item) => (
                <TableRow key={item.acres}>
                  <TableCell>{item.acres}</TableCell>
                  <TableCell className="text-right">{item.sqMiles.toFixed(4)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">FAQ</h3>
          <div className="text-muted-foreground space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-1">How many acres are in one square mile?</h4>
              <p>There are exactly 640 acres in one square mile. This is a standard unit used in land surveying in the United States.</p>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Related Converters</h3>
          <div className="space-y-2">
            <p><Link href="/category/conversions/square-miles-to-acres-converter" className="text-primary underline">Square Miles to Acres Converter</Link></p>
            <p><Link href="/category/conversions/acres-to-square-meters-converter" className="text-primary underline">Acres to Square Meters Converter</Link></p>
            <p><Link href="/category/conversions/hectares-to-acres-converter" className="text-primary underline">Hectares to Acres Converter</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
