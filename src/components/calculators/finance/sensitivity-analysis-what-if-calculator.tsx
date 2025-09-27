
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SlidersHorizontal } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const formSchema = z.object({
  initialInvestment: z.number().positive(),
  annualCashFlow: z.number().positive(),
  projectLife: z.number().int().positive(),
  variableToTest: z.enum(['discountRate', 'annualCashFlow']),
  startValue: z.number(),
  endValue: z.number(),
  step: z.number().positive(),
});

type FormValues = z.infer<typeof formSchema>;
type AnalysisResult = { variable: string, value: number, npv: number };

export default function SensitivityAnalysisCalculator() {
  const [results, setResults] = useState<AnalysisResult[] | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        initialInvestment: undefined,
        annualCashFlow: undefined,
        projectLife: undefined,
        variableToTest: 'discountRate',
        startValue: undefined,
        endValue: undefined,
        step: undefined,
    },
  });

  const calculateNPV = (rate: number, cf: number, life: number, initial: number) => {
    let npv = -initial;
    for (let t = 1; t <= life; t++) {
      npv += cf / Math.pow(1 + rate, t);
    }
    return npv;
  };

  const onSubmit = (values: FormValues) => {
    const analysisResults: AnalysisResult[] = [];
    const iterations = (values.endValue - values.startValue) / values.step;
    if (iterations > 100) { // Limit iterations
        form.setError("step", { message: "Range/step results in too many iterations."});
        return;
    }
    
    for (let i = values.startValue; i <= values.endValue; i += values.step) {
      let npv = 0;
      if (values.variableToTest === 'discountRate') {
        npv = calculateNPV(i / 100, values.annualCashFlow, values.projectLife, values.initialInvestment);
      } else { // testing annualCashFlow
        npv = calculateNPV(values.startValue / 100, i, values.projectLife, values.initialInvestment);
      }
      analysisResults.push({ variable: values.variableToTest === 'discountRate' ? `${i.toFixed(2)}%` : `$${i}`, value: i, npv });
    }
    setResults(analysisResults);
  };
  
  const variable = form.watch("variableToTest");

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Base NPV Model</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="initialInvestment" render={({ field }) => (<FormItem><FormLabel>Initial Investment ($)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl></FormItem>)} />
              <FormField control={form.control} name="annualCashFlow" render={({ field }) => (<FormItem><FormLabel>Annual Cash Flow ($)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl></FormItem>)} />
              <FormField control={form.control} name="projectLife" render={({ field }) => (<FormItem><FormLabel>Project Life (Years)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} /></FormControl></FormItem>)} />
            </CardContent>
          </Card>
           <Card>
            <CardHeader><CardTitle>Sensitivity Analysis Setup</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="variableToTest" render={({ field }) => (<FormItem><FormLabel>Variable to Test</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="discountRate">Discount Rate</SelectItem><SelectItem value="annualCashFlow">Annual Cash Flow</SelectItem></SelectContent></Select></FormItem>)} />
              <FormField control={form.control} name="startValue" render={({ field }) => (<FormItem><FormLabel>Start Value {variable === 'discountRate' ? '(%)' : '($)'}</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl></FormItem>)} />
              <FormField control={form.control} name="endValue" render={({ field }) => (<FormItem><FormLabel>End Value {variable === 'discountRate' ? '(%)' : '($)'}</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl></FormItem>)} />
              <FormField control={form.control} name="step" render={({ field }) => (<FormItem><FormLabel>Step</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
            </CardContent>
          </Card>
          <Button type="submit">Run Analysis</Button>
        </form>
      </Form>
      {results && (
        <Card className="mt-8">
          <CardHeader><div className='flex items-center gap-4'><SlidersHorizontal className="h-8 w-8 text-primary" /><CardTitle>Sensitivity Analysis Results</CardTitle></div></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>{variable === 'discountRate' ? 'Discount Rate' : 'Annual Cash Flow'}</TableHead><TableHead className="text-right">Net Present Value (NPV)</TableHead></TableRow></TableHeader>
              <TableBody>
                {results.map(item => (
                  <TableRow key={item.value}>
                    <TableCell>{item.variable}</TableCell>
                    <TableCell className="text-right">${item.npv.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="how-it-works">
          <AccordionTrigger>How "What-If" Analysis Works</AccordionTrigger>
          <AccordionContent className="text-muted-foreground">This tool systematically recalculates a financial model's output (in this case, NPV) while changing one key input variable across a defined range. It helps you understand which variables have the biggest impact on your project's outcome and identifies the break-even point for that variable.</AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
