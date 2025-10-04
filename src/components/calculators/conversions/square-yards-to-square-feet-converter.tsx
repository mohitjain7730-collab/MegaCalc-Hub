
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
  sqYards: z.number().positive('Must be a positive number'),
});

type FormValues = z.infer<typeof formSchema>;

const SQ_YARDS_TO_SQ_FEET = 9;

export default function SquareYardsToSquareFeetConverter() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sqYards: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    setResult(values.sqYards * SQ_YARDS_TO_SQ_FEET);
  };

  const conversionTable = [
    { sqYards: 1, sqFeet: 1 * SQ_YARDS_TO_SQ_FEET },
    { sqYards: 10, sqFeet: 10 * SQ_YARDS_TO_SQ_FEET },
    { sqYards: 50, sqFeet: 50 * SQ_YARDS_TO_SQ_FEET },
    { sqYards: 100, sqFeet: 100 * SQ_YARDS_TO_SQ_FEET },
  ];

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="sqYards"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Square Yards (yd²)</FormLabel>
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
            <p className="text-3xl font-bold text-center">{result.toLocaleString()} ft²</p>
          </CardContent>
        </Card>
      )}
      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold mb-2">Formula & Explanation</h3>
          <div className="text-muted-foreground space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-1">Formula</h4>
              <p className='font-mono p-2 bg-muted rounded-md'>Square Feet = Square Yards × 9</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Step-by-step explanation</h4>
              <p>Since 1 yard is equal to 3 feet, 1 square yard is 3 feet × 3 feet = 9 square feet. To convert square yards to square feet, you simply multiply the number of square yards by 9.</p>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Conversion Table</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Square Yards (yd²)</TableHead>
                <TableHead className="text-right">Square Feet (ft²)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {conversionTable.map((item) => (
                <TableRow key={item.sqYards}>
                  <TableCell>{item.sqYards}</TableCell>
                  <TableCell className="text-right">{item.sqFeet.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Related Converters</h3>
          <div className="space-y-2">
            <p><Link href="/category/conversions/square-feet-to-square-yards-converter" className="text-primary underline">Square Feet to Square Yards Converter</Link></p>
            <p><Link href="/category/conversions/square-meters-to-square-yards-converter" className="text-primary underline">Square Meters to Square Yards Converter</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
