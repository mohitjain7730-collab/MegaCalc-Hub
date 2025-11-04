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
  loanAmount: z.number().min(0).optional(),
  interestRate: z.number().min(0).optional(),
  termYears: z.number().min(1).optional(),
  pointsPercent: z.number().min(0).optional(),
  rateReductionPercent: z.number().min(0).optional(),
});

type FormValues = z.infer<typeof formSchema>;

function monthlyPayment(P:number, annualRate:number, nYears:number){
  const r=annualRate/100/12; const n=nYears*12;
  if(r===0) return P/n;
  return P*r/(1-Math.pow(1+r,-n));
}

export default function MortgagePointsImpactCalculator() {
  const [result,setResult]=useState<{paymentNoPoints:number; paymentWithPoints:number; upfrontCost:number; monthlySavings:number; breakevenMonths:number|null; interpretation:string; suggestions:string[]}|null>(null);
  const form=useForm<FormValues>({resolver:zodResolver(formSchema),defaultValues:{loanAmount:undefined as unknown as number,interestRate:undefined as unknown as number,termYears:undefined as unknown as number,pointsPercent:undefined as unknown as number,rateReductionPercent:undefined as unknown as number}});

  const onSubmit=(v:FormValues)=>{
    if(v.loanAmount===undefined||v.interestRate===undefined||v.termYears===undefined||v.pointsPercent===undefined||v.rateReductionPercent===undefined){ setResult(null); return; }
    const p0=monthlyPayment(v.loanAmount, v.interestRate, v.termYears);
    const p1=monthlyPayment(v.loanAmount, Math.max(0, v.interestRate - v.rateReductionPercent), v.termYears);
    const upfront = v.loanAmount * (v.pointsPercent/100);
    const savings = p0 - p1;
    const breakeven = savings>0 ? upfront / savings : null;
    const interpretation=`Monthly savings of ${savings.toFixed(2)} with upfront cost ${upfront.toFixed(2)}. Breakeven ${breakeven===null? 'not achieved': breakeven.toFixed(1)+' months'}.`;
    setResult({paymentNoPoints:p0,paymentWithPoints:p1,upfrontCost:upfront,monthlySavings:savings,breakevenMonths:breakeven,interpretation,suggestions:[
      'Compare breakeven months to expected time in the home.',
      'Consider opportunity cost of upfront cash spent on points.',
      'Evaluate tax treatment of points and mortgage interest.',
      'Model rate-lock and market movements before committing.'
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
          <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" /> Mortgage Points Impact Calculator</CardTitle>
          <CardDescription>Estimate payment reduction, breakeven time, and savings from buying points.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                <FormField control={form.control} name="loanAmount" render={({field})=>(<FormItem><FormLabel>Loan Amount</FormLabel><FormControl>{num('e.g., 400000',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="interestRate" render={({field})=>(<FormItem><FormLabel>Interest Rate (%)</FormLabel><FormControl>{num('e.g., 6.5',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="termYears" render={({field})=>(<FormItem><FormLabel>Term (years)</FormLabel><FormControl>{num('e.g., 30',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="pointsPercent" render={({field})=>(<FormItem><FormLabel>Points (%)</FormLabel><FormControl>{num('e.g., 1.0',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="rateReductionPercent" render={({field})=>(<FormItem><FormLabel>Rate Reduction (%)</FormLabel><FormControl>{num('e.g., 0.25',field)}</FormControl><FormMessage/></FormItem>)} />
              </div>
              <Button type="submit" className="w-full md:w-auto">Calculate</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result&&(
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Results & Insights</CardTitle><CardDescription>Points analysis</CardDescription></CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Payment (No Points)</p><p className="text-2xl font-bold">{result.paymentNoPoints.toFixed(2)}</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Payment (With Points)</p><p className="text-2xl font-bold">{result.paymentWithPoints.toFixed(2)}</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Upfront Cost</p><p className="text-2xl font-bold">{result.upfrontCost.toFixed(2)}</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Monthly Savings</p><p className={`text-2xl font-bold ${result.monthlySavings>=0?'text-green-600':'text-red-600'}`}>{result.monthlySavings.toFixed(2)}</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Breakeven</p><p className="text-2xl font-bold">{result.breakevenMonths===null?'-':result.breakevenMonths.toFixed(1)} months</p></div>
            </div>
            <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Interpretation</p><p className="font-medium">{result.interpretation}</p></div>
            <div><h4 className="font-semibold mb-2">Suggestions</h4><ul className="list-disc pl-6 text-muted-foreground space-y-1">{result.suggestions.map((s,i)=>(<li key={i}>{s}</li>))}</ul></div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Related Calculators</CardTitle><CardDescription>Home financing</CardDescription></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/mortgage-payment-calculator" className="text-primary hover:underline">Mortgage Payment</a></h4><p className="text-sm text-muted-foreground">Monthly payment.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/interest-only-loan-payment-calculator" className="text-primary hover:underline">Interest-only Loan</a></h4><p className="text-sm text-muted-foreground">IO comparison.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/adjustable-loan-comparison-calculator" className="text-primary hover:underline">Adjustable Loan Compare</a></h4><p className="text-sm text-muted-foreground">ARM vs fixed.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/house-down-payment-savings-calculator" className="text-primary hover:underline">Down Payment Savings</a></h4><p className="text-sm text-muted-foreground">Save for DP.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Complete Guide to Mortgage Points</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none"><p>Placeholder guide content.</p><p>Explain points cost, rate buydown, and breakeven analysis.</p></CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Frequently Asked Questions</CardTitle><CardDescription>Mortgage points</CardDescription></CardHeader>
        <CardContent className="space-y-6">
          <div><h4 className="font-semibold mb-2">What are mortgage points and why buy them?</h4><p className="text-muted-foreground">Points are upfront fees paid to reduce the interest rate. Buying points can lower monthly payments and total interest if you keep the loan long enough.</p></div>
          <div><h4 className="font-semibold mb-2">How do I evaluate breakeven on points?</h4><p className="text-muted-foreground">Divide the upfront cost of points by the monthly payment savings to estimate breakeven months. If you’ll keep the mortgage longer, points may pay off.</p></div>
          <div><h4 className="font-semibold mb-2">Do points always reduce the same amount of rate?</h4><p className="text-muted-foreground">No. The rate reduction per point varies by lender, loan type, credit profile, and market conditions. Always request a written quote.</p></div>
          <div><h4 className="font-semibold mb-2">Are points tax-deductible?</h4><p className="text-muted-foreground">Tax rules vary. In some cases, points on a primary residence may be deductible; consult a tax advisor for current regulations and your situation.</p></div>
          <div><h4 className="font-semibold mb-2">What are the risks of buying points?</h4><p className="text-muted-foreground">If you sell or refinance before breakeven, you may not recoup the upfront cost. Also consider opportunity cost of cash and emergency fund needs.</p></div>
          <div><h4 className="font-semibold mb-2">How do ARMs affect points decisions?</h4><p className="text-muted-foreground">Adjustable rates can change before you realize savings. Model rate caps, adjustment periods, and likely reset levels before buying points.</p></div>
          <div><h4 className="font-semibold mb-2">Should I buy points or increase down payment?</h4><p className="text-muted-foreground">Compare both: a larger down payment reduces principal and PMI, while points reduce the interest rate. Evaluate total cost of ownership and flexibility.</p></div>
          <div><h4 className="font-semibold mb-2">Do points affect loan approval?</h4><p className="text-muted-foreground">Points don’t change underwriting directly, but lower payments can improve DTI. Ensure you still meet reserves and closing cost requirements.</p></div>
        </CardContent>
      </Card>
    </div>
  );
}


