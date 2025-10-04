
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
  acres: z.number().positive('Must be a positive number'),
});

type FormValues = z.infer<typeof formSchema>;

const ACRES_TO_HECTARES = 0.404686;

export default function AcresToHectaresConverter() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      acres: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    setResult(values.acres * ACRES_TO_HECTARES);
  };

  const conversionTable = [
    { acres: 1, hectares: 1 * ACRES_TO_HECTARES },
    { acres: 5, hectares: 5 * ACRES_TO_HECTARES },
    { acres: 10, hectares: 10 * ACRES_TO_HECTARES },
    { acres: 100, hectares: 100 * ACRES_TO_HECTARES },
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
            <p className="text-3xl font-bold text-center">{result.toFixed(3)} hectares</p>
          </CardContent>
        </Card>
      )}
      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold mb-2">Formula & Explanation</h3>
          <div className="text-muted-foreground space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-1">Formula</h4>
              <p className='font-mono p-2 bg-muted rounded-md'>Hectares = Acres × 0.404686</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Step-by-step explanation</h4>
              <p>One acre is defined as 4,046.856 square meters, and one hectare is 10,000 square meters. Therefore, to convert acres to hectares, you multiply the number of acres by 0.404686.</p>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Conversion Table</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Acres</TableHead>
                <TableHead className="text-right">Hectares (ha)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {conversionTable.map((item) => (
                <TableRow key={item.acres}>
                  <TableCell>{item.acres}</TableCell>
                  <TableCell className="text-right">{item.hectares.toFixed(3)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">FAQ</h3>
          <div className="text-muted-foreground space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-1">Is an acre bigger than a hectare?</h4>
              <p>No, a hectare is larger than an acre. One hectare is approximately 2.47 acres.</p>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Related Converters</h3>
          <div className="space-y-2">
            <p><Link href="/category/conversions/hectares-to-acres-converter" className="text-primary underline">Hectares to Acres Converter</Link></p>
            <p><Link href="/category/conversions/acres-to-square-meters-converter" className="text-primary underline">Acres to Square Meters Converter</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
