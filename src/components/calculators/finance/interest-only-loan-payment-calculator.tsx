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
  interestRate: z.number().min(0).max(100).optional(),
  interestOnlyPeriod: z.number().min(0).max(120).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function InterestOnlyLoanPaymentCalculator() {
  const [result,setResult]=useState<{interestOnlyPayment:number; totalInterest:number; principalAfter:number; interpretation:string; suggestions:string[]}|null>(null);
  const form=useForm<FormValues>({resolver:zodResolver(formSchema),defaultValues:{loanAmount:undefined as unknown as number,interestRate:undefined as unknown as number,interestOnlyPeriod:undefined as unknown as number}});

  const onSubmit = (v: FormValues) => {
    if (v.loanAmount === undefined || v.interestRate === undefined || v.interestOnlyPeriod === undefined) {
      setResult(null);
      return;
    }
    const r = v.interestRate / 100 / 12;
    const ioPay = v.loanAmount * r;
    const totalInt = ioPay * v.interestOnlyPeriod;
    const interp = `Interest-only payment: ${ioPay.toFixed(2)}/month. Total interest over ${v.interestOnlyPeriod} months: ${totalInt.toFixed(2)}. Principal unchanged.`;
    setResult({
      interestOnlyPayment: ioPay,
      totalInterest: totalInt,
      principalAfter: v.loanAmount,
      interpretation: interp,
      suggestions: [
        'Interest-only loans lower initial payments but principal doesn\'t decrease.',
        'Make principal payments during interest-only period to reduce final balance.',
        'Plan for payment increase when loan converts to fully amortizing.',
        'Consider if short-term cash flow benefit outweighs long-term cost.',
      ],
    });
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
          <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" /> Interest-only Loan Payment Calculator</CardTitle>
          <CardDescription>Calculate interest-only payment amount and total interest for loans with interest-only periods.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField control={form.control} name="loanAmount" render={({field})=>(<FormItem><FormLabel>Loan Amount</FormLabel><FormControl>{num('e.g., 500000',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="interestRate" render={({field})=>(<FormItem><FormLabel>Interest Rate (%)</FormLabel><FormControl>{num('e.g., 5',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="interestOnlyPeriod" render={({field})=>(<FormItem><FormLabel>Interest-Only Period (months)</FormLabel><FormControl>{num('e.g., 60',field)}</FormControl><FormMessage/></FormItem>)} />
              </div>
              <Button type="submit" className="w-full md:w-auto">Calculate</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result&&(
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Results & Insights</CardTitle><CardDescription>Interest-only payment</CardDescription></CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Interest-Only Payment</p><p className="text-2xl font-bold">{result.interestOnlyPayment.toFixed(2)}</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Total Interest</p><p className="text-2xl font-bold">{result.totalInterest.toFixed(2)}</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Principal After Period</p><p className="text-2xl font-bold">{result.principalAfter.toFixed(2)}</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Interpretation</p><p className="font-medium">{result.interpretation}</p></div>
            </div>
            <div><h4 className="font-semibold mb-2">Suggestions</h4><ul className="list-disc pl-6 text-muted-foreground space-y-1">{result.suggestions.map((s,i)=>(<li key={i}>{s}</li>))}</ul></div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Related Calculators</CardTitle><CardDescription>Loan payment types</CardDescription></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/mortgage-payment-calculator" className="text-primary hover:underline">Mortgage Payment Calculator</a></h4><p className="text-sm text-muted-foreground">Full amortization.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/loan-emi-calculator" className="text-primary hover:underline">Loan EMI Calculator</a></h4><p className="text-sm text-muted-foreground">Standard payments.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/amortization-schedule-generator" className="text-primary hover:underline">Amortization Schedule</a></h4><p className="text-sm text-muted-foreground">Payment breakdown.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/adjustable-loan-comparison-calculator" className="text-primary hover:underline">Adjustable Loan Comparison</a></h4><p className="text-sm text-muted-foreground">Rate changes.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Complete Guide to Interest-Only Loans</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none"><p>Placeholder guide content.</p><p>Explain interest-only structure, conversion to amortizing, and when to use.</p></CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Frequently Asked Questions</CardTitle><CardDescription>Interest-only loans</CardDescription></CardHeader>
        <CardContent className="space-y-6">
          <div><h4 className="font-semibold mb-2">What is an interest-only loan?</h4><p className="text-muted-foreground">Loan where payments cover only interest for initial period; principal balance doesn't decrease; payment increases after interest-only period.</p></div>
          <div><h4 className="font-semibold mb-2">How is interest-only payment calculated?</h4><p className="text-muted-foreground">Monthly payment = Loan Amount × (Interest Rate / 12); principal remains unchanged during interest-only period.</p></div>
          <div><h4 className="font-semibold mb-2">What happens after interest-only period?</h4><p className="text-muted-foreground">Loan converts to fully amortizing; payment increases significantly to pay principal and interest; payment shock can be substantial.</p></div>
          <div><h4 className="font-semibold mb-2">Why use interest-only loans?</h4><p className="text-muted-foreground">Lower initial payments improve cash flow; useful for investors, variable income, or short-term ownership plans.</p></div>
          <div><h4 className="font-semibold mb-2">What are the risks?</h4><p className="text-muted-foreground">Principal doesn't decrease; payment increases later; negative equity if property value declines; requires discipline to build equity.</p></div>
          <div><h4 className="font-semibold mb-2">Can I make principal payments during interest-only period?</h4><p className="text-muted-foreground">Yes—most loans allow extra principal payments; reduces final balance and payment shock; recommended if affordable.</p></div>
          <div><h4 className="font-semibold mb-2">Are interest-only loans common?</h4><p className="text-muted-foreground">Less common after 2008; available for jumbo mortgages, investment properties, or high-net-worth borrowers; stricter qualification.</p></div>
          <div><h4 className="font-semibold mb-2">What about refinancing before conversion?</h4><p className="text-muted-foreground">Refinance before conversion if rates are favorable or income increased; convert to fixed-rate or new interest-only term.</p></div>
          <div><h4 className="font-semibold mb-2">How does payment change after conversion?</h4><p className="text-muted-foreground">Payment typically increases 30-50% or more; depends on remaining term and rate; plan for higher payment.</p></div>
          <div><h4 className="font-semibold mb-2">Should I choose interest-only?</h4><p className="text-muted-foreground">Only if you need lower payments short-term and can handle payment increase; not recommended for long-term homeownership without equity building.</p></div>
        </CardContent>
      </Card>
    </div>
  );
}


