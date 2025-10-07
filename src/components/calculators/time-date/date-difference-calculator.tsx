
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar as CalendarIcon } from 'lucide-react';
import { differenceInDays, differenceInYears, differenceInMonths, isValid, parse } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const dateSchema = z.object({
    year: z.number().int().max(5000, 'Year is too large').min(0, "Year cannot be negative").optional(),
    month: z.number().int().min(0).max(11).optional(),
    day: z.number().int().min(1).max(31).optional(),
});

const formSchema = z.object({
    inputType: z.enum(['dropdown', 'text']),
    dropdown: z.object({
        start: dateSchema,
        end: dateSchema,
    }),
    text: z.object({
        startDate: z.string().optional(),
        endDate: z.string().optional(),
    }),
}).superRefine((data, ctx) => {
    let startDate: Date | null = null;
    let endDate: Date | null = null;

    if (data.inputType === 'dropdown') {
        const { start, end } = data.dropdown;
        if (start.day === undefined || start.month === undefined || start.year === undefined) {
             ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Start date is incomplete.", path: ['dropdown', 'start', 'day'] });
        } else {
            startDate = new Date(start.year, start.month, start.day);
            if (!isValid(startDate) || startDate.getFullYear() !== start.year || startDate.getMonth() !== start.month || startDate.getDate() !== start.day) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Invalid start date.", path: ['dropdown', 'start', 'day'] });
            }
        }
        if (end.day === undefined || end.month === undefined || end.year === undefined) {
             ctx.addIssue({ code: z.ZodIssueCode.custom, message: "End date is incomplete.", path: ['dropdown', 'end', 'day'] });
        } else {
            endDate = new Date(end.year, end.month, end.day);
            if (!isValid(endDate) || endDate.getFullYear() !== end.year || endDate.getMonth() !== end.month || endDate.getDate() !== end.day) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Invalid end date.", path: ['dropdown', 'end', 'day'] });
            }
        }
    } else { // text input
        if (!data.text.startDate) {
             ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Start date is required.", path: ['text', 'startDate'] });
        } else {
            startDate = parse(data.text.startDate, 'yyyy-MM-dd', new Date());
            if(!isValid(startDate)) {
                 ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Invalid start date format.", path: ['text', 'startDate'] });
            }
        }
         if (!data.text.endDate) {
             ctx.addIssue({ code: z.ZodIssueCode.custom, message: "End date is required.", path: ['text', 'endDate'] });
        } else {
            endDate = parse(data.text.endDate, 'yyyy-MM-dd', new Date());
             if(!isValid(endDate)) {
                 ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Invalid end date format.", path: ['text', 'endDate'] });
            }
        }
    }
    
    if (startDate && endDate && endDate < startDate) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "End date must be after start date.",
            path: [data.inputType === 'dropdown' ? 'dropdown.end.day' : 'text.endDate'],
        });
    }
});


type FormValues = z.infer<typeof formSchema>;

interface Difference {
  totalDays: number;
  years: number;
  months: number;
  days: number;
}

const months = Array.from({ length: 12 }, (_, i) => i);
const days = Array.from({ length: 31 }, (_, i) => i + 1);
const monthNames = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
];


