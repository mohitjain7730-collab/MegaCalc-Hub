
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Coins } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const formSchema = z.object({
  amountStaked: z.number().positive(),
  rewardRate: z.number().positive(),
  compoundingFrequency: z.number().int().positive(),
  stakingDuration: z.number().positive(),
});

type FormValues = z.infer<typeof formSchema>;

export default function CryptoStakingRewardCalculator() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amountStaked: undefined,
      rewardRate: undefined,
      compoundingFrequency: undefined,
      stakingDuration: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const { amountStaked: P, rewardRate: r, compoundingFrequency: n, stakingDuration: t } = values;
    const rate = r / 100;
    const futureValue = P * Math.pow(1 + rate / n, n * t);
    const totalEarned = futureValue - P;
    setResult(totalEarned);
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="amountStaked" render={({ field }) => (
                <FormItem><FormLabel>Amount Staked (Coins)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="rewardRate" render={({ field }) => (
                <FormItem><FormLabel>Annual Staking Reward Rate (%)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="compoundingFrequency" render={({ field }) => (
                <FormItem><FormLabel>Compounding Frequency (per Year)</FormLabel><FormControl><Input type="number" placeholder="e.g., 365" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="stakingDuration" render={({ field }) => (
                <FormItem><FormLabel>Staking Duration (Years)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <Button type="submit">Calculate Rewards</Button>
        </form>
      </Form>
      {result !== null && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Coins className="h-8 w-8 text-primary" /><CardTitle>Estimated Staking Rewards</CardTitle></div></CardHeader>
            <CardContent>
                <p className="text-3xl font-bold text-center">{result.toLocaleString(undefined, {maximumFractionDigits: 6})} Coins</p>
                <CardDescription className='mt-4 text-center'>This is the total amount of new coins you are projected to earn over the staking duration.</CardDescription>
            </CardContent>
        </Card>
      )}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-2">
                <p>This calculator uses the standard compound interest formula to project your staking rewards. It determines the future value of your staked assets based on the reward rate, how often the rewards are compounded, and how long you stake for.</p>
                <p className='font-mono p-2 bg-muted rounded-md'>Future Value = P(1 + r/n)^(n*t)</p>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value="understanding-inputs">
            <AccordionTrigger>Understanding the Inputs</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-4">
              <div><h4 className="font-semibold text-foreground">Amount Staked</h4><p>The number of coins you are locking up in the staking protocol.</p></div>
              <div><h4 className="font-semibold text-foreground">Annual Staking Reward Rate (%)</h4><p>The advertised annual percentage rate (APR) or yield (APY) for staking.</p></div>
              <div><h4 className="font-semibold text-foreground">Compounding Frequency</h4><p>How many times per year your rewards are calculated and added to your staked amount. Many protocols compound daily (365).</p></div>
              <div><h4 className="font-semibold text-foreground">Staking Duration (Years)</h4><p>The length of time you plan to keep your coins staked.</p></div>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
