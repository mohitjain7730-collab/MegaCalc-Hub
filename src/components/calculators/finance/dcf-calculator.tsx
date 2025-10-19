
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

const cashFlowSchema = z.object({ value: z.number().optional() });

const formSchema = z.object({
  discountRate: z.number().positive(),
  cashFlows: z.array(cashFlowSchema).min(1, "At least one cash flow is required."),
  terminalValue: z.number().nonnegative(),
});

type FormValues = z.infer<typeof formSchema>;

export default function DcfCalculator() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      discountRate: undefined,
      cashFlows: [{ value: undefined }],
      terminalValue: undefined,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "cashFlows"
  });

  const onSubmit = (values: FormValues) => {
    const { discountRate, cashFlows, terminalValue } = values;
    const r = discountRate / 100;
    
    let dcf = 0;
    cashFlows.forEach((cf, t) => {
      dcf += (cf.value || 0) / Math.pow(1 + r, t + 1);
    });
    
    const terminalValuePV = terminalValue / Math.pow(1 + r, cashFlows.length);
    dcf += terminalValuePV;

    setResult(dcf);
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField control={form.control} name="discountRate" render={({ field }) => (
            <FormItem><FormLabel>Discount Rate (%)</FormLabel><FormControl><Input type="number" placeholder="e.g., 10" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
          )} />
          
          <Card>
            <CardHeader><CardTitle>Projected Free Cash Flows</CardTitle></CardHeader>
            <CardContent>
              {fields.map((field, index) => (
                  <div key={field.id} className="flex items-center gap-2 mb-2">
                      <FormLabel className='w-24'>Year {index + 1}:</FormLabel>
                      <FormField control={form.control} name={`cashFlows.${index}.value`} render={({ field }) => (
                          <FormItem className="flex-grow"><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>
                      )} />
                      {fields.length > 1 && <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}><XCircle className="h-5 w-5 text-destructive" /></Button>}
                  </div>
              ))}
              <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => append({ value: undefined })}><PlusCircle className="mr-2 h-4 w-4" /> Add Year</Button>
            </CardContent>
          </Card>
           <FormField control={form.control} name="terminalValue" render={({ field }) => (
            <FormItem><FormLabel>Terminal Value</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
          )} />

          <Button type="submit">Calculate DCF</Button>
        </form>
      </Form>
      {result !== null && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Landmark className="h-8 w-8 text-primary" /><CardTitle>Discounted Cash Flow (DCF) Value</CardTitle></div></CardHeader>
            <CardContent>
                <p className="text-3xl font-bold text-center">${result.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                <CardDescription className='mt-4 text-center'>This is the estimated intrinsic value of the investment based on its future cash flows.</CardDescription>
            </CardContent>
        </Card>
      )}
       <section
  className="space-y-4 text-muted-foreground leading-relaxed"
  itemScope
  itemType="https://schema.org/Article"
>
  <meta
    itemProp="headline"
    content="Discounted Cash Flow (DCF) Calculator – Estimate Intrinsic Value of Investments"
  />
  <meta itemProp="author" content="MegaCalc Hub Team" />
  <meta
    itemProp="about"
    content="Calculate the discounted cash flow (DCF) of an investment using projected cash flows and a discount rate. Understand how DCF works, the formula behind it, and how to interpret results for better financial decisions."
  />

  <h2 itemProp="name" className="text-xl font-bold text-foreground">
    Discounted Cash Flow (DCF) Calculator: Estimate True Investment Value
  </h2>
  <p itemProp="description">
    The <strong>Discounted Cash Flow (DCF) Calculator</strong> helps you determine the present value of an investment
    based on its expected future cash flows. By discounting future returns to today’s value, DCF reveals whether a stock,
    business, or project is undervalued or overvalued.
  </p>

  <h3 className="font-semibold text-foreground mt-6">💡 What Is Discounted Cash Flow?</h3>
  <p>
    Discounted Cash Flow (DCF) is a valuation method that calculates how much an investment is worth today based on
    projections of how much money it will generate in the future. The concept is grounded in the <strong>time value of money</strong>
    — the idea that a dollar today is worth more than a dollar tomorrow.
  </p>
  <p>
    Investors, analysts, and financial planners use DCF to evaluate businesses, stocks, and capital projects to assess
    whether the expected returns justify the investment.
  </p>

  <h3 className="font-semibold text-foreground mt-6">⚙️ DCF Formula</h3>
  <p>
    The core DCF formula is:
  </p>
  <pre className="bg-muted p-3 rounded text-sm">
PV = CF₁ / (1 + r)¹ + CF₂ / (1 + r)² + ... + CFₙ / (1 + r)ⁿ
  </pre>
  <p>
    Where:
  </p>
  <ul className="list-disc ml-6 space-y-1">
    <li><strong>PV:</strong> Present Value (the DCF result)</li>
    <li><strong>CF₁, CF₂…CFₙ:</strong> Expected cash flows for each future period</li>
    <li><strong>r:</strong> Discount rate (required rate of return)</li>
    <li><strong>n:</strong> Number of periods (years, months, etc.)</li>
  </ul>

  <h3 className="font-semibold text-foreground mt-6">📊 Example of DCF Calculation</h3>
  <p>
    Suppose a project is expected to generate cash flows of $10,000, $12,000, and $14,000 over three years, and your
    required rate of return is 10%.  
    The DCF would be:
  </p>
  <pre className="bg-muted p-3 rounded text-sm">
