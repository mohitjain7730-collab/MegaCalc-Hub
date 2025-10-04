
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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Link from 'next/link';

const formSchema = z.object({
  km: z.number().positive('Must be a positive number'),
});

type FormValues = z.infer<typeof formSchema>;

const KM_TO_NAUTICAL_MILES = 0.539957;

export default function KilometersToNauticalMilesConverter() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      km: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    setResult(values.km * KM_TO_NAUTICAL_MILES);
  };

  const conversionTable = [
    { km: 1, nmi: 1 * KM_TO_NAUTICAL_MILES },
    { km: 10, nmi: 10 * KM_TO_NAUTICAL_MILES },
    { km: 50, nmi: 50 * KM_TO_NAUTICAL_MILES },
    { km: 100, nmi: 100 * KM_TO_NAUTICAL_MILES },
  ];

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="km"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kilometers (km)</FormLabel>
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
            <p className="text-3xl font-bold text-center">{result.toFixed(2)} nmi</p>
          </CardContent>
        </Card>
      )}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="formula">
          <AccordionTrigger>Formula & Explanation</AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-1">Formula</h4>
              <p className='font-mono p-2 bg-muted rounded-md'>Nautical Miles = Kilometers × 0.539957</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Step-by-step explanation</h4>
              <p>One nautical mile is internationally defined as 1,852 meters, or 1.852 kilometers. To convert from kilometers to nautical miles, you divide the number of kilometers by 1.852, which is the same as multiplying by approximately 0.539957. For example, 100 km is 100 × 0.539957 ≈ 54 nautical miles.</p>
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="conversion-table">
          <AccordionTrigger>Conversion Table</AccordionTrigger>
          <AccordionContent>
             <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kilometers (km)</TableHead>
                  <TableHead className="text-right">Nautical Miles (nmi)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {conversionTable.map((item) => (
                  <TableRow key={item.km}>
                    <TableCell>{item.km}</TableCell>
                    <TableCell className="text-right">{item.nmi.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="faq">
          <AccordionTrigger>FAQ</AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-1">What is a nautical mile?</h4>
              <p>A nautical mile is a unit of measurement used in air and marine navigation. It is based on the circumference of the Earth and is equal to one minute of latitude.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Is a nautical mile the same as a regular mile?</h4>
              <p>No. A nautical mile is approximately 1.15 statute (regular) miles.</p>
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="related-converters">
          <AccordionTrigger>Related Converters</AccordionTrigger>
          <AccordionContent className="space-y-2">
            <p><Link href="/category/conversions/nautical-miles-to-kilometers-converter" className="text-primary underline">Nautical Miles to Kilometers Converter</Link></p>
            <p><Link href="/category/conversions/kilometers-to-miles-converter" className="text-primary underline">Kilometers to Miles Converter</Link></p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
