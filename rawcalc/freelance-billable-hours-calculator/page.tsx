'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileClock, Info, TrendingUp, Shield, Landmark, PlusCircle, Trash2 } from 'lucide-react';
import Link from 'next/link';

const taskSchema = z.object({
  name: z.string().min(1, "Task name is required."),
  hours: z.number().min(0, "Hours must be non-negative."),
  minutes: z.number().min(0).max(59, "Minutes must be between 0 and 59."),
});

const formSchema = z.object({
  tasks: z.array(taskSchema).min(1, 'Please add at least one task.'),
  hourlyRate: z.number().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface CalculationResult {
  totalHours: number;
  totalMinutes: number;
  totalDecimal: number;
  totalBill: number | null;
}

const formatNumberUS = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(value);

export default function FreelanceBillableHoursCalculator() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tasks: [{ name: '', hours: 0, minutes: 0 }],
      hourlyRate: undefined,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "tasks",
  });
  
  const tasks = form.watch('tasks');
  const hourlyRate = form.watch('hourlyRate');

  useEffect(() => {
    const totalMinutes = tasks.reduce((acc, task) => {
      return acc + (task.hours || 0) * 60 + (task.minutes || 0);
    }, 0);

    const finalHours = Math.floor(totalMinutes / 60);
    const finalMinutes = totalMinutes % 60;
    const totalDecimal = totalMinutes / 60;
    const totalBill = hourlyRate ? totalDecimal * hourlyRate : null;

    setResult({
      totalHours: finalHours,
      totalMinutes: finalMinutes,
      totalDecimal,
      totalBill,
    });
  }, [tasks, hourlyRate]);

  const resetForm = () => {
    form.reset({
      tasks: [{ name: '', hours: 0, minutes: 0 }],
      hourlyRate: undefined,
    });
    setResult(null);
  };
  
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileClock className="h-5 w-5" />
            Freelance Billable Hours Calculator
          </CardTitle>
          <CardDescription>
            Sum up your billable hours from various tasks and calculate your total invoice amount.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Tasks / Work Items</h3>
                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <div key={field.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end border p-4 rounded-lg relative">
                      <FormField
                        control={form.control}
                        name={`tasks.${index}.name`}
                        render={({ field }) => (
                          <FormItem className="md:col-span-3">
                            <FormLabel>Task Name {index + 1}</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Initial design mockups" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                       <FormField
                        control={form.control}
                        name={`tasks.${index}.hours`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Hours</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="e.g., 2" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || 0)} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                       <FormField
                        control={form.control}
                        name={`tasks.${index}.minutes`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Minutes</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="e.g., 30" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || 0)} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => remove(index)} disabled={fields.length <= 1}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                 <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => append({ name: '', hours: 0, minutes: 0 })}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Task
                </Button>
              </div>

               <div>
                 <h3 className="text-lg font-medium mb-2">Billing</h3>
                 <FormField
                  control={form.control}
                  name="hourlyRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hourly Rate ($)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 75" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                      </FormControl>
                       <FormMessage />
                    </FormItem>
                  )}
                />
               </div>
               <Button type="button" variant="outline" onClick={resetForm}>Reset</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      {result && (
        <Card>
            <CardHeader>
                <CardTitle>Total Billable Time & Invoice</CardTitle>
            </CardHeader>
            <CardContent>
                 {result.totalBill !== null && (
                    <div className="text-center mb-8">
                        <p className="text-sm text-muted-foreground">Total Invoice Amount</p>
                        <p className="text-5xl font-bold text-primary">{formatNumberUS(result.totalBill)}</p>
                    </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-center">
                    <div className="p-4 bg-muted/50 rounded-lg">
                        <h4 className="text-sm font-medium text-muted-foreground">Total Time (Hours & Minutes)</h4>
                        <p className="text-3xl font-bold">{result.totalHours}h {result.totalMinutes}m</p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                        <h4 className="text-sm font-medium text-muted-foreground">Total Time (Decimal)</h4>
                        <p className="text-3xl font-bold">{result.totalDecimal.toFixed(2)} hours</p>
                    </div>
                </div>
            </CardContent>
        </Card>
      )}

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" />Understanding Billable Hours</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>For freelancers and consultants, accurate time tracking is the foundation of a successful business. Billable hours are the time spent working directly on a client's project. This calculator helps you convert tracked time from various tasks into a total amount for invoicing.</p>
            <p>It correctly converts minutes into a decimal format (e.g., 2 hours and 30 minutes becomes 2.5 hours), which is essential for accurate billing against an hourly rate.</p>
          </CardContent>
        </Card>

        <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" />Calculation Logic</CardTitle></CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <ol className="list-decimal pl-5 mt-2 space-y-2">
                  <li><strong className="text-foreground">Convert to Minutes:</strong> Each task's duration is converted entirely into minutes (Hours * 60 + Minutes).</li>
                  <li><strong className="text-foreground">Sum Total Minutes:</strong> All task minutes are added together to get a grand total.</li>
                  <li><strong className="text-foreground">Convert to Decimal Hours:</strong> The total minutes are divided by 60 to get the decimal representation needed for billing (e.g., 150 minutes / 60 = 2.5 hours).</li>
                  <li><strong className="text-foreground">Calculate Bill:</strong> The total decimal hours are multiplied by your hourly rate to determine the final invoice amount.</li>
              </ol>
            </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Landmark className="h-5 w-5" />Related Calculators</CardTitle>
            <CardDescription>Explore other employment and career planning tools.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 text-sm text-primary">
              <li><Link href="/employment/contract-duration-calculator" className="hover:underline">Contract Duration Calculator</Link></li>
            </ul>
          </CardContent>
        </Card>

        <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg">
            <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">The Freelancer's Guide to Tracking and Billing Hours</h1>
            <p className="text-lg italic">"Time is money" is not a cliché for freelancers; it's a business model. Mastering the art of tracking and billing for your time is the difference between a struggling hobby and a profitable career.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">What Counts as Billable Time?</h2>
            <p>A common point of confusion is what activities are billable versus what are considered overhead (the cost of doing business). Here's a general breakdown:</p>
            <div className="overflow-x-auto mt-4">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-muted">
                            <th className="p-4 border">Activity</th>
                            <th className="p-4 border">Typically Billable?</th>
                            <th className="p-4 border">Rationale</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="p-4 border font-semibold">Direct Project Work</td>
                            <td className="p-4 border text-green-600">Yes</td>
                            <td className="p-4 border">Writing code, designing logos, writing copy, etc. This is the core work the client is paying for.</td>
                        </tr>
                        <tr>
                            <td className="p-4 border font-semibold">Project-related Communication</td>
                             <td className="p-4 border text-green-600">Yes</td>
                            <td className="p-4 border">Emails, phone calls, and meetings directly about the project's progress, revisions, or requirements.</td>
                        </tr>
                        <tr>
                            <td className="p-4 border font-semibold">Research</td>
                             <td className="p-4 border text-green-600">Yes</td>
                            <td className="p-4 border">Time spent researching specific solutions or gathering information necessary to complete the project.</td>
                        </tr>
                        <tr>
                            <td className="p-4 border font-semibold">Revisions</td>
                            <td className="p-4 border text-green-600">Yes</td>
                            <td className="p-4 border">Time spent making changes requested by the client. (Your contract should specify how many rounds of revision are included).</td>
                        </tr>
                        <tr>
                            <td className="p-4 border font-semibold">Initial Proposal Writing</td>
                            <td className="p-4 border text-red-600">No</td>
                            <td className="p-4 border">This is a cost of sales, part of the process of acquiring a new client.</td>
                        </tr>
                        <tr>
                            <td className="p-4 border font-semibold">Invoicing & Admin</td>
                            <td className="p-4 border text-red-600">No</td>
                            <td className="p-4 border">The time you spend creating and sending your invoice is business overhead.</td>
                        </tr>
                        <tr>
                            <td className="p-4 border font-semibold">Skill Development</td>
                             <td className="p-4 border text-red-600">No</td>
                            <td className="p-4 border">Time spent learning a new software or taking a course is an investment in your own business, not billable to a specific client.</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Best Practices for Time Tracking</h2>
            <ul className="list-disc ml-6 space-y-3">
                <li><strong className="font-semibold text-foreground">Use a Tracking App:</strong> Manual tracking is prone to error. Use dedicated apps like Toggl, Harvest, or Clockify. They allow you to start and stop timers for specific tasks and generate detailed reports.</li>
                <li><strong className="font-semibold text-foreground">Track in Real-Time:</strong> Don't try to remember what you did at the end of the day. Start a timer when you begin a task and stop it when you finish or switch tasks.</li>
                <li><strong className="font-semibold text-foreground">Round Up, But Be Fair:</strong> It's common practice to round time to the nearest increment, such as 6 or 15 minutes. A 3-minute email might be billed as 6 minutes. Be consistent and fair with your rounding policy.</li>
                <li><strong className="font-semibold text-foreground">Be Detailed in Your Invoices:</strong> Don't just send an invoice for "10 hours of work." Itemize it. Show the client the tasks you completed (e.g., "Homepage Design: 4.5 hours," "Revisions to contact form: 1.25 hours"). This transparency builds trust and justifies your bill.</li>
            </ul>
        </section>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" />Frequently Asked Questions</CardTitle></CardHeader>
          <CardContent className="space-y-4">
             <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">What if I work for less than an hour?</h4>
                <p className="text-muted-foreground">That's why converting to decimal is so important. If you work for 15 minutes, you should bill for 0.25 hours. This calculator handles that conversion automatically.</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">Should I charge for project management time?</h4>
                <p className="text-muted-foreground">Yes, absolutely. The time you spend organizing tasks, communicating with the client, and managing the project timeline is valuable work that directly contributes to the project's success. It is billable.</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">What about fixed-price projects?</h4>
                <p className="text-muted-foreground">Even on fixed-price projects, you should still track your time internally. It's the only way to know if you priced the project correctly and to calculate your "effective hourly rate." This data is crucial for quoting future projects more accurately.</p>
              </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" />Summary</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>This calculator is an essential tool for freelancers, contractors, and consultants. It streamlines the process of invoicing by accurately summing up hours and minutes from various tasks, converting them to a decimal format, and applying an hourly rate. This ensures fair and precise billing, helping to maintain client trust and a healthy cash flow.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
