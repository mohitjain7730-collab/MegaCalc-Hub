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
  sales: z.number().min(0).optional(),
  variableCosts: z.number().min(0).optional(),
  fixedCosts: z.number().min(0).optional(),
  salesChangePercent: z.number().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function OperatingLeverageCalculator() {
  const [result,setResult]=useState<{contributionMargin:number; operatingIncome:number; degreeOfLeverage:number; incomeChangePercent:number; interpretation:string; suggestions:string[]}|null>(null);
  const form=useForm<FormValues>({resolver:zodResolver(formSchema),defaultValues:{sales:undefined as unknown as number,variableCosts:undefined as unknown as number,fixedCosts:undefined as unknown as number,salesChangePercent:undefined as unknown as number}});

  const onSubmit=(v:FormValues)=>{
    if(v.sales===undefined||v.variableCosts===undefined||v.fixedCosts===undefined||v.salesChangePercent===undefined){ setResult(null); return; }
    const cm=v.sales-v.variableCosts;
    const oi=cm-v.fixedCosts;
    if(oi<=0){ setResult(null); return; }
    const dol=cm/oi;
    const incomeChange=dol*v.salesChangePercent;
    const interp=`Degree of operating leverage: ${dol.toFixed(2)}. ${v.salesChangePercent>=0?'A':'A'} ${Math.abs(v.salesChangePercent)}% sales change causes ${Math.abs(incomeChange).toFixed(1)}% operating income change.`;
    setResult({contributionMargin:cm,operatingIncome:oi,degreeOfLeverage:dol,incomeChangePercent:incomeChange,interpretation:interp,suggestions:['Higher operating leverage amplifies profit changes with sales changes; more risk and reward.','High fixed costs increase leverage; low fixed costs reduce leverage but provide stability.','Use leverage to evaluate business risk and profit sensitivity to sales volume.','Monitor leverage ratio; high leverage requires careful sales forecasting and management.']});
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
          <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" /> Operating Leverage Calculator</CardTitle>
          <CardDescription>Calculate degree of operating leverage to measure how operating income changes with sales volume changes.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <FormField control={form.control} name="sales" render={({field})=>(<FormItem><FormLabel>Sales Revenue</FormLabel><FormControl>{num('e.g., 1000000',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="variableCosts" render={({field})=>(<FormItem><FormLabel>Variable Costs</FormLabel><FormControl>{num('e.g., 400000',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="fixedCosts" render={({field})=>(<FormItem><FormLabel>Fixed Costs</FormLabel><FormControl>{num('e.g., 300000',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="salesChangePercent" render={({field})=>(<FormItem><FormLabel>Sales Change (%)</FormLabel><FormControl>{num('e.g., 10',field)}</FormControl><FormMessage/></FormItem>)} />
              </div>
              <Button type="submit" className="w-full md:w-auto">Calculate</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result&&(
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Results & Insights</CardTitle><CardDescription>Operating leverage analysis</CardDescription></CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Contribution Margin</p><p className="text-2xl font-bold">{result.contributionMargin.toFixed(2)}</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Operating Income</p><p className="text-2xl font-bold">{result.operatingIncome.toFixed(2)}</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Degree of Leverage</p><p className="text-2xl font-bold">{result.degreeOfLeverage.toFixed(2)}</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Income Change (%)</p><p className={`text-2xl font-bold ${result.incomeChangePercent>=0?'text-green-600':'text-red-600'}`}>{result.incomeChangePercent>=0?'+':''}{result.incomeChangePercent.toFixed(1)}%</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Interpretation</p><p className="font-medium">{result.interpretation}</p></div>
            </div>
            <div><h4 className="font-semibold mb-2">Suggestions</h4><ul className="list-disc pl-6 text-muted-foreground space-y-1">{result.suggestions.map((s,i)=>(<li key={i}>{s}</li>))}</ul></div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Related Calculators</CardTitle><CardDescription>Financial leverage and profitability</CardDescription></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/contribution-margin-calculator" className="text-primary hover:underline">Contribution Margin Calculator</a></h4><p className="text-sm text-muted-foreground">Margin analysis.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/break-even-analysis-calculator" className="text-primary hover:underline">Break-Even Analysis Calculator</a></h4><p className="text-sm text-muted-foreground">Break-even point.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/operating-margin-calculator" className="text-primary hover:underline">Operating Margin Calculator</a></h4><p className="text-sm text-muted-foreground">Profitability metrics.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/gross-margin-calculator" className="text-primary hover:underline">Gross Margin Calculator</a></h4><p className="text-sm text-muted-foreground">Margin analysis.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Complete Guide to Operating Leverage</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none"><p>Placeholder guide content.</p><p>Explain operating leverage concept, calculation, interpretation, and business implications.</p></CardContent>
      </Card>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>Operating leverage</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div><h4 className="font-semibold mb-2">What is operating leverage?</h4><p className="text-muted-foreground">Measure of how operating income changes relative to sales changes; high leverage amplifies profit changes with sales changes.</p></div>
          <div><h4 className="font-semibold mb-2">How is degree of operating leverage calculated?</h4><p className="text-muted-foreground">DOL = Contribution Margin / Operating Income; measures percentage change in operating income for 1% sales change.</p></div>
          <div><h4 className="font-semibold mb-2">What does high operating leverage mean?</h4><p className="text-muted-foreground">High fixed costs relative to variable costs; small sales changes cause large profit changes; higher risk and reward.</p></div>
          <div><h4 className="font-semibold mb-2">What does low operating leverage mean?</h4><p className="text-muted-foreground">Low fixed costs relative to variable costs; profit changes less with sales changes; more stable but lower profit potential.</p></div>
          <div><h4 className="font-semibold mb-2">Why is operating leverage important?</h4><p className="text-muted-foreground">Helps evaluate business risk, profit sensitivity, cost structure impact, and financial planning for sales changes.</p></div>
          <div><h4 className="font-semibold mb-2">How does leverage affect profitability?</h4><p className="text-muted-foreground">High leverage: profits increase faster in growth periods but decrease faster in downturns; low leverage: more stable profits.</p></div>
          <div><h4 className="font-semibold mb-2">What industries have high operating leverage?</h4><p className="text-muted-foreground">Manufacturing, utilities, airlines (high fixed costs); service businesses often have lower leverage.</p></div>
          <div><h4 className="font-semibold mb-2">Can operating leverage be negative?</h4><p className="text-muted-foreground">Not typically; negative operating income indicates losses; leverage concept applies when company is profitable.</p></div>
          <div><h4 className="font-semibold mb-2">How to reduce operating leverage?</h4><p className="text-muted-foreground">Reduce fixed costs, convert fixed to variable costs, or increase sales to improve operating income margin.</p></div>
          <div><h4 className="font-semibold mb-2">What is the relationship with financial leverage?</h4><p className="text-muted-foreground">Operating leverage affects operating income; financial leverage affects net income after interest; both amplify risk and returns.</p></div>
        </CardContent>
      </Card>
    </div>
  );
}

