
'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Landmark, PlusCircle, XCircle } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Link from 'next/link';

const cashFlowSchema = z.object({
  value: z.number().optional(),
});

const formSchema = z.object({
  discountRate: z.number().positive(),
  cashFlows: z.array(cashFlowSchema).min(1, "At least one cash flow is required."),
});

type FormValues = z.infer<typeof formSchema>;

export default function NpvCalculator() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      discountRate: undefined,
      cashFlows: [
        { value: undefined }, // Initial Investment (CF0)
        { value: undefined }, // CF1
        { value: undefined }, // CF2
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "cashFlows"
  });

  const onSubmit = (values: FormValues) => {
    const { discountRate, cashFlows } = values;
    const r = discountRate / 100;
    let npv = 0;
    cashFlows.forEach((cf, t) => {
      npv += (cf.value || 0) / Math.pow(1 + r, t);
    });
    setResult(npv);
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField control={form.control} name="discountRate" render={({ field }) => (
            <FormItem><FormLabel>Discount Rate (%)</FormLabel><FormControl><Input type="number" placeholder="e.g., 10" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
          )} />
          
          <Card>
              <CardHeader><CardTitle>Cash Flows</CardTitle><CardDescription>Enter the initial investment as a negative number (Year 0), followed by future cash flows.</CardDescription></CardHeader>
              <CardContent>
                {fields.map((field, index) => (
                    <div key={field.id} className="flex items-center gap-2 mb-2">
                        <FormLabel className='w-20'>Year {index}:</FormLabel>
                        <FormField control={form.control} name={`cashFlows.${index}.value`} render={({ field }) => (
                            <FormItem className="flex-grow"><FormControl><Input type="number" placeholder={`Cash Flow for Year ${index}`} {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>
                        )} />
                        {fields.length > 1 && <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}><XCircle className="h-5 w-5 text-destructive" /></Button>}
                    </div>
                ))}
                <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => append({ value: undefined })}><PlusCircle className="mr-2 h-4 w-4" /> Add Cash Flow</Button>
              </CardContent>
          </Card>

          <Button type="submit">Calculate NPV</Button>
        </form>
      </Form>
      {result !== null && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Landmark className="h-8 w-8 text-primary" /><CardTitle>Net Present Value (NPV)</CardTitle></div></CardHeader>
            <CardContent>
                <p className="text-3xl font-bold text-center">${result.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                <CardDescription className='mt-4 text-center'>A positive NPV indicates the investment is expected to be profitable. A negative NPV suggests it may result in a net loss.</CardDescription>
            </CardContent>
        </Card>
      )}
      <div className="mt-10 space-y-4">
  <h2 className="text-2xl font-bold">Understanding Net Present Value (NPV)</h2>
  <p>
    The <strong>Net Present Value (NPV)</strong> is one of the most powerful tools in finance and investing. It helps determine the present value of a series of future cash flows by discounting them back to today’s value. In simple terms, NPV tells you whether an investment or project will add value to your wealth after considering the time value of money.
  </p>

  <h3 className="text-xl font-semibold">💡 Why NPV Matters</h3>
  <p>
    Money today is worth more than the same amount in the future because it can earn interest or be invested elsewhere. NPV adjusts for this difference, allowing investors and businesses to make informed decisions. A positive NPV means the project is profitable, while a negative NPV indicates a loss.
  </p>

  <h3 className="text-xl font-semibold">🧮 NPV Formula</h3>
  <p>
    The general formula for Net Present Value is:
  </p>
  <pre className="bg-gray-100 p-3 rounded-md overflow-x-auto">
    NPV = (Cash Flow₁ / (1 + r)¹) + (Cash Flow₂ / (1 + r)²) + ... + (Cash Flowₙ / (1 + r)ⁿ) – Initial Investment
  </pre>
  <p>
    where:
  </p>
  <ul className="list-disc ml-6 space-y-1">
    <li><strong>r</strong> = Discount rate (required rate of return)</li>
    <li><strong>n</strong> = Number of periods</li>
    <li><strong>Cash Flow</strong> = Expected net inflows for each period</li>
  </ul>

  <h3 className="text-xl font-semibold">📈 How to Interpret NPV</h3>
  <ul className="list-disc ml-6 space-y-1">
    <li><strong>NPV &gt; 0:</strong> The investment is profitable and adds value.</li>
    <li><strong>NPV = 0:</strong> The investment breaks even.</li>
    <li><strong>NPV &lt; 0:</strong> The investment will result in a net loss.</li>
  </ul>

  <h3 className="text-xl font-semibold">🔍 Example Calculation</h3>
  <p>
    Suppose you invest $10,000 in a project that generates $3,000 annually for 5 years, and your required rate of return is 8%. Using the NPV formula, you’ll find that the NPV is around <strong>$1,198</strong>. Since it’s positive, this project is financially viable.
  </p>

  <h3 className="text-xl font-semibold">📊 Practical Applications of NPV</h3>
  <ul className="list-disc ml-6 space-y-1">
    <li>Comparing multiple investment options</li>
    <li>Evaluating business projects or capital expenditures</li>
    <li>Assessing real estate investments or long-term contracts</li>
    <li>Analyzing startup project funding and expected ROI</li>
  </ul>

  <h3 className="text-xl font-semibold">⚖️ NPV vs. IRR</h3>
  <p>
    While <strong>NPV</strong> measures absolute value creation, the <strong>Internal Rate of Return (IRR)</strong> indicates the rate at which NPV becomes zero. Ideally, both should be used together for comprehensive investment evaluation.
  </p>

  <h3 className="text-xl font-semibold">📚 Tips for Accurate NPV Analysis</h3>
  <ul className="list-disc ml-6 space-y-1">
    <li>Use realistic cash flow projections.</li>
    <li>Select an appropriate discount rate (cost of capital or desired return).</li>
    <li>Account for taxes, inflation, and risk when estimating returns.</li>
    <li>Compare NPVs of multiple projects before deciding.</li>
  </ul>

  <h3 className="text-xl font-semibold">✅ Final Thoughts</h3>
  <p>
    The <strong>Net Present Value Calculator</strong> is a vital tool for anyone making financial decisions—from individuals planning investments to corporations evaluating major projects. Understanding and applying NPV correctly can be the difference between profit and loss.
  </p>

  <div>
    <h3 className="text-lg font-semibold mb-2">Related Financial Calculators</h3>
    <div className="space-y-2">
      <p><Link href="/category/finance/payback-period-calculator" className="text-primary underline">Payback Period Calculator</Link></p>
      <p><Link href="/category/finance/future-value-calculator" className="text-primary underline">Future Value Calculator</Link></p>
    </div>
  </div>
</div>
    </div>
  );
}
