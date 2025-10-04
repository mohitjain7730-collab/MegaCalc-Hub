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
import Link from 'next/link';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';


const formSchema = z.object({
  pints: z.coerce.number().positive('Must be a positive number'),
  pintType: z.enum(['us', 'imperial']),
});

type FormValues = z.infer<typeof formSchema>;

const US_PINT_TO_LITERS = 0.473176;
const IMPERIAL_PINT_TO_LITERS = 0.568261;

export default function PintsToLitersConverter() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      pints: undefined,
      pintType: 'us',
    },
  });

  const onSubmit = (values: FormValues) => {
    if (values.pintType === 'us') {
      setResult(values.pints * US_PINT_TO_LITERS);
    } else {
      setResult(values.pints * IMPERIAL_PINT_TO_LITERS);
    }
  };
  
  const pintType = form.watch('pintType');
  const conversionTable = [
    { pints: 1, liters: 1 * (pintType === 'us' ? US_PINT_TO_LITERS : IMPERIAL_PINT_TO_LITERS) },
    { pints: 2, liters: 2 * (pintType === 'us' ? US_PINT_TO_LITERS : IMPERIAL_PINT_TO_LITERS) },
    { pints: 8, liters: 8 * (pintType === 'us' ? US_PINT_TO_LITERS : IMPERIAL_PINT_TO_LITERS) }, // 1 gallon
  ];


  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <FormField
              control={form.control}
              name="pints"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pints (pt)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} value={field.value ?? ''} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="pintType"
              render={({ field }) => (
                <FormItem>
                    <FormLabel>Pint Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                            <SelectItem value="us">US Pint</SelectItem>
                            <SelectItem value="imperial">Imperial Pint</SelectItem>
                        </SelectContent>
                    </Select>
                </FormItem>
              )}
            />
          </div>
          <Button type="submit">Convert</Button>
        </form>
      </Form>
      {result && (
        <Card className="mt-8">
          <CardHeader>
            <div className='flex items-center gap-4'>
              <ArrowRightLeft className="h-8 w-8 text-primary" />
              <CardTitle>Conversion Result</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-center">{result.toFixed(3)} Liters</p>
          </CardContent>
        </Card>
      )}
       <div className="space-y-8">
        <div>
            <h3 className="text-lg font-semibold mb-2">Conversion Table</h3>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>{pintType === 'us' ? 'US' : 'Imperial'} Pints</TableHead>
                        <TableHead className="text-right">Liters</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                {conversionTable.map((item) => (
                    <TableRow key={item.pints}>
                        <TableCell>{item.pints}</TableCell>
                        <TableCell className="text-right">{item.liters.toFixed(3)}</TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Related Converters</h3>
          <div className="space-y-2">
            <p><Link href="/category/conversions/liters-to-pints-converter" className="text-primary underline">Liters to Pints Converter</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
