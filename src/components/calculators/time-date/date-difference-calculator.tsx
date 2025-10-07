
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar as CalendarIcon } from 'lucide-react';
import { differenceInDays, differenceInYears, differenceInMonths, format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

const dropdownSchema = z.object({
  startDay: z.coerce.number(),
  startMonth: z.coerce.number(),
  startYear: z.coerce.number(),
  endDay: z.coerce.number(),
  endMonth: z.coerce.number(),
  endYear: z.coerce.number(),
});

const pickerSchema = z.object({
  startDate: z.date().optional(),
  endDate: z.date().optional(),
});

type FormValues = {
    inputType: 'dropdown' | 'picker';
    dropdown: z.infer<typeof dropdownSchema>;
    picker: z.infer<typeof pickerSchema>;
};

interface Difference {
  totalDays: number;
  years: number;
  months: number;
  days: number;
}

const years = Array.from({ length: 5001 }, (_, i) => i);
const months = Array.from({ length: 12 }, (_, i) => i);
const days = Array.from({ length: 31 }, (_, i) => i + 1);
const monthNames = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
];


export default function DateDifferenceCalculator() {
  const [result, setResult] = useState<Difference | null>(null);

  const form = useForm<FormValues>({
    defaultValues: {
        inputType: 'dropdown',
        dropdown: { startDay: undefined, startMonth: undefined, startYear: undefined, endDay: undefined, endMonth: undefined, endYear: undefined },
        picker: { startDate: undefined, endDate: undefined },
    }
  });

  const onSubmit = (values: FormValues) => {
    let startDate: Date;
    let endDate: Date;

    if (values.inputType === 'picker' && values.picker.startDate && values.picker.endDate) {
        startDate = values.picker.startDate;
        endDate = values.picker.endDate;
    } else if (values.inputType === 'dropdown') {
        const { startDay, startMonth, startYear, endDay, endMonth, endYear } = values.dropdown;
        if(startDay && startMonth !== undefined && startYear !== undefined && endDay && endMonth !== undefined && endYear !== undefined) {
             startDate = new Date(startYear, startMonth, startDay);
             endDate = new Date(endYear, endMonth, endDay);
        } else {
            form.setError('dropdown.startDay', { message: 'All date fields are required.' });
            return;
        }
    } else {
        form.setError('picker.startDate', { message: 'Both dates are required.'});
        return;
    }

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        setResult(null);
        return;
    }
    
    // Swap if end date is before start date
    if (endDate < startDate) {
        [startDate, endDate] = [endDate, startDate];
    }

    const totalDays = differenceInDays(endDate, startDate);

    let years = differenceInYears(endDate, startDate);
    let tempStartDateForMonths = new Date(startDate);
    tempStartDateForMonths.setFullYear(startDate.getFullYear() + years);
    let months = differenceInMonths(endDate, tempStartDateForMonths);
    
    let tempStartDateForDays = new Date(tempStartDateForMonths);
    tempStartDateForDays.setMonth(tempStartDateForMonths.getMonth() + months);
    
    let days = differenceInDays(endDate, tempStartDateForDays);
    
     if (months < 0) {
        years--;
        months += 12;
    }

    setResult({ totalDays, years, months, days });
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs defaultValue="dropdown" onValueChange={(v) => form.setValue('inputType', v as 'dropdown' | 'picker')}>
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="dropdown">Use Dropdowns</TabsTrigger>
                    <TabsTrigger value="picker">Use Date Picker</TabsTrigger>
                </TabsList>
                <TabsContent value="dropdown">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
                        <div>
                            <FormLabel>Start Date:</FormLabel>
                            <div className="grid grid-cols-3 gap-2 mt-2">
                                <FormField control={form.control} name="dropdown.startDay" render={({ field }) => ( <FormItem><Select onValueChange={val => field.onChange(parseInt(val))} value={field.value?.toString()}><FormControl><SelectTrigger><SelectValue placeholder="Day" /></SelectTrigger></FormControl><SelectContent className="max-h-60">{days.map(d => <SelectItem key={d} value={String(d)}>{d}</SelectItem>)}</SelectContent></Select></FormItem> )}/>
                                <FormField control={form.control} name="dropdown.startMonth" render={({ field }) => ( <FormItem><Select onValueChange={val => field.onChange(parseInt(val))} value={field.value?.toString()}><FormControl><SelectTrigger><SelectValue placeholder="Month" /></SelectTrigger></FormControl><SelectContent className="max-h-60">{months.map(m => <SelectItem key={m} value={String(m)}>{monthNames[m]}</SelectItem>)}</SelectContent></Select></FormItem> )}/>
                                <FormField control={form.control} name="dropdown.startYear" render={({ field }) => ( <FormItem><Select onValueChange={val => field.onChange(parseInt(val))} value={field.value?.toString()}><FormControl><SelectTrigger><SelectValue placeholder="Year" /></SelectTrigger></FormControl><SelectContent className="max-h-60">{years.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}</SelectContent></Select></FormItem> )}/>
                            </div>
                        </div>
                         <div>
                            <FormLabel>End Date:</FormLabel>
                            <div className="grid grid-cols-3 gap-2 mt-2">
                                <FormField control={form.control} name="dropdown.endDay" render={({ field }) => ( <FormItem><Select onValueChange={val => field.onChange(parseInt(val))} value={field.value?.toString()}><FormControl><SelectTrigger><SelectValue placeholder="Day" /></SelectTrigger></FormControl><SelectContent className="max-h-60">{days.map(d => <SelectItem key={d} value={String(d)}>{d}</SelectItem>)}</SelectContent></Select></FormItem> )}/>
                                <FormField control={form.control} name="dropdown.endMonth" render={({ field }) => ( <FormItem><Select onValueChange={val => field.onChange(parseInt(val))} value={field.value?.toString()}><FormControl><SelectTrigger><SelectValue placeholder="Month" /></SelectTrigger></FormControl><SelectContent className="max-h-60">{months.map(m => <SelectItem key={m} value={String(m)}>{monthNames[m]}</SelectItem>)}</SelectContent></Select></FormItem> )}/>
                                <FormField control={form.control} name="dropdown.endYear" render={({ field }) => ( <FormItem><Select onValueChange={val => field.onChange(parseInt(val))} value={field.value?.toString()}><FormControl><SelectTrigger><SelectValue placeholder="Year" /></SelectTrigger></FormControl><SelectContent className="max-h-60">{years.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}</SelectContent></Select></FormItem> )}/>
                            </div>
                        </div>
                    </div>
                </TabsContent>
                <TabsContent value="picker">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
                        <FormField control={form.control} name="picker.startDate" render={({ field }) => (<FormItem className="flex flex-col"><FormLabel>Start Date</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("pl-3 text-left font-normal",!field.value && "text-muted-foreground")} >{field.value ? format(field.value, "PPP") : <span>Pick a date</span>}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent></Popover><FormMessage /></FormItem> )} />
                        <FormField control={form.control} name="picker.endDate" render={({ field }) => (<FormItem className="flex flex-col"><FormLabel>End Date</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("pl-3 text-left font-normal",!field.value && "text-muted-foreground")} >{field.value ? format(field.value, "PPP") : <span>Pick a date</span>}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent></Popover><FormMessage /></FormItem> )} />
                    </div>
                </TabsContent>
            </Tabs>
          <Button type="submit" className="w-full">Calculate Difference</Button>
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
