'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Split, Info, TrendingUp, Shield, Landmark } from 'lucide-react';
import { calculateTimeDuration } from '@/lib/employment-calculators';
import Link from 'next/link';

const timeSchema = z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time (HH:MM)");

const formSchema = z.object({
  shift1Start: timeSchema,
  shift1End: timeSchema,
  shift2Start: timeSchema,
  shift2End: timeSchema,
});

type FormValues = z.infer<typeof formSchema>;

interface CalculationResult {
  shift1: { hours: number; minutes: number; };
  shift2: { hours: number; minutes: number; };
  breakDuration: { hours: number; minutes: number; };
  totalWork: { hours: number; minutes: number; decimalHours: number; };
}

export default function SplitShiftHoursCalculator() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      shift1Start: undefined,
      shift1End: undefined,
      shift2Start: undefined,
      shift2End: undefined,
    },
  });

  const resetForm = () => {
    form.reset({
      shift1Start: undefined,
      shift1End: undefined,
      shift2Start: undefined,
      shift2End: undefined,
    });
    setResult(null);
  };
  
  const onSubmit = (values: FormValues) => {
    const shift1 = calculateTimeDuration(values.shift1Start, values.shift1End, false);
    const shift2 = calculateTimeDuration(values.shift2Start, values.shift2End, false);
    const breakDuration = calculateTimeDuration(values.shift1End, values.shift2Start, false);

    const totalMinutes = shift1.totalMinutes + shift2.totalMinutes;
    const totalHours = Math.floor(totalMinutes / 60);
    const remainingMinutes = totalMinutes % 60;
    const decimalHours = totalMinutes / 60;

    setResult({
      shift1: { hours: shift1.hours, minutes: shift1.minutes },
      shift2: { hours: shift2.hours, minutes: shift2.minutes },
      breakDuration: { hours: breakDuration.hours, minutes: breakDuration.minutes },
      totalWork: { hours: totalHours, minutes: remainingMinutes, decimalHours },
    });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Split className="h-5 w-5" />
            Split Shift Hours Calculator
          </CardTitle>
          <CardDescription>
            Calculate the total hours for a split shift, including the duration of the break.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">First Shift</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <FormField control={form.control} name="shift1Start" render={({ field }) => (<FormItem><FormLabel>Start Time (24h)</FormLabel><FormControl><Input placeholder="e.g., 08:00" {...field} /></FormControl><FormMessage /></FormItem>)} />
                   <FormField control={form.control} name="shift1End" render={({ field }) => (<FormItem><FormLabel>End Time (24h)</FormLabel><FormControl><Input placeholder="e.g., 12:00" {...field} /></FormControl><FormMessage /></FormItem>)} />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2">Second Shift</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <FormField control={form.control} name="shift2Start" render={({ field }) => (<FormItem><FormLabel>Start Time (24h)</FormLabel><FormControl><Input placeholder="e.g., 16:00" {...field} /></FormControl><FormMessage /></FormItem>)} />
                   <FormField control={form.control} name="shift2End" render={({ field }) => (<FormItem><FormLabel>End Time (24h)</FormLabel><FormControl><Input placeholder="e.g., 20:00" {...field} /></FormControl><FormMessage /></FormItem>)} />
                </div>
              </div>

               <div className="flex gap-4">
                <Button type="submit">Calculate Hours</Button>
                <Button type="button" variant="outline" onClick={resetForm}>Reset</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      {result && (
        <Card>
            <CardHeader>
                <CardTitle>Shift Analysis</CardTitle>
            </CardHeader>
            <CardContent>
                 <div className="text-center mb-8">
                    <p className="text-lg font-medium text-muted-foreground">Total Work Duration</p>
                    <p className="text-5xl font-bold text-primary mt-1">{result.totalWork.hours}h {result.totalWork.minutes}m</p>
                    <p className="text-muted-foreground">({result.totalWork.decimalHours.toFixed(2)} decimal hours)</p>
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                    <div className="p-4 bg-muted/50 rounded-lg">
                        <h4 className="text-sm font-medium text-muted-foreground">Shift 1 Duration</h4>
                        <p className="text-2xl font-bold">{result.shift1.hours}h {result.shift1.minutes}m</p>
                    </div>
                    <div className="p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                        <h4 className="text-sm font-medium text-muted-foreground">Break Duration</h4>
                        <p className="text-2xl font-bold text-orange-600">{result.breakDuration.hours}h {result.breakDuration.minutes}m</p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                        <h4 className="text-sm font-medium text-muted-foreground">Shift 2 Duration</h4>
                        <p className="text-2xl font-bold">{result.shift2.hours}h {result.shift2.minutes}m</p>
                    </div>
                </div>
            </CardContent>
        </Card>
      )}

      <div className="space-y-6">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" />Understanding Split Shifts</CardTitle></CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>A split shift is a work schedule that is divided into two or more parts, separated by a longer-than-usual unpaid break. For example, an employee might work from 9 AM to 1 PM and then again from 5 PM to 9 PM on the same day.</p>
            <p>This calculator helps employees and managers accurately calculate the total paid hours for such a schedule, while also clearly defining the duration of the unpaid break period between the two work blocks.</p>
          </CardContent>
        </Card>

        <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" />Calculation Logic</CardTitle></CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p>The calculator independently determines the duration of each work block and the break in between. It then sums the work durations to provide a total for the day.</p>
               <ol className="list-decimal pl-5 mt-2 space-y-2">
                  <li><strong className="text-foreground">Calculate Durations:</strong> The time difference is calculated for Shift 1, Shift 2, and the break period.</li>
                  <li><strong className="text-foreground">Sum Work Hours:</strong> The total minutes from Shift 1 and Shift 2 are added together.</li>
                  <li><strong className="text-foreground">Format Output:</strong> The total minutes are converted into both hours/minutes format and a decimal format for easy payroll calculation.</li>
              </ol>
            </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Landmark className="h-5 w-5" />Related Calculators</CardTitle></CardHeader>
          <CardContent><ul className="list-disc pl-5 text-sm text-primary"><li><Link href="/employment/night-shift-duration-calculator" className="hover:underline">Night Shift Duration Calculator</Link></li></ul></CardContent>
        </Card>

        <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg">
            <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">A Guide to Split Shift Regulations and Best Practices</h1>
            <p className="text-lg italic">Split shifts are common in service industries but come with specific legal requirements and employee-welfare considerations.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Industries and Legal Considerations</h2>
            <p>Split shifts are most prevalent in industries where demand peaks at certain times of the day.</p>
            <div className="overflow-x-auto mt-4">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-muted"><th className="p-4 border">Industry</th><th className="p-4 border">Example Use Case</th><th className="p-4 border">Key Regulation</th></tr>
                    </thead>
                    <tbody>
                        <tr><td className="p-4 border font-semibold">Restaurants & Hospitality</td><td className="p-4 border">Covering the lunch rush (e.g., 11am-2pm) and the dinner rush (e.g., 5pm-10pm).</td><td className="p-4 border">Some states require "split shift pay."</td></tr>
                        <tr><td className="p-4 border font-semibold">Transportation</td><td className="p-4 border">School bus drivers working morning and afternoon routes.</td><td className="p-4 border">Hours of service regulations are critical.</td></tr>
                        <tr><td className="p-4 border font-semibold">Retail</td><td className="p-4 border">Covering opening, midday, and closing shifts during peak holiday seasons.</td><td className="p-4 border">Predictive scheduling laws in some cities may apply.</td></tr>
                    </tbody>
                </table>
            </div>

            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">What is Split Shift Pay?</h2>
            <p>Several states have regulations requiring employers to pay a premium to employees who work split shifts. This is to compensate the employee for the inconvenience of having their workday extended over a long period. For example:</p>
             <ul className="list-disc ml-6 space-y-3">
                <li><strong className="font-semibold text-foreground">California:</strong> Requires employers to pay one extra hour of pay at the minimum wage rate for any day an employee works a split shift.</li>
                <li><strong className="font-semibold text-foreground">New York:</strong> Requires one extra hour of pay at the minimum wage rate when the spread of hours exceeds 10 hours in a day.</li>
            </ul>
            <p>It's crucial for employers to check their state and local labor laws to ensure compliance with any split shift pay requirements.</p>
        </section>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" />Frequently Asked Questions</CardTitle></CardHeader>
          <CardContent className="space-y-4">
             <div className="p-4 border rounded-lg"><h4 className="font-semibold mb-2">Is the break between shifts paid?</h4><p className="text-muted-foreground">Generally, no. The long break between the two work periods in a split shift is unpaid time. However, short rest breaks within a work period may be required to be paid by state law.</p></div>
             <div className="p-4 border rounded-lg"><h4 className="font-semibold mb-2">Does this calculator handle overtime?</h4><p className="text-muted-foreground">This calculator provides the total hours worked. You must apply your local overtime rules (e.g., time-and-a-half for hours over 8 in a day or 40 in a week) to the total to determine final pay.</p></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" />Summary</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground"><p>This calculator provides a clear and accurate calculation for split shift schedules. By breaking down the duration of each work block and the intermediate break, it gives employees a precise total of their daily work hours and helps employers ensure accurate payroll and compliance with labor regulations.</p></CardContent>
        </Card>
      </div>
    </div>
  );
}
