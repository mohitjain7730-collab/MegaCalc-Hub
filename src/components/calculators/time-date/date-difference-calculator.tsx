
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format, differenceInDays, differenceInWeeks, differenceInMonths, differenceInYears } from 'date-fns';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const formSchema = z.object({
  startDate: z.date({ required_error: "Start date is required." }),
  endDate: z.date({ required_error: "End date is required." }),
}).refine(data => data.endDate >= data.startDate, {
  message: "End date must be after start date.",
  path: ["endDate"],
});

type FormValues = z.infer<typeof formSchema>;

interface Difference {
    days: number;
    weeks: number;
    months: number;
    years: number;
}

export default function DateDifferenceCalculator() {
  const [result, setResult] = useState<Difference | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = (values: FormValues) => {
    const { startDate, endDate } = values;
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="startDate" render={({ field }) => (
              <FormItem className="flex flex-col"><FormLabel>Start Date</FormLabel>
                <Popover><PopoverTrigger asChild><FormControl>
                      <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                </FormControl></PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} captionLayout="dropdown-nav" fromYear={1900} toYear={new Date().getFullYear() + 10} initialFocus/>
                </PopoverContent></Popover><FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="endDate" render={({ field }) => (
                <FormItem className="flex flex-col"><FormLabel>End Date</FormLabel>
                  <Popover><PopoverTrigger asChild><FormControl>
                        <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                          {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                  </FormControl></PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={field.value} onSelect={field.onChange} captionLayout="dropdown-nav" fromYear={1900} toYear={new Date().getFullYear() + 10} initialFocus/>
                  </PopoverContent></Popover><FormMessage />
                </FormItem>
            )} />
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
