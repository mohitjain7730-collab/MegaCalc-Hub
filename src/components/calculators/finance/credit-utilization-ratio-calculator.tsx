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
  totalCreditUsed: z.number().min(0).optional(),
  totalCreditLimit: z.number().min(0).optional(),
  individualCardBalance: z.number().min(0).optional(),
  individualCardLimit: z.number().min(0).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function CreditUtilizationRatioCalculator() {
  const [result,setResult]=useState<{totalUtilization:number; individualUtilization:number; interpretation:string; suggestions:string[]}|null>(null);
  const form=useForm<FormValues>({resolver:zodResolver(formSchema),defaultValues:{totalCreditUsed:undefined as unknown as number,totalCreditLimit:undefined as unknown as number,individualCardBalance:undefined as unknown as number,individualCardLimit:undefined as unknown as number}});

  const onSubmit=(v:FormValues)=>{
    if(v.totalCreditUsed===undefined||v.totalCreditLimit===undefined||v.totalCreditLimit===0){ setResult(null); return; }
    const totalUtil=(v.totalCreditUsed/v.totalCreditLimit)*100;
    let indUtil=NaN;
    if(v.individualCardBalance!==undefined&&v.individualCardLimit!==undefined&&v.individualCardLimit>0){ indUtil=(v.individualCardBalance/v.individualCardLimit)*100; }
    const interp=`Total utilization: ${totalUtil.toFixed(2)}%. ${Number.isFinite(indUtil)?`Individual card: ${indUtil.toFixed(2)}%.`:''} ${totalUtil<30?'Good':'High'} utilization.`;
    setResult({totalUtilization:totalUtil,individualUtilization:indUtil,interpretation:interp,suggestions:['Keep utilization below 30% overall and per card for best credit scores.','Pay down balances or request credit limit increases to lower utilization.','High utilization (>70%) significantly hurts credit scores; aim for under 30%.','Individual card utilization matters too; high utilization on one card can hurt scores.']});
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
          <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" /> Credit Utilization Ratio Calculator</CardTitle>
          <CardDescription>Calculate credit utilization ratio to understand how much of your available credit you're using.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <FormField control={form.control} name="totalCreditUsed" render={({field})=>(<FormItem><FormLabel>Total Credit Used</FormLabel><FormControl>{num('e.g., 5000',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="totalCreditLimit" render={({field})=>(<FormItem><FormLabel>Total Credit Limit</FormLabel><FormControl>{num('e.g., 20000',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="individualCardBalance" render={({field})=>(<FormItem><FormLabel>Individual Card Balance (optional)</FormLabel><FormControl>{num('e.g., 2000',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="individualCardLimit" render={({field})=>(<FormItem><FormLabel>Individual Card Limit (optional)</FormLabel><FormControl>{num('e.g., 5000',field)}</FormControl><FormMessage/></FormItem>)} />
              </div>
              <Button type="submit" className="w-full md:w-auto">Calculate</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result&&(
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Results & Insights</CardTitle><CardDescription>Utilization analysis</CardDescription></CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Total Utilization (%)</p><p className={`text-2xl font-bold ${result.totalUtilization<30?'text-green-600':result.totalUtilization<70?'text-yellow-600':'text-red-600'}`}>{result.totalUtilization.toFixed(2)}%</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Individual Card (%)</p><p className={`text-2xl font-bold ${Number.isFinite(result.individualUtilization)?(result.individualUtilization<30?'text-green-600':result.individualUtilization<70?'text-yellow-600':'text-red-600'):'text-gray-400'}`}>{Number.isFinite(result.individualUtilization)?result.individualUtilization.toFixed(2)+'%':'N/A'}</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Interpretation</p><p className="font-medium">{result.interpretation}</p></div>
            </div>
            <div><h4 className="font-semibold mb-2">Suggestions</h4><ul className="list-disc pl-6 text-muted-foreground space-y-1">{result.suggestions.map((s,i)=>(<li key={i}>{s}</li>))}</ul></div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Related Calculators</CardTitle><CardDescription>Credit management</CardDescription></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/credit-score-impact-estimator-debt-ratio-calculator" className="text-primary hover:underline">Credit Score Impact Estimator</a></h4><p className="text-sm text-muted-foreground">Score factors.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/credit-card-payoff-calculator" className="text-primary hover:underline">Credit Card Payoff Calculator</a></h4><p className="text-sm text-muted-foreground">Debt payoff.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/dti-ratio-calculator" className="text-primary hover:underline">Debt-to-Income Ratio</a></h4><p className="text-sm text-muted-foreground">DTI analysis.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/monthly-budget-planner-calculator" className="text-primary hover:underline">Monthly Budget Planner</a></h4><p className="text-sm text-muted-foreground">Budget tracking.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Complete Guide to Credit Utilization</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none"><p>Placeholder guide content.</p><p>Explain utilization impact on credit scores, optimal ratios, and management strategies.</p></CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Frequently Asked Questions</CardTitle><CardDescription>Credit utilization</CardDescription></CardHeader>
        <CardContent className="space-y-6">
          <div><h4 className="font-semibold mb-2">What is credit utilization ratio?</h4><p className="text-muted-foreground">Percentage of available credit you're using; calculated as total balance divided by total credit limit across all cards.</p></div>
          <div><h4 className="font-semibold mb-2">Why does utilization matter?</h4><p className="text-muted-foreground">Second most important credit score factor (30% of score); high utilization signals risk and lowers scores significantly.</p></div>
          <div><h4 className="font-semibold mb-2">What is a good utilization ratio?</h4><p className="text-muted-foreground">Below 30% is good; under 10% is excellent; over 70% is very bad; lower is always better for credit scores.</p></div>
          <div><h4 className="font-semibold mb-2">Does individual card utilization matter?</h4><p className="text-muted-foreground">Yes—high utilization on any single card can hurt scores even if overall utilization is low; keep all cards under 30%.</p></div>
          <div><h4 className="font-semibold mb-2">How quickly does utilization affect credit score?</h4><p className="text-muted-foreground">Immediately—utilization is updated monthly when credit bureaus receive statements; paying down balances improves score quickly.</p></div>
          <div><h4 className="font-semibold mb-2">Should I pay off cards before statement date?</h4><p className="text-muted-foreground">Paying before statement date can lower reported utilization; helps if you use cards heavily but want to show low utilization.</p></div>
          <div><h4 className="font-semibold mb-2">Does requesting credit limit increase help?</h4><p className="text-muted-foreground">Yes—if balance stays same, higher limit lowers utilization; but credit check for increase can temporarily lower score slightly.</p></div>
          <div><h4 className="font-semibold mb-2">What if I close a credit card?</h4><p className="text-muted-foreground">Closing reduces total credit limit, which can increase utilization ratio; keep cards open if they have no annual fee.</p></div>
          <div><h4 className="font-semibold mb-2">Should I carry a small balance to show usage?</h4><p className="text-muted-foreground">No—paying in full is best; small balance under 30% utilization is fine but unnecessary; zero balance is ideal.</p></div>
          <div><h4 className="font-semibold mb-2">How often should I check utilization?</h4><p className="text-muted-foreground">Monthly, before major purchases; monitor especially if using large portion of credit; aim to keep it consistently low.</p></div>
        </CardContent>
      </Card>
    </div>
  );
}

