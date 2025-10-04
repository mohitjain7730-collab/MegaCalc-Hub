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
  ounces: z.coerce.number().positive('Must be a positive number'),
  ounceType: z.enum(['us', 'imperial']),
});

type FormValues = z.infer<typeof formSchema>;

const US_OZ_TO_ML = 29.5735;
const IMPERIAL_OZ_TO_ML = 28.4131;

export default function OuncesToMillilitersConverter() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ounces: undefined,
      ounceType: 'us',
    },
  });

  const onSubmit = (values: FormValues) => {
    if (values.ounceType === 'us') {
      setResult(values.ounces * US_OZ_TO_ML);
    } else {
      setResult(values.ounces * IMPERIAL_OZ_TO_ML);
    }
  };
  
  const ounceType = form.watch('ounceType');
  const conversionTable = [
    { ounces: 1, ml: 1 * (ounceType === 'us' ? US_OZ_TO_ML : IMPERIAL_OZ_TO_ML) },
    { ounces: 8, ml: 8 * (ounceType === 'us' ? US_OZ_TO_ML : IMPERIAL_OZ_TO_ML) }, // 1 cup
    { ounces: 12, ml: 12 * (ounceType === 'us' ? US_OZ_TO_ML : IMPERIAL_OZ_TO_ML) }, // 1 can of soda
    { ounces: 16, ml: 16 * (ounceType === 'us' ? US_OZ_TO_ML : IMPERIAL_OZ_TO_ML) }, // 1 pint
  ];

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <FormField
              control={form.control}
              name="ounces"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fluid Ounces (fl oz)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} value={field.value ?? ''} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="ounceType"
              render={({ field }) => (
                <FormItem>
                    <FormLabel>Ounce Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                            <SelectItem value="us">US Fluid Ounce</SelectItem>
                            <SelectItem value="imperial">Imperial Fluid Ounce</SelectItem>
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
            <p className="text-3xl font-bold text-center">{result.toFixed(2)} ml</p>
          </CardContent>
        </Card>
      )}
      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold mb-2">Conversion Table</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{ounceType === 'us' ? 'US' : 'Imperial'} fl oz</TableHead>
                <TableHead className="text-right">Milliliters (ml)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {conversionTable.map((item) => (
                <TableRow key={item.ounces}>
                  <TableCell>{item.ounces}</TableCell>
                  <TableCell className="text-right">{item.ml.toFixed(1)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Related Converters</h3>
          <div className="space-y-2">
            <p><Link href="/category/conversions/milliliters-to-ounces-converter" className="text-primary underline">Milliliters to Ounces Converter</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
