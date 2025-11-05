'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Info } from 'lucide-react';

const formSchema = z.object({
  loanAmount: z.number().min(0).optional(),
  propertyValue: z.number().min(0).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function LoanToValueLTVRatioCalculator(){
  const [result,setResult]=useState<null|{ltvPct:number; interpretation:string; altValue?:number; altLtv?:number}>(null);
  const [whatIfValue,setWhatIfValue]=useState<number|null>(null);

  const form=useForm<FormValues>({resolver:zodResolver(formSchema), defaultValues:{loanAmount:undefined as unknown as number, propertyValue:undefined as unknown as number}});

  const num=(ph:string,field:any)=>(<Input type="number" step="0.01" placeholder={ph} {...field} value={Number.isFinite(field.value as any)?(field.value as any):''} onChange={e=>{const v=e.target.value; const n=v===''?undefined:Number(v); field.onChange(Number.isFinite(n as any)?n:undefined);}} />);

  const onSubmit=(v:FormValues)=>{
    if(v.loanAmount===undefined||v.propertyValue===undefined||v.propertyValue===0){ setResult(null); return; }
    const ltv=(v.loanAmount/v.propertyValue)*100;
    let interpretation = `LTV: ${ltv.toFixed(1)}%.`;
    interpretation += ltv<=80? ' Strong equity position—often qualifies for better rates.': ltv<=90? ' Moderate risk—PMI or higher rate may apply.' : ' High risk—consider larger down payment to reduce LTV.';
    setResult({ltvPct:ltv, interpretation});
  };

  const alt=(val:number)=>{
    const loan=(form.getValues('loanAmount')||0); return val>0? (loan/val)*100 : 0;
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5"/> Loan-to-Value (LTV) Ratio Calculator</CardTitle>
          <CardDescription>Measure leverage by comparing loan balance to property value.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="loanAmount" render={({field})=>(<FormItem><FormLabel>Loan Amount ($)</FormLabel><FormControl>{num('e.g., 320000',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="propertyValue" render={({field})=>(<FormItem><FormLabel>Property Value ($)</FormLabel><FormControl>{num('e.g., 400000',field)}</FormControl><FormMessage/></FormItem>)} />
              </div>
              <Button type="submit" className="w-full md:w-auto">Calculate</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Results</CardTitle>
            <CardDescription>Test different valuation scenarios.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-2xl font-semibold">LTV: {result.ltvPct.toFixed(1)}%</div>
            <p className="text-sm leading-6">{result.interpretation}</p>
            <div className="rounded-md border p-3">
              <div className="flex items-center gap-2 font-medium mb-2"><Info className="h-4 w-4"/> What-if: Property Value</div>
              <div className="flex flex-wrap gap-2">
                {[0.9, 1.0, 1.1].map(mult=>{
                  const base=form.getValues('propertyValue')||0; const val=base*mult; return (
                    <Button key={mult} variant={(whatIfValue===val)?'default':'secondary'} onClick={()=>setWhatIfValue(val)}>Value {Math.round(mult*100)}%</Button>
                  );
                })}
              </div>
              {whatIfValue!==null && (
                <div className="mt-2 text-sm">At value ${whatIfValue.toFixed(0)}, LTV ≈ {alt(whatIfValue).toFixed(1)}%.</div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Guide</CardTitle>
          <CardDescription>Lower LTV generally means better pricing and lower risk.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-6 space-y-2 text-sm">
            <li>Common thresholds: 80% (conventional), 90–95% with mortgage insurance.</li>
            <li>Re-appraisals and market changes can shift LTV materially.</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Frequently Asked Questions</CardTitle>
          <CardDescription>Comprehensive answers about LTV, leverage, and risk</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div><h4 className="font-semibold mb-2">What is Loan‑to‑Value (LTV)?</h4><p className="text-muted-foreground">LTV measures leverage: loan balance divided by property value. A lower LTV indicates more equity and typically qualifies for better loan pricing.</p></div>
          <div><h4 className="font-semibold mb-2">Why does LTV matter to lenders?</h4><p className="text-muted-foreground">LTV is a key credit risk indicator. Higher LTVs mean less borrower equity and higher default loss potential, prompting higher rates or mortgage insurance.</p></div>
          <div><h4 className="font-semibold mb-2">How is property value determined?</h4><p className="text-muted-foreground">Usually via appraisal or automated valuation. In hot markets, lender‑accepted value may be capped—even if you agree to a higher purchase price.</p></div>
          <div><h4 className="font-semibold mb-2">What LTV qualifies for the best rates?</h4><p className="text-muted-foreground">Conventional loans often price best at ≤80% LTV. Below 60–70% can qualify for additional discounts. Government‑backed loans have specific thresholds.</p></div>
          <div><h4 className="font-semibold mb-2">Does PMI go away?</h4><p className="text-muted-foreground">Private mortgage insurance can be removed when LTV drops to ~80% through principal reduction or home value appreciation, subject to loan servicer rules.</p></div>
          <div><h4 className="font-semibold mb-2">How does a market downturn affect LTV?</h4><p className="text-muted-foreground">If property values fall, LTV rises even without borrowing more. Negative equity can occur if values drop below loan balance—maintain cash buffers for downturns.</p></div>
          <div><h4 className="font-semibold mb-2">Is high LTV always bad?</h4><p className="text-muted-foreground">High LTV increases risk and payment costs, but can be rational for short holding periods or high expected appreciation. Balance leverage with liquidity and risk tolerance.</p></div>
          <div><h4 className="font-semibold mb-2">What is CLTV or HCLTV?</h4><p className="text-muted-foreground">Combined LTV (CLTV) includes all liens (first + seconds). High‑CLTV products may have stricter terms. HCLTV considers maximum possible draw on HELOCs.</p></div>
          <div><h4 className="font-semibold mb-2">Does LTV consider closing costs?</h4><p className="text-muted-foreground">No. LTV is based on loan amount and value only. However, high closing costs still affect your overall cash invested and cash‑on‑cash returns.</p></div>
          <div><h4 className="font-semibold mb-2">How fast does LTV improve?</h4><p className="text-muted-foreground">Amortization reduces the loan balance each payment; appreciation increases value. Together they lower LTV over time. Extra principal payments accelerate the effect.</p></div>
        </CardContent>
      </Card>
    </div>
  );
}


