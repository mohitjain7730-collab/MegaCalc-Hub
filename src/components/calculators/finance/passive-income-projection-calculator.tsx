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
  initialInvestment: z.number().min(0).optional(),
  monthlyContribution: z.number().min(0).optional(),
  annualReturn: z.number().min(-100).max(100).optional(),
  withdrawalRate: z.number().min(0).max(100).optional(),
  years: z.number().min(0).max(100).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function PassiveIncomeProjectionCalculator() {
  const [result,setResult]=useState<{portfolioValue:number; annualPassiveIncome:number; monthlyPassiveIncome:number; interpretation:string; suggestions:string[]}|null>(null);
  const form=useForm<FormValues>({resolver:zodResolver(formSchema),defaultValues:{initialInvestment:undefined as unknown as number,monthlyContribution:undefined as unknown as number,annualReturn:undefined as unknown as number,withdrawalRate:undefined as unknown as number,years:undefined as unknown as number}});

  const onSubmit=(v:FormValues)=>{
    if(v.initialInvestment===undefined||v.monthlyContribution===undefined||v.annualReturn===undefined||v.withdrawalRate===undefined||v.years===undefined){ setResult(null); return; }
    const r=v.annualReturn/100/12;
    let pv=v.initialInvestment;
    for(let i=0;i<v.years*12;i++){ pv=pv*(1+r)+v.monthlyContribution; }
    const annualInc=pv*(v.withdrawalRate/100);
    const monthlyInc=annualInc/12;
    const interp=`After ${v.years} years: portfolio ${pv.toFixed(2)}, annual passive income ${annualInc.toFixed(2)}, monthly ${monthlyInc.toFixed(2)}.`;
    setResult({portfolioValue:pv,annualPassiveIncome:annualInc,monthlyPassiveIncome:monthlyInc,interpretation:interp,suggestions:['Passive income depends on portfolio size and withdrawal rate.','Consider sustainable withdrawal rates: 3-4% for long-term viability.','Reinvest dividends initially to accelerate growth; withdraw later.','Diversify income sources: dividends, interest, rental income, royalties.']});
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
          <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" /> Passive Income Projection Calculator</CardTitle>
          <CardDescription>Project future passive income from investments based on contributions, returns, and withdrawal rate.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                <FormField control={form.control} name="initialInvestment" render={({field})=>(<FormItem><FormLabel>Initial Investment</FormLabel><FormControl>{num('e.g., 10000',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="monthlyContribution" render={({field})=>(<FormItem><FormLabel>Monthly Contribution</FormLabel><FormControl>{num('e.g., 500',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="annualReturn" render={({field})=>(<FormItem><FormLabel>Annual Return (%)</FormLabel><FormControl>{num('e.g., 7',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="withdrawalRate" render={({field})=>(<FormItem><FormLabel>Withdrawal Rate (%)</FormLabel><FormControl>{num('e.g., 4',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="years" render={({field})=>(<FormItem><FormLabel>Years</FormLabel><FormControl>{num('e.g., 20',field)}</FormControl><FormMessage/></FormItem>)} />
              </div>
              <Button type="submit" className="w-full md:w-auto">Calculate</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result&&(
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Results & Insights</CardTitle><CardDescription>Passive income projection</CardDescription></CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Portfolio Value</p><p className="text-2xl font-bold">{result.portfolioValue.toFixed(2)}</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Annual Passive Income</p><p className="text-2xl font-bold text-green-600">{result.annualPassiveIncome.toFixed(2)}</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Monthly Passive Income</p><p className="text-2xl font-bold text-green-600">{result.monthlyPassiveIncome.toFixed(2)}</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Interpretation</p><p className="font-medium">{result.interpretation}</p></div>
            </div>
            <div><h4 className="font-semibold mb-2">Suggestions</h4><ul className="list-disc pl-6 text-muted-foreground space-y-1">{result.suggestions.map((s,i)=>(<li key={i}>{s}</li>))}</ul></div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Related Calculators</CardTitle><CardDescription>Passive income</CardDescription></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/retirement-savings-calculator" className="text-primary hover:underline">Retirement Savings Calculator</a></h4><p className="text-sm text-muted-foreground">Retirement planning.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/compound-interest-calculator" className="text-primary hover:underline">Compound Interest Calculator</a></h4><p className="text-sm text-muted-foreground">Investment growth.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/dividend-yield-calculator" className="text-primary hover:underline">Dividend Yield Calculator</a></h4><p className="text-sm text-muted-foreground">Dividend income.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/monthly-budget-planner-calculator" className="text-primary hover:underline">Monthly Budget Planner</a></h4><p className="text-sm text-muted-foreground">Expense planning.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Complete Guide to Passive Income</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none"><p>Placeholder guide content.</p><p>Explain passive income sources, withdrawal strategies, and portfolio building.</p></CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Frequently Asked Questions</CardTitle><CardDescription>Passive income</CardDescription></CardHeader>
        <CardContent className="space-y-6">
          <div><h4 className="font-semibold mb-2">What is passive income?</h4><p className="text-muted-foreground">Income generated with minimal ongoing effort: dividends, interest, rental income, royalties, or automated businesses.</p></div>
          <div><h4 className="font-semibold mb-2">How is passive income calculated?</h4><p className="text-muted-foreground">Portfolio value × withdrawal rate; or sum of dividend/interest payments; depends on income source type.</p></div>
          <div><h4 className="font-semibold mb-2">What withdrawal rate is sustainable?</h4><p className="text-muted-foreground">3-4% for long-term sustainability; higher rates risk depleting principal; adjust for age, expenses, and market conditions.</p></div>
          <div><h4 className="font-semibold mb-2">How long to build meaningful passive income?</h4><p className="text-muted-foreground">10-20 years typical; depends on savings rate, returns, and starting capital; compound interest accelerates over time.</p></div>
          <div><h4 className="font-semibold mb-2">Should I reinvest or withdraw passive income?</h4><p className="text-muted-foreground">Reinvest early to accelerate growth; withdraw when needed for expenses or after reaching financial independence goals.</p></div>
          <div><h4 className="font-semibold mb-2">What are the best passive income sources?</h4><p className="text-muted-foreground">Dividend stocks, bonds, real estate, index funds, peer-to-peer lending, royalties, or automated digital businesses.</p></div>
          <div><h4 className="font-semibold mb-2">How does passive income affect taxes?</h4><p className="text-muted-foreground">Taxed as ordinary income, qualified dividends, or capital gains depending on source; use tax-advantaged accounts when possible.</p></div>
          <div><h4 className="font-semibold mb-2">Can passive income replace active income?</h4><p className="text-muted-foreground">Yes—when passive income exceeds expenses, you achieve financial independence; allows retirement or career flexibility.</p></div>
          <div><h4 className="font-semibold mb-2">How to increase passive income faster?</h4><p className="text-muted-foreground">Increase savings rate, seek higher returns (with appropriate risk), diversify sources, or reinvest all income initially.</p></div>
          <div><h4 className="font-semibold mb-2">What about inflation?</h4><p className="text-muted-foreground">Adjust withdrawal rate for inflation; growth-oriented investments help maintain purchasing power; plan for 2-3% annual inflation.</p></div>
        </CardContent>
      </Card>
    </div>
  );
}

