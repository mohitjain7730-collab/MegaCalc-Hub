
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { differenceInDays, isSaturday, isSunday, isSameDay } from 'date-fns';

const dateSchema = z.object({
    year: z.number().int(),
    month: z.number().int().min(1).max(12),
    day: z.number().int().min(1).max(31),
});

const formSchema = z.object({
  start: dateSchema,
  end: dateSchema,
}).refine(data => {
    try {
        const startDate = new Date(data.start.year, data.start.month - 1, data.start.day);
        const endDate = new Date(data.end.year, data.end.month - 1, data.end.day);
        return endDate >= startDate;
    } catch {
        return false;
    }
}, {
  message: "End date must be after start date.",
  path: ["end"],
}).refine(data => {
    const date = new Date(data.start.year, data.start.month - 1, data.start.day);
    return date.getFullYear() === data.start.year && date.getMonth() === data.start.month - 1 && date.getDate() === data.start.day;
}, {
    message: 'Invalid start date.',
    path: ['start', 'day'],
}).refine(data => {
    const date = new Date(data.end.year, data.end.month - 1, data.end.day);
    return date.getFullYear() === data.end.year && date.getMonth() === data.end.month - 1 && date.getDate() === data.end.day;
}, {
    message: 'Invalid end date.',
    path: ['end', 'day'],
});

type FormValues = z.infer<typeof formSchema>;

const usHolidays2024 = [
  new Date('2024-01-01T12:00:00Z'),
  new Date('2024-01-15T12:00:00Z'),
  new Date('2024-02-19T12:00:00Z'),
  new Date('2024-05-27T12:00:00Z'),
  new Date('2024-06-19T12:00:00Z'),
  new Date('2024-07-04T12:00:00Z'),
  new Date('2024-09-02T12:00:00Z'),
  new Date('2024-10-14T12:00:00Z'),
  new Date('2024-11-11T12:00:00Z'),
  new Date('2024-11-28T12:00:00Z'),
  new Date('2024-12-25T12:00:00Z'),
];


const currentYear = new Date().getFullYear();
const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);
const months = Array.from({ length: 12 }, (_, i) => i + 1);
const days = Array.from({ length: 31 }, (_, i) => i + 1);

export default function WorkingDaysBusinessDaysCalculator() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = (values: FormValues) => {
    const startDate = new Date(values.start.year, values.start.month - 1, values.start.day);
    const endDate = new Date(values.end.year, values.end.month - 1, values.end.day);
    const totalDays = differenceInDays(endDate, startDate) + 1;
    let workingDays = 0;

    for (let i = 0; i < totalDays; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);

      const isWeekend = isSaturday(currentDate) || isSunday(currentDate);
      const isHoliday = usHolidays2024.some(holiday => isSameDay(holiday, currentDate));

      if (!isWeekend && !isHoliday) {
        workingDays++;
      }
    }
    setResult(workingDays);
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <FormLabel>Start Date</FormLabel>
              <div className="grid grid-cols-3 gap-2 mt-2">
                 <FormField control={form.control} name="start.day" render={({ field }) => (
                    <FormItem><FormLabel className="sr-only">Day</FormLabel><Select onValueChange={val => field.onChange(parseInt(val))}><FormControl><SelectTrigger><SelectValue placeholder="Day" /></SelectTrigger></FormControl><SelectContent>{days.map(d => <SelectItem key={d} value={String(d)}>{d}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="start.month" render={({ field }) => (
                    <FormItem><FormLabel className="sr-only">Month</FormLabel><Select onValueChange={val => field.onChange(parseInt(val))}><FormControl><SelectTrigger><SelectValue placeholder="Month" /></SelectTrigger></FormControl><SelectContent>{months.map(m => <SelectItem key={m} value={String(m)}>{m}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="start.year" render={({ field }) => (
                    <FormItem><FormLabel className="sr-only">Year</FormLabel><Select onValueChange={val => field.onChange(parseInt(val))}><FormControl><SelectTrigger><SelectValue placeholder="Year" /></SelectTrigger></FormControl><SelectContent>{years.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                )} />
              </div>
            </div>
            <div>
              <FormLabel>End Date</FormLabel>
              <div className="grid grid-cols-3 gap-2 mt-2">
                 <FormField control={form.control} name="end.day" render={({ field }) => (
                    <FormItem><FormLabel className="sr-only">Day</FormLabel><Select onValueChange={val => field.onChange(parseInt(val))}><FormControl><SelectTrigger><SelectValue placeholder="Day" /></SelectTrigger></FormControl><SelectContent>{days.map(d => <SelectItem key={d} value={String(d)}>{d}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="end.month" render={({ field }) => (
                    <FormItem><FormLabel className="sr-only">Month</FormLabel><Select onValueChange={val => field.onChange(parseInt(val))}><FormControl><SelectTrigger><SelectValue placeholder="Month" /></SelectTrigger></FormControl><SelectContent>{months.map(m => <SelectItem key={m} value={String(m)}>{m}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="end.year" render={({ field }) => (
                    <FormItem><FormLabel className="sr-only">Year</FormLabel><Select onValueChange={val => field.onChange(parseInt(val))}><FormControl><SelectTrigger><SelectValue placeholder="Year" /></SelectTrigger></FormControl><SelectContent>{years.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                )} />
              </div>
            </div>
          </div>
          <Button type="submit">Calculate Business Days</Button>
        </form>
      </Form>

      {result !== null && (
        <Card className="mt-8">
          <CardHeader>
            <div className='flex items-center gap-4'><Briefcase className="h-8 w-8 text-primary" /><CardTitle>Business Days</CardTitle></div>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-3xl font-bold">{result}</p>
            <CardDescription className="mt-2">Total working days between the selected dates (excluding weekends and US federal holidays).</CardDescription>
          </CardContent>
        </Card>
      )}

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="how-it-works">
          <AccordionTrigger>How It Works</AccordionTrigger>
          <AccordionContent className="text-muted-foreground">
            The calculator iterates through each day between your start and end dates. For each day, it checks if it is a Saturday or Sunday. It also checks if the date matches one of the pre-programmed U.S. federal holidays for 2024. If the day is not a weekend or a holiday, it is counted as a business day.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
