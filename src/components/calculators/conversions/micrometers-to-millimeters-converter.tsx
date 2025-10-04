
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
  micrometers: z.number().positive('Must be a positive number'),
});

type FormValues = z.infer<typeof formSchema>;

const MICROMETERS_TO_MM = 0.001;

export default function MicrometersToMillimetersConverter() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      micrometers: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    setResult(values.micrometers * MICROMETERS_TO_MM);
  };

  const conversionTable = [
    { micrometers: 1, mm: 1 * MICROMETERS_TO_MM },
    { micrometers: 10, mm: 10 * MICROMETERS_TO_MM },
    { micrometers: 100, mm: 100 * MICROMETERS_TO_MM },
    { micrometers: 1000, mm: 1000 * MICROMETERS_TO_MM },
  ];

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="micrometers"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Micrometers (µm)</FormLabel>
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
            <p className="text-3xl font-bold text-center">{result.toFixed(4)} mm</p>
          </CardContent>
        </Card>
      )}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="formula">
          <AccordionTrigger>Formula & Explanation</AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-1">Formula</h4>
              <p className='font-mono p-2 bg-muted rounded-md'>Millimeters = Micrometers × 0.001</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Step-by-step explanation</h4>
              <p>There are 1,000 micrometers (also known as microns) in one millimeter. To convert from micrometers to millimeters, you simply divide the number of micrometers by 1,000. For example, a human hair is about 70 micrometers thick, which is 70 / 1000 = 0.07 millimeters.</p>
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="conversion-table">
          <AccordionTrigger>Conversion Table</AccordionTrigger>
          <AccordionContent>
             <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Micrometers (µm)</TableHead>
                  <TableHead className="text-right">Millimeters (mm)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {conversionTable.map((item) => (
                  <TableRow key={item.micrometers}>
                    <TableCell>{item.micrometers}</TableCell>
                    <TableCell className="text-right">{item.mm.toFixed(3)}</TableCell>
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
              <h4 className="font-semibold text-foreground mb-1">What is a micrometer?</h4>
              <p>A micrometer (µm), also known as a micron, is one-millionth of a meter. It's a common unit for measuring microscopic objects like cells and bacteria.</p>
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="related-converters">
          <AccordionTrigger>Related Converters</AccordionTrigger>
          <AccordionContent className="space-y-2">
            <p><Link href="/category/conversions/millimeters-to-inches-converter" className="text-primary underline">Millimeters to Inches Converter</Link></p>
            <p><Link href="/category/conversions/nanometers-to-meters-converter" className="text-primary underline">Nanometers to Meters Converter</Link></p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
