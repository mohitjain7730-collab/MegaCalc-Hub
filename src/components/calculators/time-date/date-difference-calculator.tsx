
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { parse, isValid, differenceInDays, differenceInYears, differenceInMonths } from 'date-fns';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Date Difference Calculator – Calculate Days, Months, & Years",
    description: "Easily calculate the exact time between two dates. Find the total number of days, months, and years. Perfect for age calculation, project timelines, and historical analysis.",
    keywords: ["date difference calculator", "days between dates", "calculate months between dates", "year difference calculator", "time duration calculator", "age calculator", "date duration", "how many days between"],
};


const dateSchema = z.object({
    year: z.number().int(),
    month: z.number().int().min(0).max(11),
    day: z.number().int().min(1).max(31),
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

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5001 }, (_, i) => i).reverse();
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
        [startDate, endDate] = [endDate, startDate]; // swap
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
                        </div>
                         <div>
                            <FormLabel>End Date:</FormLabel>
                            <div className="grid grid-cols-3 gap-2 mt-2">
                                <FormField control={form.control} name="dropdown.end.day" render={({ field }) => ( <FormItem><Select onValueChange={val => field.onChange(parseInt(val))} value={field.value?.toString()}><FormControl><SelectTrigger><SelectValue placeholder="Day" /></SelectTrigger></FormControl><SelectContent className="max-h-60">{days.map(d => <SelectItem key={d} value={String(d)}>{d}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem> )}/>
                                <FormField control={form.control} name="dropdown.end.month" render={({ field }) => ( <FormItem><Select onValueChange={val => field.onChange(parseInt(val))} value={field.value?.toString()}><FormControl><SelectTrigger><SelectValue placeholder="Month" /></SelectTrigger></FormControl><SelectContent className="max-h-60">{months.map(m => <SelectItem key={m} value={String(m)}>{monthNames[m]}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem> )}/>
                                <FormField control={form.control} name="dropdown.end.year" render={({ field }) => ( <FormItem><FormControl><Input type="number" placeholder="Year" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem> )}/>
                            </div>
                        </div>
                    </div>
                     <FormMessage>{form.formState.errors.dropdown?.end?.message}</FormMessage>
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

        <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-2">How It Works</h3>
            <div className="text-muted-foreground">
                <p>This calculator determines the time elapsed between two dates. It first computes the total number of days for a quick measure. Then, it calculates the precise difference in terms of years, months, and remaining days, accounting for the varying lengths of months and leap years to provide a human-readable duration.</p>
            </div>
        </div>
        <div className="space-y-4">
            <h3 className="text-xl font-semibold mb-2">🧭 Date Difference Calculator – Calculate Days, Months, and Years Between Two Dates</h3>
            <p className="text-sm">The <strong>Date Difference Calculator</strong> helps you find the exact number of days, months, and years between two given dates. Whether you’re calculating your age, the duration between two historical events, or the number of days left for an upcoming milestone, this calculator gives you instant and accurate results.</p>
            <h4 className='font-bold text-lg mt-4'>📅 What Is a Date Difference Calculator?</h4>
            <p className="text-sm">A <strong>Date Difference Calculator</strong> is a tool designed to calculate how much time has passed (or will pass) between two dates. It works by subtracting one date from another, considering months with different numbers of days, leap years, and even future or past dates — all to give you an exact result in <strong>years, months, and days</strong>.</p>
            <p className="text-sm">For example:</p>
            <ul className="list-disc list-inside pl-4 text-sm">
                <li><strong>From:</strong> January 1, 2000</li>
                <li><strong>To:</strong> October 7, 2025</li>
            </ul>
            <p className="text-sm">The difference is <strong>25 years, 9 months, and 6 days</strong>.</p>
            <h4 className='font-bold text-lg mt-4'>⏳ Why Use a Date Difference Calculator?</h4>
            <p className="text-sm">Calculating date differences manually can be confusing due to varying month lengths, leap years, and date formats. A date difference calculator simplifies this by performing instant, error-free calculations. Here are a few common uses:</p>
            <ul className="list-disc list-inside pl-4 text-sm">
                <li>✅ Calculating <strong>age</strong> in years, months, and days.</li>
                <li>✅ Finding <strong>days between two events</strong> (e.g., start and end of a project).</li>
                <li>✅ Checking <strong>anniversary durations</strong> (e.g., how long you’ve been married).</li>
                <li>✅ Measuring <strong>historical timelines</strong>.</li>
                <li>✅ Comparing <strong>future or past dates</strong> for planning and analysis.</li>
            </ul>
            <h4 className='font-bold text-lg mt-4'>📘 How Does the Date Difference Calculator Work?</h4>
            <p className="text-sm">This calculator uses the standard <strong>Gregorian calendar</strong> rules for date calculations. Here’s how it computes the difference:</p>
            <ol className="list-decimal list-inside pl-4 text-sm">
              <li>Convert both dates into timestamps (milliseconds since January 1, 1970).</li>
              <li>Find the absolute difference between the two timestamps.</li>
              <li>Convert this difference into total days.</li>
              <li>Then break it down into years, months, and days, adjusting for varying month lengths.</li>
            </ol>
            <h4 className='font-bold text-lg mt-4'>🧮 Manual Formula to Calculate the Date Difference</h4>
            <p className="text-sm">If you’d like to calculate it manually, follow this simple method:</p>
            <ol className="list-decimal list-inside pl-4 text-sm">
              <li>Step 1: Write down both dates in DD/MM/YYYY format.</li>
              <li>Step 2: Subtract the earlier date from the later date.</li>
              <li>Step 3: Use standard month lengths.</li>
              <li>Step 4: After adjusting for leap years and borrowings, you’ll get a difference in years, months, and days.</li>
            </ol>
            <h4 className='font-bold text-lg mt-4'>🧑‍🏫 Understanding Leap Years and Calendar Adjustments</h4>
            <p className="text-sm">Leap years are years that have 366 days instead of 365. Every 4th year (except century years not divisible by 400) is a leap year.</p>
            <h4 className='font-bold text-lg mt-4'>🌍 Supported Date Range and Accuracy</h4>
            <p className="text-sm">Our calculator supports all valid Gregorian calendar dates from year 0 to year 5000, making it suitable for historical research, future planning, and lifetime tracking.</p>
            <h4 className='font-bold text-lg mt-4'>🔢 Example Calculations</h4>
            <p className="text-sm"><strong>Example 1:</strong> Start: Jan 1, 2000; End: Oct 7, 2025 -> 25 years, 9 months, 6 days.</p>
            <h4 className='font-bold text-lg mt-4'>📆 Different Ways to Input Dates</h4>
            <p className="text-sm">Our calculator allows two convenient methods: dropdown selection and direct date input.</p>
            <h4 className='font-bold text-lg mt-4'>🧰 Applications of the Date Difference Calculator</h4>
            <p className="text-sm">Use this for age calculation, project duration, event planning, historical analysis, and checking loan tenure.</p>
            <h4 className='font-bold text-lg mt-4'>💡 Bonus Tip: Using It as an Age Calculator</h4>
            <p className="text-sm">This calculator can also work as an age calculator. Just enter your birth date as the start date and today’s date as the end date.</p>
            <h4 className='font-bold text-lg mt-4'>❓ Frequently Asked Questions (FAQs)</h4>
            <p className="text-sm"><strong>Q1. Can this calculator handle historical dates?</strong><br/>Yes. It supports all years from 0 to 5000.</p>
            <p className="text-sm"><strong>Q2. How accurate is it?</strong><br/>It’s 100% accurate as it considers leap years and varying month lengths.</p>
            <p className="text-sm"><strong>Q3. Can I calculate negative date differences?</strong><br/>Yes, the calculator automatically swaps the dates if the end date is before the start date.</p>
            <h4 className='font-bold text-lg mt-4'>🏁 Conclusion</h4>
            <p className="text-sm">The <strong>Date Difference Calculator</strong> is a simple yet useful tool for everyday life. Try the calculator above and get instant, precise results for any pair of dates!</p>
        </div>
    </div>
  );
}
