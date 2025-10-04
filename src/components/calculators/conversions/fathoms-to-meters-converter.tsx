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
  fathoms: z.coerce.number().positive('Must be a positive number'),
});

type FormValues = z.infer<typeof formSchema>;

const FATHOMS_TO_METERS = 1.8288;

export default function FathomsToMetersConverter() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fathoms: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    setResult(values.fathoms * FATHOMS_TO_METERS);
  };

  const conversionTable = [
    { fathoms: 1, meters: 1 * FATHOMS_TO_METERS },
    { fathoms: 5, meters: 5 * FATHOMS_TO_METERS },
    { fathoms: 10, meters: 10 * FATHOMS_TO_METERS },
    { fathoms: 50, meters: 50 * FATHOMS_TO_METERS },
  ];

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="fathoms"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fathoms</FormLabel>
                <FormControl>
                  <Input type="number" {...field} value={field.value ?? ''} onChange={field.onChange} />
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
            <p className="text-3xl font-bold text-center">{result.toFixed(2)} m</p>
          </CardContent>
        </Card>
      )}
      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold mb-2">Formula & Explanation</h3>
          <div className="text-muted-foreground space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-1">Formula</h4>
              <p className='font-mono p-2 bg-muted rounded-md'>Meters = Fathoms × 1.8288</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Step-by-step explanation</h4>
              <p>One fathom is defined as exactly 6 feet, and one foot is exactly 0.3048 meters. Therefore, to convert fathoms to meters, you multiply the number of fathoms by 1.8288 (6 × 0.3048). For example, a depth of 20 fathoms is 20 × 1.8288 = 36.576 meters.</p>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Conversion Table</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fathoms</TableHead>
                <TableHead className="text-right">Meters (m)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {conversionTable.map((item) => (
                <TableRow key={item.fathoms}>
                  <TableCell>{item.fathoms}</TableCell>
                  <TableCell className="text-right">{item.meters.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">FAQ</h3>
          <div className="text-muted-foreground space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-1">What is a fathom?</h4>
              <p>A fathom is a unit of length in the imperial and U.S. customary systems, equal to 6 feet (1.8288 m). It is primarily used in a maritime context for measuring the depth of water.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Why is it called a "fathom"?</h4>
              <p>The term originates from an Old English word meaning "outstretched arms," as a fathom was roughly the distance of a man's outstretched arms, a convenient way for sailors to measure rope depth by hand.</p>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Related Converters</h3>
          <div className="space-y-2">
            <p><Link href="/category/conversions/nautical-miles-to-kilometers-converter" className="text-primary underline">Nautical Miles to Kilometers Converter</Link></p>
            <p><Link href="/category/conversions/feet-to-meters-converter" className="text-primary underline">Feet to Meters Converter</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
