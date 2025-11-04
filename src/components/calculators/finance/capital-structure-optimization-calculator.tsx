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
  costOfEquity: z.number().min(0).optional(),
  costOfDebt: z.number().min(0).optional(),
  taxRate: z.number().min(0).max(100).optional(),
  debtRatio: z.number().min(0).max(100).optional(),
});

type FormValues = z.infer<typeof formSchema>;

function wacc(ke:number,kd:number,t:number,d:number){
  const E = 1 - d; const D = d;
  return ke*E + kd*(1 - t)*D;
}

export default function CapitalStructureOptimizationCalculator() {
  const [result,setResult]=useState<{wacc:number; waccLowerDebt:number; waccHigherDebt:number; interpretation:string; suggestions:string[]}|null>(null);
  const form=useForm<FormValues>({resolver:zodResolver(formSchema),defaultValues:{costOfEquity:undefined as unknown as number,costOfDebt:undefined as unknown as number,taxRate:undefined as unknown as number,debtRatio:undefined as unknown as number}});

  const onSubmit=(v:FormValues)=>{
    if(v.costOfEquity===undefined||v.costOfDebt===undefined||v.taxRate===undefined||v.debtRatio===undefined){ setResult(null); return; }
    const ke=v.costOfEquity/100; const kd=v.costOfDebt/100; const t=v.taxRate/100; const d=v.debtRatio/100;
    const base=wacc(ke,kd,t,d);
    const lower=wacc(ke,kd,t,Math.max(0, d-0.1));
    const higher=wacc(ke,kd,t,Math.min(1, d+0.1));
    const interpretation=`WACC at ${v.debtRatio.toFixed(1)}% debt is ${(base*100).toFixed(2)}%. Nearby range: ${(lower*100).toFixed(2)}% at ${(Math.max(0,d-0.1)*100).toFixed(0)}% debt, ${(higher*100).toFixed(2)}% at ${(Math.min(1,d+0.1)*100).toFixed(0)}% debt.`;
    setResult({wacc:base,waccLowerDebt:lower,waccHigherDebt:higher,interpretation,suggestions:[
      'Balance cheaper debt (after-tax) with rising financial risk and potential higher equity costs.',
      'Target the lowest WACC zone subject to rating, covenant, and liquidity constraints.',
      'Stress-test WACC to interest rate changes and equity risk premia.',
      'Review capital structure quarterly as markets and business risks evolve.'
    ]});
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
          <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" /> Capital Structure Optimization Calculator</CardTitle>
          <CardDescription>Estimate WACC at a chosen debt ratio and compare nearby structures.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <FormField control={form.control} name="costOfEquity" render={({field})=>(<FormItem><FormLabel>Cost of Equity (%)</FormLabel><FormControl>{num('e.g., 12',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="costOfDebt" render={({field})=>(<FormItem><FormLabel>Cost of Debt (%)</FormLabel><FormControl>{num('e.g., 6',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="taxRate" render={({field})=>(<FormItem><FormLabel>Tax Rate (%)</FormLabel><FormControl>{num('e.g., 25',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="debtRatio" render={({field})=>(<FormItem><FormLabel>Debt Ratio (%)</FormLabel><FormControl>{num('e.g., 40',field)}</FormControl><FormMessage/></FormItem>)} />
              </div>
              <Button type="submit" className="w-full md:w-auto">Calculate</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result&&(
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Results & Insights</CardTitle><CardDescription>WACC and structure</CardDescription></CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">WACC (Current)</p><p className="text-2xl font-bold">{(result.wacc*100).toFixed(2)}%</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">WACC (Lower Debt)</p><p className="text-2xl font-bold">{(result.waccLowerDebt*100).toFixed(2)}%</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">WACC (Higher Debt)</p><p className="text-2xl font-bold">{(result.waccHigherDebt*100).toFixed(2)}%</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Interpretation</p><p className="font-medium">{result.interpretation}</p></div>
            </div>
            <div><h4 className="font-semibold mb-2">Suggestions</h4><ul className="list-disc pl-6 text-muted-foreground space-y-1">{result.suggestions.map((s,i)=>(<li key={i}>{s}</li>))}</ul></div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Related Calculators</CardTitle><CardDescription>Financing costs</CardDescription></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/wacc-calculator" className="text-primary hover:underline">WACC Calculator</a></h4><p className="text-sm text-muted-foreground">Weighted average cost of capital.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/capm-calculator" className="text-primary hover:underline">CAPM Calculator</a></h4><p className="text-sm text-muted-foreground">Cost of equity.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/return-on-equity-calculator" className="text-primary hover:underline">Return on Equity</a></h4><p className="text-sm text-muted-foreground">Equity returns.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/debt-to-equity-ratio-calculator" className="text-primary hover:underline">Debt-to-Equity Ratio</a></h4><p className="text-sm text-muted-foreground">Leverage level.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Complete Guide to Capital Structure</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none"><p>Placeholder guide content.</p><p>Explain WACC drivers, tax shield, and trade-off theory basics.</p></CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Frequently Asked Questions</CardTitle><CardDescription>Capital structure optimization</CardDescription></CardHeader>
        <CardContent className="space-y-6">
          <div><h4 className="font-semibold mb-2">What is WACC and why does it matter?</h4><p className="text-muted-foreground">WACC is the blended cost of capital from equity and debt. It’s used to discount project cash flows; the lower the WACC, the higher the present value of future cash flows.</p></div>
          <div><h4 className="font-semibold mb-2">How does debt lower WACC?</h4><p className="text-muted-foreground">Debt is usually cheaper than equity and benefits from a tax shield on interest, reducing the after-tax cost and thus the overall WACC at moderate leverage levels.</p></div>
          <div><h4 className="font-semibold mb-2">What limits the benefits of leverage?</h4><p className="text-muted-foreground">Beyond a point, bankruptcy risk, agency costs, and higher required returns by investors can raise WACC. The optimal capital structure balances these forces.</p></div>
          <div><h4 className="font-semibold mb-2">Is there a single optimal debt ratio?</h4><p className="text-muted-foreground">No. It varies by industry, business risk, asset tangibility, and market conditions. Firms maintain a target range rather than a single point.</p></div>
          <div><h4 className="font-semibold mb-2">How does tax rate affect optimal structure?</h4><p className="text-muted-foreground">Higher tax rates increase the value of the interest tax shield, generally favoring more debt—subject to risk tolerance and covenants.</p></div>
          <div><h4 className="font-semibold mb-2">What inputs drive cost of equity?</h4><p className="text-muted-foreground">Market risk premium, risk-free rate, and firm-specific beta (via CAPM). Idiosyncratic risk and capital structure also influence equity costs.</p></div>
          <div><h4 className="font-semibold mb-2">How often should firms revisit capital structure?</h4><p className="text-muted-foreground">At least annually and during major strategy shifts. Interest rate moves and equity market changes can quickly alter the optimal mix.</p></div>
          <div><h4 className="font-semibold mb-2">What role do credit ratings play?</h4><p className="text-muted-foreground">Ratings constrain debt capacity and pricing. Maintaining an investment-grade rating can be a key objective, shaping leverage choices.</p></div>
          <div><h4 className="font-semibold mb-2">Can WACC be negative?</h4><p className="text-muted-foreground">In normal market conditions, no. If observed, reassess inputs; negative WACC implies unrealistically low or erroneous assumptions.</p></div>
          <div><h4 className="font-semibold mb-2">How to use WACC results?</h4><p className="text-muted-foreground">Use WACC to set hurdle rates, evaluate projects, and inform financing policy, while overlaying qualitative risk and strategic considerations.</p></div>
        </CardContent>
      </Card>
    </div>
  );
}
