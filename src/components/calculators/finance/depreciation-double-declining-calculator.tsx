
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Landmark } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const formSchema = z.object({
  assetCost: z.number().positive(),
  salvageValue: z.number().nonnegative(),
  usefulLife: z.number().int().positive(),
}).refine(data => data.assetCost > data.salvageValue, {
  message: "Asset cost must be greater than salvage value.",
  path: ['salvageValue'],
});

type FormValues = z.infer<typeof formSchema>;
type ScheduleItem = { year: number; beginningBookValue: number; depreciation: number; endingBookValue: number };

export default function DepreciationDoubleDecliningCalculator() {
  const [schedule, setSchedule] = useState<ScheduleItem[] | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      assetCost: undefined,
      salvageValue: undefined,
      usefulLife: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const { assetCost, salvageValue, usefulLife } = values;
    const rate = (1 / usefulLife) * 2;
    let bookValue = assetCost;
    const newSchedule: ScheduleItem[] = [];

    for (let year = 1; year <= usefulLife; year++) {
      let depreciation = bookValue * rate;
      if (bookValue - depreciation < salvageValue) {
        depreciation = bookValue - salvageValue;
      }
      if(depreciation < 0) depreciation = 0;
      
      const endingBookValue = bookValue - depreciation;
      newSchedule.push({ year, beginningBookValue: bookValue, depreciation, endingBookValue });
      bookValue = endingBookValue;
    }
    setSchedule(newSchedule);
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="assetCost" render={({ field }) => (<FormItem><FormLabel>Asset Cost ($)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="salvageValue" render={({ field }) => (<FormItem><FormLabel>Salvage Value ($)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="usefulLife" render={({ field }) => (<FormItem className='md:col-span-2'><FormLabel>Useful Life (years)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
          </div>
          <Button type="submit">Generate Schedule</Button>
        </form>
      </Form>
      {schedule && (
        <Card className="mt-8">
          <CardHeader><div className='flex items-center gap-4'><Landmark className="h-8 w-8 text-primary" /><CardTitle>Depreciation Schedule</CardTitle></div></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Year</TableHead><TableHead>Beginning Book Value</TableHead><TableHead>Depreciation</TableHead><TableHead>Ending Book Value</TableHead></TableRow></TableHeader>
              <TableBody>
                {schedule.map(item => (
                  <TableRow key={item.year}>
                    <TableCell>{item.year}</TableCell>
                    <TableCell>${item.beginningBookValue.toFixed(2)}</TableCell>
                    <TableCell>${item.depreciation.toFixed(2)}</TableCell>
                    <TableCell>${item.endingBookValue.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="understanding-inputs">
            <AccordionTrigger>Understanding the Inputs</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-4">
                <p>The inputs are the same as the Straight-Line method: Asset Cost, Salvage Value, and Useful Life.</p>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value="how-it-works">
          <AccordionTrigger>How Double Declining Balance Works</AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-2">
            <p>This is an accelerated depreciation method that results in higher depreciation expenses during the earlier years of an asset's life.</p>
            <ol className='list-decimal list-inside space-y-2 mt-2'>
              <li><strong>Calculate Rate:</strong> It first determines the straight-line rate (1 / Useful Life) and doubles it.</li>
              <li><strong>Calculate Annual Depreciation:</strong> For each year, it multiplies this fixed rate by the asset's book value at the beginning of that year (not the depreciable base).</li>
              <li><strong>Apply Salvage Value Rule:</strong> A key rule is that depreciation stops once the book value equals the salvage value. This calculator automatically adjusts the final year's depreciation to ensure the ending book value does not fall below the salvage value.</li>
            </ol>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