DCF = 10,000 / (1.10)¹ + 12,000 / (1.10)² + 14,000 / (1.10)³ = $30,200 (approx)
  </pre>
  <p>
    If the investment costs less than $30,200 today, it’s considered a good opportunity — otherwise, it might be
    overvalued.
  </p>

  <h3 className="font-semibold text-foreground mt-6">🧮 Components of a DCF Model</h3>
  <ul className="list-disc ml-6 space-y-1">
    <li><strong>Forecasted Cash Flows:</strong> Estimate revenues, expenses, and taxes over several years.</li>
    <li><strong>Discount Rate:</strong> Reflects opportunity cost, often based on WACC (Weighted Average Cost of Capital).</li>
    <li><strong>Terminal Value:</strong> Accounts for value beyond the forecast period using the Gordon Growth Model.</li>
  </ul>

  <h3 className="font-semibold text-foreground mt-6">🧩 Terminal Value (TV) Formula</h3>
  <pre className="bg-muted p-3 rounded text-sm">
TV = CF_&#123;n+1&#125; / (r − g)
  </pre>
  <p>
    Where:
  </p>
  <ul className="list-disc ml-6 space-y-1">
    <li><strong>CFₙ₊₁:</strong> Cash flow in the first year after the projection period</li>
    <li><strong>r:</strong> Discount rate</li>
    <li><strong>g:</strong> Long-term growth rate</li>
  </ul>

  <h3 className="font-semibold text-foreground mt-6">💰 How to Interpret DCF Results</h3>
  <ul className="list-disc ml-6 space-y-1">
    <li>
      If the <strong>DCF value is higher than the current investment cost</strong>, it’s considered <strong>undervalued</strong> — a potentially profitable investment.
    </li>
    <li>
      If the <strong>DCF is lower</strong>, the investment might be <strong>overvalued</strong> or carry excessive risk.
    </li>
  </ul>

  <h3 className="font-semibold text-foreground mt-6">📈 DCF vs. NPV: What’s the Difference?</h3>
  <p>
    The <strong>Discounted Cash Flow (DCF)</strong> method calculates the total present value of future cash flows, while
    <strong>Net Present Value (NPV)</strong> subtracts the initial investment cost from that total.  
    In short:
  </p>
  <pre className="bg-muted p-3 rounded text-sm">
NPV = DCF − Initial Investment
  </pre>

  <h3 className="font-semibold text-foreground mt-6">🔬 Why DCF Matters in Financial Analysis</h3>
  <ul className="list-disc ml-6 space-y-1">
    <li>It helps identify intrinsic value beyond market price fluctuations.</li>
    <li>It’s useful for evaluating long-term projects, startups, or corporate valuations.</li>
    <li>It accounts for risk through discounting — offering a more realistic assessment.</li>
  </ul>

  <h3 className="font-semibold text-foreground mt-6">⚠️ Common Mistakes to Avoid</h3>
  <ul className="list-disc ml-6 space-y-1">
    <li>Using unrealistic growth rates or discount rates.</li>
    <li>Failing to adjust for inflation or currency fluctuations.</li>
    <li>Overestimating terminal value or cash flow projections.</li>
  </ul>

  <h3 className="font-semibold text-foreground mt-6">🧠 Pro Tips for Accurate DCF Analysis</h3>
  <ul className="list-disc ml-6 space-y-1">
    <li>Use at least 5–10 years of forecast data for stability.</li>
    <li>Include sensitivity analysis — test how changes in discount rate affect valuation.</li>
    <li>Pair DCF with other metrics like IRR, Payback Period, and ROI for better insight.</li>
  </ul>

  <h3 className="font-semibold text-foreground mt-6">📚 FAQs About Discounted Cash Flow</h3>
  <div className="space-y-3">
    <p>
      <strong>What is a good discount rate for DCF?</strong><br />
      Typically between 8–12%, depending on risk level and cost of capital.
    </p>
    <p>
      <strong>Can DCF be used for startups?</strong><br />
      Yes, but cash flow projections are more uncertain — consider scenario-based modeling.
    </p>
    <p>
      <strong>Why does DCF often differ from market value?</strong><br />
      Because market prices reflect sentiment and volatility, while DCF measures intrinsic value.
    </p>
    <p>
      <strong>What’s the main limitation of DCF?</strong><br />
      Small changes in assumptions (growth rate or discount rate) can significantly alter results.
    </p>
  </div>

  <p className="italic">
    Disclaimer: The Discounted Cash Flow (DCF) Calculator provides general financial estimates. Always consult a
    certified financial analyst before making investment or business decisions.
  </p>
</section>
    </div>
  );
}
