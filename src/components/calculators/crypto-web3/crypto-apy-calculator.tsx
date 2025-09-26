
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChartIcon } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const formSchema = z.object({
  initialInvestment: z.number().positive(),
  apy: z.number().positive(),
  duration: z.number().positive(),
  compoundingFrequency: z.number().positive(),
});

type FormValues = z.infer<typeof formSchema>;

interface Result {
  finalAmount: number;
  totalInterest: number;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-2))'];

export default function CryptoApyCalculator() {
  const [result, setResult] = useState<Result | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      initialInvestment: undefined,
      apy: undefined,
      duration: undefined,
      compoundingFrequency: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const { initialInvestment: P, apy, duration: t, compoundingFrequency: n } = values;
    const r = apy / 100;
    const finalAmount = P * Math.pow(1 + r / n, n * t);
    const totalInterest = finalAmount - P;
    setResult({ finalAmount, totalInterest });
  };

  const chartData = result ? [
    { name: 'Initial Investment', value: form.getValues('initialInvestment') },
    { name: 'Total Interest', value: result.totalInterest },
  ] : [];

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="initialInvestment" render={({ field }) => (
                <FormItem><FormLabel>Initial Investment (USD)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="apy" render={({ field }) => (
                <FormItem><FormLabel>Annual Percentage Yield (APY %)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="duration" render={({ field }) => (
                <FormItem><FormLabel>Duration (Years)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="compoundingFrequency" render={({ field }) => (
                <FormItem><FormLabel>Compounding Frequency (per Year)</FormLabel><FormControl><Input type="number" placeholder="e.g., 365" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <Button type="submit">Calculate Yield</Button>
        </form>
      </Form>
      {result && (
        <Card className="mt-8">
            <CardHeader>
                <div className='flex items-center gap-4'><PieChartIcon className="h-8 w-8 text-primary" /><CardTitle>Yield Farming Projection</CardTitle></div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <div className="space-y-4">
                        <div>
                            <p className="text-muted-foreground">Final Amount</p>
                            <p className="text-2xl font-bold">${result.finalAmount.toLocaleString(undefined, {maximumFractionDigits: 2})}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Total Interest Earned</p>
                            <p className="text-2xl font-bold">${result.totalInterest.toLocaleString(undefined, {maximumFractionDigits: 2})}</p>
                        </div>
                    </div>
                    <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={chartData} cx="50%" cy="50%" labelLine={false} outerRadius={80} fill="#8884d8" dataKey="value">
                                    {chartData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                                </Pie>
                                <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </CardContent>
        </Card>
      )}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-2">
                <p>This calculator uses the standard compound interest formula to project the growth of your investment in a yield farming protocol. APY includes the effects of compounding.</p>
                <p className='font-mono p-2 bg-muted rounded-md'>Final Amount = P(1 + APY/n)^(n*t)</p>
                <ul className="list-disc list-inside space-y-1 pl-4">
                    <li><strong>P</strong> is the initial investment.</li>
                    <li><strong>APY</strong> is the Annual Percentage Yield (as a decimal).</li>
                    <li><strong>n</strong> is the number of times compounding occurs per year.</li>
                    <li><strong>t</strong> is the number of years.</li>
                </ul>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value="understanding-inputs">
            <AccordionTrigger>Understanding the Inputs</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-4">
              <div><h4 className="font-semibold text-foreground">Initial Investment (USD)</h4><p>The amount of money you are initially putting into the yield farming protocol.</p></div>
              <div><h4 className="font-semibold text-foreground">Annual Percentage Yield (APY %)</h4><p>The annualized rate of return from your investment, including the effect of compounding interest. APYs in DeFi can be highly variable.</p></div>
              <div><h4 className="font-semibold text-foreground">Duration (Years)</h4><p>How long you plan to keep your investment in the protocol.</p></div>
              <div><h4 className="font-semibold text-foreground">Compounding Frequency</h4><p>How often the rewards are added to your staked amount, which then also starts earning rewards. Daily (365) is common.</p></div>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
