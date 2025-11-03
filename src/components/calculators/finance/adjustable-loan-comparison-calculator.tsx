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
  initialRate: z.number().min(0).max(100).optional(),
  adjustmentCap: z.number().min(0).max(100).optional(),
  adjustmentFrequency: z.number().min(0).max(120).optional(),
  termYears: z.number().min(0).max(100).optional(),
  scenarioRates: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function AdjustableLoanComparisonCalculator() {
  const [result,setResult]=useState<{initialPayment:number; maxPayment:number; totalInterest:number; interpretation:string; suggestions:string[]}|null>(null);
  const form=useForm<FormValues>({resolver:zodResolver(formSchema),defaultValues:{loanAmount:undefined as unknown as number,initialRate:undefined as unknown as number,adjustmentCap:undefined as unknown as number,adjustmentFrequency:undefined as unknown as number,termYears:undefined as unknown as number,scenarioRates:undefined}});

  const onSubmit=(v:FormValues)=>{
    if(v.loanAmount===undefined||v.initialRate===undefined||v.termYears===undefined||v.termYears===0){ setResult(null); return; }
    const r=v.initialRate/100/12;
    const months=v.termYears*12;
    const initPay=(v.loanAmount*r*Math.pow(1+r,months))/(Math.pow(1+r,months)-1);
    const maxRate=Math.min(v.initialRate+(v.adjustmentCap||0),100);
    const maxR=maxRate/100/12;
    const maxPay=(v.loanAmount*maxR*Math.pow(1+maxR,months))/(Math.pow(1+maxR,months)-1);
    let totalInt=0; let bal=v.loanAmount; const rAvg=(r+maxR)/2;
    for(let i=0;i<months;i++){ const pay=Math.min(bal,bal*rAvg+initPay); totalInt+=bal*rAvg; bal=Math.max(0,bal*(1+rAvg)-pay); }
    const interp=`Initial payment: ${initPay.toFixed(2)}. Max payment: ${maxPay.toFixed(2)}. Total interest estimate: ${totalInt.toFixed(2)}.`;
    setResult({initialPayment:initPay,maxPayment:maxPay,totalInterest:totalInt,interpretation:interp,suggestions:['ARMs have lower initial rates but payment uncertainty as rates adjust.','Plan for maximum payment; ensure you can afford worst-case scenario.','Monitor rate adjustments; consider refinancing if rates rise significantly.','Fixed-rate loans provide payment certainty; ARM saves if rates stay low.']});
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
          <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" /> Adjustable Loan Comparison Calculator</CardTitle>
          <CardDescription>Compare initial and maximum payments for adjustable-rate loans and estimate total interest costs.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                <FormField control={form.control} name="loanAmount" render={({field})=>(<FormItem><FormLabel>Loan Amount</FormLabel><FormControl>{num('e.g., 400000',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="initialRate" render={({field})=>(<FormItem><FormLabel>Initial Rate (%)</FormLabel><FormControl>{num('e.g., 4',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="adjustmentCap" render={({field})=>(<FormItem><FormLabel>Adjustment Cap (%)</FormLabel><FormControl>{num('e.g., 5',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="adjustmentFrequency" render={({field})=>(<FormItem><FormLabel>Adjustment Frequency (months)</FormLabel><FormControl>{num('e.g., 12',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="termYears" render={({field})=>(<FormItem><FormLabel>Loan Term (years)</FormLabel><FormControl>{num('e.g., 30',field)}</FormControl><FormMessage/></FormItem>)} />
              </div>
              <Button type="submit" className="w-full md:w-auto">Calculate</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result&&(
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Results & Insights</CardTitle><CardDescription>ARM analysis</CardDescription></CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Initial Payment</p><p className="text-2xl font-bold">{result.initialPayment.toFixed(2)}</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Maximum Payment</p><p className="text-2xl font-bold text-red-600">{result.maxPayment.toFixed(2)}</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Total Interest (Est.)</p><p className="text-2xl font-bold">{result.totalInterest.toFixed(2)}</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Interpretation</p><p className="font-medium">{result.interpretation}</p></div>
            </div>
            <div><h4 className="font-semibold mb-2">Suggestions</h4><ul className="list-disc pl-6 text-muted-foreground space-y-1">{result.suggestions.map((s,i)=>(<li key={i}>{s}</li>))}</ul></div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Related Calculators</CardTitle><CardDescription>Loan types</CardDescription></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/mortgage-payment-calculator" className="text-primary hover:underline">Mortgage Payment Calculator</a></h4><p className="text-sm text-muted-foreground">Fixed-rate payments.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/interest-only-loan-payment-calculator" className="text-primary hover:underline">Interest-Only Loan Payment</a></h4><p className="text-sm text-muted-foreground">Payment types.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/loan-emi-calculator" className="text-primary hover:underline">Loan EMI Calculator</a></h4><p className="text-sm text-muted-foreground">Payment calculations.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/amortization-schedule-generator" className="text-primary hover:underline">Amortization Schedule</a></h4><p className="text-sm text-muted-foreground">Payment breakdown.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Complete Guide to Adjustable Rate Loans</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none"><p>Placeholder guide content.</p><p>Explain ARM structure, rate adjustments, caps, and comparison to fixed-rate loans.</p></CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Frequently Asked Questions</CardTitle><CardDescription>Adjustable rate loans</CardDescription></CardHeader>
        <CardContent className="space-y-6">
          <div><h4 className="font-semibold mb-2">What is an adjustable-rate loan?</h4><p className="text-muted-foreground">Loan with interest rate that changes periodically based on index plus margin; payments adjust with rate changes.</p></div>
          <div><h4 className="font-semibold mb-2">How often do ARM rates adjust?</h4><p className="text-muted-foreground">Typically annually after initial fixed period (1, 3, 5, 7, or 10 years); some adjust monthly or every 6 months.</p></div>
          <div><h4 className="font-semibold mb-2">What are rate caps?</h4><p className="text-muted-foreground">Limits on rate increases: initial cap (first adjustment), periodic cap (per adjustment), lifetime cap (total increase limit).</p></div>
          <div><h4 className="font-semibold mb-2">How much can payments increase?</h4><p className="text-muted-foreground">Depends on rate cap and loan balance; can increase 30-50% or more at maximum rate; plan for worst-case scenario.</p></div>
          <div><h4 className="font-semibold mb-2">What index do ARMs use?</h4><p className="text-muted-foreground">Common indexes: SOFR, LIBOR (deprecated), Treasury rates, Prime rate; plus margin (typically 2-3%).</p></div>
          <div><h4 className="font-semibold mb-2">When should I choose ARM?</h4><p className="text-muted-foreground">If planning to sell/refinance before adjustment, rates expected to fall, or need lower initial payments.</p></div>
          <div><h4 className="font-semibold mb-2">What are the risks of ARMs?</h4><p className="text-muted-foreground">Payment uncertainty, rate increases, payment shock, negative amortization risk (if payment caps exist).</p></div>
          <div><h4 className="font-semibold mb-2">Can I convert ARM to fixed?</h4><p className="text-muted-foreground">Refinance to fixed-rate loan; costs apply but provides payment certainty; consider if rates rising.</p></div>
          <div><h4 className="font-semibold mb-2">How do I prepare for rate increases?</h4><p className="text-muted-foreground">Budget for maximum payment, build emergency fund, monitor rate trends, consider refinancing if rates spike.</p></div>
          <div><h4 className="font-semibold mb-2">What is hybrid ARM?</h4><p className="text-muted-foreground">ARM with initial fixed period (e.g., 5/1 ARM: fixed 5 years, then adjusts annually); popular option.</p></div>
        </CardContent>
      </Card>
    </div>
  );
}


