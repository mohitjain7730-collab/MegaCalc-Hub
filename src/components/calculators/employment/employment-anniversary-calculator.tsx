
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
import { CalendarIcon, Cake, Info, TrendingUp, Shield, Landmark } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, differenceInYears, addYears, differenceInDays } from 'date-fns';
import { calculateAnniversaries } from '@/lib/employment-calculators';
import Link from 'next/link';

const formSchema = z.object({
  hireDate: z.date({
    required_error: "A hire date is required.",
  }),
});

type FormValues = z.infer<typeof formSchema>;

interface Anniversary {
  year: number;
  date: string;
  daysAgo: number | null;
  daysUntil: number | null;
}

interface CalculationResult {
  nextAnniversary: Anniversary;
  pastAnniversaries: Anniversary[];
  upcomingAnniversaries: Anniversary[];
  totalYearsOfService: number;
}

export default function EmploymentAnniversaryCalculator() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      hireDate: undefined,
    },
  });

  const resetForm = () => {
    form.reset({
      hireDate: undefined,
    });
    setResult(null);
  };
  
  const onSubmit = (values: FormValues) => {
    const { nextAnniversary, pastAnniversaries, upcomingAnniversaries, totalYearsOfService } = calculateAnniversaries(values.hireDate);
    setResult({ nextAnniversary, pastAnniversaries, upcomingAnniversaries, totalYearsOfService });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cake className="h-5 w-5" />
            Employment Anniversary Calculator
          </CardTitle>
          <CardDescription>
            Calculate and track your upcoming and past work anniversaries.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="hireDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col max-w-sm">
                      <FormLabel>Your Hire Date</FormLabel>
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
                            disabled={(date) => date > new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
               <div className="flex gap-4">
                <Button type="submit">Calculate Anniversaries</Button>
                <Button type="button" variant="outline" onClick={resetForm}>Reset</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      {result && (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Your Anniversary Snapshot</CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                    <div>
                        <p className="text-sm text-muted-foreground">You have completed</p>
                        <p className="text-4xl font-bold text-primary mt-1">{result.totalYearsOfService} years</p>
                        <p className="text-muted-foreground">of service.</p>
                    </div>
                    <div className="border-t pt-4">
                        <p className="text-sm text-muted-foreground">Your next anniversary is in</p>
                        <p className="text-4xl font-bold text-primary mt-1">{result.nextAnniversary.daysUntil} days</p>
                        <p className="text-muted-foreground mt-1">on {format(new Date(result.nextAnniversary.date), 'MMMM do, yyyy')}</p>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Past Anniversaries</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2 text-sm">
                            {result.pastAnniversaries.map(ann => (
                                <li key={ann.year} className="flex justify-between items-center">
                                    <span><strong className="text-foreground">{ann.year}-Year</strong> Anniversary</span>
                                    <span className="text-muted-foreground">{format(new Date(ann.date), 'MMM d, yyyy')}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Upcoming Anniversaries</CardTitle>
                    </CardHeader>
                    <CardContent>
                         <ul className="space-y-2 text-sm">
                            {result.upcomingAnniversaries.map(ann => (
                                <li key={ann.year} className="flex justify-between items-center">
                                    <span><strong className="text-foreground">{ann.year}-Year</strong> Anniversary</span>
                                    <span className="text-muted-foreground">{format(new Date(ann.date), 'MMMM d, yyyy')}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </div>
      )}

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" />Why Track Your Work Anniversary?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>Your work anniversary is more than just a date on the calendar; it's a significant milestone in your career journey. Tracking it serves several practical purposes:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
                <li><strong className="text-foreground">Benefits Vesting:</strong> Many employer benefits, such as 401(k) matching funds or stock options, have a vesting schedule tied to your years of service.</li>
                <li><strong className="text-foreground">Performance Reviews:</strong> Anniversaries are a natural time for annual performance reviews, salary negotiations, and career path discussions with your manager.</li>
                <li><strong className="text-foreground">Career Reflection:</strong> It's a perfect opportunity to reflect on your accomplishments over the past year and set goals for the next one.</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" />Calculation Logic</CardTitle></CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <div>
                  <h4 className="font-semibold text-foreground mb-2">Date Calculation</h4>
                  <p className="mt-2">The calculator performs the following steps:</p>
                  <ol className="list-decimal pl-5 mt-2 space-y-1">
                      <li><strong className="text-foreground">Calculate Total Years:</strong> It determines the number of full years you have worked by comparing your hire date to today's date.</li>
                      <li><strong className="text-foreground">Identify Anniversaries:</strong> It then calculates the specific dates for your past and upcoming anniversaries by adding the corresponding number of years to your original hire date.</li>
                       <li><strong className="text-foreground">Find Days Until/Ago:</strong> It measures the difference in days between today and each anniversary to show you how close the next one is or how long ago the last one was.</li>
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
              <li><Link href="/employment/probation-period-calculator" className="hover:underline">Probation Period End Date Calculator</Link></li>
              <li><Link href="/employment/last-working-day-calculator" className="hover:underline">Last Working Day Calculator</Link></li>
            </ul>
          </CardContent>
        </Card>

        <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg">
            <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">Leveraging Your Work Anniversary for Career Growth</h1>
            <p className="text-lg italic">Your work anniversary isn't just for cake in the breakroom. It's a strategic opportunity to take stock of your career, negotiate your worth, and plan for the future. Here’s how to make the most of it.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">The Importance of Tenure-Based Benefits</h2>
            <p>Many valuable compensation and benefits components are tied directly to your length of service. Knowing your anniversary dates helps you track when you unlock this value.</p>
            <div className="overflow-x-auto mt-4">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-muted">
                            <th className="p-4 border">Benefit</th>
                            <th className="p-4 border">Common Vesting/Milestone Schedule</th>
                            <th className="p-4 border">Why It Matters</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="p-4 border">401(k) Employer Match</td>
                            <td className="p-4 border">Graded (e.g., 20% per year for 5 years) or Cliff (100% after 2-3 years).</td>
                            <td className="p-4 border">Leaving before you are fully vested means forfeiting free money from your employer.</td>
                        </tr>
                        <tr>
                            <td className="p-4 border">Stock Options / RSUs</td>
                            <td className="p-4 border">Typically vest over 4 years with a 1-year "cliff" (e.g., 25% vests after year 1, then monthly/quarterly).</td>
                            <td className="p-4 border">This is a major part of compensation in tech. Knowing your vesting dates is crucial for financial planning.</td>
                        </tr>
                        <tr>
                            <td className="p-4 border">Increased Vacation/PTO</td>
                            <td className="p-4 border">Often increases after 3, 5, or 10 years of service.</td>
                            <td className="p-4 border">A tangible improvement to your work-life balance and total compensation package.</td>
                        </tr>
                        <tr>
                            <td className="p-4 border">Pension Plans</td>
                            <td className="p-4 border">Usually require a minimum of 5 years of service to become vested.</td>
                            <td className="p-4 border">Critical for long-term employees in industries with traditional pension benefits.</td>
                        </tr>
                         <tr>
                            <td className="p-4 border">Statutory Notice/Severance</td>
                            <td className="p-4 border">In many countries (e.g., UK, Canada), legally required notice periods or severance pay increase with tenure.</td>
                            <td className="p-4 border">Provides a greater safety net in the event of a layoff.</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">How to Prepare for Your Annual Review</h2>
            <p>Your work anniversary is the ideal time to initiate a conversation about your performance and compensation. Don't wait for your manager to bring it up. Be proactive.</p>
            <ol className="list-decimal ml-6 space-y-3">
                <li><strong className="font-semibold text-foreground">Start 60-90 Days Early:</strong> Begin preparing well in advance. Don't start thinking about your review the week before.</li>
                <li><strong className="font-semibold text-foreground">Create an Accomplishments Dossier:</strong> Throughout the year, keep a running document of your wins. Include specific projects, quantifiable results (e.g., "Increased efficiency by 15%"), and positive feedback from colleagues or clients.</li>
                <li><strong className="font-semibold text-foreground">Research Your Market Value:</strong> Use sites like Glassdoor, Levels.fyi, and Payscale to research the salary range for your role, experience level, and location. This data is your most powerful negotiation tool.</li>
                <li><strong className="font-semibold text-foreground">Frame the Conversation:</strong> When you meet with your manager, frame the discussion around your value and future contributions, not just your past performance. Say something like, "As I approach my X-year anniversary, I'm excited about the future here. I'd like to discuss my career path and how my compensation aligns with my current responsibilities and the market."</li>
            </ol>
        </section>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" />Frequently Asked Questions</CardTitle></CardHeader>
          <CardContent className="space-y-4">
             <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">What is a "vesting cliff"?</h4>
                <p className="text-muted-foreground">A vesting cliff is a common feature in stock option grants. For example, a "1-year cliff" means you receive 0% of your grant if you leave before your first anniversary, but you receive a large chunk (often 25%) on the day of your anniversary. Knowing this date is crucial to avoid leaving just before a major payday.</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">Does this calculator account for leap years?</h4>
                <p className="text-muted-foreground">Yes, the underlying date functions are leap-year aware, so the anniversary dates will be accurate even over long periods.</p>
              </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" />Summary</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>This calculator helps employees track key career milestones by determining their total years of service, and listing past and upcoming work anniversaries. It is a valuable tool for timing career discussions, monitoring benefit vesting schedules, and reflecting on professional growth over time.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
