
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bitcoin } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const formSchema = z.object({
  hashRate: z.number().positive(),
  powerConsumption: z.number().positive(),
  electricityCost: z.number().nonnegative(),
  blockReward: z.number().positive(),
  networkDifficulty: z.number().positive(),
  btcPrice: z.number().positive(),
});

type FormValues = z.infer<typeof formSchema>;

export default function CryptoMiningProfitabilityCalculator() {
  const [result, setResult] = useState<{ dailyProfit: number; monthlyProfit: number } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      hashRate: undefined,
      powerConsumption: undefined,
      electricityCost: undefined,
      blockReward: undefined,
      networkDifficulty: undefined,
      btcPrice: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const { hashRate, powerConsumption, electricityCost, blockReward, networkDifficulty, btcPrice } = values;
    const hashesPerDay = hashRate * 1e12 * 86400; // TH/s to H/day
    const btcPerDay = (hashesPerDay / (networkDifficulty * Math.pow(2, 32))) * blockReward;
    const revenuePerDay = btcPerDay * btcPrice;
    const costPerDay = powerConsumption * 24 * electricityCost;
    const dailyProfit = revenuePerDay - costPerDay;
    setResult({ dailyProfit, monthlyProfit: dailyProfit * 30 });
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="hashRate" render={({ field }) => (
                <FormItem><FormLabel>Hash Rate (TH/s)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="powerConsumption" render={({ field }) => (
                <FormItem><FormLabel>Power Consumption (kW)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="electricityCost" render={({ field }) => (
                <FormItem><FormLabel>Electricity Cost ($/kWh)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="blockReward" render={({ field }) => (
                <FormItem><FormLabel>Block Reward (BTC)</FormLabel><FormControl><Input type="number" step="any" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="networkDifficulty" render={({ field }) => (
                <FormItem><FormLabel>Network Difficulty</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="btcPrice" render={({ field }) => (
                <FormItem><FormLabel>BTC Price ($)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <Button type="submit">Calculate Profitability</Button>
        </form>
      </Form>
      {result && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Bitcoin className="h-8 w-8 text-primary" /><CardTitle>Estimated Mining Profit</CardTitle></div></CardHeader>
            <CardContent>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
                    <div>
                        <p className="text-muted-foreground">Daily Profit</p>
                        <p className={`text-2xl font-bold ${result.dailyProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>${result.dailyProfit.toLocaleString(undefined, {maximumFractionDigits: 2})}</p>
                    </div>
                    <div>
                        <p className="text-muted-foreground">Monthly Profit</p>
                        <p className={`text-2xl font-bold ${result.monthlyProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>${result.monthlyProfit.toLocaleString(undefined, {maximumFractionDigits: 2})}</p>
                    </div>
                </div>
                <CardDescription className='mt-4 text-center'>This is a simplified estimate and does not include pool fees, hardware depreciation, or changes in difficulty and price.</CardDescription>
            </CardContent>
        </Card>
      )}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-2">
                <p>This calculator estimates Bitcoin mining profitability based on several key factors:</p>
                <ol className="list-decimal list-inside space-y-1 pl-4">
                    <li><strong>BTC Earned:</strong> It calculates your proportional share of the network's total hash rate to estimate how much of a block reward you would earn per day.</li>
                    <li><strong>Revenue:</strong> It multiplies the BTC earned by the current BTC price to find your daily revenue.</li>
                    <li><strong>Costs:</strong> It calculates your daily electricity cost by multiplying your hardware's power consumption by your electricity rate over 24 hours.</li>
                    <li><strong>Profit:</strong> It subtracts your daily costs from your daily revenue to find the estimated profit.</li>
                </ol>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value="understanding-inputs">
            <AccordionTrigger>Understanding the Inputs</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-4">
              <div><h4 className="font-semibold text-foreground">Hash Rate (TH/s)</h4><p>The processing power of your mining hardware, in terahashes per second.</p></div>
              <div><h4 className="font-semibold text-foreground">Power Consumption (kW)</h4><p>How much power your hardware uses, in kilowatts. If your hardware is rated in Watts, divide by 1000.</p></div>
              <div><h4 className="font-semibold text-foreground">Electricity Cost ($/kWh)</h4><p>Your electricity rate, in dollars per kilowatt-hour.</p></div>
              <div><h4 className="font-semibold text-foreground">Block Reward (BTC)</h4><p>The amount of new BTC awarded for mining a block. This halves approximately every four years.</p></div>
              <div><h4 className="font-semibold text-foreground">Network Difficulty</h4><p>A measure of how difficult it is to find a hash below the target defined by the network. It adjusts to keep block times consistent.</p></div>
              <div><h4 className="font-semibold text-foreground">BTC Price ($)</h4><p>The current market price of one Bitcoin in USD.</p></div>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
