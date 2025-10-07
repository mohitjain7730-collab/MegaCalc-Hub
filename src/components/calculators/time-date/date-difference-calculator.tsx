
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar as CalendarIcon } from 'lucide-react';
import { differenceInDays, differenceInYears, differenceInMonths } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const dateSchema = z.object({
    year: z.coerce.number().int(),
    month: z.coerce.number().int().min(1).max(12),
    day: z.coerce.number().int().min(1).max(31),
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
  message: "End date must be on or after the start date.",
  path: ["end.day"],
}).refine(data => {
    if (!data.start.year && data.start.year !== 0 || !data.start.month || !data.start.day) return true;
    const date = new Date(data.start.year, data.start.month - 1, data.start.day);
    return date.getFullYear() === data.start.year && date.getMonth() === data.start.month - 1 && date.getDate() === data.start.day;
}, {
    message: 'Invalid start date.',
    path: ['start.day'],
}).refine(data => {
    if (!data.end.year && data.end.year !== 0 || !data.end.month || !data.end.day) return true;
    const date = new Date(data.end.year, data.end.month - 1, data.end.day);
    return date.getFullYear() === data.end.year && date.getMonth() === data.end.month - 1 && date.getDate() === data.end.day;
}, {
    message: 'Invalid end date.',
    path: ['end.day'],
});

type FormValues = z.infer<typeof formSchema>;

interface Difference {
  totalDays: number;
  years: number;
  months: number;
  days: number;
}

const currentYear = new Date().getFullYear();
const years = Array.from({ length: currentYear + 1 }, (_, i) => currentYear - i);
const months = Array.from({ length: 12 }, (_, i) => i + 1);
const days = Array.from({ length: 31 }, (_, i) => i + 1);

export default function DateDifferenceCalculator() {
  const [result, setResult] = useState<Difference | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        start: { day: undefined, month: undefined, year: undefined },
        end: { day: undefined, month: undefined, year: undefined },
    }
  });

  const onSubmit = (values: FormValues) => {
    const startDate = new Date(values.start.year, values.start.month - 1, values.start.day);
    const endDate = new Date(values.end.year, values.end.month - 1, values.end.day);

    const totalDays = differenceInDays(endDate, startDate);

    let years = differenceInYears(endDate, startDate);
    let tempStartDate = new Date(startDate);
    tempStartDate.setFullYear(startDate.getFullYear() + years);
    
    let months = differenceInMonths(endDate, tempStartDate);
    let tempStartDate2 = new Date(tempStartDate);
    tempStartDate2.setMonth(tempStartDate.getMonth() + months);
    
    let days = differenceInDays(endDate, tempStartDate2);

    if (days < 0) {
        months--;
        tempStartDate2.setMonth(tempStartDate2.getMonth() -1);
        days = differenceInDays(endDate, tempStartDate2);
    }
    if (months < 0) {
      years--;
      months += 12;
    }


    setResult({
      totalDays,
      years,
      months,
      days
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
                    <FormItem><FormLabel className="sr-only">Day</FormLabel><Select onValueChange={val => field.onChange(parseInt(val))} value={field.value?.toString()}><FormControl><SelectTrigger><SelectValue placeholder="Day" /></SelectTrigger></FormControl><SelectContent>{days.map(d => <SelectItem key={d} value={String(d)}>{d}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="start.month" render={({ field }) => (
                    <FormItem><FormLabel className="sr-only">Month</FormLabel><Select onValueChange={val => field.onChange(parseInt(val))} value={field.value?.toString()}><FormControl><SelectTrigger><SelectValue placeholder="Month" /></SelectTrigger></FormControl><SelectContent>{months.map(m => <SelectItem key={m} value={String(m)}>{new Date(0, m-1).toLocaleString('default', { month: 'long' })}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="start.year" render={({ field }) => (
                    <FormItem><FormLabel className="sr-only">Year</FormLabel><Select onValueChange={val => field.onChange(parseInt(val))} value={field.value?.toString()}><FormControl><SelectTrigger><SelectValue placeholder="Year" /></SelectTrigger></FormControl><SelectContent>{years.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                )} />
              </div>
            </div>
            <div>
              <FormLabel>End Date</FormLabel>
              <div className="grid grid-cols-3 gap-2 mt-2">
                 <FormField control={form.control} name="end.day" render={({ field }) => (
                    <FormItem><FormLabel className="sr-only">Day</FormLabel><Select onValueChange={val => field.onChange(parseInt(val))} value={field.value?.toString()}><FormControl><SelectTrigger><SelectValue placeholder="Day" /></SelectTrigger></FormControl><SelectContent>{days.map(d => <SelectItem key={d} value={String(d)}>{d}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="end.month" render={({ field }) => (
                    <FormItem><FormLabel className="sr-only">Month</FormLabel><Select onValueChange={val => field.onChange(parseInt(val))} value={field.value?.toString()}><FormControl><SelectTrigger><SelectValue placeholder="Month" /></SelectTrigger></FormControl><SelectContent>{months.map(m => <SelectItem key={m} value={String(m)}>{new Date(0, m-1).toLocaleString('default', { month: 'long' })}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="end.year" render={({ field }) => (
                    <FormItem><FormLabel className="sr-only">Year</FormLabel><Select onValueChange={val => field.onChange(parseInt(val))} value={field.value?.toString()}><FormControl><SelectTrigger><SelectValue placeholder="Year" /></SelectTrigger></FormControl><SelectContent>{years.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
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
                <div className='text-center'>
                    <CardDescription>Total Duration</CardDescription>
                    <p className="text-2xl font-bold">{result.totalDays.toLocaleString()} days</p>
                </div>
                <div className="text-center mt-4 pt-4 border-t">
                    <CardDescription>Detailed Breakdown</CardDescription>
                    <p className="text-3xl font-bold">
                        {result.years > 0 && `${result.years} year${result.years > 1 ? 's' : ''}, `}
                        {result.months > 0 && `${result.months} month${result.months > 1 ? 's' : ''}, `}
                        {result.days} day{result.days !== 1 ? 's' : ''}
                    </p>
                </div>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
