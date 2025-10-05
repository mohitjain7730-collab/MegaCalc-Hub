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
  atm: z.coerce.number().positive('Must be a positive number'),
});

type FormValues = z.infer<typeof formSchema>;

const ATM_TO_TORR = 760;

export default function AtmospheresToTorrConverter() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { atm: undefined },
  });

  const onSubmit = (values: FormValues) => {
    setResult(values.atm * ATM_TO_TORR);
  };

  const conversionTable = [
    { atm: 1, torr: 760 },
    { atm: 0.5, torr: 0.5 * ATM_TO_TORR },
  ];

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="atm"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Atmospheres (atm)</FormLabel>
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
            <p className="text-3xl font-bold text-center">{result.toLocaleString()} Torr (mmHg)</p>
          </CardContent>
        </Card>
      )}
      <div>
        <h3 className="text-lg font-semibold mb-2">Formula & Explanation</h3>
        <div className="text-muted-foreground space-y-4">
          <p className='font-mono p-2 bg-muted rounded-md'>Torr = atm × 760</p>
          <p>Multiply the pressure in atmospheres by 760 to get the pressure in Torr.</p>
        </div>
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2">Conversion Table</h3>
        <Table>
          <TableHeader><TableRow><TableHead>Atmospheres (atm)</TableHead><TableHead className="text-right">Torr (mmHg)</TableHead></TableRow></TableHeader>
          <TableBody>
            {conversionTable.map((item) => (
              <TableRow key={item.atm}>
                <TableCell>{item.atm}</TableCell>
                <TableCell className="text-right">{item.torr}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
       <div>
          <h3 className="text-lg font-semibold mb-2">Related Converters</h3>
          <div className="space-y-2">
            <p><Link href="/category/conversions/torr-to-atmospheres-converter" className="text-primary underline">Torr to Atmospheres Converter</Link></p>
          </div>
        </div>
    </div>
  );
}
