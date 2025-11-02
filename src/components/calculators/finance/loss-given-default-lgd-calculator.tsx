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
  exposure: z.number().min(0).optional(),
  recoveryAmount: z.number().min(0).optional(),
  recoveryRate: z.number().min(0).max(100).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function LossGivenDefaultLGDCalculator() {
  const [result,setResult]=useState<{lgd:number; recoveryUsed:number; lossAmount:number; interpretation:string; suggestions:string[]}|null>(null);
  const form=useForm<FormValues>({resolver:zodResolver(formSchema),defaultValues:{exposure:undefined as unknown as number,recoveryAmount:undefined as unknown as number,recoveryRate:undefined as unknown as number}});

  const onSubmit=(v:FormValues)=>{
    if(v.exposure===undefined){ setResult(null); return; }
    let recovery=0;
    if(v.recoveryAmount!==undefined) recovery=v.recoveryAmount;
    else if(v.recoveryRate!==undefined) recovery=v.exposure*(v.recoveryRate/100);
    else { setResult(null); return; }
    const lgd=((v.exposure-recovery)/v.exposure)*100;
    const loss=v.exposure-recovery;
    const interp=`Loss given default: ${lgd.toFixed(2)}%. Recovery: ${recovery.toFixed(2)} (${(recovery/v.exposure*100).toFixed(1)}%). Loss: ${loss.toFixed(2)}.`;
    setResult({lgd,recoveryUsed:recovery,lossAmount:loss,interpretation:interp,suggestions:['LGD depends on collateral, seniority, and recovery environment.','Use downturn LGD for stress testing and regulatory capital.','Recovery rates vary by asset class: secured loans recover more than unsecured.','Update LGD estimates based on actual recovery experience.']});
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
          <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" /> Loss Given Default (LGD) Calculator</CardTitle>
          <CardDescription>Calculate LGD from exposure, recovery amount or rate, and estimate loss.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField control={form.control} name="exposure" render={({field})=>(<FormItem><FormLabel>Exposure at Default</FormLabel><FormControl>{num('e.g., 1000000',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="recoveryAmount" render={({field})=>(<FormItem><FormLabel>Recovery Amount</FormLabel><FormControl>{num('e.g., 600000',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="recoveryRate" render={({field})=>(<FormItem><FormLabel>Recovery Rate (%)</FormLabel><FormControl>{num('e.g., 60',field)}</FormControl><FormMessage/></FormItem>)} />
              </div>
              <Button type="submit" className="w-full md:w-auto">Calculate</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result&&(
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Results & Insights</CardTitle><CardDescription>LGD calculation</CardDescription></CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Loss Given Default (%)</p><p className="text-2xl font-bold">{result.lgd.toFixed(2)}%</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Loss Amount</p><p className="text-2xl font-bold text-red-600">{result.lossAmount.toFixed(2)}</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Recovery Amount</p><p className="text-2xl font-bold text-green-600">{result.recoveryUsed.toFixed(2)}</p></div>
            </div>
            <div><h4 className="font-semibold mb-2">Interpretation</h4><p className="text-muted-foreground">{result.interpretation}</p></div>
            <div><h4 className="font-semibold mb-2">Suggestions</h4><ul className="list-disc pl-6 text-muted-foreground space-y-1">{result.suggestions.map((s,i)=>(<li key={i}>{s}</li>))}</ul></div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Related Calculators</CardTitle><CardDescription>Credit risk metrics</CardDescription></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/credit-risk-expected-loss-calculator" className="text-primary hover:underline">Expected Loss Calculator</a></h4><p className="text-sm text-muted-foreground">EAD × PD × LGD.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/exposure-at-default-ead-calculator" className="text-primary hover:underline">Exposure at Default Calculator</a></h4><p className="text-sm text-muted-foreground">EAD calculation.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/probability-of-default-pd-estimator" className="text-primary hover:underline">Probability of Default Estimator</a></h4><p className="text-sm text-muted-foreground">PD estimation.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/bond-yield-to-maturity-calculator" className="text-primary hover:underline">Bond Yield Calculator</a></h4><p className="text-sm text-muted-foreground">Credit spread context.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Complete Guide to Loss Given Default</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none"><p>Placeholder guide content.</p><p>Explain recovery rates, collateral, seniority, and downturn LGD.</p></CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Frequently Asked Questions</CardTitle><CardDescription>LGD basics</CardDescription></CardHeader>
        <CardContent className="space-y-6">
          <div><h4 className="font-semibold mb-2">What is loss given default?</h4><p className="text-muted-foreground">Percentage of exposure lost after default, calculated as (Exposure - Recovery) / Exposure.</p></div>
          <div><h4 className="font-semibold mb-2">How is LGD different from recovery rate?</h4><p className="text-muted-foreground">LGD = 1 - Recovery Rate; LGD is loss percentage, recovery rate is recovered percentage.</p></div>
          <div><h4 className="font-semibold mb-2">What affects recovery rates?</h4><p className="text-muted-foreground">Collateral quality, seniority, industry, economic cycle, and legal/enforcement framework.</p></div>
          <div><h4 className="font-semibold mb-2">Do secured loans have lower LGD?</h4><p className="text-muted-foreground">Generally yes—collateral reduces LGD, but value depends on collateral type and market conditions.</p></div>
          <div><h4 className="font-semibold mb-2">What is downturn LGD?</h4><p className="text-muted-foreground">LGD estimated during economic stress when recoveries are typically lower; required for regulatory capital.</p></div>
          <div><h4 className="font-semibold mb-2">How long does recovery take?</h4><p className="text-muted-foreground">Varies by jurisdiction and asset; discount recoveries to present value for accuracy.</p></div>
          <div><h4 className="font-semibold mb-2">Can LGD exceed 100%?</h4><p className="text-muted-foreground">Theoretically yes if expenses exceed recovery; in practice LGD typically ranges 10–90%.</p></div>
          <div><h4 className="font-semibold mb-2">How to estimate LGD for new exposures?</h4><p className="text-muted-foreground">Use historical recovery data by product/collateral type, or industry benchmarks and rating agency studies.</p></div>
          <div><h4 className="font-semibold mb-2">What about guarantees?</h4><p className="text-muted-foreground">Guarantees can reduce LGD if guarantor credit is strong; adjust LGD based on guarantor quality.</p></div>
          <div><h4 className="font-semibold mb-2">How does seniority affect LGD?</h4><p className="text-muted-foreground">Senior secured loans typically have lower LGD than subordinated or unsecured debt.</p></div>
        </CardContent>
      </Card>
    </div>
  );
}