export default function DateDifferenceCalculator() {
  const [result, setResult] = useState<Difference | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        inputType: 'dropdown',
        dropdown: { 
            start: { day: undefined, month: undefined, year: undefined }, 
            end: { day: undefined, month: undefined, year: undefined } 
        },
        text: { startDate: '', endDate: '' },
    }
  });

  const onSubmit = (values: FormValues) => {
    let startDate: Date;
    let endDate: Date;

    if (values.inputType === 'text' && values.text.startDate && values.text.endDate) {
        startDate = parse(values.text.startDate, 'yyyy-MM-dd', new Date());
        endDate = parse(values.text.endDate, 'yyyy-MM-dd', new Date());
    } else if (values.inputType === 'dropdown') {
        const { start, end } = values.dropdown;
        if(start.year === undefined || start.month === undefined || start.day === undefined || end.year === undefined || end.month === undefined || end.day === undefined) return;
        startDate = new Date(start.year, start.month, start.day);
        endDate = new Date(end.year, end.month, end.day);
    } else {
        return; // Invalid state
    }
    
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
    
     if (days < 0) {
        months--;
        tempStartDateForDays.setMonth(tempStartDateForDays.getMonth() -1);
        days = differenceInDays(endDate, tempStartDateForDays);
     }

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
            <Tabs defaultValue="dropdown" onValueChange={(v) => form.setValue('inputType', v as 'dropdown' | 'text')}>
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="dropdown">Select Date</TabsTrigger>
                    <TabsTrigger value="text">Enter Date</TabsTrigger>
                </TabsList>
                <TabsContent value="dropdown">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
                        <div>
                            <FormLabel>Start Date:</FormLabel>
                            <div className="grid grid-cols-3 gap-2 mt-2">
                                <FormField control={form.control} name="dropdown.start.day" render={({ field }) => ( <FormItem><Select onValueChange={val => field.onChange(parseInt(val))} value={field.value?.toString()}><FormControl><SelectTrigger><SelectValue placeholder="Day" /></SelectTrigger></FormControl><SelectContent className="max-h-60">{days.map(d => <SelectItem key={d} value={String(d)}>{d}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem> )}/>
                                <FormField control={form.control} name="dropdown.start.month" render={({ field }) => ( <FormItem><Select onValueChange={val => field.onChange(parseInt(val))} value={field.value?.toString()}><FormControl><SelectTrigger><SelectValue placeholder="Month" /></SelectTrigger></FormControl><SelectContent className="max-h-60">{months.map(m => <SelectItem key={m} value={String(m)}>{monthNames[m]}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem> )}/>
                                <FormField control={form.control} name="dropdown.start.year" render={({ field }) => ( <FormItem><FormControl><Input type="number" placeholder="Year" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem> )}/>
                            </div>
                            <FormMessage>{form.formState.errors.dropdown?.start?.day?.message}</FormMessage>
                        </div>
                         <div>
                            <FormLabel>End Date:</FormLabel>
                            <div className="grid grid-cols-3 gap-2 mt-2">
                                <FormField control={form.control} name="dropdown.end.day" render={({ field }) => ( <FormItem><Select onValueChange={val => field.onChange(parseInt(val))} value={field.value?.toString()}><FormControl><SelectTrigger><SelectValue placeholder="Day" /></SelectTrigger></FormControl><SelectContent className="max-h-60">{days.map(d => <SelectItem key={d} value={String(d)}>{d}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem> )}/>
                                <FormField control={form.control} name="dropdown.end.month" render={({ field }) => ( <FormItem><Select onValueChange={val => field.onChange(parseInt(val))} value={field.value?.toString()}><FormControl><SelectTrigger><SelectValue placeholder="Month" /></SelectTrigger></FormControl><SelectContent className="max-h-60">{months.map(m => <SelectItem key={m} value={String(m)}>{monthNames[m]}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem> )}/>
                                <FormField control={form.control} name="dropdown.end.year" render={({ field }) => ( <FormItem><FormControl><Input type="number" placeholder="Year" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem> )}/>
                            </div>
                             <FormMessage>{form.formState.errors.dropdown?.end?.day?.message}</FormMessage>
                        </div>
                    </div>
                </TabsContent>
                <TabsContent value="text">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
                        <FormField control={form.control} name="text.startDate" render={({ field }) => (<FormItem className="flex flex-col"><FormLabel>Start Date</FormLabel><FormControl><Input type="date" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem> )} />
                        <FormField control={form.control} name="text.endDate" render={({ field }) => (<FormItem className="flex flex-col"><FormLabel>End Date</FormLabel><FormControl><Input type="date" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem> )} />
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

    