
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
  lbs: z.coerce.number().positive('Must be a positive number'),
});

type FormValues = z.infer<typeof formSchema>;

const LBS_TO_STONES = 1 / 14;

export default function PoundsToStonesConverter() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      lbs: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    setResult(values.lbs * LBS_TO_STONES);
  };

  const conversionTable = [
    { lbs: 1, stones: 1 * LBS_TO_STONES },
    { lbs: 14, stones: 14 * LBS_TO_STONES },
    { lbs: 50, stones: 50 * LBS_TO_STONES },
    { lbs: 140, stones: 140 * LBS_TO_STONES },
  ];

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="lbs"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pounds (lbs)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} onChange={field.onChange} />
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
            <p className="text-3xl font-bold text-center">{result.toFixed(2)} st</p>
          </CardContent>
        </Card>
      )}
      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold mb-2">Formula & Explanation</h3>
          <div className="text-muted-foreground space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-1">Formula</h4>
              <p className='font-mono p-2 bg-muted rounded-md'>Stones = Pounds / 14</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Step-by-step explanation</h4>
              <p>There are exactly 14 pounds in one stone. To convert from pounds to stones, you simply divide the mass in pounds by 14.</p>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Conversion Table</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pounds (lbs)</TableHead>
                <TableHead className="text-right">Stones (st)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {conversionTable.map((item) => (
                <TableRow key={item.lbs}>
                  <TableCell>{item.lbs}</TableCell>
                  <TableCell className="text-right">{item.stones.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">FAQ</h3>
          <div className="text-muted-foreground space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-1">What is a stone?</h4>
              <p>A stone is a unit of weight in the imperial system, used primarily in the United Kingdom and Ireland, commonly for measuring body weight.</p>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Related Converters</h3>
          <div className="space-y-2">
            <p><Link href="/category/conversions/stones-to-pounds-converter" className="text-primary underline">Stones to Pounds Converter</Link></p>
            <p><Link href="/category/conversions/pounds-to-kilograms-converter" className="text-primary underline">Pounds to Kilograms Converter</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
