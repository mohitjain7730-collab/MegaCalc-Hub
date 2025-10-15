'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Calendar, Info } from 'lucide-react';
import Link from 'next/link';

const formSchema = z.object({
  lastMenstrualPeriod: z.string().optional(),
  conceptionDate: z.string().optional(),
  ultrasoundDate: z.string().optional(),
  ultrasoundWeeks: z.number().positive().optional(),
  cycleLength: z.number().positive().optional(),
});

type FormValues = z.infer<typeof formSchema>;

function calculateDueDate(values: FormValues) {
  let dueDate: Date;
  let method = '';
  
  if (values.lastMenstrualPeriod) {
    // Naegele's rule: LMP + 280 days
    const lmpDate = new Date(values.lastMenstrualPeriod);
    dueDate = new Date(lmpDate.getTime() + 280 * 24 * 60 * 60 * 1000);
    method = 'Last Menstrual Period';
  } else if (values.conceptionDate) {
    // Conception date + 266 days
    const conceptionDate = new Date(values.conceptionDate);
    dueDate = new Date(conceptionDate.getTime() + 266 * 24 * 60 * 60 * 1000);
    method = 'Conception Date';
  } else if (values.ultrasoundDate && values.ultrasoundWeeks) {
    // Ultrasound dating
    const usDate = new Date(values.ultrasoundDate);
    const weeksToAdd = 40 - values.ultrasoundWeeks;
    dueDate = new Date(usDate.getTime() + weeksToAdd * 7 * 24 * 60 * 60 * 1000);
    method = 'Ultrasound Dating';
  } else {
    // Default to today + 40 weeks
    dueDate = new Date(Date.now() + 40 * 7 * 24 * 60 * 60 * 1000);
    method = 'Default (40 weeks from today)';
  }
  
  const today = new Date();
  const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  const currentWeeks = Math.floor((280 - daysUntilDue) / 7);
  const currentDays = Math.floor((280 - daysUntilDue) % 7);
  
  // Trimester calculation
  let trimester = 1;
  if (currentWeeks >= 14) trimester = 2;
  if (currentWeeks >= 28) trimester = 3;
  
  return {
    dueDate: dueDate.toLocaleDateString(),
    method,
    daysUntilDue,
    currentWeeks,
    currentDays,
    trimester,
    isOverdue: daysUntilDue < 0,
  };
}

