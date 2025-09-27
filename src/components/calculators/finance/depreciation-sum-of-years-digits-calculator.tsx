
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
type ScheduleItem = { year: number; beginningBookValue: number; fraction: string; depreciation: number; endingBookValue: number };

export default function DepreciationSumOfYearsDigitsCalculator() {
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
    const syd = (usefulLife * (usefulLife + 1)) / 2;
    const depreciableBase = assetCost - salvageValue;
    let bookValue = assetCost;
    const newSchedule: ScheduleItem[] = [];

    for (let year = 1; year <= usefulLife; year++) {
      const remainingLife = usefulLife - year + 1;
      const fraction = `${remainingLife}/${syd}`;
      const depreciation = depreciableBase * (remainingLife / syd);
      const endingBookValue = bookValue - depreciation;
      newSchedule.push({ year, beginningBookValue: bookValue, fraction, depreciation, endingBookValue });
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
              <TableHeader><TableRow><TableHead>Year</TableHead><TableHead>Book Value (Start)</TableHead><TableHead>Fraction</TableHead><TableHead>Depreciation</TableHead><TableHead>Book Value (End)</TableHead></TableRow></TableHeader>
              <TableBody>
                {schedule.map(item => (
                  <TableRow key={item.year}>
                    <TableCell>{item.year}</TableCell>
                    <TableCell>${item.beginningBookValue.toFixed(2)}</TableCell>
                    <TableCell>{item.fraction}</TableCell>
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
                 <p>The inputs are the same as other depreciation methods: Asset Cost, Salvage Value, and Useful Life.</p>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value="how-it-works">
          <AccordionTrigger>How Sum-of-the-Years'-Digits Works</AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-2">
            <p>This is another accelerated depreciation method that recognizes more depreciation in the early years of an asset's life.</p>
            <ol className='list-decimal list-inside space-y-2 mt-2'>
              <li><strong>Calculate the SYD:</strong> First, it calculates the "Sum-of-the-Years' Digits" (SYD). For a 5-year asset, this is 5 + 4 + 3 + 2 + 1 = 15. This sum becomes the denominator of the depreciation fraction.</li>
              <li><strong>Determine the Fraction:</strong> For each year, the numerator of the fraction is the number of years of useful life remaining at the beginning of that year. So, for Year 1 of a 5-year asset, the fraction is 5/15. For Year 2, it's 4/15, and so on.</li>
              <li><strong>Calculate Depreciation:</strong> The annual depreciation expense is calculated by multiplying this fraction by the total depreciable base (Asset Cost - Salvage Value).</li>
            </ol>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
