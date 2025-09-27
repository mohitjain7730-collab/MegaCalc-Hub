
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dices } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const formSchema = z.object({
  diceCount: z.number().int().min(1, "Must be at least 1 die").max(10, "Max 10 dice for performance"),
  targetSum: z.number().int().min(1, "Must be a positive number"),
}).refine(data => !data.diceCount || data.targetSum >= data.diceCount, {
    message: "Target sum must be at least the number of dice.",
    path: ["targetSum"],
}).refine(data => !data.diceCount || data.targetSum <= data.diceCount * 6, {
    message: "Target sum cannot be greater than (dice count * 6).",
    path: ["targetSum"],
});

type FormValues = z.infer<typeof formSchema>;

export default function DiceRollProbabilityCalculator() {
  const [result, setResult] = useState<{ combinations: number, probability: number, totalCombinations: number } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      diceCount: undefined,
      targetSum: undefined,
    },
  });

  const findCombinations = (dice: number, target: number, sides: number): number => {
    if (target < dice || target > dice * sides) {
        return 0;
    }
    // DP table to store results
    const dp = Array(dice + 1).fill(0).map(() => Array(target + 1).fill(0));
    
    // Base case: 1 die
    for (let i = 1; i <= sides && i <= target; i++) {
        dp[1][i] = 1;
    }

    // Fill table for 2 to `dice` dice
    for (let i = 2; i <= dice; i++) {
        for (let j = i; j <= target; j++) {
            for (let k = 1; k <= sides && k < j; k++) {
                dp[i][j] += dp[i - 1][j - k];
            }
        }
    }
    return dp[dice][target];
  };

  const onSubmit = (values: FormValues) => {
    const { diceCount, targetSum } = values;
    const combinations = findCombinations(diceCount, targetSum, 6);
    const totalCombinations = Math.pow(6, diceCount);
    const probability = (combinations / totalCombinations) * 100;
    setResult({ combinations, probability, totalCombinations });
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="diceCount" render={({ field }) => (
                <FormItem><FormLabel>Number of Dice (d6)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="targetSum" render={({ field }) => (
                <FormItem><FormLabel>Target Sum</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <Button type="submit">Calculate Probability</Button>
        </form>
      </Form>
      
      {result !== null && form.getValues('diceCount') && form.getValues('targetSum') && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Dices className="h-8 w-8 text-primary" /><CardTitle>Roll Probability</CardTitle></div></CardHeader>
            <CardContent>
                <div className='text-center'>
                    <p className="text-3xl font-bold">{result.probability.toFixed(4)}%</p>
                    <p className="text-muted-foreground mt-1">
                        There are {result.combinations.toLocaleString()} ways to roll a {form.getValues('targetSum')} out of {result.totalCombinations.toLocaleString()} total possibilities.
                    </p>
                </div>
            </CardContent>
        </Card>
      )}

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
                <p>This calculator uses a dynamic programming approach to find the number of ways to achieve a target sum with a given number of 6-sided dice. It then divides this by the total number of possible outcomes (6 raised to the power of the number of dice) to find the probability.</p>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
