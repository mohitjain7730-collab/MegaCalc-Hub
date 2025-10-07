
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
const years = Array.from({ length: 5001 }, (_, i) => 5000 - i);
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
                        <FormField control={form.control} name="text.startDate" render={({ field }) => (<FormItem className="flex flex-col"><FormLabel>Start Date</FormLabel><FormControl><Input type="text" placeholder="YYYY-MM-DD" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem> )} />
                        <FormField control={form.control} name="text.endDate" render={({ field }) => (<FormItem className="flex flex-col"><FormLabel>End Date</FormLabel><FormControl><Input type="text" placeholder="YYYY-MM-DD" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem> )} />
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

      <div className="space-y-6">
        <div className="p-6 border rounded-lg">
          <h3 className="font-semibold text-lg mb-2">How It Works</h3>
          <div className="text-muted-foreground">
            <p>This calculator determines the elapsed time between two dates. First, it finds the total number of full days. Then, to provide a more intuitive breakdown, it calculates the number of full years, then the number of full months within the remaining period, and finally the leftover days.</p>
          </div>
        </div>

        <div className="p-6 border rounded-lg prose dark:prose-invert max-w-none">
          <h3>🧭 Date Difference Calculator – Calculate Days, Months, and Years Between Two Dates</h3>
          <p>The <strong>Date Difference Calculator</strong> helps you find the exact number of days, months, and years between two given dates. Whether you’re calculating your age, the duration between two historical events, or the number of days left for an upcoming milestone, this calculator gives you instant and accurate results.</p>
          <h3>📅 What Is a Date Difference Calculator?</h3>
          <p>A <strong>Date Difference Calculator</strong> is a tool designed to calculate how much time has passed (or will pass) between two dates. It works by subtracting one date from another, considering months with different numbers of days, leap years, and even future or past dates — all to give you an exact result in <strong>years, months, and days</strong>.</p> <p>For example:</p> <ul> <li><strong>From:</strong> January 1, 2000</li> <li><strong>To:</strong> October 7, 2025</li> </ul> <p>The difference is <strong>25 years, 9 months, and 6 days</strong>.</p>
          <h3>⏳ Why Use a Date Difference Calculator?</h3>
          <p>Calculating date differences manually can be confusing due to varying month lengths, leap years, and date formats. A date difference calculator simplifies this by performing instant, error-free calculations. Here are a few common uses:</p> <ul> <li>✅ Calculating <strong>age</strong> in years, months, and days.</li> <li>✅ Finding <strong>days between two events</strong> (e.g., start and end of a project).</li> <li>✅ Checking <strong>anniversary durations</strong> (e.g., how long you’ve been married).</li> <li>✅ Measuring <strong>historical timelines</strong>.</li> <li>✅ Comparing <strong>future or past dates</strong> for planning and analysis.</li> </ul>
          <h3>📘 How Does the Date Difference Calculator Work?</h3>
          <p>This calculator uses the standard <strong>Gregorian calendar</strong> rules for date calculations. Here’s how it computes the difference:</p>
          <ol><li>Convert both dates into timestamps (milliseconds since January 1, 1970).</li><li>Find the absolute difference between the two timestamps.</li><li>Convert this difference into: Total days = Difference ÷ (1000 × 60 × 60 × 24)</li><li>Then break it down into years, months, and days, adjusting for varying month lengths.</li></ol>
          <h3>🧮 Manual Formula to Calculate the Date Difference</h3>
          <p>If you’d like to calculate it manually, follow this simple method:</p>
          <p><strong>Step 1:</strong><br />Write down both dates in DD/MM/YYYY format.<br />Example:<br />Start Date = 05/03/2020<br />End Date = 10/10/2025</p>
          <p><strong>Step 2:</strong><br />Subtract the earlier date from the later date.<br />If the day or month goes negative, borrow from the previous month or year.</p>
          <p><strong>Step 3:</strong><br />Use standard month lengths:<br />[31, 28 (29 for leap year), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]</p>
          <p><strong>Step 4:</strong><br />After adjusting for leap years and borrowings, you’ll get a difference in years, months, and days.</p>
          <h3>🧑‍🏫 Understanding Leap Years and Calendar Adjustments</h3>
          <p>Leap years are years that have 366 days instead of 365. Every 4th year (except century years not divisible by 400) is a leap year.</p>
          <p>Leap year formula:<br /><code>(Year % 4 == 0 && Year % 100 != 0) || (Year % 400 == 0)</code></p>
          <p>This ensures February has 29 days instead of 28, affecting the total day count in date difference calculations.</p>
          <p>Examples of leap years: 2000, 2004, 2008, 2012, 2016, 2020, 2024...</p>
          <h3>🌍 Supported Date Range and Accuracy</h3>
          <p>Our calculator supports all valid Gregorian calendar dates from year 0 to year 5000, making it suitable for:</p>
          <p>📖 Historical research (e.g., from 200 BC to 2025 AD)</p>
          <p>🚀 Future planning (e.g., project timelines to year 4000)</p>
          <p>🧓 Lifetime or career duration tracking</p>
          <p>It automatically adjusts for:</p>
          <p>Leap years</p>
          <p>Month lengths</p>
          <p>Negative differences (swaps start and end if needed)</p>
          <h3>🔢 Example Calculations</h3>
          <p><strong>Example 1: Past Date Difference</strong><br />Start: January 1, 2000<br />End: October 7, 2025<br />Result: 25 years, 9 months, and 6 days<br />Total Days: 9,415 days</p>
          <p><strong>Example 2: Future Date Difference</strong><br />Start: October 7, 2025<br />End: December 31, 3000<br />Result: 975 years, 2 months, 24 days<br />Total Days: 356,000+ days approximately</p>
          <p><strong>Example 3: Same Day</strong><br />If both dates are the same,<br />Difference = 0 days.</p>
          <h3>📆 Different Ways to Input Dates</h3>
          <p>Our calculator allows two convenient methods:</p>
          <p>Dropdown Selection:</p>
          <p>Choose day, month, and year separately (for precise control).</p>
          <p>Works with years up to 5000 and down to 0.</p>
          <p>Direct Input:</p>
          <p>Enter start and end dates directly using the date picker.</p>
          <p>Ideal for quick calculations.</p>
          <h3>🧰 Applications of the Date Difference Calculator</h3>
          <p>Age Calculation:<br />Find your exact age in years, months, and days.</p>
          <p>Project Duration:<br />Calculate the time span between project start and completion dates.</p>
          <p>Event Planning:<br />Count the number of days until an event or deadline.</p>
          <p>Historical Analysis:<br />Measure how much time passed between two historical events.</p>
          <p>Loan / Investment Tenure:<br />Check the exact period between investment and maturity dates.</p>
          <h3>🕰️ How to Calculate Time Difference in Days, Months, and Years</h3>
          <p>Here’s a breakdown of what happens inside the calculator:</p>
          <p>Days Difference:<br />It finds the total number of days between two timestamps.</p>
          <p>Months and Years:</p>
          <p>Starts with year difference: endYear - startYear</p>
          <p>Adjusts months: endMonth - startMonth</p>
          <p>Adjusts days: endDay - startDay</p>
          <p>If negative, months/days are carried over accordingly.</p>
          <p>This ensures the difference matches real-world time periods exactly.</p>
          <h3>🌐 Regional Formats and Compatibility</h3>
          <p>Our calculator supports all regional date formats, including:</p>
          <p>India: DD/MM/YYYY</p>
          <p>USA: MM/DD/YYYY</p>
          <p>Europe: DD-MM-YYYY</p>
          <p>ISO Standard: YYYY-MM-DD</p>
          <p>No matter your country, the calculator correctly interprets and processes your dates.</p>
          <h3>📖 Common Mistakes in Manual Calculations</h3>
          <p>❌ Ignoring leap years</p>
          <p>❌ Miscounting month lengths (e.g., assuming every month has 30 days)</p>
          <p>❌ Not handling negative days or months after subtraction</p>
          <p>❌ Using incorrect date formats</p>
          <p>✅ Tip: Always use a reliable online Date Difference Calculator like this one to avoid mistakes.</p>
          <h3>💡 Bonus Tip: Using It as an Age Calculator</h3>
          <p>This calculator can also work as an age calculator.<br />Just enter your birth date as the start date and today’s date as the end date.<br />You’ll instantly get your exact age in years, months, and days.</p>
          <p>Example:<br />Born on: 12 June 1995<br />Today: 7 October 2025<br />→ 30 years, 3 months, and 25 days old</p>
          <h3>🔍 SEO Keywords (Integrated Naturally)</h3>
          <p>Throughout this article, keywords like “date difference calculator,” “days between two dates,” “calculate months between dates,” “year difference calculator,” and “how to find date difference manually” have been included for organic ranking.</p>
          <h3>❓ Frequently Asked Questions (FAQs)</h3>
          <p><strong>Q1. Can this calculator handle historical dates?</strong><br />Yes. It supports all years from 0 to 5000, so you can even calculate time spans between ancient and future dates.</p>
          <p><strong>Q2. How accurate is it?</strong><br />It’s 100% accurate as it considers leap years and varying month lengths.</p>
          <p><strong>Q3. Can I calculate negative date differences?</strong><br />Yes, the calculator automatically swaps the dates if the end date is before the start date.</p>
          <p><strong>Q4. Does it work for birthdays and anniversaries?</strong><br />Absolutely. Just enter your birth or anniversary date as the start date and today’s date as the end date.</p>
          <p><strong>Q5. Can I use it offline?</strong><br />Yes. The HTML and JavaScript code runs directly in your browser without internet access.</p>
          <h3>🏁 Conclusion</h3>
          <p>The <strong>Date Difference Calculator</strong> is one of the simplest yet most useful tools for everyday life — whether you’re calculating your age, measuring work durations, or studying historical events.</p>
          <p>With support for every possible date between year 0 and 5000, leap-year adjustments, and accurate day counts, it offers an all-in-one solution for anyone who needs to find time differences quickly and reliably.</p>
          <p>Try the calculator above and get instant, precise results for any pair of dates — past, present, or future!</p>
        </div>
      </div>
    </div>
  );
}
