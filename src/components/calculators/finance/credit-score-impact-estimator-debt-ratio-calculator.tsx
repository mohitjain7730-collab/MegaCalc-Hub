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
  totalDebt: z.number().min(0).optional(),
  totalCreditLimit: z.number().min(0).optional(),
  monthlyIncome: z.number().min(0).optional(),
  monthlyDebtPayments: z.number().min(0).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function CreditScoreImpactEstimatorDebtRatioCalculator() {
  const [result,setResult]=useState<{utilizationRatio:number; dtiRatio:number; scoreImpact:string; interpretation:string; suggestions:string[]}|null>(null);
  const form=useForm<FormValues>({resolver:zodResolver(formSchema),defaultValues:{totalDebt:undefined as unknown as number,totalCreditLimit:undefined as unknown as number,monthlyIncome:undefined as unknown as number,monthlyDebtPayments:undefined as unknown as number}});

  const onSubmit=(v:FormValues)=>{
    if((v.totalDebt===undefined||v.totalCreditLimit===undefined||v.totalCreditLimit===0)&&(v.monthlyIncome===undefined||v.monthlyDebtPayments===undefined||v.monthlyIncome===0)){ setResult(null); return; }
    let util=NaN; let dti=NaN;
    if(v.totalDebt!==undefined&&v.totalCreditLimit!==undefined&&v.totalCreditLimit>0){ util=(v.totalDebt/v.totalCreditLimit)*100; }
    if(v.monthlyIncome!==undefined&&v.monthlyDebtPayments!==undefined&&v.monthlyIncome>0){ dti=(v.monthlyDebtPayments/v.monthlyIncome)*100; }
    let impact='';
    if(Number.isFinite(util)){
      if(util<10) impact+='Excellent utilization; ';
      else if(util<30) impact+='Good utilization; ';
      else if(util<70) impact+='High utilization hurts score; ';
      else impact+='Very high utilization significantly hurts score; ';
    }
    if(Number.isFinite(dti)){
      if(dti<20) impact+='Excellent DTI; ';
      else if(dti<36) impact+='Good DTI; ';
      else if(dti<43) impact+='High DTI may limit approvals; ';
      else impact+='Very high DTI severely limits approvals; ';
    }
    const interp=`${Number.isFinite(util)?`Utilization: ${util.toFixed(1)}%. `:''}${Number.isFinite(dti)?`DTI: ${dti.toFixed(1)}%. `:''}${impact}`;
    setResult({utilizationRatio:util,dtiRatio:dti,scoreImpact:impact,interpretation:interp,suggestions:['Keep utilization under 30% and DTI under 36% for best credit scores and loan approvals.','High utilization (>70%) or DTI (>43%) significantly hurts credit scores and loan eligibility.','Pay down debts to improve both ratios; even small reductions help.','Monitor both ratios monthly; they update as balances and payments change.']});
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
          <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" /> Credit Score Impact Estimator (Debt Ratio)</CardTitle>
          <CardDescription>Estimate how debt ratios (utilization and DTI) impact your credit score and loan eligibility.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <FormField control={form.control} name="totalDebt" render={({field})=>(<FormItem><FormLabel>Total Debt Balance</FormLabel><FormControl>{num('e.g., 8000',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="totalCreditLimit" render={({field})=>(<FormItem><FormLabel>Total Credit Limit</FormLabel><FormControl>{num('e.g., 20000',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="monthlyIncome" render={({field})=>(<FormItem><FormLabel>Monthly Income</FormLabel><FormControl>{num('e.g., 5000',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="monthlyDebtPayments" render={({field})=>(<FormItem><FormLabel>Monthly Debt Payments</FormLabel><FormControl>{num('e.g., 1500',field)}</FormControl><FormMessage/></FormItem>)} />
              </div>
              <Button type="submit" className="w-full md:w-auto">Calculate</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result&&(
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Results & Insights</CardTitle><CardDescription>Credit score impact</CardDescription></CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Credit Utilization (%)</p><p className={`text-2xl font-bold ${Number.isFinite(result.utilizationRatio)?(result.utilizationRatio<30?'text-green-600':result.utilizationRatio<70?'text-yellow-600':'text-red-600'):'text-gray-400'}`}>{Number.isFinite(result.utilizationRatio)?result.utilizationRatio.toFixed(1)+'%':'N/A'}</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Debt-to-Income (%)</p><p className={`text-2xl font-bold ${Number.isFinite(result.dtiRatio)?(result.dtiRatio<36?'text-green-600':result.dtiRatio<43?'text-yellow-600':'text-red-600'):'text-gray-400'}`}>{Number.isFinite(result.dtiRatio)?result.dtiRatio.toFixed(1)+'%':'N/A'}</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Score Impact</p><p className="font-medium">{result.scoreImpact||'Enter values to calculate'}</p></div>
            </div>
            <div><h4 className="font-semibold mb-2">Interpretation</h4><p className="text-muted-foreground">{result.interpretation}</p></div>
            <div><h4 className="font-semibold mb-2">Suggestions</h4><ul className="list-disc pl-6 text-muted-foreground space-y-1">{result.suggestions.map((s,i)=>(<li key={i}>{s}</li>))}</ul></div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Related Calculators</CardTitle><CardDescription>Credit and debt</CardDescription></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/credit-utilization-ratio-calculator" className="text-primary hover:underline">Credit Utilization Ratio</a></h4><p className="text-sm text-muted-foreground">Utilization analysis.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/dti-ratio-calculator" className="text-primary hover:underline">Debt-to-Income Ratio</a></h4><p className="text-sm text-muted-foreground">DTI analysis.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/debt-snowball-avalanche-repayment-calculator" className="text-primary hover:underline">Debt Repayment Calculator</a></h4><p className="text-sm text-muted-foreground">Payoff strategies.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/credit-card-payoff-calculator" className="text-primary hover:underline">Credit Card Payoff</a></h4><p className="text-sm text-muted-foreground">Debt payoff.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Complete Guide to Credit Score Impact</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none"><p>Placeholder guide content.</p><p>Explain credit score factors, utilization impact, DTI thresholds, and improvement strategies.</p></CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Frequently Asked Questions</CardTitle><CardDescription>Credit score impact</CardDescription></CardHeader>
        <CardContent className="space-y-6">
          <div><h4 className="font-semibold mb-2">How do debt ratios affect credit scores?</h4><p className="text-muted-foreground">Credit utilization (30% of score) and debt-to-income ratio affect loan approvals; high ratios lower scores and limit borrowing.</p></div>
          <div><h4 className="font-semibold mb-2">What is a good credit utilization ratio?</h4><p className="text-muted-foreground">Under 30% is good; under 10% is excellent; over 70% significantly hurts scores; lower is always better.</p></div>
          <div><h4 className="font-semibold mb-2">What is a good debt-to-income ratio?</h4><p className="text-muted-foreground">Under 36% is good for most loans; under 20% is excellent; over 43% limits loan approvals; mortgage lenders prefer under 28-36%.</p></div>
          <div><h4 className="font-semibold mb-2">Which affects credit score more?</h4><p className="text-muted-foreground">Credit utilization directly impacts credit score (30% weight); DTI affects loan approvals more than credit score itself.</p></div>
          <div><h4 className="font-semibold mb-2">How quickly can I improve my ratios?</h4><p className="text-muted-foreground">Utilization improves immediately when balances paid; DTI improves as debts paid down; both update monthly with statement dates.</p></div>
          <div><h4 className="font-semibold mb-2">Does paying off debt improve credit score?</h4><p className="text-muted-foreground">Yes—lowers utilization ratio significantly; reduces DTI; both improve creditworthiness and scores.</p></div>
          <div><h4 className="font-semibold mb-2">What if my utilization is high but DTI is low?</h4><p className="text-muted-foreground">Focus on utilization first—it directly impacts score; high utilization hurts even if income is high.</p></div>
          <div><h4 className="font-semibold mb-2">Should I close credit cards to improve ratios?</h4><p className="text-muted-foreground">No—closing reduces credit limit, increasing utilization; keep cards open even if unused (no annual fee).</p></div>
          <div><h4 className="font-semibold mb-2">How do lenders use these ratios?</h4><p className="text-muted-foreground">Lenders check both: utilization for credit score, DTI for affordability; both must be acceptable for loan approval.</p></div>
          <div><h4 className="font-semibold mb-2">Can I have good credit with high DTI?</h4><p className="text-muted-foreground">Yes—credit score can be high with high DTI if utilization is low; but high DTI limits new loan approvals.</p></div>
        </CardContent>
      </Card>
    </div>
  );
}

