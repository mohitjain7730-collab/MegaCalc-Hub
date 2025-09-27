
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
import { differenceInDays } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const formSchema = z.object({
    year: z.number().int(),
    month: z.number().int().min(1).max(12),
    day: z.number().int().min(1).max(31),
}).refine(data => {
    const date = new Date(data.year, data.month - 1, data.day);
    return date.getFullYear() === data.year && date.getMonth() === data.month - 1 && date.getDate() === data.day;
}, {
    message: 'Invalid date.',
    path: ['day'],
});

type FormValues = z.infer<typeof formSchema>;

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 125 }, (_, i) => currentYear - i);
const months = Array.from({ length: 12 }, (_, i) => i + 1);
const days = Array.from({ length: 31 }, (_, i) => i + 1);

export default function FriendshipAnniversaryCalculator() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      year: undefined,
      month: undefined,
      day: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const today = new Date();
    const startDate = new Date(values.year, values.month - 1, values.day);
    setResult(differenceInDays(today, startDate));
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormLabel>Date you met</FormLabel>
            <div className="grid grid-cols-3 gap-4">
                <FormField control={form.control} name="day" render={({ field }) => (
                    <FormItem><FormLabel className="sr-only">Day</FormLabel><Select onValueChange={val => field.onChange(parseInt(val))}><FormControl><SelectTrigger><SelectValue placeholder="Day" /></SelectTrigger></FormControl><SelectContent>{days.map(d => <SelectItem key={d} value={String(d)}>{d}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="month" render={({ field }) => (
                    <FormItem><FormLabel className="sr-only">Month</FormLabel><Select onValueChange={val => field.onChange(parseInt(val))}><FormControl><SelectTrigger><SelectValue placeholder="Month" /></SelectTrigger></FormControl><SelectContent>{months.map(m => <SelectItem key={m} value={String(m)}>{m}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="year" render={({ field }) => (
                    <FormItem><FormLabel className="sr-only">Year</FormLabel><Select onValueChange={val => field.onChange(parseInt(val))}><FormControl><SelectTrigger><SelectValue placeholder="Year" /></SelectTrigger></FormControl><SelectContent>{years.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                )} />
            </div>
          <Button type="submit">Calculate</Button>
        </form>
      </Form>

      {result !== null && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><CalendarIcon className="h-8 w-8 text-primary" /><CardTitle>Duration</CardTitle></div></CardHeader>
            <CardContent>
                <div className="text-center">
                    <p className="text-3xl font-bold">{result.toLocaleString()} days</p>
                    <CardDescription className="mt-2">have passed since you met.</CardDescription>
                </div>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
