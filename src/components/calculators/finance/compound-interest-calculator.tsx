
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PiggyBank } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const formSchema = z.object({
  principal: z.number().positive(),
  annualRate: z.number().positive(),
  years: z.number().int().positive(),
  compoundingFrequency: z.coerce.number().positive(),
});

type FormValues = z.infer<typeof formSchema>;

interface CalculationResult {
  totalAmount: number;
  totalInterest: number;
  chartData: { year: number; value: number, principal: number }[];
}

export default function CompoundInterestCalculator() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      principal: undefined,
      annualRate: undefined,
      years: undefined,
      compoundingFrequency: 12,
    },
  });

  const onSubmit = (values: FormValues) => {
    const { principal, annualRate, years, compoundingFrequency } = values;
    const P = principal;
    const r = annualRate / 100;
    const n = compoundingFrequency;
    const t = years;

    const totalAmount = P * Math.pow(1 + r / n, n * t);
    const totalInterest = totalAmount - P;

    const chartData = [];
    for (let i = 1; i <= t; i++) {
      const value = P * Math.pow(1 + r / n, n * i);
      chartData.push({
        year: i,
        value: Math.round(value),
        principal: P,
      });
    }

    setResult({ totalAmount, totalInterest, chartData });
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="principal" render={({ field }) => (
                <FormItem><FormLabel>Principal Amount</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="annualRate" render={({ field }) => (
                <FormItem><FormLabel>Annual Interest Rate (%)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="years" render={({ field }) => (
                <FormItem><FormLabel>Number of Years</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
             <FormField control={form.control} name="compoundingFrequency" render={({ field }) => (
                <FormItem><FormLabel>Compounding Frequency</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={String(field.value)}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                        <SelectItem value="1">Annually</SelectItem>
                        <SelectItem value="2">Semi-Annually</SelectItem>
                        <SelectItem value="4">Quarterly</SelectItem>
                        <SelectItem value="12">Monthly</SelectItem>
                        <SelectItem value="365">Daily</SelectItem>
                    </SelectContent>
                </Select>
                <FormMessage /></FormItem>
            )} />
          </div>
          <Button type="submit">Calculate</Button>
        </form>
      </Form>
      {result && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><PiggyBank className="h-8 w-8 text-primary" /><CardTitle>Investment Growth</CardTitle></div></CardHeader>
            <CardContent>
                <div className="text-center space-y-4">
                    <div>
                        <CardDescription>Future Value</CardDescription>
                        <p className="text-3xl font-bold">${result.totalAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                        <div>
                            <CardDescription>Principal Amount</CardDescription>
                            <p className="text-xl font-semibold">${form.getValues('principal').toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                        </div>
                        <div>
                            <CardDescription>Total Interest Earned</CardDescription>
                            <p className="text-xl font-semibold">${result.totalInterest.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                        </div>
                    </div>
                </div>
                <div className="mt-8 h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={result.chartData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                        </linearGradient>
                         <linearGradient id="colorPrincipal" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" unit="yr" />
                      <YAxis tickFormatter={(value) => `$${(value/1000)}k`} />
                      <Tooltip formatter={(value: number, name: string) => name === "principal" ? `$${value.toLocaleString()}`: `$${value.toLocaleString()}`} />
                      <Legend />
                      <Area type="monotone" dataKey="principal" name="Principal" stroke="hsl(var(--muted-foreground))" fillOpacity={1} fill="url(#colorPrincipal)" />
                      <Area type="monotone" dataKey="value" name="Future Value" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorValue)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
      )}
       <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="what-is-compound-interest">
          <AccordionTrigger>What is Compound Interest?</AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-2">
            <p>Compound interest is the interest on an investment's principal plus the interest that has already been earned. This "interest on interest" effect is why investments can grow at an exponential rate over time. The more frequently interest is compounded, the faster the growth.</p>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How The Calculation Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-2">
                <p>This calculator uses the standard formula for the future value of an investment with compound interest:</p>
                <p className='font-mono p-4 bg-muted rounded-md'>A = P(1 + r/n)^(nt)</p>
                 <ul className="list-disc list-inside space-y-1 pl-4">
                    <li><strong>A</strong> is the future value of the investment/loan, including interest.</li>
                    <li><strong>P</strong> is the principal investment amount (the initial deposit or loan amount).</li>
                    <li><strong>r</strong> is the annual interest rate (in decimal form).</li>
                    <li><strong>n</strong> is the number of times that interest is compounded per year.</li>
                    <li><strong>t</strong> is the number of years the money is invested or borrowed for.</li>
                </ul>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value="further-reading">
            <AccordionTrigger>Further Reading</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-2">
              <p>For more detailed information on compound interest and financial planning, consult these authoritative sources:</p>
               <ul className="list-disc list-inside space-y-1 pl-4">
                  <li><a href="https://www.investopedia.com/terms/c/compoundinterest.asp" target="_blank" rel="noopener noreferrer" className="text-primary underline">Investopedia: Compound Interest</a></li>
                  <li><a href="https://www.finra.org/investors/learn-to-invest/advanced-investing/compound-interest" target="_blank" rel="noopener noreferrer" className="text-primary underline">FINRA: Compound Interest Basics</a></li>
              </ul>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
