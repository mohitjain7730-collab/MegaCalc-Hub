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
  probabilityOfDefault: z.number().min(0).max(100).optional(),
  lossGivenDefault: z.number().min(0).max(100).optional(),
  recoveryRate: z.number().min(0).max(100).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function CreditRiskExpectedLossCalculator() {
  const [result,setResult]=useState<{expectedLoss:number; lgdUsed:number; interpretation:string; suggestions:string[]}|null>(null);
  const form=useForm<FormValues>({resolver:zodResolver(formSchema),defaultValues:{exposure:undefined as unknown as number,probabilityOfDefault:undefined as unknown as number,lossGivenDefault:undefined as unknown as number,recoveryRate:undefined as unknown as number}});

  const onSubmit=(v:FormValues)=>{
    if(v.exposure===undefined||v.probabilityOfDefault===undefined){ setResult(null); return; }
    const pd=v.probabilityOfDefault/100;
    let lgd=0;
    if(v.lossGivenDefault!==undefined) lgd=v.lossGivenDefault/100;
    else if(v.recoveryRate!==undefined) lgd=1-v.recoveryRate/100;
    else { setResult(null); return; }
    const el=v.exposure*pd*lgd;
    const interp=`Expected loss: ${el.toFixed(2)}. Based on PD=${(pd*100).toFixed(2)}%, LGD=${(lgd*100).toFixed(2)}%.`;
    setResult({expectedLoss:el,lgdUsed:lgd*100,interpretation:interp,suggestions:['Expected loss is average loss over many scenarios; actual losses vary.','Use risk-adjusted PD (not historical) for forward-looking estimates.','Adjust LGD for collateral, guarantees, and seniority.','Include correlation and portfolio effects for aggregate risk.']});
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
          <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" /> Credit Risk Expected Loss Calculator</CardTitle>
          <CardDescription>Estimate expected credit loss from exposure, probability of default, and loss given default.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <FormField control={form.control} name="exposure" render={({field})=>(<FormItem><FormLabel>Exposure at Default (EAD)</FormLabel><FormControl>{num('e.g., 100000',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="probabilityOfDefault" render={({field})=>(<FormItem><FormLabel>Probability of Default (%)</FormLabel><FormControl>{num('e.g., 2.5',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="lossGivenDefault" render={({field})=>(<FormItem><FormLabel>Loss Given Default (%)</FormLabel><FormControl>{num('e.g., 40',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="recoveryRate" render={({field})=>(<FormItem><FormLabel>Recovery Rate (%)</FormLabel><FormControl>{num('e.g., 60',field)}</FormControl><FormMessage/></FormItem>)} />
              </div>
              <Button type="submit" className="w-full md:w-auto">Calculate</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result&&(
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Results & Insights</CardTitle><CardDescription>Expected credit loss</CardDescription></CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Expected Loss</p><p className="text-2xl font-bold">{result.expectedLoss.toFixed(2)}</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">LGD Used (%)</p><p className="text-2xl font-bold">{result.lgdUsed.toFixed(2)}%</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Interpretation</p><p className="font-medium">{result.interpretation}</p></div>
            </div>
            <div><h4 className="font-semibold mb-2">Suggestions</h4><ul className="list-disc pl-6 text-muted-foreground space-y-1">{result.suggestions.map((s,i)=>(<li key={i}>{s}</li>))}</ul></div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Related Calculators</CardTitle><CardDescription>Credit and risk</CardDescription></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/value-at-risk-calculator" className="text-primary hover:underline">Value at Risk (VaR)</a></h4><p className="text-sm text-muted-foreground">Portfolio risk.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/conditional-value-at-risk-calculator" className="text-primary hover:underline">Conditional VaR</a></h4><p className="text-sm text-muted-foreground">Tail risk.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/credit-default-swap-calculator" className="text-primary hover:underline">Credit Default Swap</a></h4><p className="text-sm text-muted-foreground">Credit protection.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/bond-yield-to-maturity-calculator" className="text-primary hover:underline">Bond Yield Calculator</a></h4><p className="text-sm text-muted-foreground">Credit spread context.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Complete Guide to Expected Credit Loss</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none"><p>Placeholder guide content.</p><p>Explain PD, LGD, EAD, and Basel/IFRS 9 frameworks.</p></CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Frequently Asked Questions</CardTitle><CardDescription>Credit risk and expected loss</CardDescription></CardHeader>
        <CardContent className="space-y-6">
          <div><h4 className="font-semibold mb-2">What is expected loss?</h4><p className="text-muted-foreground">The average credit loss over time, calculated as Exposure × Probability of Default × Loss Given Default.</p></div>
          <div><h4 className="font-semibold mb-2">What is probability of default?</h4><p className="text-muted-foreground">Likelihood that a borrower defaults within a specified time horizon; expressed as annual percentage.</p></div>
          <div><h4 className="font-semibold mb-2">What is loss given default?</h4><p className="text-muted-foreground">Percentage of exposure lost after default, accounting for recoveries; LGD = 1 - Recovery Rate.</p></div>
          <div><h4 className="font-semibold mb-2">What is exposure at default?</h4><p className="text-muted-foreground">Total amount at risk when default occurs, including drawn amounts and potential future draws.</p></div>
          <div><h4 className="font-semibold mb-2">How to estimate PD?</h4><p className="text-muted-foreground">Use internal models, external ratings, market-implied CDS spreads, or historical default rates by rating/industry.</p></div>
          <div><h4 className="font-semibold mb-2">How to estimate LGD?</h4><p className="text-muted-foreground">Based on collateral, seniority, recovery history, and market prices post-default; varies by asset type.</p></div>
          <div><h4 className="font-semibold mb-2">Does EL equal actual loss?</h4><p className="text-muted-foreground">No—EL is expected average; actual losses vary due to default correlation and concentration risk.</p></div>
          <div><h4 className="font-semibold mb-2">What about unexpected loss?</h4><p className="text-muted-foreground">Unexpected loss measures volatility around EL; use VaR or stress testing for tail scenarios.</p></div>
          <div><h4 className="font-semibold mb-2">How does correlation affect portfolio EL?</h4><p className="text-muted-foreground">Higher correlation increases portfolio risk; diversification reduces EL through lower joint default probabilities.</p></div>
          <div><h4 className="font-semibold mb-2">What are regulatory requirements?</h4><p className="text-muted-foreground">Basel III and IFRS 9 require expected loss provisioning; use forward-looking PDs and downturn LGDs.</p></div>
        </CardContent>
      </Card>
    </div>
  );
}

