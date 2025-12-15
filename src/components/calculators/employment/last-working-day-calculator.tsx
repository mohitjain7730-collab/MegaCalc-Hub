
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, CalendarOff, Info, TrendingUp, Shield, Landmark } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { calculateLastWorkingDay } from '@/lib/employment-calculators';
import Link from 'next/link';

const formSchema = z.object({
  resignationDate: z.date({
    required_error: "A resignation date is required.",
  }),
  noticeDuration: z.number().positive("Duration must be positive."),
  noticeUnit: z.enum(['days', 'weeks', 'months']),
  publicHolidays: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface CalculationResult {
  noticePeriodEndDate: Date;
  lastWorkingDay: Date;
  totalHolidays: number;
}

export default function LastWorkingDayCalculator() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      resignationDate: undefined,
      noticeDuration: undefined,
      noticeUnit: 'weeks',
      publicHolidays: '',
    },
  });

  const resetForm = () => {
    form.reset({
      resignationDate: undefined,
      noticeDuration: undefined,
      noticeUnit: 'weeks',
      publicHolidays: '',
    });
    setResult(null);
  };
  
  const onSubmit = (values: FormValues) => {
    const { noticePeriodEndDate, lastWorkingDay, totalHolidays } = calculateLastWorkingDay(values);
    setResult({ noticePeriodEndDate, lastWorkingDay, totalHolidays });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarOff className="h-5 w-5" />
            Last Working Day Calculator
          </CardTitle>
          <CardDescription>
            Calculate your final day of work, excluding weekends and public holidays.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="resignationDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Resignation Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                            >
                              {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            fromYear={1900}
                            toYear={new Date().getFullYear() + 75}
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="publicHolidays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Public Holidays (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="YYYY-MM-DD, YYYY-MM-DD" {...field} />
                      </FormControl>
                       <FormDescription>
                        Comma-separated dates, e.g., 2024-12-25, 2025-01-01
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <FormField
                  control={form.control}
                  name="noticeDuration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notice Period Duration</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 10" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="noticeUnit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration Unit</FormLabel>
                       <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select unit" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="days">Working Days</SelectItem>
                          <SelectItem value="weeks">Weeks</SelectItem>
                          <SelectItem value="months">Months</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

               <div className="flex gap-4">
                <Button type="submit">Calculate Last Day</Button>
                <Button type="button" variant="outline" onClick={resetForm}>Reset</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      {result && (
        <Card>
            <CardHeader>
                <CardTitle>Last Working Day Projection</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
                <div>
                    <p className="text-sm text-muted-foreground">Notice Period End Date (raw)</p>
                    <p className="text-2xl font-bold mt-1">{format(result.noticePeriodEndDate, 'PPPP')}</p>
                </div>
                 <div className="border-t pt-4">
                    <p className="text-sm text-muted-foreground">Adjusted Last Working Day</p>
                    <p className="text-4xl font-bold text-primary mt-1">{format(result.lastWorkingDay, 'PPPP')}</p>
                    <p className="text-muted-foreground mt-1">{format(result.lastWorkingDay, 'eeee')}</p>
                    {result.totalHolidays > 0 && <p className="text-xs text-muted-foreground mt-2">(Accounts for {result.totalHolidays} public holiday(s))</p>}
                 </div>
            </CardContent>
        </Card>
      )}

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" />What is the Last Working Day?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>Your "last working day" is the final day you are expected to perform duties for your employer. This date is important for payroll, benefits continuation, and handover processes. It is often different from the raw notice period end date.</p>
            <p>This calculator determines the date by first calculating the end of the notice period, then adjusting that date to account for non-working days like weekends and specified public holidays, ensuring the calculation reflects the true end of your employment term.</p>
          </CardContent>
        </Card>

        <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" />Calculation Logic Explained</CardTitle></CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <div>
                  <h4 className="font-semibold text-foreground mb-2">Step-by-Step Calculation</h4>
                  <ol className="list-decimal pl-5 mt-2 space-y-2">
                      <li><strong className="text-foreground">Calculate Raw End Date:</strong> The notice period (in calendar days, weeks, or months) is added to the resignation date. This gives a theoretical end date.</li>
                      <li><strong className="text-foreground">Handle "Working Days" Notice:</strong> If the notice is specified in "working days", the calculator iteratively adds days, skipping weekends and any provided public holidays, until the count is met.</li>
                      <li><strong className="text-foreground">Adjust for Weekends & Holidays:</strong> If the raw end date falls on a Saturday, Sunday, or a specified public holiday, the calculator adjusts it to the preceding business day.</li>
                  </ol>
                  <p className="mt-2">This multi-step process ensures a more accurate final date compared to a simple calendar addition.</p>
              </div>
            </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Landmark className="h-5 w-5" />Related Calculators</CardTitle>
            <CardDescription>Explore other employment and career planning tools.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 text-sm text-primary">
              <li><Link href="/employment/notice-period-calculator" className="hover:underline">Notice Period End Date Calculator</Link></li>
              <li><Link href="/employment/probation-period-calculator" className="hover:underline">Probation Period End Date Calculator</Link></li>
            </ul>
          </CardContent>
        </Card>
        
        <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg">
            <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">A Practical Guide to Your Final Days at Work</h1>
            <p className="text-lg italic">Calculating your last working day is the first step in planning a smooth and professional exit from your company. This guide covers the key considerations, from handover to final pay.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Calendar Days vs. Working Days: A Critical Distinction</h2>
            <p>Employment contracts can define notice periods in two ways, and the difference is crucial:</p>
            <ul className="list-disc ml-6 space-y-3">
                <li><strong className="font-semibold text-foreground">Calendar Days/Weeks/Months:</strong> This is the most common method. A "2-week" notice period is 14 calendar days. If your last day falls on a weekend, your effective last working day is usually the Friday before.</li>
                <li><strong className="font-semibold text-foreground">Working Days (or Business Days):</strong> This method excludes weekends and public holidays from the count. A "10 working day" notice period will be longer than 10 calendar days. This calculator handles both types, but it's vital to know which one your contract specifies.</li>
            </ul>

            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Checklist for Your Notice Period</h2>
            <p>Once you've given your notice, use the time wisely to ensure a seamless transition.</p>
             <ol className="list-decimal ml-6 space-y-3">
                <li><strong className="font-semibold text-foreground">Create a Handover Document:</strong> This is your most important task. Document your key responsibilities, project statuses, important contacts, and login credentials for work-related systems.</li>
                <li><strong className="font-semibold text-foreground">Schedule Knowledge Transfer Sessions:</strong> Don't just leave a document. Schedule time to walk your manager or replacement through your duties.</li>
                <li><strong className="font-semibold text-foreground">Clean Up Your Files:</strong> Organize your digital and physical files so your successor can find everything easily.</li>
                <li><strong className="font-semibold text-foreground">Confirm Final Pay and Benefits:</strong> Talk to HR to understand when you will receive your final paycheck, how your unused vacation time will be handled (payout vs. forfeiture), and what your options are for continuing health coverage (e.g., COBRA).</li>
            </ol>
            
            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Handling of Public Holidays & Leave</h2>
            <p>How leave and holidays are treated during a notice period varies by company policy and local law.</p>
            <div className="overflow-x-auto mt-4">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-muted">
                            <th className="p-4 border">Scenario</th>
                            <th className="p-4 border">Common Handling</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="p-4 border">A public holiday falls within the notice period.</td>
                            <td className="p-4 border">The notice period is usually not extended. The holiday is treated as a paid non-working day.</td>
                        </tr>
                        <tr>
                            <td className="p-4 border">You take pre-approved vacation days during notice.</td>
                            <td className="p-4 border">Generally allowed, but the employer may have policies against it or may ask to pay you out instead to ensure you are present for handover.</td>
                        </tr>
                        <tr>
                            <td className="p-4 border">You call in sick during your notice period.</td>
                            <td className="p-4 border">Legitimate sick days are protected. However, employers may require a doctor's note and excessive use could be viewed negatively.</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </section>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" />Frequently Asked Questions</CardTitle></CardHeader>
          <CardContent className="space-y-4">
             <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">My last day landed on a Friday, but that's a public holiday. What happens?</h4>
                <p className="text-muted-foreground">In most cases, your last working day would become the preceding Thursday. The calculator automatically handles this adjustment if you input the holiday date.</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">What's the difference between this and the Notice Period Calculator?</h4>
                <p className="text-muted-foreground">The Notice Period Calculator gives you the raw calendar end date of your notice. This Last Working Day calculator takes it a step further by adjusting that date to account for weekends and holidays, giving you your true final day of work.</p>
              </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" />Summary</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>This calculator provides a precise estimate for your last working day by adjusting the raw notice period end date for weekends and public holidays. It is an essential tool for employees and HR managers to accurately plan handovers, final payroll, and off-boarding procedures, ensuring a smooth and professional transition out of a role.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
