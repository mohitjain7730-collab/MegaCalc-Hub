
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Landmark } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const formSchema = z.object({
  monthlyInvestment: z.number().positive(),
  annualInterestRate: z.number().positive(),
  investmentPeriodYears: z.number().positive(),
});

type FormValues = z.infer<typeof formSchema>;

interface CalculationResult {
  futureValue: number;
  totalInvestment: number;
  totalProfit: number;
  chartData: { year: number; totalInvestment: number; futureValue: number }[];
}


export default function SipCalculator() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      monthlyInvestment: undefined,
      annualInterestRate: undefined,
      investmentPeriodYears: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const { monthlyInvestment, annualInterestRate, investmentPeriodYears } = values;
    const r = annualInterestRate / 12 / 100;
    const n = investmentPeriodYears * 12;

    const chartData = [];
    for (let year = 1; year <= investmentPeriodYears; year++) {
      const currentN = year * 12;
      const yearEndFutureValue = monthlyInvestment * ( (Math.pow(1 + r, currentN) - 1) / r ) * (1 + r);
      const yearEndTotalInvestment = monthlyInvestment * currentN;
      chartData.push({
        year: year,
        totalInvestment: Math.round(yearEndTotalInvestment),
        futureValue: Math.round(yearEndFutureValue),
      });
    }

    const futureValue = chartData[chartData.length - 1].futureValue;
    const totalInvestment = monthlyInvestment * n;
    const totalProfit = futureValue - totalInvestment;

    setResult({ futureValue, totalInvestment, totalProfit, chartData });
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="monthlyInvestment" render={({ field }) => (
                <FormItem><FormLabel>Monthly Investment</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="annualInterestRate" render={({ field }) => (
                <FormItem><FormLabel>Expected Annual Return (%)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="investmentPeriodYears" render={({ field }) => (
                <FormItem className="md:col-span-2"><FormLabel>Investment Period (Years)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <Button type="submit">Calculate</Button>
        </form>
      </Form>
      {result && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Landmark className="h-8 w-8 text-primary" /><CardTitle>Investment Projection</CardTitle></div></CardHeader>
            <CardContent>
                <div className="text-center space-y-4">
                    <div>
                        <CardDescription>Estimated Value</CardDescription>
                        <p className="text-3xl font-bold">${result.futureValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                        <div>
                            <CardDescription>Total Investment</CardDescription>
                            <p className="text-xl font-semibold">${result.totalInvestment.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                        </div>
                        <div>
                            <CardDescription>Total Profit</CardDescription>
                            <p className="text-xl font-semibold">${result.totalProfit.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                        </div>
                    </div>
                </div>
                 <div className="mt-8 h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={result.chartData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" unit="yr" />
                      <YAxis tickFormatter={(value) => `$${(value/1000)}k`} />
                      <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                      <Legend />
                      <Line type="monotone" dataKey="totalInvestment" name="Total Investment" stroke="hsl(var(--muted-foreground))" activeDot={{ r: 8 }} />
                      <Line type="monotone" dataKey="futureValue" name="Estimated Value" stroke="hsl(var(--primary))" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
      )}
       <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="what-is-sip">
          <AccordionTrigger>What is a SIP?</AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-2">
            <p>A Systematic Investment Plan (SIP) is a method of investing a fixed amount of money in mutual funds at regular intervals (usually monthly). It helps in disciplined investing, rupee cost averaging, and harnessing the power of compounding. Instead of investing a large lump sum at once, you invest smaller amounts over time, which can reduce the risk of market volatility.</p>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="understanding-inputs">
          <AccordionTrigger>Understanding the Inputs</AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-1">Monthly Investment</h4>
              <p>The fixed amount of money you plan to invest every month.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Expected Annual Return (%)</h4>
              <p>The rate of return you expect from your investment annually. This is not a guaranteed figure. For example, historically, equity funds have offered higher returns (e.g., 10-15%) with higher risk, while debt funds offer lower, more stable returns (e.g., 5-7%).</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Investment Period (Years)</h4>
              <p>The total duration in years for which you plan to stay invested.</p>
            </div>
          </AccordionContent>
        </AccordionItem>
         <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-2">
                <p>This calculator uses the future value of a series formula to project the growth of your systematic investments over time, factoring in the effect of compound interest on your monthly contributions.</p>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value="further-reading">
            <AccordionTrigger>Further Reading</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-2">
              <p>To learn more about Systematic Investment Plans and related concepts, you can visit these credible resources:</p>
               <ul className="list-disc list-inside space-y-1 pl-4">
                  <li><a href="https://www.investopedia.com/terms/s/systematicinvestmentplan.asp" target="_blank" rel="noopener noreferrer" className="text-primary underline">Investopedia: What Is a Systematic Investment Plan (SIP)?</a></li>
                  <li><a href="https://www.investor.gov/introduction-investing/investing-basics/investment-products/mutual-funds" target="_blank" rel="noopener noreferrer" className="text-primary underline">Investor.gov (U.S. SEC): Mutual Funds</a></li>
              </ul>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
