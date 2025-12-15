
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, CalendarCheck, Info, TrendingUp, Shield, Landmark } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import Link from 'next/link';
import { calculateNoticePeriodEndDate } from '@/lib/employment-calculators';

const formSchema = z.object({
  resignationDate: z.date({
    required_error: "A resignation date is required.",
  }),
  duration: z.number().positive("Duration must be positive."),
  unit: z.enum(['days', 'weeks', 'months']),
});

type FormValues = z.infer<typeof formSchema>;

interface CalculationResult {
  endDate: Date;
}

export default function NoticePeriodCalculator() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      resignationDate: undefined,
      duration: undefined,
      unit: 'weeks',
    },
  });

  const resetForm = () => {
    form.reset({
      resignationDate: undefined,
      duration: undefined,
      unit: 'weeks',
    });
    setResult(null);
  };
  
  const onSubmit = (values: FormValues) => {
    const endDate = calculateNoticePeriodEndDate(values);
    setResult({ endDate });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarCheck className="h-5 w-5" />
            Notice Period End Date Calculator
          </CardTitle>
          <CardDescription>
            Calculate your last day of employment based on your resignation date and notice period.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                              className={cn(
                                "pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
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
                            disabled={(date) => date > new Date("2200-01-01") || date < new Date("1900-01-01")}
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
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notice Period Duration</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 2" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="unit"
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
                          <SelectItem value="days">Days</SelectItem>
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
                <CardTitle>Estimated Last Day of Employment</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
                <p className="text-sm text-muted-foreground">Your notice period is projected to end on:</p>
                <p className="text-4xl font-bold text-primary mt-2">{format(result.endDate, 'PPPP')}</p>
                <p className="text-muted-foreground mt-2">{format(result.endDate, 'eeee')}</p>
            </CardContent>
        </Card>
      )}

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" />Understanding Notice Periods</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>A notice period is the length of time an employee must continue to work for their employer after submitting their resignation. It allows the employer time to find a replacement and ensures a smooth handover of responsibilities.</p>
            <p>The length of the notice period is usually stipulated in the employment contract. In the United States, a "two weeks' notice" is a widely accepted professional courtesy, but it is often not a legal requirement unless specified in a contract. This calculator helps you determine your last day based on your contractual obligation or professional standard.</p>
          </CardContent>
        </Card>

        <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" />Calculation Logic</CardTitle></CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <div>
                  <h4 className="font-semibold text-foreground mb-2">End Date Calculation</h4>
                  <p className="font-mono bg-muted p-4 rounded-md">Last Day = Resignation Date + Notice Period Duration - 1 Day</p>
                  <p className="mt-2">The calculator adds the specified duration (e.g., 14 days for a 2-week notice) to your resignation date and then subtracts one day. This correctly finds the end of the period. For example, a 2-week notice given on a Monday results in a final day on the Sunday two weeks later, not the Monday.</p>
                   <ul className="list-disc pl-5 mt-2 space-y-1">
                      <li><strong className="text-foreground">Days:</strong> A 14-day notice adds 14 calendar days.</li>
                      <li><strong className="text-foreground">Weeks:</strong> A 2-week notice adds 14 calendar days.</li>
                      <li><strong className="text-foreground">Months:</strong> A 1-month notice adds one calendar month.</li>
                  </ul>
                  <p className="mt-2">This tool calculates the end of the notice period itself. Your actual last working day might be different if this date falls on a weekend or public holiday. Use the <Link href="/employment/last-working-day-calculator" className="text-primary hover:underline">Last Working Day Calculator</Link> for a more detailed analysis including holidays.</p>
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
              <li><Link href="/employment/last-working-day-calculator" className="hover:underline">Last Working Day Calculator</Link></li>
              <li><Link href="/employment/probation-period-calculator" className="hover:underline">Probation Period End Date Calculator</Link></li>
            </ul>
          </CardContent>
        </Card>
        
        <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg">
            <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">A Professional's Guide to Resigning Gracefully</h1>
            <p className="text-lg italic">How you leave a job is just as important as how you start it. Providing a proper notice period is the cornerstone of a professional and graceful exit, ensuring you leave on good terms and maintain your reputation.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Contractual Obligation vs. Professional Courtesy</h2>
            <p>In the United States, with its "at-will" employment doctrine, a notice period is often a matter of professional courtesy rather than a strict legal mandate, unless specified otherwise in an employment contract or collective bargaining agreement. However, in many other countries, notice periods are legally required and vary by length of service.</p>
            <div className="overflow-x-auto mt-4">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-muted">
                            <th className="p-4 border">Country/Region</th>
                            <th className="p-4 border">Common Practice / Legal Minimum</th>
                            <th className="p-4 border">Notes</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="p-4 border">United States</td>
                            <td className="p-4 border">2 weeks (Courtesy)</td>
                            <td className="p-4 border">Generally not legally required unless stated in a contract. Senior roles may provide longer notices (e.g., one month).</td>
                        </tr>
                        <tr>
                            <td className="p-4 border">United Kingdom</td>
                            <td className="p-4 border">Statutory minimum of 1 week (if employed &gt;1 month). Contractually often 1 to 3 months.</td>
                            <td className="p-4 border">Notice periods are a firm legal requirement. Senior executives can have 6-12 month notice periods.</td>
                        </tr>
                        <tr>
                            <td className="p-4 border">Germany</td>
                            <td className="p-4 border">4 weeks (statutory minimum), often extended by contract based on tenure.</td>
                            <td className="p-4 border">Notice must be given to the 15th or end of the calendar month. Longer service leads to longer notice periods (up to 7 months).</td>
                        </tr>
                        <tr>
                            <td className="p-4 border">Australia</td>
                            <td className="p-4 border">1 to 5 weeks, based on length of service (Fair Work Act).</td>
                            <td className="p-4 border">This is a legal minimum; contracts may require longer periods.</td>
                        </tr>
                        <tr>
                            <td className="p-4 border">Canada</td>
                            <td className="p-4 border">2 weeks (common law courtesy), but varies by province and tenure.</td>
                            <td className="p-4 border">Provincial Employment Standards Acts set minimums, but "reasonable notice" under common law can be much longer.</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">How to Resign Professionally</h2>
            <p>Resigning can be an uncomfortable conversation, but a professional approach smooths the process.</p>
            <ol className="list-decimal ml-6 space-y-3">
                <li><strong className="font-semibold text-foreground">Inform Your Direct Manager First:</strong> Schedule a private meeting with your boss. Inform them of your decision directly and respectfully before telling anyone else.</li>
                <li><strong className="font-semibold text-foreground">Submit a Formal Resignation Letter:</strong> Following the conversation, provide a simple, concise resignation letter. It should state your intention to resign and specify your last day of employment. There's no need for lengthy explanations; keep it positive and professional.</li>
                <li><strong className="font-semibold text-foreground">Offer to Help with the Transition:</strong> Express your commitment to ensuring a smooth handover. Offer to document your processes, organize your files, and help train your replacement if possible.</li>
                <li><strong className="font-semibold text-foreground">Stay Productive and Positive:</strong> Avoid "checking out" during your notice period. Continue to perform your duties to the best of your ability. Your final impression is a lasting one.</li>
            </ol>
        </section>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" />Frequently Asked Questions</CardTitle></CardHeader>
          <CardContent className="space-y-4">
             <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">Can an employer terminate me immediately after I resign?</h4>
                <p className="text-muted-foreground">Yes, in an "at-will" employment state. An employer can accept your resignation effective immediately. Some companies do this for security reasons, especially for employees going to a competitor. In such cases, they may pay you for your notice period, but this is not always required.</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">Do I have to work my full notice period?</h4>
                <p className="text-muted-foreground">If it's a contractual requirement, failing to do so could be a breach of contract, potentially leading to legal action or the forfeiture of certain payments. If it's a courtesy, you can leave earlier, but it may harm your professional reputation.</p>
              </div>
               <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">What about unused vacation time?</h4>
                <p className="text-muted-foreground">This depends on state law and company policy. Some states require employers to pay out accrued, unused vacation time. Others do not. Check your employee handbook and local labor laws.</p>
              </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" />Summary</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>This calculator determines the raw end date of an employment notice period. By providing a resignation date and the length of the notice in days, weeks, or months, it projects the calendar end date. This tool is useful for establishing the basic timeline for an employee's departure, before accounting for weekends or holidays.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
