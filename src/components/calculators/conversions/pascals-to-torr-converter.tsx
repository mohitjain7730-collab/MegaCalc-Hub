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
  pascals: z.coerce.number().positive('Must be a positive number'),
});

type FormValues = z.infer<typeof formSchema>;

const PA_TO_TORR = 1 / 133.322;

export default function PascalsToTorrConverter() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { pascals: undefined },
  });

  const onSubmit = (values: FormValues) => {
    setResult(values.pascals * PA_TO_TORR);
  };

  const conversionTable = [
    { pa: 133.322, torr: 1 },
    { pa: 1000, torr: 1000 * PA_TO_TORR },
    { pa: 101325, torr: 760 },
  ];

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="pascals"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pascals (Pa)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Convert</Button>
        </form>
      </Form>
      {result !== null && (
        <Card>
          <CardHeader>
            <div className='flex items-center gap-4'>
              <ArrowRightLeft className="h-8 w-8 text-primary" />
              <CardTitle>Conversion Result</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-center">{result.toFixed(4)} Torr (mmHg)</p>
          </CardContent>
        </Card>
      )}
      <div>
        <h3 className="text-lg font-semibold mb-2">Formula & Explanation</h3>
        <div className="text-muted-foreground space-y-4">
          <p className='font-mono p-2 bg-muted rounded-md'>Torr = Pa / 133.322</p>
          <p>Divide the pressure in Pascals by 133.322 to get the pressure in Torr.</p>
        </div>
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2">Conversion Table</h3>
        <Table>
          <TableHeader><TableRow><TableHead>Pascals (Pa)</TableHead><TableHead className="text-right">Torr (mmHg)</TableHead></TableRow></TableHeader>
          <TableBody>
            {conversionTable.map((item) => (
              <TableRow key={item.pa}>
                <TableCell>{item.pa.toLocaleString()}</TableCell>
                <TableCell className="text-right">{item.torr.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
       <div>
          <h3 className="text-lg font-semibold mb-2">Related Converters</h3>
          <div className="space-y-2">
            <p><Link href="/category/conversions/torr-to-pascals-converter" className="text-primary underline">Torr to Pascals Converter</Link></p>
          </div>
        </div>
    </div>
  );
}
