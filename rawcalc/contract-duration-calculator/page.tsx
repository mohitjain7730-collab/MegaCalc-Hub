
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, CalendarRange, Info, TrendingUp, Shield, Landmark } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { calculateContractDuration } from '@/lib/employment-calculators';
import Link from 'next/link';

const formSchema = z.object({
  startDate: z.date({
    required_error: "A start date is required.",
  }),
  endDate: z.date({
    required_error: "An end date is required.",
  }),
}).refine(data => data.endDate > data.startDate, {
  message: "End date must be after start date.",
  path: ["endDate"],
});


type FormValues = z.infer<typeof formSchema>;

interface CalculationResult {
  totalDays: number;
  totalWeeks: number;
  totalMonths: number;
  years: number;
  months: number;
  days: number;
}

export default function ContractDurationCalculator() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      startDate: undefined,
      endDate: undefined,
    },
  });

  const resetForm = () => {
    form.reset({
      startDate: undefined,
      endDate: undefined,
    });
    setResult(null);
  };
  
  const onSubmit = (values: FormValues) => {
    const duration = calculateContractDuration(values.startDate, values.endDate);
    setResult(duration);
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarRange className="h-5 w-5" />
            Contract Duration Calculator
          </CardTitle>
          <CardDescription>
            Calculate the precise duration between a contract's start and end dates.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Contract Start Date</FormLabel>
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
                  name="endDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Contract End Date</FormLabel>
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
                            disabled={(date) => date < (form.getValues().startDate || new Date(0))}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

               <div className="flex gap-4">
                <Button type="submit">Calculate Duration</Button>
                <Button type="button" variant="outline" onClick={resetForm}>Reset</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      {result && (
        <Card>
            <CardHeader>
                <CardTitle>Contract Duration</CardTitle>
                 <CardDescription>
                    The total time from {format(form.getValues().startDate!, 'PPP')} to {format(form.getValues().endDate!, 'PPP')}.
                </CardDescription>
            </CardHeader>
            <CardContent>
                 <div className="text-center mb-8">
                    <p className="text-lg font-medium text-muted-foreground">Total Duration</p>
                    <p className="text-4xl md:text-5xl font-bold text-primary mt-1">
                        {result.years > 0 && `${result.years}y `}
                        {result.months > 0 && `${result.months}m `}
                        {result.days > 0 && `${result.days}d`}
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                    <div className="p-4 bg-muted/50 rounded-lg">
                        <h4 className="text-sm font-medium text-muted-foreground">In Total Days</h4>
                        <p className="text-2xl font-bold">{result.totalDays}</p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                        <h4 className="text-sm font-medium text-muted-foreground">In Total Weeks</h4>
                        <p className="text-2xl font-bold">{result.totalWeeks.toFixed(1)}</p>
                    </div>
                     <div className="p-4 bg-muted/50 rounded-lg">
                        <h4 className="text-sm font-medium text-muted-foreground">In Total Months</h4>
                        <p className="text-2xl font-bold">{result.totalMonths.toFixed(1)}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
      )}

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" />Understanding the Calculation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>This calculator determines the inclusive duration between two dates. It breaks down the total time into a human-readable format of years, months, and days, while also providing the total duration in days, weeks, and months for different planning needs.</p>
            <p>Knowing the precise duration of a contract is vital for project planning, resource allocation, billing cycles, and ensuring compliance with contractual obligations and renewal deadlines.</p>
          </CardContent>
        </Card>

        <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" />Calculation Logic</CardTitle></CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <div>
                  <h4 className="font-semibold text-foreground mb-2">Date Difference Logic</h4>
                  <p>The calculator uses date-fns, a robust library for date manipulation, to accurately compute the difference between the start and end dates.</p>
                  <ol className="list-decimal pl-5 mt-2 space-y-1">
                      <li><strong className="text-foreground">Total Days:</strong> Calculates the absolute number of days between the two dates.</li>
                      <li><strong className="text-foreground">Years, Months, Days Breakdown:</strong> It calculates the number of full years, then full months within the remainder, and finally the remaining days for a "X years, Y months, Z days" format.</li>
                  </ol>
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
            <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">The Freelancer & Manager's Guide to Contract Durations</h1>
            <p className="text-lg italic">Whether you're a freelancer managing multiple projects or a manager allocating resources, accurately calculating contract durations is a fundamental skill. It impacts everything from cash flow and project timelines to legal compliance.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Why Precise Duration Matters</h2>
            <div className="overflow-x-auto mt-4">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-muted">
                            <th className="p-4 border">Stakeholder</th>
                            <th className="p-4 border">Key Importance</th>
                            <th className="p-4 border">Example</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="p-4 border font-semibold">Freelancers</td>
                            <td className="p-4 border">Cash flow forecasting, availability planning, and milestone invoicing.</td>
                            <td className="p-4 border">A 90-day contract might have three monthly billing cycles. Knowing the exact end date prevents gaps in income.</td>
                        </tr>
                        <tr>
                            <td className="p-4 border font-semibold">Project Managers</td>
                            <td className="p-4 border">Resource allocation, project timeline management, and dependency planning.</td>
                            <td className="p-4 border">A 6-month contract for a key developer means they must complete their tasks before that date or the project is delayed.</td>
                        </tr>
                        <tr>
                            <td className="p-4 border font-semibold">HR & Legal</td>
                            <td className="p-4 border">Compliance, renewal notifications, and benefits eligibility.</td>
                            <td className="p-4 border">A one-year contract might have a 60-day renewal notification clause. The end date dictates the final day for that notice.</td>
                        </tr>
                         <tr>
                            <td className="p-4 border font-semibold">Clients</td>
                            <td className="p-4 border">Budgeting, deliverable expectations, and planning for post-contract transitions.</td>
                            <td className="p-4 border">Knowing a marketing contract ends on a specific date allows the client to plan their next campaign or hire a replacement.</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Common Pitfalls in Contract Duration</h2>
            <ul className="list-disc ml-6 space-y-3">
                <li><strong className="font-semibold text-foreground">Ambiguous Start Dates:</strong> Does the contract start on the day it's signed or a specified "Effective Date"? This should always be clarified.</li>
                <li><strong className="font-semibold text-foreground">"Business Days" vs. "Calendar Days":</strong> A "30-day" contract is very different from a "30-business-day" contract. Always ensure the language is specific. This calculator uses calendar days.</li>
                <li><strong className="font-semibold text-foreground">Renewal Clauses:</strong> Many contracts have auto-renewal ("evergreen") clauses. Knowing your contract duration is key to providing timely notice if you do *not* wish to renew.</li>
            </ul>
        </section>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" />Frequently Asked Questions</CardTitle></CardHeader>
          <CardContent className="space-y-4">
             <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">Is the end date included in the calculation?</h4>
                <p className="text-muted-foreground">Yes, this calculator is inclusive of the end date. For example, the duration from January 1 to January 2 is considered two days.</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">How does this calculator handle leap years?</h4>
                <p className="text-muted-foreground">By using a standard date library, leap years are automatically accounted for, ensuring the total number of days is accurate.</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">What's the difference between the "total months" and the "months" in the breakdown?</h4>
                <p className="text-muted-foreground">"Total months" provides the entire duration expressed as a single number (e.g., 2.5 months). The "months" in the "X years, Y months, Z days" breakdown shows only the number of full months *after* accounting for full years.</p>
              </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" />Summary</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>This calculator offers a clear and precise way to determine the duration of a contract or project. By providing a human-readable breakdown (years, months, days) and total durations (in days, weeks, and months), it serves as an essential tool for freelancers, project managers, and anyone who needs to manage timelines, resources, and contractual obligations effectively.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
