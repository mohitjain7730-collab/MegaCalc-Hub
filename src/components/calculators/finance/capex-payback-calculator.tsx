
'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, PlusCircle, XCircle } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const cashFlowSchema = z.object({ value: z.number().positive().optional() });

const formSchema = z.object({
  initialInvestment: z.number().positive(),
  cashFlows: z.array(cashFlowSchema).min(1, "At least one cash flow is required."),
});

type FormValues = z.infer<typeof formSchema>;

export default function CapexPaybackCalculator() {
  const [result, setResult] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      initialInvestment: undefined,
      cashFlows: [{ value: undefined }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "cashFlows" });

  const onSubmit = (values: FormValues) => {
    const { initialInvestment, cashFlows } = values;
    let cumulativeCashFlow = 0;
    
    // Handle case for even cash flows by checking if only one cash flow value is provided
    const isEvenFlow = cashFlows.length === 1 && cashFlows[0].value;
    if(isEvenFlow) {
        const payback = initialInvestment / cashFlows[0].value!;
        const years = Math.floor(payback);
        const months = (payback - years) * 12;
        setResult(`${years} years and ${months.toFixed(1)} months`);
        return;
    }

    // Handle uneven cash flows
    for (let i = 0; i < cashFlows.length; i++) {
        const cashFlow = cashFlows[i].value || 0;
        if (cumulativeCashFlow + cashFlow >= initialInvestment) {
            const unrecovered = initialInvestment - cumulativeCashFlow;
            const months = (unrecovered / cashFlow) * 12;
            setResult(`${i} years and ${months.toFixed(1)} months`);
            return;
        }
        cumulativeCashFlow += cashFlow;
    }
    setResult("Payback period is longer than the provided cash flows.");
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField control={form.control} name="initialInvestment" render={({ field }) => (<FormItem><FormLabel>Initial Investment ($)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl></FormItem>)} />
          
          <Card>
            <CardHeader><CardTitle>Annual Cash Inflows</CardTitle><CardDescription>For even cash flows, enter one value. For uneven, add a field for each year.</CardDescription></CardHeader>
            <CardContent>
              {fields.map((field, index) => (
                  <div key={field.id} className="flex items-center gap-2 mb-2">
                      <FormLabel className='w-24'>Year {index + 1}:</FormLabel>
                      <FormField control={form.control} name={`cashFlows.${index}.value`} render={({ field }) => (<FormItem className="flex-grow"><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl></FormItem>)} />
                      {fields.length > 1 && <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}><XCircle className="h-5 w-5 text-destructive" /></Button>}
                  </div>
              ))}
              <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => append({ value: undefined })}><PlusCircle className="mr-2 h-4 w-4" /> Add Year for Uneven Flows</Button>
            </CardContent>
          </Card>

          <Button type="submit">Calculate Payback Period</Button>
        </form>
      </Form>
      {result !== null && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Clock className="h-8 w-8 text-primary" /><CardTitle>Payback Period</CardTitle></div></CardHeader>
            <CardContent>
                <p className="text-3xl font-bold text-center">{result}</p>
                <CardDescription className='mt-4 text-center'>This is the time it takes for the investment to generate enough cash flow to recover its initial cost.</CardDescription>
            </CardContent>
        </Card>
      )}
       <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="understanding-inputs">
            <AccordionTrigger>Understanding the Inputs</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-4">
                <div>
                    <h4 className="font-semibold text-foreground mb-1">Initial Investment</h4>
                    <p>The total upfront cost of the project or capital expenditure.</p>
                </div>
                <div>
                    <h4 className="font-semibold text-foreground mb-1">Annual Cash Inflows</h4>
                    <p>The net cash generated by the project each year. If the inflows are the same every year, enter a single value. If they change, add a field for each year's projected inflow.</p>
                </div>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-2">
              <p>The Payback Period is a capital budgeting method used to determine the time required for an investment to generate cash flows to recover its initial cost. It is a simple measure of risk.</p>
              <ul className='list-disc list-inside mt-2 space-y-1'>
                <li><strong>For Even Cash Flows:</strong> The calculator simply divides the `Initial Investment` by the constant `Annual Cash Inflow`.</li>
                <li><strong>For Uneven Cash Flows:</strong> The calculator sequentially subtracts each year's cash inflow from the unrecovered investment amount until it reaches zero. The final year's portion is calculated as a fraction to determine the number of months.</li>
              </ul>
              <p className='mt-2'>Note: This method does not account for the time value of money (i.e., it doesn't discount future cash flows).</p>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
