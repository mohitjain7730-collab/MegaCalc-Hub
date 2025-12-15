
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
import { CalendarIcon, UserCheck, Info, TrendingUp, Shield, Landmark } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import Link from 'next/link';
import { calculateProbationEndDate } from '@/lib/employment-calculators';

const formSchema = z.object({
  startDate: z.date({
    required_error: "A start date is required.",
  }),
  duration: z.number().positive("Duration must be positive."),
  unit: z.enum(['days', 'weeks', 'months']),
});

type FormValues = z.infer<typeof formSchema>;

interface CalculationResult {
  endDate: Date;
}

export default function ProbationPeriodCalculator() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      startDate: undefined,
      duration: undefined,
      unit: 'days',
    },
  });

  const resetForm = () => {
    form.reset({
      startDate: undefined,
      duration: undefined,
      unit: 'days',
    });
    setResult(null);
  };
  
  const onSubmit = (values: FormValues) => {
    const endDate = calculateProbationEndDate(values);
    setResult({ endDate });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Probation Period End Date Calculator
          </CardTitle>
          <CardDescription>
            Calculate the end date of an employment probationary period.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Probation Start Date</FormLabel>
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
                      <FormLabel>Probation Duration</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 90" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} />
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
                <Button type="submit">Calculate End Date</Button>
                <Button type="button" variant="outline" onClick={resetForm}>Reset</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      {result && (
        <Card>
            <CardHeader>
                <CardTitle>Probation End Date</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
                <p className="text-sm text-muted-foreground">Your probation period is projected to end on:</p>
                <p className="text-4xl font-bold text-primary mt-2">{format(result.endDate, 'PPPP')}</p>
                 <p className="text-muted-foreground mt-2">{format(result.endDate, 'eeee')}</p>
            </CardContent>
        </Card>
      )}

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" />Understanding Probation Periods</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>An employment probation period (or probationary period) is a fixed length of time at the beginning of a new job, during which an employee is evaluated to determine their suitability for the role. It's a trial phase for both the employer and the employee to assess if the fit is right.</p>
            <p>The length of this period is typically defined in the employment contract and can vary based on company policy, industry standards, and local labor laws. Common durations include 30, 60, 90 days, or up to six months. This calculator helps you determine the precise end date of this important period.</p>
          </CardContent>
        </Card>

        <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" />Calculation Logic</CardTitle></CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <div>
                  <h4 className="font-semibold text-foreground mb-2">Date Calculation</h4>
                  <p className="font-mono bg-muted p-4 rounded-md">End Date = Start Date + Duration - 1 Day</p>
                  <p className="mt-2">The calculation adds the specified duration to the start date and then subtracts one day. This is because a probation period starting on a Monday and lasting 7 days should end on the following Sunday, not the next Monday.</p>
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                      <li><strong className="text-foreground">Days/Weeks:</strong> The specified number of days or weeks is added directly to the start date.</li>
                      <li><strong className="text-foreground">Months:</strong> When adding months, the calculator accounts for the varying lengths of months. For example, adding one month to January 31st will result in February 28th (or 29th in a leap year).</li>
                  </ul>
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
              <li><Link href="/employment/employment-anniversary-calculator" className="hover:underline">Employment Anniversary Calculator</Link></li>
            </ul>
          </CardContent>
        </Card>
        
        <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg">
            <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">A Guide to Employment Probation Periods</h1>
            <p className="text-lg italic">The probationary period is a critical phase in any new job. It's a structured opportunity for both employer and employee to confirm their initial decision. This guide breaks down what to expect and how to navigate it successfully.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">The Purpose of a Probation Period</h2>
            <p>From the employer's perspective, the probation period is a risk management tool. It allows them to assess a new hire's skills, work ethic, and cultural fit in a real-world setting before committing to long-term employment. For the employee, it's a chance to evaluate the company, the role, and the team to ensure the job aligns with their career goals and expectations.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Typical Probation Period Durations by Industry</h2>
            <p>While probation periods can vary, certain trends exist across industries. The table below provides a general overview of common practices in the United States.</p>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-muted">
                            <th className="p-4 border">Industry</th>
                            <th className="p-4 border">Common Duration</th>
                            <th className="p-4 border">Rationale</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="p-4 border">Technology / Startups</td>
                            <td className="p-4 border">90 Days</td>
                            <td className="p-4 border">Fast-paced environment; allows for quick assessment of technical skills and adaptability.</td>
                        </tr>
                        <tr>
                            <td className="p-4 border">Government / Public Sector</td>
                            <td className="p-4 border">6 Months to 1 Year</td>
                            <td className="p-4 border">Structured processes, union agreements, and civil service rules often mandate longer evaluation periods.</td>
                        </tr>
                        <tr>
                            <td className="p-4 border">Healthcare</td>
                            <td className="p-4 border">90 Days</td>
                            <td className="p-4 border">Standard period to evaluate clinical skills, patient interaction, and adherence to protocols.</td>
                        </tr>
                        <tr>
                            <td className="p-4 border">Retail / Hospitality</td>
                            <td className="p-4 border">30 to 60 Days</td>
                            <td className="p-4 border">Focus on customer service skills and reliability, which can often be assessed relatively quickly.</td>
                        </tr>
                        <tr>
                            <td className="p-4 border">Manufacturing</td>
                            <td className="p-4 border">90 Days</td>
                            <td className="p-4 border">Allows time to evaluate safety compliance, technical proficiency with machinery, and teamwork.</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Tips for a Successful Probation Period</h2>
            <p>For the employee, the goal is to turn a new job into a secure, long-term position. Here’s how to make a great impression:</p>
             <ul className="list-disc ml-6 space-y-3">
                <li><strong className="font-semibold text-foreground">Seek Clarity and Feedback:</strong> Don't wait for your final review. Proactively schedule check-ins with your manager. Ask questions like, "What are the key priorities for my first 30/60/90 days?" and "Do you have any feedback on my progress so far?"</li>
                <li><strong className="font-semibold text-foreground">Understand Company Culture:</strong> Pay attention to the unwritten rules. How do people communicate? What are the expectations around working hours and collaboration? Observe and adapt.</li>
                <li><strong className="font-semibold text-foreground">Document Your Achievements:</strong> Keep a running list of your accomplishments, successful projects, and positive feedback. This will be invaluable during your performance reviews.</li>
                <li><strong className="font-semibold text-foreground">Build Relationships:</strong> Make an effort to get to know your colleagues. Building positive relationships not only makes work more enjoyable but also demonstrates your ability to be a good team member.</li>
            </ul>
        </section>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" />Frequently Asked Questions</CardTitle></CardHeader>
          <CardContent className="space-y-4">
             <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">What legal rights do I have during a probation period?</h4>
                <p className="text-muted-foreground">In an "at-will" employment state like most of the U.S., your rights are largely the same as a permanent employee. You cannot be terminated for illegal reasons (discrimination based on race, gender, religion, etc.). However, the termination process may be simpler for the employer. Always check your employment contract for specific terms.</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">Am I eligible for benefits during probation?</h4>
                <p className="text-muted-foreground">It depends on company policy. Some companies delay eligibility for benefits like health insurance or retirement plan contributions until after the successful completion of the probationary period. This should be clearly stated in your employment offer.</p>
              </div>
               <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">Can a probation period be extended?</h4>
                <p className="text-muted-foreground">Yes, if it is allowed for in your employment contract or by company policy. An employer might extend a probation period if they need more time to assess your performance. This should be communicated to you formally in writing.</p>
              </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" />Summary</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>This calculator determines the end date of a new employee's trial period. By inputting the start date and the duration in days, weeks, or months, it provides a clear date, helping both employees and managers track this important initial phase of employment. This allows for timely performance reviews and confirmation of permanent status.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
