
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
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const formSchema = z.object({
  initialValue: z.number().positive(),
  expectedReturn: z.number(),
  volatility: z.number().positive(),
  timeHorizon: z.number().int().positive(),
  simulations: z.number().int().min(100).max(10000),
});

type FormValues = z.infer<typeof formSchema>;

interface Result {
    mean: number;
    median: number;
    p10: number;
    p90: number;
    chartData: { value: number }[];
}

export default function MonteCarloPortfolioCalculator() {
  const [result, setResult] = useState<Result | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { initialValue: 10000, expectedReturn: 8, volatility: 15, timeHorizon: 10, simulations: 1000 },
  });

  // Standard Normal variate using Box-Muller transform
  const randomNormal = () => {
    let u = 0, v = 0;
    while(u === 0) u = Math.random(); //Converting [0,1) to (0,1)
    while(v === 0) v = Math.random();
    return Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
  }

  const onSubmit = (values: FormValues) => {
    const { initialValue, expectedReturn, volatility, timeHorizon, simulations } = values;
    const mu = expectedReturn / 100;
    const sigma = volatility / 100;

    const finalValues = [];

    for (let i = 0; i < simulations; i++) {
        let portfolioValue = initialValue;
        for (let j = 0; j < timeHorizon; j++) {
            const annualReturn = mu + randomNormal() * sigma;
            portfolioValue *= (1 + annualReturn);
        }
        finalValues.push(portfolioValue);
    }
    
    finalValues.sort((a,b) => a-b);
    
    const sum = finalValues.reduce((a,b) => a+b, 0);
    const mean = sum / simulations;
    const median = finalValues[Math.floor(simulations/2)];
    const p10 = finalValues[Math.floor(simulations * 0.1)];
    const p90 = finalValues[Math.floor(simulations * 0.9)];

    setResult({
        mean,
        median,
        p10,
        p90,
        chartData: finalValues.map(v => ({value: v})),
    });
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="initialValue" render={({ field }) => ( <FormItem><FormLabel>Initial Portfolio Value</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem> )}/>
            <FormField control={form.control} name="expectedReturn" render={({ field }) => ( <FormItem><FormLabel>Expected Annual Return (%)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem> )}/>
            <FormField control={form.control} name="volatility" render={({ field }) => ( <FormItem><FormLabel>Volatility (Std. Dev.) %</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem> )}/>
            <FormField control={form.control} name="timeHorizon" render={({ field }) => ( <FormItem><FormLabel>Time Horizon (Years)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem> )}/>
            <FormField control={form.control} name="simulations" render={({ field }) => ( <FormItem className="md:col-span-2"><FormLabel>Number of Simulations</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem> )}/>
          </div>
          <Button type="submit">Run Simulation</Button>
        </form>
      </Form>
      {result && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Landmark className="h-8 w-8 text-primary" /><CardTitle>Monte Carlo Simulation Results</CardTitle></div></CardHeader>
            <CardContent>
                <div className='grid grid-cols-2 md:grid-cols-4 gap-4 text-center mb-8'>
                    <div><p className='font-semibold text-muted-foreground'>10th Percentile</p><p className='text-lg font-bold'>${result.p10.toLocaleString(undefined, {maximumFractionDigits:0})}</p></div>
                    <div><p className='font-semibold text-muted-foreground'>Median Value</p><p className='text-lg font-bold'>${result.median.toLocaleString(undefined, {maximumFractionDigits:0})}</p></div>
                    <div><p className='font-semibold text-muted-foreground'>Mean Value</p><p className='text-lg font-bold'>${result.mean.toLocaleString(undefined, {maximumFractionDigits:0})}</p></div>
                    <div><p className='font-semibold text-muted-foreground'>90th Percentile</p><p className='text-lg font-bold'>${result.p90.toLocaleString(undefined, {maximumFractionDigits:0})}</p></div>
                </div>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={result.chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="value" name="Portfolio Value" type="number" domain={['dataMin', 'dataMax']} tickFormatter={(val) => `$${(val/1000).toFixed(0)}k`} />
                            <YAxis name="Frequency" />
                            <Tooltip formatter={(value, name, props) => {
                                const payload = props.payload as any;
                                if(payload && payload.value) {
                                    return [`$${payload.value.toLocaleString(undefined, {maximumFractionDigits:0})}`, 'Value'];
                                }
                                return null;
                            }} />
                            <Bar dataKey="value" name="Frequency" fill="hsl(var(--primary))" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
      )}
       <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
                A Monte Carlo simulation models the probability of different outcomes by running thousands of randomized trials. This calculator simulates the growth of your portfolio over the time horizon, year by year, using a random annual return drawn from a normal distribution defined by your expected return (mean) and volatility (standard deviation). By running many simulations, it builds a probability distribution of potential future portfolio values.
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
