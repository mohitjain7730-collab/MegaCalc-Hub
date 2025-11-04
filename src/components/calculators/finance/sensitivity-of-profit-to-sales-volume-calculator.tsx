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
  pricePerUnit: z.number().min(0).optional(),
  variableCostPerUnit: z.number().min(0).optional(),
  fixedCosts: z.number().min(0).optional(),
  currentSalesVolume: z.number().min(0).optional(),
  salesVolumeChangePercent: z.number().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function SensitivityOfProfitToSalesVolumeCalculator() {
  const [result,setResult]=useState<{
    currentProfit:number;
    adjustedProfit:number;
    profitChange:number;
    profitChangePercent:number;
    degreeOfOperatingLeverage:number | null;
    interpretation:string;
    suggestions:string[];
  }|null>(null);

  const form=useForm<FormValues>({resolver:zodResolver(formSchema),defaultValues:{pricePerUnit:undefined as unknown as number,variableCostPerUnit:undefined as unknown as number,fixedCosts:undefined as unknown as number,currentSalesVolume:undefined as unknown as number,salesVolumeChangePercent:undefined as unknown as number}});

  const onSubmit=(v:FormValues)=>{
    if(v.pricePerUnit===undefined||v.variableCostPerUnit===undefined||v.fixedCosts===undefined||v.currentSalesVolume===undefined){ setResult(null); return; }
    const contributionPerUnit=v.pricePerUnit - v.variableCostPerUnit;
    const currentProfit=contributionPerUnit * v.currentSalesVolume - v.fixedCosts;
    const adjVolume=v.currentSalesVolume * (1 + ((v.salesVolumeChangePercent ?? 0)/100));
    const adjustedProfit=contributionPerUnit * adjVolume - v.fixedCosts;
    const profitChange=adjustedProfit - currentProfit;
    const profitChangePercent=currentProfit!==0 ? (profitChange/currentProfit)*100 : 0;
    const dol=currentProfit!==0 ? (contributionPerUnit * v.currentSalesVolume) / currentProfit : null;
    const interpretation=`With a ${(v.salesVolumeChangePercent??0).toFixed(1)}% change in volume, profit changes by ${profitChange.toFixed(2)} (${profitChangePercent.toFixed(1)}%).`;
    setResult({currentProfit,adjustedProfit,profitChange,profitChangePercent,degreeOfOperatingLeverage:dol,interpretation,suggestions:[
      'Increase contribution margin by raising prices or reducing variable costs.',
      'Lower fixed costs to reduce downside risk and improve profit sensitivity.',
      'Use promotions to boost volume when contribution margin is healthy.',
      'Benchmark degree of operating leverage against peers to understand risk.'
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
          <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" /> Sensitivity of Profit to Sales Volume Calculator</CardTitle>
          <CardDescription>Analyze how profit changes with sales volume adjustments, given price, variable cost, and fixed costs.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                <FormField control={form.control} name="pricePerUnit" render={({field})=>(<FormItem><FormLabel>Price per Unit</FormLabel><FormControl>{num('e.g., 50',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="variableCostPerUnit" render={({field})=>(<FormItem><FormLabel>Variable Cost per Unit</FormLabel><FormControl>{num('e.g., 30',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="fixedCosts" render={({field})=>(<FormItem><FormLabel>Fixed Costs</FormLabel><FormControl>{num('e.g., 100000',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="currentSalesVolume" render={({field})=>(<FormItem><FormLabel>Current Sales Volume</FormLabel><FormControl>{num('e.g., 10000',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="salesVolumeChangePercent" render={({field})=>(<FormItem><FormLabel>Volume Change (%)</FormLabel><FormControl>{num('e.g., 10',field)}</FormControl><FormMessage/></FormItem>)} />
              </div>
              <Button type="submit" className="w-full md:w-auto">Calculate</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result&&(
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Results & Insights</CardTitle><CardDescription>Profit sensitivity analysis</CardDescription></CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Current Profit</p><p className="text-2xl font-bold">{result.currentProfit.toFixed(2)}</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Adjusted Profit</p><p className="text-2xl font-bold">{result.adjustedProfit.toFixed(2)}</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Profit Change</p><p className={`text-2xl font-bold ${result.profitChange>=0? 'text-green-600':'text-red-600'}`}>{result.profitChange.toFixed(2)}</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Profit Change (%)</p><p className={`text-2xl font-bold ${result.profitChangePercent>=0? 'text-green-600':'text-red-600'}`}>{result.profitChangePercent.toFixed(1)}%</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Degree of Operating Leverage</p><p className="text-2xl font-bold">{result.degreeOfOperatingLeverage===null?'-':result.degreeOfOperatingLeverage.toFixed(2)}</p></div>
            </div>
            <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Interpretation</p><p className="font-medium">{result.interpretation}</p></div>
            <div><h4 className="font-semibold mb-2">Suggestions</h4><ul className="list-disc pl-6 text-muted-foreground space-y-1">{result.suggestions.map((s,i)=>(<li key={i}>{s}</li>))}</ul></div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Related Calculators</CardTitle><CardDescription>Profitability and leverage</CardDescription></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/contribution-margin-calculator" className="text-primary hover:underline">Contribution Margin Calculator</a></h4><p className="text-sm text-muted-foreground">Margin per unit.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/operating-leverage-calculator" className="text-primary hover:underline">Operating Leverage Calculator</a></h4><p className="text-sm text-muted-foreground">Leverage impact.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/gross-margin-calculator" className="text-primary hover:underline">Gross Margin Calculator</a></h4><p className="text-sm text-muted-foreground">Gross profitability.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/net-profit-margin-calculator" className="text-primary hover:underline">Net Profit Margin Calculator</a></h4><p className="text-sm text-muted-foreground">Net profitability.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Complete Guide to Profit Sensitivity</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none"><p>Placeholder guide content.</p><p>Explain profit sensitivity, contribution margin, operating leverage, and scenario analysis.</p></CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Frequently Asked Questions</CardTitle><CardDescription>Profit sensitivity</CardDescription></CardHeader>
        <CardContent className="space-y-6">
          <div><h4 className="font-semibold mb-2">What is profit sensitivity?</h4><p className="text-muted-foreground">The responsiveness of profit to changes in sales volume, price, variable costs, and fixed costs.</p></div>
          <div><h4 className="font-semibold mb-2">How is degree of operating leverage calculated?</h4><p className="text-muted-foreground">Approx. DOL = Contribution Margin / Operating Income at a given volume.</p></div>
          <div><h4 className="font-semibold mb-2">Why does fixed cost level matter?</h4><p className="text-muted-foreground">Higher fixed costs increase leverage, amplifying profit changes with volume swings.</p></div>
          <div><h4 className="font-semibold mb-2">What actions improve profit sensitivity?</h4><p className="text-muted-foreground">Increase prices, reduce variable costs, optimize product mix, and manage fixed costs.</p></div>
          <div><h4 className="font-semibold mb-2">What if current profit is near zero?</h4><p className="text-muted-foreground">DOL becomes very large or undefined; small volume changes can flip to losses or profits.</p></div>
          <div><h4 className="font-semibold mb-2">How often to review sensitivity?</h4><p className="text-muted-foreground">Quarterly or when costs/prices change materially; rerun scenarios before major decisions.</p></div>
          <div><h4 className="font-semibold mb-2">Is volume change always linear?</h4><p className="text-muted-foreground">This model assumes linearity; real-world capacity constraints and discounts may cause nonlinearity.</p></div>
          <div><h4 className="font-semibold mb-2">Can I model multiple scenarios?</h4><p className="text-muted-foreground">Yes—run different volume change percentages or use a scenario tool for multiple cases.</p></div>
        </CardContent>
      </Card>
    </div>
  );
}



