
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar as CalendarIcon, Briefcase } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format, differenceInDays, isSaturday, isSunday, isSameDay } from 'date-fns';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const formSchema = z.object({
  startDate: z.date({ required_error: "Start date is required." }),
  endDate: z.date({ required_error: "End date is required." }),
}).refine(data => data.endDate >= data.startDate, {
  message: "End date must be after start date.",
  path: ["endDate"],
});

type FormValues = z.infer<typeof formSchema>;

// Hardcoded US Federal Holidays for 2024
const usHolidays2024 = [
  new Date('2024-01-01'), // New Year's Day
  new Date('2024-01-15'), // Martin Luther King, Jr. Day
  new Date('2024-02-19'), // Washington's Birthday
  new Date('2024-05-27'), // Memorial Day
  new Date('2024-06-19'), // Juneteenth
  new Date('2024-07-04'), // Independence Day
  new Date('2024-09-02'), // Labor Day
  new Date('2024-10-14'), // Columbus Day
  new Date('2024-11-11'), // Veterans Day
  new Date('2024-11-28'), // Thanksgiving Day
  new Date('2024-12-25'), // Christmas Day
];

export default function WorkingDaysBusinessDaysCalculator() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = (values: FormValues) => {
    const { startDate, endDate } = values;
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
