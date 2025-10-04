
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck } from 'lucide-react';

const formSchema = z.object({
  monthlyExpenses: z.number().positive(),
  coverageMonths: z.number().min(1).max(24),
});

type FormValues = z.infer<typeof formSchema>;

export default function EmergencyFundGoalCalculator() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      monthlyExpenses: undefined,
      coverageMonths: 6,
    },
  });

  const onSubmit = (values: FormValues) => {
    setResult(values.monthlyExpenses * values.coverageMonths);
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="monthlyExpenses" render={({ field }) => (
                <FormItem><FormLabel>Total Monthly Expenses</FormLabel><FormControl><Input type="number" placeholder="e.g., 3000" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="coverageMonths" render={({ field }) => (
                <FormItem><FormLabel>Months of Coverage</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <Button type="submit">Calculate Fund</Button>
        </form>
      </Form>
      {result !== null && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><ShieldCheck className="h-8 w-8 text-primary" /><CardTitle>Your Emergency Fund Goal</CardTitle></div></CardHeader>
            <CardContent>
                <div className="text-center space-y-2">
                    <p className="text-4xl font-bold">${result.toLocaleString()}</p>
                    <CardDescription>This is your target to cover {form.getValues('coverageMonths')} months of expenses.</CardDescription>
                </div>
            </CardContent>
        </Card>
      )}
       <div className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold mb-2">Why You Need an Emergency Fund</h3>
          <div className="text-muted-foreground space-y-2">
            <p>An emergency fund is a stash of money set aside to cover the financial surprises life throws your way. These unexpected events can be stressful and costly. The purpose of the fund is to have cash readily available to handle these events without having to dip into high-interest debt or sell your long-term investments.</p>
          </div>
        </div>
        <div>
            <h3 className="text-lg font-semibold mb-2">Understanding the Inputs</h3>
            <div className="text-muted-foreground space-y-4">
              <div>
                  <h4 className="font-semibold text-foreground mb-1">Total Monthly Expenses</h4>
                  <p>The sum of all your essential monthly living expenses. This should include rent/mortgage, utilities, food, transportation, insurance, and minimum debt payments.</p>
              </div>
              <div>
                  <h4 className="font-semibold text-foreground mb-1">Months of Coverage</h4>
                  <p>The number of months you want your emergency fund to be able to cover your expenses without any income. Financial advisors typically recommend 3 to 6 months.</p>
              </div>
            </div>
        </div>
        <div>
            <h3 className="text-lg font-semibold mb-2">How The Calculation Works</h3>
            <div className="text-muted-foreground">
                <p>This is a straightforward but powerful calculation. It simply multiplies your essential monthly expenses by the number of months you want to have covered. Financial experts typically recommend having enough to cover 3 to 6 months of living expenses.</p>
            </div>
        </div>
      </div>
    </div>
  );
}
