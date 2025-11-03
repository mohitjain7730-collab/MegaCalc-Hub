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
  currentValue: z.number().min(0).optional(),
  previousValue: z.number().min(0).optional(),
  timePeriods: z.number().min(1).optional(),
  targetValue: z.number().min(0).optional(),
  targetPeriods: z.number().min(1).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function FinancialForecastGrowthRateCalculator() {
  const [result,setResult]=useState<{growthRate:number; compoundGrowthRate:number; forecastValue:number; requiredGrowthRate:number; interpretation:string; suggestions:string[]}|null>(null);
  const form=useForm<FormValues>({resolver:zodResolver(formSchema),defaultValues:{currentValue:undefined as unknown as number,previousValue:undefined as unknown as number,timePeriods:undefined as unknown as number,targetValue:undefined as unknown as number,targetPeriods:undefined as unknown as number}});

  const onSubmit=(v:FormValues)=>{
    if(v.currentValue!==undefined&&v.previousValue!==undefined&&v.previousValue>0){
      const gr=((v.currentValue-v.previousValue)/v.previousValue)*100;
      let cgr=NaN;
      if(v.timePeriods!==undefined&&v.timePeriods>0){
        cgr=(Math.pow(v.currentValue/v.previousValue,1/v.timePeriods)-1)*100;
      }
      let fv=NaN;
      let rgr=NaN;
      if(v.targetValue!==undefined&&v.targetPeriods!==undefined&&v.targetPeriods>0&&v.currentValue>0){
        fv=v.currentValue*Math.pow(1+gr/100,v.targetPeriods);
        rgr=(Math.pow(v.targetValue/v.currentValue,1/v.targetPeriods)-1)*100;
      }
      let interp=`Growth rate: ${gr.toFixed(2)}%.`;
      if(Number.isFinite(cgr)) interp+=` CAGR: ${cgr.toFixed(2)}%.`;
      if(Number.isFinite(fv)) interp+=` Forecast value: ${fv.toFixed(2)}.`;
      if(Number.isFinite(rgr)) interp+=` Required growth: ${rgr.toFixed(2)}%.`;
      setResult({growthRate:gr,compoundGrowthRate:cgr,forecastValue:fv,requiredGrowthRate:rgr,interpretation:interp,suggestions:['Growth rates measure business expansion; use for financial planning and forecasting.','CAGR provides smoothed annual growth; useful for comparing periods of different lengths.','Forecast future values using historical growth rates; adjust for market conditions.','Required growth rate shows what\'s needed to reach targets; assess feasibility realistically.']});
    } else if(v.currentValue!==undefined&&v.targetValue!==undefined&&v.targetPeriods!==undefined&&v.currentValue>0&&v.targetPeriods>0){
      const rgr=(Math.pow(v.targetValue/v.currentValue,1/v.targetPeriods)-1)*100;
      const fv=v.currentValue*Math.pow(1+rgr/100,v.targetPeriods);
      const interp=`Required growth rate: ${rgr.toFixed(2)}% to reach ${v.targetValue.toFixed(2)} in ${v.targetPeriods} periods. Forecast: ${fv.toFixed(2)}.`;
      setResult({growthRate:NaN,compoundGrowthRate:rgr,forecastValue:fv,requiredGrowthRate:rgr,interpretation:interp,suggestions:['Calculate required growth to meet financial targets and strategic goals.','Assess if required growth is achievable based on historical performance and market conditions.','Break down targets into annual or quarterly milestones for better planning.','Monitor actual growth against required growth to adjust strategies as needed.']});
    } else { setResult(null); return; }
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
          <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" /> Financial Forecast / Growth Rate Calculator</CardTitle>
          <CardDescription>Calculate growth rates, compound annual growth rate (CAGR), and forecast future financial values based on growth patterns.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                <FormField control={form.control} name="currentValue" render={({field})=>(<FormItem><FormLabel>Current Value</FormLabel><FormControl>{num('e.g., 1000000',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="previousValue" render={({field})=>(<FormItem><FormLabel>Previous Value</FormLabel><FormControl>{num('e.g., 800000',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="timePeriods" render={({field})=>(<FormItem><FormLabel>Time Periods</FormLabel><FormControl>{num('e.g., 1',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="targetValue" render={({field})=>(<FormItem><FormLabel>Target Value (optional)</FormLabel><FormControl>{num('e.g., 1500000',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="targetPeriods" render={({field})=>(<FormItem><FormLabel>Target Periods (optional)</FormLabel><FormControl>{num('e.g., 3',field)}</FormControl><FormMessage/></FormItem>)} />
              </div>
              <Button type="submit" className="w-full md:w-auto">Calculate</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result&&(
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Results & Insights</CardTitle><CardDescription>Growth rate analysis</CardDescription></CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Growth Rate (%)</p><p className={`text-2xl font-bold ${Number.isFinite(result.growthRate)?(result.growthRate>=0?'text-green-600':'text-red-600'):'text-gray-400'}`}>{Number.isFinite(result.growthRate)?result.growthRate.toFixed(2)+'%':'N/A'}</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">CAGR (%)</p><p className={`text-2xl font-bold ${Number.isFinite(result.compoundGrowthRate)?(result.compoundGrowthRate>=0?'text-green-600':'text-red-600'):'text-gray-400'}`}>{Number.isFinite(result.compoundGrowthRate)?result.compoundGrowthRate.toFixed(2)+'%':'N/A'}</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Forecast Value</p><p className={`text-2xl font-bold ${Number.isFinite(result.forecastValue)?'text-blue-600':'text-gray-400'}`}>{Number.isFinite(result.forecastValue)?result.forecastValue.toFixed(2):'N/A'}</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Required Growth (%)</p><p className={`text-2xl font-bold ${Number.isFinite(result.requiredGrowthRate)?(result.requiredGrowthRate>=0?'text-green-600':'text-red-600'):'text-gray-400'}`}>{Number.isFinite(result.requiredGrowthRate)?result.requiredGrowthRate.toFixed(2)+'%':'N/A'}</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Interpretation</p><p className="font-medium">{result.interpretation}</p></div>
            </div>
            <div><h4 className="font-semibold mb-2">Suggestions</h4><ul className="list-disc pl-6 text-muted-foreground space-y-1">{result.suggestions.map((s,i)=>(<li key={i}>{s}</li>))}</ul></div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Related Calculators</CardTitle><CardDescription>Financial forecasting</CardDescription></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/cagr-calculator" className="text-primary hover:underline">CAGR Calculator</a></h4><p className="text-sm text-muted-foreground">Compound growth.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/future-value-calculator" className="text-primary hover:underline">Future Value Calculator</a></h4><p className="text-sm text-muted-foreground">Value projection.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/dcf-calculator" className="text-primary hover:underline">DCF Calculator</a></h4><p className="text-sm text-muted-foreground">Discounted cash flow.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/cash-flow-forecasting-calculator" className="text-primary hover:underline">Cash Flow Forecasting</a></h4><p className="text-sm text-muted-foreground">Cash projections.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Complete Guide to Financial Forecasting</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none"><p>Placeholder guide content.</p><p>Explain growth rates, CAGR calculation, forecasting methods, and financial planning applications.</p></CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Frequently Asked Questions</CardTitle><CardDescription>Financial forecasting</CardDescription></CardHeader>
        <CardContent className="space-y-6">
          <div><h4 className="font-semibold mb-2">What is growth rate?</h4><p className="text-muted-foreground">Percentage change in value over time; calculated as (Current - Previous) / Previous × 100.</p></div>
          <div><h4 className="font-semibold mb-2">What is CAGR?</h4><p className="text-muted-foreground">Compound Annual Growth Rate; smoothed annual growth rate over multiple periods; accounts for compounding.</p></div>
          <div><h4 className="font-semibold mb-2">How is CAGR calculated?</h4><p className="text-muted-foreground">CAGR = (End Value / Start Value)^(1/Periods) - 1; provides average annual growth rate.</p></div>
          <div><h4 className="font-semibold mb-2">When to use growth rate vs CAGR?</h4><p className="text-muted-foreground">Use growth rate for single period changes; use CAGR for multi-period analysis and comparisons.</p></div>
          <div><h4 className="font-semibold mb-2">How accurate are growth forecasts?</h4><p className="text-muted-foreground">Depends on data quality and market stability; past performance doesn't guarantee future results; use multiple scenarios.</p></div>
          <div><h4 className="font-semibold mb-2">What is required growth rate?</h4><p className="text-muted-foreground">Growth rate needed to reach target value in specified time; helps set realistic goals and assess feasibility.</p></div>
          <div><h4 className="font-semibold mb-2">How to forecast financial values?</h4><p className="text-muted-foreground">Apply growth rate to current value: Future Value = Current × (1 + Growth Rate)^Periods; adjust for risk factors.</p></div>
          <div><h4 className="font-semibold mb-2">What affects growth rates?</h4><p className="text-muted-foreground">Market conditions, competition, economic factors, business strategy, industry trends, and company-specific factors.</p></div>
          <div><h4 className="font-semibold mb-2">How often should growth forecasts be updated?</h4><p className="text-muted-foreground">Regularly—quarterly or annually; update when actual results differ significantly or market conditions change.</p></div>
          <div><h4 className="font-semibold mb-2">What are limitations of growth forecasts?</h4><p className="text-muted-foreground">Assume constant growth; don't account for volatility, disruptions, or external shocks; use multiple scenarios for better planning.</p></div>
        </CardContent>
      </Card>
    </div>
  );
}

