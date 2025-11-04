'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator, Info, Activity } from 'lucide-react';

const formSchema = z.object({
  initialInvestment: z.number().min(0).optional(),
  discountRate: z.number().min(0).optional(),
  years: z.number().min(1).optional(),
  currentAnnualCashFlow: z.number().min(0).optional(),
});

type FormValues = z.infer<typeof formSchema>;

function annuityPVFactor(rate:number, n:number){
  if(rate===0) return n;
  return (1 - Math.pow(1+rate, -n)) / rate;
}

export default function FinancialBreakEvenNPVZeroCalculator() {
  const [result,setResult]=useState<{requiredAnnualCashFlow:number; currentNPV:number|null; interpretation:string; suggestions:string[]}|null>(null);
  const form=useForm<FormValues>({resolver:zodResolver(formSchema),defaultValues:{initialInvestment:undefined as unknown as number,discountRate:undefined as unknown as number,years:undefined as unknown as number,currentAnnualCashFlow:undefined as unknown as number}});

  const onSubmit=(v:FormValues)=>{
    if(v.initialInvestment===undefined||v.discountRate===undefined||v.years===undefined){ setResult(null); return; }
    const r=(v.discountRate)/100;
    const pvFactor=annuityPVFactor(r,v.years);
    const requiredAnnualCashFlow= pvFactor>0 ? v.initialInvestment / pvFactor : 0;
    let currentNPV: number | null = null;
    if(v.currentAnnualCashFlow!==undefined){
      currentNPV = (v.currentAnnualCashFlow * pvFactor) - v.initialInvestment;
    }
    const interpretation=`Breakeven annual cash flow for NPV = 0 is ${requiredAnnualCashFlow.toFixed(2)}.`;
    setResult({requiredAnnualCashFlow,currentNPV,interpretation,suggestions:[
      'Increase operating cash flows via pricing, mix, or cost efficiency to meet breakeven.',
      'Reduce initial investment or phase spending to lower the breakeven cash flow.',
      'Extend project life or residual value if realistic to improve NPV.',
      'Negotiate lower financing/discount rate by de-risking the project.'
    ]});
  };

  const num=(ph:string,field:any)=>(
    <Input type="number" step="0.01" placeholder={ph} {...field}
      value={Number.isFinite(field.value as any)?(field.value as any):''}
      onChange={e=>{const v=e.target.value; const n=v===''?undefined:Number(v); field.onChange(Number.isFinite(n as any)?n:undefined);}}/>
  );

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" /> Financial Break-even (NPV=0) Calculator</CardTitle>
          <CardDescription>Compute required annual cash flow to achieve NPV = 0 for a project.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <FormField control={form.control} name="initialInvestment" render={({field})=>(<FormItem><FormLabel>Initial Investment</FormLabel><FormControl>{num('e.g., 1000000',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="discountRate" render={({field})=>(<FormItem><FormLabel>Discount Rate (%)</FormLabel><FormControl>{num('e.g., 10',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="years" render={({field})=>(<FormItem><FormLabel>Years</FormLabel><FormControl>{num('e.g., 5',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="currentAnnualCashFlow" render={({field})=>(<FormItem><FormLabel>Current Annual Cash Flow (optional)</FormLabel><FormControl>{num('e.g., 210000',field)}</FormControl><FormMessage/></FormItem>)} />
              </div>
              <Button type="submit" className="w-full md:w-auto">Calculate</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result&&(
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Results & Insights</CardTitle><CardDescription>Project breakeven analysis</CardDescription></CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Required Annual Cash Flow (NPV=0)</p><p className="text-2xl font-bold">{result.requiredAnnualCashFlow.toFixed(2)}</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Current NPV</p><p className={`text-2xl font-bold ${result.currentNPV!==null && result.currentNPV>=0?'text-green-600': result.currentNPV===null?'':'text-red-600'}`}>{result.currentNPV===null?'-':result.currentNPV.toFixed(2)}</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Interpretation</p><p className="font-medium">{result.interpretation}</p></div>
            </div>
            <div><h4 className="font-semibold mb-2">Suggestions</h4><ul className="list-disc pl-6 text-muted-foreground space-y-1">{result.suggestions.map((s,i)=>(<li key={i}>{s}</li>))}</ul></div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Related Calculators</CardTitle><CardDescription>Capital budgeting</CardDescription></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/npv-calculator" className="text-primary hover:underline">NPV Calculator</a></h4><p className="text-sm text-muted-foreground">Net present value.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/wacc-calculator" className="text-primary hover:underline">WACC Calculator</a></h4><p className="text-sm text-muted-foreground">Weighted average cost of capital.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/capital-budgeting-risk-standard-deviation-calculator" className="text-primary hover:underline">Capital Budgeting Risk</a></h4><p className="text-sm text-muted-foreground">Scenario risk.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/payback-period-calculator" className="text-primary hover:underline">Payback Period</a></h4><p className="text-sm text-muted-foreground">Recovery time.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Complete Guide to Financial Breakeven (NPV=0)</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none"><p>Placeholder guide content.</p><p>Explain annuity PV factor and breakeven cash flow for NPV = 0.</p></CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Frequently Asked Questions</CardTitle><CardDescription>Financial breakeven NPV</CardDescription></CardHeader>
        <CardContent className="space-y-6">
          <div><h4 className="font-semibold mb-2">What does financial breakeven (NPV=0) mean in capital budgeting?</h4><p className="text-muted-foreground">Financial breakeven occurs when the present value of a project’s expected cash inflows equals the initial investment, resulting in NPV = 0. At this point, the project exactly compensates for the time value of money but does not create economic profit.</p></div>
          <div><h4 className="font-semibold mb-2">How do you compute the breakeven annual cash flow?</h4><p className="text-muted-foreground">Divide the initial investment by the annuity present value factor for the discount rate and project life. This yields the constant annual cash flow that sets NPV to zero.</p></div>
          <div><h4 className="font-semibold mb-2">Why is the discount rate critical for NPV breakeven?</h4><p className="text-muted-foreground">A higher discount rate lowers the PV of cash inflows, increasing the breakeven cash flow. It represents the project’s opportunity cost, risk, and financing environment.</p></div>
          <div><h4 className="font-semibold mb-2">Can financial breakeven be used with uneven cash flows?</h4><p className="text-muted-foreground">Yes, but you must use the exact PV of the uneven stream to solve for the missing value (e.g., scale factor). This tool approximates with constant annual cash flows for clarity.</p></div>
          <div><h4 className="font-semibold mb-2">How does project life affect breakeven requirements?</h4><p className="text-muted-foreground">Longer lives increase the PV factor, typically lowering the required annual cash flow. Shorter projects need higher annual cash flows to break even.</p></div>
          <div><h4 className="font-semibold mb-2">Is an NPV=0 project acceptable?</h4><p className="text-muted-foreground">It meets the minimum return hurdle but does not create value. In competitive capital allocation, positive NPV projects are preferred if capital is scarce.</p></div>
          <div><h4 className="font-semibold mb-2">How does risk adjustment impact breakeven?</h4><p className="text-muted-foreground">Using a higher risk-adjusted discount rate increases the required cash flows. Scenario and sensitivity analyses help quantify uncertainty.</p></div>
          <div><h4 className="font-semibold mb-2">What’s the relation between IRR and financial breakeven?</h4><p className="text-muted-foreground">At NPV=0, the discount rate equals the IRR if cash flows are conventional. If your required rate is below IRR, the project has positive NPV.</p></div>
          <div><h4 className="font-semibold mb-2">Does salvage value change breakeven?</h4><p className="text-muted-foreground">Yes. Including a terminal value increases PV of inflows and lowers the required annual cash flow for breakeven.</p></div>
          <div><h4 className="font-semibold mb-2">How should managers use breakeven results?</h4><p className="text-muted-foreground">Treat breakeven as a target for operational planning. If forecast cash flows exceed breakeven with margin, the project is more resilient to shocks.</p></div>
        </CardContent>
      </Card>
    </div>
  );
}


