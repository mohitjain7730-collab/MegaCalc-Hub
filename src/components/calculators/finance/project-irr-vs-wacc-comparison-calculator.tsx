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
  projectIRR: z.number().optional(),
  companyWACC: z.number().min(0).max(100).optional(),
  projectNPV: z.number().optional(),
  initialInvestment: z.number().min(0).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function ProjectIRRVsWACCComparisonCalculator() {
  const [result,setResult]=useState<{irr:number; wacc:number; spread:number; recommendation:string; npvIfAvailable:number; interpretation:string; suggestions:string[]}|null>(null);
  const form=useForm<FormValues>({resolver:zodResolver(formSchema),defaultValues:{projectIRR:undefined as unknown as number,companyWACC:undefined as unknown as number,projectNPV:undefined as unknown as number,initialInvestment:undefined as unknown as number}});

  const onSubmit=(v:FormValues)=>{
    if(v.projectIRR===undefined||v.companyWACC===undefined){ setResult(null); return; }
    const spread=v.projectIRR-v.companyWACC;
    let rec='';
    if(spread>2) rec='Strong Accept - IRR significantly exceeds WACC';
    else if(spread>0) rec='Accept - IRR exceeds WACC';
    else if(spread>-2) rec='Marginal - IRR close to WACC, consider other factors';
    else rec='Reject - IRR below WACC';
    let npvCalc=NaN;
    if(v.projectNPV!==undefined){
      npvCalc=v.projectNPV;
    } else if(v.initialInvestment!==undefined&&v.initialInvestment>0){
      npvCalc=v.initialInvestment*(spread/100);
    }
    const interp=`IRR: ${v.projectIRR.toFixed(2)}%, WACC: ${v.companyWACC.toFixed(2)}%, Spread: ${spread>=0?'+':''}${spread.toFixed(2)}%. ${Number.isFinite(npvCalc)?`Estimated NPV: ${npvCalc.toFixed(2)}. `:''}${rec}`;
    setResult({irr:v.projectIRR,wacc:v.companyWACC,spread,recommendation:rec,npvIfAvailable:npvCalc,interpretation:interp,suggestions:['IRR above WACC indicates project creates value and should be accepted.','IRR below WACC suggests project destroys value; consider rejection or restructuring.','Larger spread (IRR - WACC) indicates stronger value creation potential.','Consider project risk, strategic value, and other qualitative factors beyond IRR/WACC comparison.']});
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
          <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" /> Project IRR vs WACC Comparison Calculator</CardTitle>
          <CardDescription>Compare project internal rate of return (IRR) with weighted average cost of capital (WACC) to evaluate project viability and value creation.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <FormField control={form.control} name="projectIRR" render={({field})=>(<FormItem><FormLabel>Project IRR (%)</FormLabel><FormControl>{num('e.g., 15',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="companyWACC" render={({field})=>(<FormItem><FormLabel>Company WACC (%)</FormLabel><FormControl>{num('e.g., 10',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="projectNPV" render={({field})=>(<FormItem><FormLabel>Project NPV (optional)</FormLabel><FormControl>{num('e.g., 50000',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="initialInvestment" render={({field})=>(<FormItem><FormLabel>Initial Investment (optional)</FormLabel><FormControl>{num('e.g., 1000000',field)}</FormControl><FormMessage/></FormItem>)} />
              </div>
              <Button type="submit" className="w-full md:w-auto">Calculate</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result&&(
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Results & Insights</CardTitle><CardDescription>IRR vs WACC analysis</CardDescription></CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Project IRR</p><p className={`text-2xl font-bold ${result.irr>=result.wacc?'text-green-600':'text-red-600'}`}>{result.irr.toFixed(2)}%</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Company WACC</p><p className="text-2xl font-bold">{result.wacc.toFixed(2)}%</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Spread (IRR - WACC)</p><p className={`text-2xl font-bold ${result.spread>=0?'text-green-600':'text-red-600'}`}>{result.spread>=0?'+':''}{result.spread.toFixed(2)}%</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Recommendation</p><p className={`text-lg font-bold ${result.spread>0?'text-green-600':result.spread>-2?'text-yellow-600':'text-red-600'}`}>{result.recommendation}</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Interpretation</p><p className="font-medium">{result.interpretation}</p></div>
            </div>
            {Number.isFinite(result.npvIfAvailable) && (
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Project NPV</p><p className={`text-2xl font-bold ${result.npvIfAvailable>=0?'text-green-600':'text-red-600'}`}>{result.npvIfAvailable.toFixed(2)}</p></div>
            )}
            <div><h4 className="font-semibold mb-2">Suggestions</h4><ul className="list-disc pl-6 text-muted-foreground space-y-1">{result.suggestions.map((s,i)=>(<li key={i}>{s}</li>))}</ul></div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Related Calculators</CardTitle><CardDescription>Project evaluation</CardDescription></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/npv-calculator" className="text-primary hover:underline">NPV Calculator</a></h4><p className="text-sm text-muted-foreground">Project value.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/wacc-calculator" className="text-primary hover:underline">WACC Calculator</a></h4><p className="text-sm text-muted-foreground">Cost of capital.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/capital-budgeting-risk-standard-deviation-calculator" className="text-primary hover:underline">Capital Budgeting Risk</a></h4><p className="text-sm text-muted-foreground">Risk assessment.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/payback-period-calculator" className="text-primary hover:underline">Payback Period Calculator</a></h4><p className="text-sm text-muted-foreground">Recovery time.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Complete Guide to IRR vs WACC Comparison</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none"><p>Placeholder guide content.</p><p>Explain IRR vs WACC comparison, project acceptance criteria, value creation assessment, and capital budgeting decision-making.</p></CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Frequently Asked Questions</CardTitle><CardDescription>IRR vs WACC comparison</CardDescription></CardHeader>
        <CardContent className="space-y-6">
          <div><h4 className="font-semibold mb-2">What is IRR?</h4><p className="text-muted-foreground">Internal Rate of Return; discount rate that makes NPV equal zero; represents project's expected return rate.</p></div>
          <div><h4 className="font-semibold mb-2">What is WACC?</h4><p className="text-muted-foreground">Weighted Average Cost of Capital; average cost of financing company operations using debt and equity.</p></div>
          <div><h4 className="font-semibold mb-2">Why compare IRR to WACC?</h4><p className="text-muted-foreground">IRR above WACC indicates project creates value; IRR below WACC suggests project destroys value.</p></div>
          <div><h4 className="font-semibold mb-2">When should I accept a project?</h4><p className="text-muted-foreground">Accept if IRR exceeds WACC (and NPV is positive); reject if IRR is below WACC; consider other factors for marginal cases.</p></div>
          <div><h4 className="font-semibold mb-2">What is the minimum acceptable IRR?</h4><p className="text-muted-foreground">Should exceed WACC; many companies require IRR 2-5% above WACC to account for risk and opportunity cost.</p></div>
          <div><h4 className="font-semibold mb-2">Can IRR be below WACC but project still acceptable?</h4><p className="text-muted-foreground">Rarely; consider strategic value, non-financial benefits, or if project uses different financing than WACC represents.</p></div>
          <div><h4 className="font-semibold mb-2">How does project risk affect IRR requirement?</h4><p className="text-muted-foreground">Riskier projects should have higher IRR requirement (risk-adjusted hurdle rate) above standard WACC.</p></div>
          <div><h4 className="font-semibold mb-2">What if multiple projects exceed WACC?</h4><p className="text-muted-foreground">Rank by NPV or IRR spread; choose projects with highest value creation, considering capital constraints and risk.</p></div>
          <div><h4 className="font-semibold mb-2">Should I use WACC for all projects?</h4><p className="text-muted-foreground">Use WACC for projects with similar risk to company; adjust hurdle rate for projects with different risk profiles.</p></div>
          <div><h4 className="font-semibold mb-2">What are limitations of IRR vs WACC?</h4><p className="text-muted-foreground">Assumes reinvestment at IRR; doesn't account for project size; use NPV for capital-constrained decisions.</p></div>
        </CardContent>
      </Card>
    </div>
  );
}

