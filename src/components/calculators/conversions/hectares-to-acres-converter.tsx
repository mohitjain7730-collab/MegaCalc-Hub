
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
  hectares: z.number().positive('Must be a positive number'),
});

type FormValues = z.infer<typeof formSchema>;

const HECTARES_TO_ACRES = 2.47105;

export default function HectaresToAcresConverter() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      hectares: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    setResult(values.hectares * HECTARES_TO_ACRES);
  };

  const conversionTable = [
    { hectares: 1, acres: 1 * HECTARES_TO_ACRES },
    { hectares: 5, acres: 5 * HECTARES_TO_ACRES },
    { hectares: 10, acres: 10 * HECTARES_TO_ACRES },
    { hectares: 100, acres: 100 * HECTARES_TO_ACRES },
  ];

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="hectares"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hectares (ha)</FormLabel>
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
            <p className="text-3xl font-bold text-center">{result.toFixed(3)} acres</p>
          </CardContent>
        </Card>
      )}
      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold mb-2">Formula & Explanation</h3>
          <div className="text-muted-foreground space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-1">Formula</h4>
              <p className='font-mono p-2 bg-muted rounded-md'>Acres = Hectares × 2.47105</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Step-by-step explanation</h4>
              <p>One hectare is an area of 10,000 square meters. An acre is approximately 4,046.86 square meters. To convert from hectares to acres, you multiply the number of hectares by the conversion factor of 2.47105. For example, a 10-hectare park is 10 × 2.47105 = 24.71 acres.</p>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Conversion Table</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Hectares (ha)</TableHead>
                <TableHead className="text-right">Acres</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {conversionTable.map((item) => (
                <TableRow key={item.hectares}>
                  <TableCell>{item.hectares}</TableCell>
                  <TableCell className="text-right">{item.acres.toFixed(3)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">FAQ</h3>
          <div className="text-muted-foreground space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-1">Is a hectare bigger than an acre?</h4>
              <p>Yes, a hectare is significantly larger than an acre. One hectare is almost 2.5 times the size of an acre.</p>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Related Converters</h3>
          <div className="space-y-2">
            <p><Link href="/category/conversions/acres-to-hectares-converter" className="text-primary underline">Acres to Hectares Converter</Link></p>
            <p><Link href="/category/conversions/hectares-to-square-kilometers-converter" className="text-primary underline">Hectares to Square Kilometers Converter</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
