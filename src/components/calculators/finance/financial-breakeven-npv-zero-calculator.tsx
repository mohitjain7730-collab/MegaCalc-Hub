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
  pricePerUnit: z.number().min(0).optional(),
  variableCostPerUnit: z.number().min(0).optional(),
  annualFixedCosts: z.number().min(0).optional(),
  periods: z.number().min(1).optional(),
  discountRatePercent: z.number().min(0).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function FinancialBreakevenNPVZeroCalculator() {
  const [result,setResult]=useState<{requiredAnnualNetCF:number; requiredUnits:number|null; annuityFactor:number; interpretation:string; suggestions:string[]}|null>(null);
  const form=useForm<FormValues>({resolver:zodResolver(formSchema),defaultValues:{initialInvestment:undefined as unknown as number,pricePerUnit:undefined as unknown as number,variableCostPerUnit:undefined as unknown as number,annualFixedCosts:undefined as unknown as number,periods:undefined as unknown as number,discountRatePercent:undefined as unknown as number}});

  const onSubmit=(v:FormValues)=>{
    if(v.initialInvestment===undefined||v.periods===undefined||v.discountRatePercent===undefined){ setResult(null); return; }
    const r=(v.discountRatePercent/100);
    const af = r===0? v.periods : (1 - Math.pow(1+r,-v.periods))/r;
    const requiredAnnualNetCF = v.initialInvestment/af;
    let requiredUnits: number | null = null;
    if(v.pricePerUnit!==undefined && v.variableCostPerUnit!==undefined && v.annualFixedCosts!==undefined){
      const cm = v.pricePerUnit - v.variableCostPerUnit;
      if(cm>0){
        requiredUnits = (requiredAnnualNetCF + v.annualFixedCosts)/cm;
      }
    }
    const interpretation = `Required annual net cash flow: ${requiredAnnualNetCF.toFixed(2)} to make NPV = 0 over ${v.periods} periods at ${(v.discountRatePercent).toFixed(2)}%.`;
    setResult({requiredAnnualNetCF,requiredUnits,annuityFactor:af,interpretation,suggestions:[
      'Increase contribution margin (raise price or reduce variable costs) to lower required units.',
      'Reduce fixed costs to decrease breakeven burden on volume.',
      'Extend project life or lower discount rate to reduce required annual cash flow.',
      'Phase investment or seek cheaper capital to improve NPV breakeven.'
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
          <CardDescription>Compute required annual net cash flow and breakeven units for NPV = 0.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
                <FormField control={form.control} name="initialInvestment" render={({field})=>(<FormItem><FormLabel>Initial Investment</FormLabel><FormControl>{num('e.g., 1000000',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="periods" render={({field})=>(<FormItem><FormLabel>Periods (years)</FormLabel><FormControl>{num('e.g., 5',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="discountRatePercent" render={({field})=>(<FormItem><FormLabel>Discount Rate (%)</FormLabel><FormControl>{num('e.g., 10',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="pricePerUnit" render={({field})=>(<FormItem><FormLabel>Price per Unit (optional)</FormLabel><FormControl>{num('e.g., 50',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="variableCostPerUnit" render={({field})=>(<FormItem><FormLabel>Variable Cost per Unit (optional)</FormLabel><FormControl>{num('e.g., 30',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="annualFixedCosts" render={({field})=>(<FormItem><FormLabel>Annual Fixed Costs (optional)</FormLabel><FormControl>{num('e.g., 200000',field)}</FormControl><FormMessage/></FormItem>)} />
              </div>
              <Button type="submit" className="w-full md:w-auto">Calculate</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result&&(
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Results & Insights</CardTitle><CardDescription>NPV breakeven</CardDescription></CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Annuity Factor</p><p className="text-2xl font-bold">{result.annuityFactor.toFixed(4)}</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Required Annual Net CF</p><p className="text-2xl font-bold">{result.requiredAnnualNetCF.toFixed(2)}</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Required Units/Year</p><p className="text-2xl font-bold">{result.requiredUnits===null?'-':result.requiredUnits.toFixed(0)}</p></div>
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
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/irr-calculator" className="text-primary hover:underline">IRR Calculator</a></h4><p className="text-sm text-muted-foreground">Internal rate of return.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/payback-period-calculator" className="text-primary hover:underline">Payback Period</a></h4><p className="text-sm text-muted-foreground">Recovery time.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/wacc-calculator" className="text-primary hover:underline">WACC Calculator</a></h4><p className="text-sm text-muted-foreground">Cost of capital.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Complete Guide to Financial Break-even</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none"><p>Placeholder guide content.</p><p>Explain annuity factor method for NPV=0 and mapping to volume.</p></CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Frequently Asked Questions</CardTitle><CardDescription>Financial breakeven (NPV=0)</CardDescription></CardHeader>
        <CardContent className="space-y-6">
          <div><h4 className="font-semibold mb-2">What is financial break-even (NPV=0)?</h4><p className="text-muted-foreground">It is the point where the present value of expected net cash inflows equals the initial investment, resulting in zero net present value and an implied IRR equal to the discount rate.</p></div>
          <div><h4 className="font-semibold mb-2">How do you derive required annual cash flow?</h4><p className="text-muted-foreground">Divide the initial investment by the annuity factor AF = (1 − (1 + r)^{-n})/r. This yields the constant annual net cash flow needed to achieve NPV = 0.</p></div>
          <div><h4 className="font-semibold mb-2">How is required volume computed?</h4><p className="text-muted-foreground">Convert the required annual net cash flow to units using: Units = (Required CF + Fixed Costs) / (Price − Variable Cost). This assumes linear cost behavior and constant contribution margin.</p></div>
          <div><h4 className="font-semibold mb-2">What assumptions underlie this method?</h4><p className="text-muted-foreground">It assumes constant price, costs, and discount rate, level annual cash flows, and no working capital changes. Real projects may require scenario analysis and cash flow schedules.</p></div>
          <div><h4 className="font-semibold mb-2">How sensitive is breakeven to the discount rate?</h4><p className="text-muted-foreground">Higher discount rates increase the required annual cash flow (lower AF), raising the breakeven volume. Conduct sensitivity or tornado analysis to gauge impact.</p></div>
          <div><h4 className="font-semibold mb-2">Can taxes be incorporated?</h4><p className="text-muted-foreground">Yes. Convert cash flows to after-tax terms by applying (1 − tax rate) where appropriate and include tax shields from depreciation in annual net cash flows.</p></div>
          <div><h4 className="font-semibold mb-2">How does project life affect results?</h4><p className="text-muted-foreground">Longer lives increase the annuity factor, lowering required annual cash flow and breakeven units, all else equal. Conversely, short lives raise breakeven requirements.</p></div>
          <div><h4 className="font-semibold mb-2">When should I use scenario vs single-point estimates?</h4><p className="text-muted-foreground">Use multiple scenarios when price, cost, or demand are uncertain. Single-point breakeven can mislead if inputs are volatile or correlated.</p></div>
        </CardContent>
      </Card>
    </div>
  );
}


