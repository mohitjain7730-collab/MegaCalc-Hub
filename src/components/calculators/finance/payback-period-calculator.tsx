
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

const cashFlowSchema = z.object({ value: z.number().positive() });

const formSchema = z.object({
  initialInvestment: z.number().positive(),
  cashFlows: z.array(cashFlowSchema).min(1, "At least one cash flow is required."),
});

type FormValues = z.infer<typeof formSchema>;

export default function PaybackPeriodCalculator() {
  const [result, setResult] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      initialInvestment: undefined,
      cashFlows: [{ value: undefined }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "cashFlows"
  });

  const onSubmit = (values: FormValues) => {
    const { initialInvestment, cashFlows } = values;
    let cumulativeCashFlow = 0;
    let years = 0;

    for (let i = 0; i < cashFlows.length; i++) {
        const cashFlow = cashFlows[i].value || 0;
        if (cumulativeCashFlow + cashFlow >= initialInvestment) {
            const unrecoveredAmount = initialInvestment - cumulativeCashFlow;
            const months = (unrecoveredAmount / cashFlow) * 12;
            setResult(`${years} years and ${months.toFixed(1)} months`);
            return;
        }
        cumulativeCashFlow += cashFlow;
        years++;
    }
    setResult("Payback period is longer than the provided cash flows.");
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField control={form.control} name="initialInvestment" render={({ field }) => (
            <FormItem><FormLabel>Initial Investment</FormLabel><FormControl><Input type="number" placeholder="e.g., 100000" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
          )} />
          
          <Card>
            <CardHeader><CardTitle>Projected Annual Cash Inflows</CardTitle></CardHeader>
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
              <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => append({ value: 0 })}><PlusCircle className="mr-2 h-4 w-4" /> Add Year</Button>
            </CardContent>
          </Card>

          <Button type="submit">Calculate Payback Period</Button>
        </form>
      </Form>
      {result !== null && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Landmark className="h-8 w-8 text-primary" /><CardTitle>Payback Period</CardTitle></div></CardHeader>
            <CardContent>
                <p className="text-3xl font-bold text-center">{result}</p>
                <CardDescription className='mt-4 text-center'>This is the time it takes for the investment to generate enough cash flow to recover its initial cost.</CardDescription>
            </CardContent>
        </Card>
      )}
      <div className="space-y-4">

<h2 className="text-2xl font-semibold">Discounted Payback Period Calculator: Account for Time Value of Money</h2>

<p>
  The <strong>Discounted Payback Period Calculator</strong> determines how long it takes to recover an investment while considering the <strong>time value of money</strong>. 
  Unlike the standard payback period, this method discounts future cash flows before calculating the recovery period, providing a more accurate assessment of investment risk and profitability.
</p>

<h3 className="text-xl font-semibold mt-4">💡 What Is the Discounted Payback Period?</h3>
<p>
  The <strong>Discounted Payback Period (DPP)</strong> measures the time needed for the <strong>present value of cumulative cash inflows</strong> to equal the initial investment.  
  This accounts for the fact that a dollar today is worth more than a dollar in the future.
</p>

<h3 className="text-xl font-semibold mt-4">🧮 Formula</h3>
<pre className="bg-muted p-3 rounded text-sm">
Discounted Payback Period = Time until cumulative discounted cash inflows = Initial Investment
</pre>
<p>
  To calculate, discount each cash flow using the required rate of return (r):
</p>
<pre className="bg-muted p-3 rounded text-sm">
Present Value of Cash Flow = Cash Flow / (1 + r)^t
</pre>
<p>
  Then sum discounted cash flows until the total equals the initial investment.
</p>

<h3 className="text-xl font-semibold mt-4">📊 Example</h3>
<p>
  Suppose you invest <strong>$50,000</strong> in a project with expected cash inflows:
</p>
<ul className="list-disc ml-6 space-y-1">
  <li>Year 1: $10,000</li>
  <li>Year 2: $15,000</li>
  <li>Year 3: $20,000</li>
  <li>Year 4: $10,000</li>
</ul>
<p>Assume a discount rate of 10%:</p>
<ul className="list-disc ml-6 space-y-1">
  <li>Year 1 PV = 10,000 / (1+0.10)^1 = $9,091</li>
  <li>Year 2 PV = 15,000 / (1+0.10)^2 = $12,397</li>
  <li>Year 3 PV = 20,000 / (1+0.10)^3 = $15,026</li>
  <li>Year 4 PV = 10,000 / (1+0.10)^4 = $6,831</li>
</ul>
<p>
  Cumulative discounted inflow at end of Year 3 = $36,514.  
  Remaining to recover = $50,000 − $36,514 = $13,486.  
  Fraction of Year 4 needed = 13,486 ÷ 6,831 ≈ 1.97 years.  
  ✅ Discounted Payback Period ≈ 3 + 1.97 ≈ <strong>4.97 years</strong>.
</p>

<h3 className="text-xl font-semibold mt-4">📈 Why Use Discounted Payback Period?</h3>
<ul className="list-disc ml-6 space-y-1">
  <li><strong>Time value awareness:</strong> Accounts for interest rates or required returns.</li>
  <li><strong>Better risk assessment:</strong> Projects with slower cash flows appear riskier when discounted.</li>
  <li><strong>Comparison tool:</strong> Useful for evaluating alternative investments with different cash flow timing.</li>
</ul>

<h3 className="text-xl font-semibold mt-4">⚠️ Limitations</h3>
<ul className="list-disc ml-6 space-y-1">
  <li>Ignores cash flows after payback period (even discounted).</li>
  <li>Requires an accurate discount rate — misestimating r affects results.</li>
  <li>Does not measure overall profitability — use alongside NPV and IRR.</li>
</ul>

<h3 className="text-xl font-semibold mt-4">💼 Practical Use Cases</h3>
<ul className="list-disc ml-6 space-y-1">
  <li>Evaluating long-term infrastructure projects.</li>
  <li>Comparing investment opportunities with unequal cash flows.</li>
  <li>Making liquidity-sensitive financial decisions while accounting for the cost of capital.</li>
</ul>

<h3 className="text-xl font-semibold mt-4">🏁 Key Takeaway</h3>
<p>
  The <strong>Discounted Payback Period Calculator</strong> provides a realistic measure of how quickly your investment will return value while considering the time value of money. 
  Combine it with <strong>NPV</strong> and <strong>IRR</strong> for a complete financial assessment.
</p>

</div>
    </div>
  );
}
