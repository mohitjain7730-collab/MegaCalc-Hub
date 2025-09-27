
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Landmark } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const macrsTables = {
  '3-year': [0.3333, 0.4445, 0.1481, 0.0741],
  '5-year': [0.2000, 0.3200, 0.1920, 0.1152, 0.1152, 0.0576],
  '7-year': [0.1429, 0.2449, 0.1749, 0.1249, 0.0893, 0.0892, 0.0893, 0.0446],
};

type AssetClass = keyof typeof macrsTables;

const formSchema = z.object({
  assetCost: z.number().positive(),
  assetClass: z.string(),
});

type FormValues = z.infer<typeof formSchema>;
type ScheduleItem = { year: number; rate: number; depreciation: number; };

export default function MacrsDepreciationCalculator() {
  const [schedule, setSchedule] = useState<ScheduleItem[] | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      assetCost: undefined,
      assetClass: '5-year',
    },
  });

  const onSubmit = (values: FormValues) => {
    const { assetCost, assetClass } = values;
    const rates = macrsTables[assetClass as AssetClass];
    const newSchedule: ScheduleItem[] = rates.map((rate, index) => ({
      year: index + 1,
      rate: rate * 100,
      depreciation: assetCost * rate,
    }));
    setSchedule(newSchedule);
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="assetCost" render={({ field }) => (<FormItem><FormLabel>Asset Cost ($)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="assetClass" render={({ field }) => (
              <FormItem><FormLabel>Asset Class (Half-Year Convention)</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="3-year">3-Year (e.g., some tools)</SelectItem>
                    <SelectItem value="5-year">5-Year (e.g., computers, cars)</SelectItem>
                    <SelectItem value="7-year">7-Year (e.g., office furniture)</SelectItem>
                  </SelectContent>
                </Select><FormMessage /></FormItem>
            )} />
          </div>
          <Button type="submit">Generate Schedule</Button>
        </form>
      </Form>
      {schedule && (
        <Card className="mt-8">
          <CardHeader><div className='flex items-center gap-4'><Landmark className="h-8 w-8 text-primary" /><CardTitle>MACRS Depreciation Schedule</CardTitle></div></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Year</TableHead><TableHead>MACRS Rate (%)</TableHead><TableHead>Depreciation Deduction</TableHead></TableRow></TableHeader>
              <TableBody>
                {schedule.map(item => (
                  <TableRow key={item.year}>
                    <TableCell>{item.year}</TableCell>
                    <TableCell>{item.rate.toFixed(2)}%</TableCell>
                    <TableCell>${item.depreciation.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="how-it-works">
          <AccordionTrigger>How MACRS Works</AccordionTrigger>
          <AccordionContent className="text-muted-foreground">The Modified Accelerated Cost Recovery System (MACRS) is the standard for tax depreciation in the US. It allows for larger deductions in the early years of an asset's life. The calculator uses pre-defined IRS tables for specific asset classes (3, 5, or 7-year property) to find the depreciation percentage for each year. Salvage value is always ignored under MACRS.</AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
