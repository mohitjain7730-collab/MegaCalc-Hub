
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const formSchema = z.object({
  years: z.coerce.number().nonnegative('Must be a positive number'),
});

type FormValues = z.infer<typeof formSchema>;

const YEARS_TO_MONTHS = 12;

export default function YearsToMonthsConverter() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { years: undefined },
  });

  const yearsValue = form.watch('years');

  useEffect(() => {
    if (yearsValue !== undefined && !isNaN(yearsValue)) {
      setResult(yearsValue * YEARS_TO_MONTHS);
    } else {
      setResult(null);
    }
  }, [yearsValue]);

  const conversionTable = [
    { year: 1, month: 12 },
    { year: 2, month: 24 },
    { year: 5, month: 60 },
    { year: 10, month: 120 },
    { year: 30, month: 360 },
  ];

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
          <FormField
            control={form.control}
            name="years"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Years</FormLabel>
                <FormControl>
                  <Input type="number" {...field} value={field.value ?? ''} onChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
      {result !== null && (
        <Card className="mt-8">
          <CardHeader>
            <div className='flex items-center gap-4'>
              <Calendar className="h-8 w-8 text-primary" />
              <CardTitle>Conversion Result</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-center">{result.toLocaleString()} months</p>
          </CardContent>
        </Card>
      )}
      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold mb-2">Formula & Explanation</h3>
          <div className="text-muted-foreground space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-1">Formula</h4>
              <p className='font-mono p-2 bg-muted rounded-md'>Months = Years × 12</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Example</h4>
              <p>A 5-year loan term is equivalent to `5 × 12 = 60 months`.</p>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Use Cases</h3>
          <p className="text-muted-foreground">Essential for financial planning, particularly for converting loan terms or investment horizons from years into months for periodic calculations.</p>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Conversion Table</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Years</TableHead>
                <TableHead className="text-right">Months</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {conversionTable.map((item) => (
                <TableRow key={item.year}>
                  <TableCell>{item.year}</TableCell>
                  <TableCell className="text-right">{item.month}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">FAQ</h3>
          <div className="text-muted-foreground space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-1">How many months in 2.5 years?</h4>
              <p>2.5 years is equal to 30 months (2.5 × 12).</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

    