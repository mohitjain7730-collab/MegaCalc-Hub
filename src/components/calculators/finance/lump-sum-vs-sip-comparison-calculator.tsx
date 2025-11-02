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
  lumpSumAmount: z.number().min(0).optional(),
  sipMonthlyAmount: z.number().min(0).optional(),
  annualReturn: z.number().min(-100).max(100).optional(),
  investmentPeriod: z.number().min(0).max(100).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function LumpSumVsSIPComparisonCalculator() {
  const [result,setResult]=useState<{lumpSumValue:number; sipValue:number; difference:number; better:string; interpretation:string; suggestions:string[]}|null>(null);
  const form=useForm<FormValues>({resolver:zodResolver(formSchema),defaultValues:{lumpSumAmount:undefined as unknown as number,sipMonthlyAmount:undefined as unknown as number,annualReturn:undefined as unknown as number,investmentPeriod:undefined as unknown as number}});

  const onSubmit=(v:FormValues)=>{
    if(v.lumpSumAmount===undefined||v.sipMonthlyAmount===undefined||v.annualReturn===undefined||v.investmentPeriod===undefined){ setResult(null); return; }
    const r=v.annualReturn/100/12;
    const months=v.investmentPeriod*12;
    const lumpSumVal=v.lumpSumAmount*Math.pow(1+r,months);
    let sipVal=0;
    for(let i=0;i<months;i++){ sipVal=(sipVal+v.sipMonthlyAmount)*(1+r); }
    const diff=Math.abs(lumpSumVal-sipVal);
    const better=lumpSumVal>sipVal?'Lump Sum':'SIP';
    const interp=`Lump Sum: ${lumpSumVal.toFixed(2)}, SIP: ${sipVal.toFixed(2)}. ${better} yields ${diff.toFixed(2)} more.`;
    setResult({lumpSumValue:lumpSumVal,sipValue:sipVal,difference:diff,better,interpretation:interp,suggestions:['Lump sum performs better if you have capital available and can invest immediately.','SIP reduces timing risk through dollar-cost averaging; better for regular income.','Consider tax implications: lump sum timing vs SIP spreading.','Combine both: invest lump sum and continue SIP for additional diversification.']});
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
          <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" /> Lump Sum vs SIP Comparison Calculator</CardTitle>
          <CardDescription>Compare final value of lump sum investment versus systematic investment plan (SIP) over the same period.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <FormField control={form.control} name="lumpSumAmount" render={({field})=>(<FormItem><FormLabel>Lump Sum Amount</FormLabel><FormControl>{num('e.g., 100000',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="sipMonthlyAmount" render={({field})=>(<FormItem><FormLabel>SIP Monthly Amount</FormLabel><FormControl>{num('e.g., 5000',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="annualReturn" render={({field})=>(<FormItem><FormLabel>Annual Return (%)</FormLabel><FormControl>{num('e.g., 12',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="investmentPeriod" render={({field})=>(<FormItem><FormLabel>Investment Period (years)</FormLabel><FormControl>{num('e.g., 5',field)}</FormControl><FormMessage/></FormItem>)} />
              </div>
              <Button type="submit" className="w-full md:w-auto">Calculate</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result&&(
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Results & Insights</CardTitle><CardDescription>Investment comparison</CardDescription></CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Lump Sum Value</p><p className="text-2xl font-bold">{result.lumpSumValue.toFixed(2)}</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">SIP Value</p><p className="text-2xl font-bold">{result.sipValue.toFixed(2)}</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Difference</p><p className="text-2xl font-bold">{result.difference.toFixed(2)}</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Better Option</p><p className={`text-2xl font-bold ${result.better==='Lump Sum'?'text-green-600':'text-blue-600'}`}>{result.better}</p></div>
            </div>
            <div><h4 className="font-semibold mb-2">Interpretation</h4><p className="text-muted-foreground">{result.interpretation}</p></div>
            <div><h4 className="font-semibold mb-2">Suggestions</h4><ul className="list-disc pl-6 text-muted-foreground space-y-1">{result.suggestions.map((s,i)=>(<li key={i}>{s}</li>))}</ul></div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Related Calculators</CardTitle><CardDescription>Investment strategies</CardDescription></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/compound-interest-calculator" className="text-primary hover:underline">Compound Interest Calculator</a></h4><p className="text-sm text-muted-foreground">Growth calculations.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/sip-calculator" className="text-primary hover:underline">SIP Calculator</a></h4><p className="text-sm text-muted-foreground">SIP planning.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/return-on-investment-calculator" className="text-primary hover:underline">ROI Calculator</a></h4><p className="text-sm text-muted-foreground">Return analysis.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/cost-of-delay-investing-late-calculator" className="text-primary hover:underline">Cost of Delay Calculator</a></h4><p className="text-sm text-muted-foreground">Timing impact.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Complete Guide to Lump Sum vs SIP</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none"><p>Placeholder guide content.</p><p>Explain lump sum benefits, SIP advantages, and when to use each strategy.</p></CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Frequently Asked Questions</CardTitle><CardDescription>Lump sum vs SIP</CardDescription></CardHeader>
        <CardContent className="space-y-6">
          <div><h4 className="font-semibold mb-2">What is the difference between lump sum and SIP?</h4><p className="text-muted-foreground">Lump sum: invest entire amount at once; SIP: invest fixed amount regularly over time (systematic investment plan).</p></div>
          <div><h4 className="font-semibold mb-2">Which performs better?</h4><p className="text-muted-foreground">Lump sum typically performs better due to more time in market; SIP reduces timing risk through dollar-cost averaging.</p></div>
          <div><h4 className="font-semibold mb-2">What are advantages of lump sum?</h4><p className="text-muted-foreground">Maximum time in market, higher potential returns, simpler management, immediate full investment.</p></div>
          <div><h4 className="font-semibold mb-2">What are advantages of SIP?</h4><p className="text-muted-foreground">Dollar-cost averaging reduces timing risk, suits regular income, discipline, less emotional stress from volatility.</p></div>
          <div><h4 className="font-semibold mb-2">When should I choose lump sum?</h4><p className="text-muted-foreground">When you have large capital available, markets are expected to rise, or you're comfortable with timing risk.</p></div>
          <div><h4 className="font-semibold mb-2">When should I choose SIP?</h4><p className="text-muted-foreground">Regular income earners, risk-averse investors, or when uncertain about market timing prefer SIP's averaging benefit.</p></div>
          <div><h4 className="font-semibold mb-2">Can I combine both strategies?</h4><p className="text-muted-foreground">Yes—invest lump sum for immediate capital deployment and continue SIP for ongoing contributions and diversification.</p></div>
          <div><h4 className="font-semibold mb-2">Does market timing matter for lump sum?</h4><p className="text-muted-foreground">Yes—lump sum is exposed to entry point; buying at peak can underperform SIP; timing matters more for lump sum.</p></div>
          <div><h4 className="font-semibold mb-2">How does SIP reduce risk?</h4><p className="text-muted-foreground">Dollar-cost averaging: buy more shares when prices low, fewer when high; smooths entry price over time.</p></div>
          <div><h4 className="font-semibold mb-2">What about tax implications?</h4><p className="text-muted-foreground">Lump sum timing affects tax year; SIP spreads gains/losses across years; consider tax-efficient investment accounts.</p></div>
        </CardContent>
      </Card>
    </div>
  );
}

