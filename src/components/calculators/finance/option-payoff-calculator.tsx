
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Landmark } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const formSchema = z.object({
  optionType: z.enum(['call', 'put']),
  strikePrice: z.number().positive(),
  premium: z.number().positive(),
});

type FormValues = z.infer<typeof formSchema>;

export default function OptionPayoffCalculator() {
  const [result, setResult] = useState<{ chartData: any[], breakEven: number } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      optionType: 'call',
      strikePrice: undefined,
      premium: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const { optionType, strikePrice, premium } = values;
    const chartData = [];
    const breakEven = optionType === 'call' ? strikePrice + premium : strikePrice - premium;
    const range = strikePrice * 0.4;
    
    for (let i = 0; i <= 20; i++) {
        const underlyingPrice = strikePrice - range + (i * (range*2 / 20));
        let profit = 0;
        if (optionType === 'call') {
            profit = Math.max(0, underlyingPrice - strikePrice) - premium;
        } else {
            profit = Math.max(0, strikePrice - underlyingPrice) - premium;
        }
        chartData.push({ price: parseFloat(underlyingPrice.toFixed(2)), profit: parseFloat(profit.toFixed(2)) });
    }

    setResult({ chartData, breakEven });
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField control={form.control} name="optionType" render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Option Type</FormLabel>
              <FormControl>
                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-4">
                  <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="call" /></FormControl><FormLabel className="font-normal">Call</FormLabel></FormItem>
                  <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="put" /></FormControl><FormLabel className="font-normal">Put</FormLabel></FormItem>
                </RadioGroup>
              </FormControl>
            </FormItem>
          )} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="strikePrice" render={({ field }) => ( <FormItem><FormLabel>Strike Price (K)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem> )}/>
            <FormField control={form.control} name="premium" render={({ field }) => ( <FormItem><FormLabel>Premium Paid</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem> )}/>
          </div>
          <Button type="submit">Show Payoff</Button>
        </form>
      </Form>
      {result && (
        <Card className="mt-8">
            <CardHeader>
                <div className='flex items-center gap-4'><Landmark className="h-8 w-8 text-primary" /><CardTitle>Option Payoff at Expiration</CardTitle></div>
                <CardDescription>Break-even price: ${result.breakEven.toFixed(2)}</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
                 <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={result.chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="price" name="Underlying Price" type="number" domain={['dataMin', 'dataMax']} />
                        <YAxis name="Profit/Loss" />
                        <Tooltip formatter={(value) => `$${value}`} />
                        <Legend />
                        <Line type="monotone" dataKey="profit" name="Profit/Loss" stroke="hsl(var(--primary))" dot={false} />
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
      )}
       <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
                <p>This calculator shows the potential profit or loss of a single call or put option at expiration. For a call option, profit is made if the underlying price is above the strike price plus the premium paid. For a put option, profit is made if the underlying price is below the strike price minus the premium paid. The chart visualizes this relationship across a range of potential underlying prices.</p>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
