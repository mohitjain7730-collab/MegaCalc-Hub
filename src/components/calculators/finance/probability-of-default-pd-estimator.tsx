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
  currentAssetValue: z.number().min(0).optional(),
  debtValue: z.number().min(0).optional(),
  assetVolatility: z.number().min(0).max(500).optional(),
  timeYears: z.number().min(0).max(100).optional(),
});

type FormValues = z.infer<typeof formSchema>;

function normCdf(x: number) { return 0.5 * (1 + erf(x / Math.SQRT2)); }
function erf(x: number) { const s=x<0?-1:1; x=Math.abs(x); const a1=0.254829592,a2=-0.284496736,a3=1.421413741,a4=-1.453152027,a5=1.061405429,p=0.3275911; const t=1/(1+p*x); const y=1-(((((a5*t+a4)*t)+a3)*t+a2)*t+a1)*t*Math.exp(-x*x); return s*y; }

export default function ProbabilityOfDefaultPDEstimator() {
  const [result,setResult]=useState<{pd:number; distanceToDefault:number; interpretation:string; suggestions:string[]}|null>(null);
  const form=useForm<FormValues>({resolver:zodResolver(formSchema),defaultValues:{currentAssetValue:undefined as unknown as number,debtValue:undefined as unknown as number,assetVolatility:undefined as unknown as number,timeYears:undefined as unknown as number}});

  const onSubmit=(v:FormValues)=>{
    if(v.currentAssetValue===undefined||v.debtValue===undefined||v.assetVolatility===undefined||v.timeYears===undefined){ setResult(null); return; }
    const sig=v.assetVolatility/100;
    if(sig===0||v.timeYears===0){ setResult({pd:NaN,distanceToDefault:NaN,interpretation:'Invalid inputs.',suggestions:[]}); return; }
    const d=(Math.log(v.currentAssetValue/v.debtValue))/(sig*Math.sqrt(v.timeYears));
    const pd=normCdf(-d);
    const interp=`Estimated PD: ${(pd*100).toFixed(2)}% over ${v.timeYears} years. Distance to default: ${d.toFixed(3)}.`;
    setResult({pd:pd*100,distanceToDefault:d,interpretation:interp,suggestions:['This uses Merton structural model; assumes log-normal assets.','Use market-based asset values and volatility for accuracy.','Compare to rating agency PDs or CDS-implied probabilities.','Update PD as asset values and leverage change over time.']});
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
          <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" /> Probability of Default (PD) Estimator</CardTitle>
          <CardDescription>Estimate PD using Merton structural model from asset value, debt, volatility, and time.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <FormField control={form.control} name="currentAssetValue" render={({field})=>(<FormItem><FormLabel>Current Asset Value</FormLabel><FormControl>{num('e.g., 1000000',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="debtValue" render={({field})=>(<FormItem><FormLabel>Debt Value</FormLabel><FormControl>{num('e.g., 600000',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="assetVolatility" render={({field})=>(<FormItem><FormLabel>Asset Volatility (%/year)</FormLabel><FormControl>{num('e.g., 25',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="timeYears" render={({field})=>(<FormItem><FormLabel>Time Horizon (years)</FormLabel><FormControl>{num('e.g., 1',field)}</FormControl><FormMessage/></FormItem>)} />
              </div>
              <Button type="submit" className="w-full md:w-auto">Calculate</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result&&(
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Results & Insights</CardTitle><CardDescription>PD estimation</CardDescription></CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Probability of Default (%)</p><p className="text-2xl font-bold">{Number.isFinite(result.pd)?result.pd.toFixed(3):'N/A'}%</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Distance to Default</p><p className="text-2xl font-bold">{Number.isFinite(result.distanceToDefault)?result.distanceToDefault.toFixed(3):'N/A'}</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Interpretation</p><p className="font-medium">{result.interpretation}</p></div>
            </div>
            <div><h4 className="font-semibold mb-2">Suggestions</h4><ul className="list-disc pl-6 text-muted-foreground space-y-1">{result.suggestions.map((s,i)=>(<li key={i}>{s}</li>))}</ul></div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Related Calculators</CardTitle><CardDescription>Credit risk</CardDescription></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/credit-risk-expected-loss-calculator" className="text-primary hover:underline">Expected Loss Calculator</a></h4><p className="text-sm text-muted-foreground">PD × LGD × EAD.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/loss-given-default-lgd-calculator" className="text-primary hover:underline">Loss Given Default Calculator</a></h4><p className="text-sm text-muted-foreground">Recovery estimation.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/exposure-at-default-ead-calculator" className="text-primary hover:underline">Exposure at Default Calculator</a></h4><p className="text-sm text-muted-foreground">Credit exposure.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/debt-to-equity-ratio-calculator" className="text-primary hover:underline">Debt-to-Equity Ratio</a></h4><p className="text-sm text-muted-foreground">Leverage context.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Complete Guide to Probability of Default</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none"><p>Placeholder guide content.</p><p>Explain Merton model, distance to default, and PD estimation methods.</p></CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Frequently Asked Questions</CardTitle><CardDescription>PD estimation</CardDescription></CardHeader>
        <CardContent className="space-y-6">
          <div><h4 className="font-semibold mb-2">What is probability of default?</h4><p className="text-muted-foreground">Likelihood that a borrower fails to meet debt obligations within a specified time horizon.</p></div>
          <div><h4 className="font-semibold mb-2">How does the Merton model work?</h4><p className="text-muted-foreground">Treats equity as a call option on assets; default occurs when asset value falls below debt value.</p></div>
          <div><h4 className="font-semibold mb-2">What is distance to default?</h4><p className="text-muted-foreground">Number of standard deviations asset value is above the default threshold (debt level).</p></div>
          <div><h4 className="font-semibold mb-2">How to estimate asset volatility?</h4><p className="text-muted-foreground">Use equity volatility and leverage to back out asset volatility; or use industry benchmarks.</p></div>
          <div><h4 className="font-semibold mb-2">Does PD vary by horizon?</h4><p className="text-muted-foreground">Yes—longer horizons typically show higher PDs as more time allows for adverse movements.</p></div>
          <div><h4 className="font-semibold mb-2">What are alternative PD sources?</h4><p className="text-muted-foreground">Rating agency defaults, internal models, market-implied CDS spreads, or logistic regression on financial ratios.</p></div>
          <div><h4 className="font-semibold mb-2">How accurate is the Merton model?</h4><p className="text-muted-foreground">Useful for listed firms; less accurate for non-public companies or complex capital structures.</p></div>
          <div><h4 className="font-semibold mb-2">What about cyclical effects?</h4><p className="text-muted-foreground">PDs rise in downturns; use through-the-cycle or point-in-time approaches based on purpose.</p></div>
          <div><h4 className="font-semibold mb-2">Can I use CDS spreads?</h4><p className="text-muted-foreground">Yes—CDS spreads imply risk-neutral PDs; adjust for risk premium to get physical PDs.</p></div>
          <div><h4 className="font-semibold mb-2">How often to update PD?</h4><p className="text-muted-foreground">Quarterly or when material changes occur (earnings, debt, market conditions).</p></div>
        </CardContent>
      </Card>
    </div>
  );
}

