
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
  sqFeet: z.number().positive('Must be a positive number'),
});

type FormValues = z.infer<typeof formSchema>;

const SQ_FEET_TO_SQ_YARDS = 1 / 9;

export default function SquareFeetToSquareYardsConverter() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sqFeet: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    setResult(values.sqFeet * SQ_FEET_TO_SQ_YARDS);
  };

  const conversionTable = [
    { sqFeet: 1, sqYards: 1 * SQ_FEET_TO_SQ_YARDS },
    { sqFeet: 9, sqYards: 9 * SQ_FEET_TO_SQ_YARDS },
    { sqFeet: 50, sqYards: 50 * SQ_FEET_TO_SQ_YARDS },
    { sqFeet: 100, sqYards: 100 * SQ_FEET_TO_SQ_YARDS },
  ];

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="sqFeet"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Square Feet (ft²)</FormLabel>
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
            <p className="text-3xl font-bold text-center">{result.toFixed(2)} yd²</p>
          </CardContent>
        </Card>
      )}
      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold mb-2">Formula & Explanation</h3>
          <div className="text-muted-foreground space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-1">Formula</h4>
              <p className='font-mono p-2 bg-muted rounded-md'>Square Yards = Square Feet / 9</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Step-by-step explanation</h4>
              <p>Since 1 yard is equal to 3 feet, 1 square yard is 3 feet × 3 feet = 9 square feet. To convert square feet to square yards, you simply divide the number of square feet by 9. For example, a room that is 180 square feet is equal to 180 / 9 = 20 square yards.</p>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Conversion Table</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Square Feet (ft²)</TableHead>
                <TableHead className="text-right">Square Yards (yd²)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {conversionTable.map((item) => (
                <TableRow key={item.sqFeet}>
                  <TableCell>{item.sqFeet}</TableCell>
                  <TableCell className="text-right">{item.sqYards.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">FAQ</h3>
          <div className="text-muted-foreground space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-1">How many square feet are in a square yard?</h4>
              <p>There are exactly 9 square feet in one square yard.</p>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Related Converters</h3>
          <div className="space-y-2">
            <p><Link href="/category/conversions/square-yards-to-square-feet-converter" className="text-primary underline">Square Yards to Square Feet Converter</Link></p>
            <p><Link href="/category/conversions/square-meters-to-square-feet-converter" className="text-primary underline">Square Meters to Square Feet Converter</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
