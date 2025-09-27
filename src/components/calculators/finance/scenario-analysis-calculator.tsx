'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Drama } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const scenarioSchema = z.object({
  unitsSold: z.number().nonnegative(),
  pricePerUnit: z.number().nonnegative(),
  variableCost: z.number().nonnegative(),
  fixedCosts: z.number().nonnegative(),
});

const formSchema = z.object({
  initialInvestment: z.number().positive(),
  projectLife: z.number().int().positive(),
  discountRate: z.number().positive(),
  baseCase: scenarioSchema,
  bestCase: scenarioSchema,
  worstCase: scenarioSchema,
});

type FormValues = z.infer<typeof formSchema>;
type NpvResult = { name: string; npv: number };

export default function ScenarioAnalysisCalculator() {
  const [results, setResults] = useState<NpvResult[] | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      initialInvestment: undefined,
      projectLife: undefined,
      discountRate: undefined,
      baseCase: { unitsSold: undefined, pricePerUnit: undefined, variableCost: undefined, fixedCosts: undefined },
      bestCase: { unitsSold: undefined, pricePerUnit: undefined, variableCost: undefined, fixedCosts: undefined },
      worstCase: { unitsSold: undefined, pricePerUnit: undefined, variableCost: undefined, fixedCosts: undefined },
    },
  });

  const calculateNPV = (values: z.infer<typeof scenarioSchema>, discountRate: number, projectLife: number, initialInvestment: number) => {
    const annualCashFlow = (values.pricePerUnit * values.unitsSold) - (values.variableCost * values.unitsSold) - values.fixedCosts;
    let npv = -initialInvestment;
    for (let t = 1; t <= projectLife; t++) {
      npv += annualCashFlow / Math.pow(1 + (discountRate / 100), t);
    }
    return npv;
  };

  const onSubmit = (values: FormValues) => {
    const { initialInvestment, projectLife, discountRate, baseCase, bestCase, worstCase } = values;
    setResults([
      { name: 'Worst Case', npv: calculateNPV(worstCase, discountRate, projectLife, initialInvestment) },
      { name: 'Base Case', npv: calculateNPV(baseCase, discountRate, projectLife, initialInvestment) },
      { name: 'Best Case', npv: calculateNPV(bestCase, discountRate, projectLife, initialInvestment) },
    ]);
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Project Assumptions</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField control={form.control} name="initialInvestment" render={({ field }) => (<FormItem><FormLabel>Initial Investment ($)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl></FormItem>)} />
              <FormField control={form.control} name="projectLife" render={({ field }) => (<FormItem><FormLabel>Project Life (Years)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} /></FormControl></FormItem>)} />
              <FormField control={form.control} name="discountRate" render={({ field }) => (<FormItem><FormLabel>Discount Rate (%)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl></FormItem>)} />
            </CardContent>
          </Card>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {['worstCase', 'baseCase', 'bestCase'].map(scenario => (
              <Card key={scenario}>
                <CardHeader><CardTitle>{scenario.replace('Case', ' Case')}</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <FormField control={form.control} name={`${scenario as keyof FormValues}.unitsSold`} render={({ field }) => (<FormItem><FormLabel>Units Sold/Year</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)}/></FormControl></FormItem>)} />
                  <FormField control={form.control} name={`${scenario as keyof FormValues}.pricePerUnit`} render={({ field }) => (<FormItem><FormLabel>Price/Unit ($)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)}/></FormControl></FormItem>)} />
                  <FormField control={form.control} name={`${scenario as keyof FormValues}.variableCost`} render={({ field }) => (<FormItem><FormLabel>Variable Cost/Unit ($)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)}/></FormControl></FormItem>)} />
                  <FormField control={form.control} name={`${scenario as keyof FormValues}.fixedCosts`} render={({ field }) => (<FormItem><FormLabel>Fixed Costs/Year ($)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)}/></FormControl></FormItem>)} />
                </CardContent>
              </Card>
            ))}
          </div>
          <Button type="submit">Run Scenario Analysis</Button>
        </form>
      </Form>
      {results && (
        <Card className="mt-8">
          <CardHeader><div className='flex items-center gap-4'><Drama className="h-8 w-8 text-primary" /><CardTitle>Scenario Analysis Results (NPV)</CardTitle></div></CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            {results.map(res => (
              <div key={res.name} className={`p-4 rounded-lg ${res.npv < 0 ? 'bg-destructive/10' : 'bg-green-500/10'}`}>
                <p className="font-semibold">{res.name}</p>
                <p className="text-2xl font-bold">${res.npv.toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="how-it-works">
          <AccordionTrigger>How It Works</AccordionTrigger>
          <AccordionContent className="text-muted-foreground">Scenario analysis evaluates a project's outcome under different sets of assumptions. This calculator runs a Net Present Value (NPV) calculation three times: once for your base-case assumptions, once for an optimistic (best-case) scenario, and once for a pessimistic (worst-case) scenario, showing the range of potential outcomes.</AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
