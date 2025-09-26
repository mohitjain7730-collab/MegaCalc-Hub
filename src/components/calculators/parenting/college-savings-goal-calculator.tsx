
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const formSchema = z.object({
  currentAge: z.number().int().positive(),
  collegeStartAge: z.number().int().positive(),
  annualTuition: z.number().positive(),
  tuitionInflation: z.number().nonnegative(),
  investmentReturn: z.number().positive(),
}).refine(data => data.collegeStartAge > data.currentAge, {
  message: "College start age must be after the current age.",
  path: ["collegeStartAge"],
});

type FormValues = z.infer<typeof formSchema>;

export default function CollegeSavingsGoalCalculator() {
  const [result, setResult] = useState<{ totalCost: number, monthlySaving: number } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentAge: undefined,
      collegeStartAge: undefined,
      annualTuition: undefined,
      tuitionInflation: undefined,
      investmentReturn: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const { currentAge, collegeStartAge, annualTuition, tuitionInflation, investmentReturn } = values;

    const yearsUntilCollege = collegeStartAge - currentAge;
    const i = tuitionInflation / 100;
    
    // Calculate cost for each of the 4 years of college
    let futureCost = 0;
    for(let j=0; j<4; j++) {
        futureCost += annualTuition * Math.pow(1 + i, yearsUntilCollege + j);
    }
    
    // Calculate monthly savings needed (Future Value of an Annuity formula)
    const m = yearsUntilCollege * 12;
    const r = (investmentReturn / 100) / 12;
    const pmt = futureCost / (((Math.pow(1 + r, m) - 1) / r));
    
    setResult({ totalCost: futureCost, monthlySaving: pmt });
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="currentAge" render={({ field }) => (
                <FormItem><FormLabel>Child's Current Age</FormLabel><FormControl><Input type="number" placeholder="e.g., 2" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="collegeStartAge" render={({ field }) => (
                <FormItem><FormLabel>College Start Age</FormLabel><FormControl><Input type="number" placeholder="e.g., 18" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="annualTuition" render={({ field }) => (
                <FormItem><FormLabel>Current Annual Tuition ($)</FormLabel><FormControl><Input type="number" placeholder="e.g., 20000" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
             <FormField control={form.control} name="tuitionInflation" render={({ field }) => (
                <FormItem><FormLabel>Tuition Inflation Rate (%)</FormLabel><FormControl><Input type="number" placeholder="e.g., 5" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
             <FormField control={form.control} name="investmentReturn" render={({ field }) => (
                <FormItem className="md:col-span-2"><FormLabel>Expected Investment Return (%)</FormLabel><FormControl><Input type="number" placeholder="e.g., 7" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <Button type="submit">Calculate Savings Goal</Button>
        </form>
      </Form>

      {result && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><GraduationCap className="h-8 w-8 text-primary" /><CardTitle>College Savings Plan</CardTitle></div></CardHeader>
            <CardContent className="text-center space-y-4">
                <div>
                    <CardDescription>Estimated Total Cost for 4 Years</CardDescription>
                    <p className="text-2xl font-bold">${result.totalCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                </div>
                <div className="pt-4 border-t">
                    <CardDescription>Required Monthly Savings</CardDescription>
                    <p className="text-3xl font-bold">${result.monthlySaving.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                </div>
            </CardContent>
        </Card>
      )}

       <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="understanding-inputs">
          <AccordionTrigger>Understanding the Inputs</AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-4">
            <div><h4 className="font-semibold text-foreground">Ages</h4><p>The time between the child's current age and college start age determines your investment horizon.</p></div>
            <div><h4 className="font-semibold text-foreground">Current Annual Tuition</h4><p>The cost of one year at your target college today. This is the baseline for projecting future costs.</p></div>
            <div><h4 className="font-semibold text-foreground">Tuition Inflation Rate (%)</h4><p>The rate at which you expect college costs to increase each year. Historically, this has been higher than general inflation.</p></div>
            <div><h4 className="font-semibold text-foreground">Expected Investment Return (%)</h4><p>The average annual return you expect from your college savings investments (e.g., in a 529 plan).</p></div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="how-it-works">
          <AccordionTrigger>How It Works</AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-2">
            <ol className="list-decimal list-inside space-y-2">
              <li><strong>Project Future Cost:</strong> The calculator first estimates the tuition for each of the four years of college by applying the annual inflation rate to the current tuition cost over the years until college starts. It sums these four inflated figures to get the total estimated future cost.</li>
              <li><strong>Calculate Monthly Savings:</strong> It then uses the "Future Value of an Annuity" formula, solving for the monthly payment (PMT). This determines how much you need to save each month, earning your expected investment return, to reach the total future cost by the time your child starts college.</li>
            </ol>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