export default function DueDateCalculator() {
  const [result, setResult] = useState<ReturnType<typeof calculateDueDate> | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      lastMenstrualPeriod: undefined,
      conceptionDate: undefined,
      ultrasoundDate: undefined,
      ultrasoundWeeks: undefined,
      cycleLength: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    setResult(calculateDueDate(values));
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="lastMenstrualPeriod" render={({ field }) => (
              <FormItem>
                <FormLabel>Last Menstrual Period Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
              </FormItem>
            )} />
            <FormField control={form.control} name="conceptionDate" render={({ field }) => (
              <FormItem>
                <FormLabel>Conception Date (if known)</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
              </FormItem>
            )} />
            <FormField control={form.control} name="ultrasoundDate" render={({ field }) => (
              <FormItem>
                <FormLabel>Ultrasound Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
              </FormItem>
            )} />
            <FormField control={form.control} name="ultrasoundWeeks" render={({ field }) => (
              <FormItem>
                <FormLabel>Gestational Age at Ultrasound (weeks)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} value={field.value ?? ''} onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
              </FormItem>
            )} />
            <FormField control={form.control} name="cycleLength" render={({ field }) => (
              <FormItem>
                <FormLabel>Average Cycle Length (days)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} value={field.value ?? ''} onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
              </FormItem>
            )} />
          </div>
          <Button type="submit">Calculate Due Date</Button>
        </form>
      </Form>

      {result !== null && (
        <Card className="mt-8">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Calendar className="h-8 w-8 text-primary" />
              <CardTitle>Due Date Calculation</CardTitle>
            </div>
            <CardDescription>Based on {result.method.toLowerCase()}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-4xl font-bold text-primary">{result.dueDate}</p>
                <p className="text-lg text-muted-foreground">Estimated Due Date</p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded">
                  <p className="text-2xl font-bold">{result.currentWeeks}</p>
                  <p className="text-sm text-muted-foreground">Weeks</p>
                </div>
                <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded">
                  <p className="text-2xl font-bold">{result.currentDays}</p>
                  <p className="text-sm text-muted-foreground">Days</p>
                </div>
                <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded">
                  <p className="text-2xl font-bold">{result.trimester}</p>
                  <p className="text-sm text-muted-foreground">Trimester</p>
                </div>
                <div className={`p-3 rounded ${
                  result.daysUntilDue > 0 ? 'bg-green-100 dark:bg-green-900' : 
                  result.daysUntilDue === 0 ? 'bg-yellow-100 dark:bg-yellow-900' : 
                  'bg-red-100 dark:bg-red-900'
                }`}>
                  <p className="text-2xl font-bold">{Math.abs(result.daysUntilDue)}</p>
                  <p className="text-sm text-muted-foreground">
                    {result.daysUntilDue > 0 ? 'Days Left' : 
                     result.daysUntilDue === 0 ? 'Due Today' : 'Days Overdue'}
                  </p>
                </div>
              </div>
            </div>
            <Alert className="mt-4">
              <Info className="h-4 w-4" />
              <AlertTitle>Interpretation</AlertTitle>
              <AlertDescription>
                {result.isOverdue ? 'Your baby is overdue. Only 5% of babies are born on their exact due date, and most arrive within 2 weeks before or after.' : 
                 result.daysUntilDue === 0 ? 'Today is your estimated due date! Most babies arrive within 2 weeks of this date.' :
                 result.daysUntilDue < 14 ? 'You are in the final weeks! Your baby could arrive at any time now.' :
                 result.trimester === 3 ? 'You are in the third trimester. The final countdown has begun!' :
                 result.trimester === 2 ? 'You are in the second trimester. This is often the most comfortable period of pregnancy.' :
                 'You are in the first trimester. Focus on prenatal care and healthy habits.'}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      <section className="space-y-4 text-muted-foreground leading-relaxed" itemScope itemType="https://schema.org/Article">
        <meta itemProp="headline" content="Due Date Calculator – Pregnancy Timeline and Gestational Age" />
        <meta itemProp="author" content="MegaCalc Hub Team" />
        <meta itemProp="about" content="Calculate pregnancy due date using LMP, conception date, or ultrasound dating with trimester information." />

        <h2 className="text-xl font-bold text-foreground">Guide: Understanding Pregnancy Dating</h2>
        <p>Accurate pregnancy dating is essential for monitoring fetal development and planning delivery. Here are the key methods:</p>
        <h3 className="font-semibold text-foreground mt-4">Dating Methods</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li><strong>Last Menstrual Period (LMP):</strong> Most common method, adds 280 days</li>
          <li><strong>Conception Date:</strong> Adds 266 days from fertilization</li>
          <li><strong>Ultrasound Dating:</strong> Most accurate, especially in first trimester</li>
          <li><strong>Cycle Length Adjustment:</strong> Accounts for irregular cycles</li>
        </ul>
        <h3 className="font-semibold text-foreground mt-4">Pregnancy Timeline</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li>First trimester: Weeks 1-13 (organ development)</li>
          <li>Second trimester: Weeks 14-26 (growth and movement)</li>
          <li>Third trimester: Weeks 27-40 (final preparation)</li>
          <li>Full term: 37-42 weeks gestation</li>
        </ul>
      </section>

      <div className="space-y-2">
        <h2 className="text-xl font-bold text-foreground">Related Calculators</h2>
        <p><Link className="text-primary underline" href="/category/health-fitness/pregnancy-weight-gain-calculator">Pregnancy Weight Gain Calculator</Link></p>
        <p><Link className="text-primary underline" href="/category/health-fitness/fertility-ovulation-calculator">Fertility Ovulation Calculator</Link></p>
        <p><Link className="text-primary underline" href="/category/health-fitness/breastfeeding-calorie-needs-calculator">Breastfeeding Calorie Needs Calculator</Link></p>
      </div>
    </div>
  );
}
