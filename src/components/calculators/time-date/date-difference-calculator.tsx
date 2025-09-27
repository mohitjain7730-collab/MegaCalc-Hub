
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { differenceInDays, differenceInWeeks, differenceInMonths, differenceInYears } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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

interface Difference {
    days: number;
    weeks: number;
    months: number;
    years: number;
}

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 125 }, (_, i) => currentYear - 60 + i);
const months = Array.from({ length: 12 }, (_, i) => i + 1);
const days = Array.from({ length: 31 }, (_, i) => i + 1);

export default function DateDifferenceCalculator() {
  const [result, setResult] = useState<Difference | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = (values: FormValues) => {
    const startDate = new Date(values.start.year, values.start.month - 1, values.start.day);
    const endDate = new Date(values.end.year, values.end.month - 1, values.end.day);
    setResult({
        days: differenceInDays(endDate, startDate),
        weeks: differenceInWeeks(endDate, startDate),
        months: differenceInMonths(endDate, startDate),
        years: differenceInYears(endDate, startDate),
    });
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
          <Button type="submit">Calculate Difference</Button>
        </form>
      </Form>

      {result && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><CalendarIcon className="h-8 w-8 text-primary" /><CardTitle>Time Difference</CardTitle></div></CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div><p className="font-bold text-2xl">{result.years.toLocaleString()}</p><p className="text-sm text-muted-foreground">Years</p></div>
                    <div><p className="font-bold text-2xl">{result.months.toLocaleString()}</p><p className="text-sm text-muted-foreground">Months</p></div>
                    <div><p className="font-bold text-2xl">{result.weeks.toLocaleString()}</p><p className="text-sm text-muted-foreground">Weeks</p></div>
                    <div><p className="font-bold text-2xl">{result.days.toLocaleString()}</p><p className="text-sm text-muted-foreground">Days</p></div>
                </div>
            </CardContent>
        </Card>
      )}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
                This calculator uses a date library to find the difference between two dates. It provides the total duration broken down into different units (years, months, weeks, and days) for your convenience.
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
