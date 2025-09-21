
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

const formSchema = z.object({
  monthlyInvestment: z.number().positive(),
  annualInterestRate: z.number().positive(),
  investmentPeriodYears: z.number().positive(),
});

type FormValues = z.infer<typeof formSchema>;

export default function SipCalculator() {
  const [result, setResult] = useState<{ futureValue: number; totalInvestment: number; totalProfit: number } | null>(null);

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

    const futureValue = monthlyInvestment * ( (Math.pow(1 + r, n) - 1) / r ) * (1 + r);
    const totalInvestment = monthlyInvestment * n;
    const totalProfit = futureValue - totalInvestment;

    setResult({ futureValue, totalInvestment, totalProfit });
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="monthlyInvestment" render={({ field }) => (
                <FormItem><FormLabel>Monthly Investment</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="annualInterestRate" render={({ field }) => (
                <FormItem><FormLabel>Expected Annual Return (%)</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="investmentPeriodYears" render={({ field }) => (
                <FormItem className="md:col-span-2"><FormLabel>Investment Period (Years)</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>
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
        <AccordionItem value="understanding-returns">
          <AccordionTrigger>Understanding Returns: Risk vs. Reward</AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-2">
            <p>The "Expected Annual Return" is a crucial input that significantly impacts the final amount. It is not a guaranteed figure. The return rate depends on the type of fund you invest in:</p>
            <ul className="list-disc list-inside space-y-1 pl-4">
                <li><strong>High Risk / High Return (e.g., Equity Funds):</strong> Historically, equity markets have provided higher returns over the long term, often in the range of <strong>10-15%</strong> annually, but they also carry higher risk and can be volatile in the short term.</li>
                <li><strong>Moderate Risk / Moderate Return (e.g., Hybrid Funds):</strong> These funds balance investments between stocks and bonds. Expected returns might be in the <strong>8-12%</strong> range.</li>
                <li><strong>Low Risk / Safe Returns (e.g., Debt Funds or Fixed Deposits):</strong> These are much safer investments with more predictable, but lower, returns, typically in the <strong>5-7%</strong> range.</li>
            </ul>
             <p className="mt-2 font-semibold">Disclaimer: Past performance is not indicative of future results. The figures above are for educational purposes only.</p>
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
