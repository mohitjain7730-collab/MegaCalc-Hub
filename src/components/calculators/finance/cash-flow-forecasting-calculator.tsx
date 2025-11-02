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
  startingCash: z.number().optional(),
  operatingCashInflow: z.number().optional(),
  operatingCashOutflow: z.number().optional(),
  investingCashFlow: z.number().optional(),
  financingCashFlow: z.number().optional(),
  months: z.number().min(1).max(120).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function CashFlowForecastingCalculator() {
  const [result,setResult]=useState<{endingCash:number; netOperatingCashFlow:number; netCashFlow:number; monthlyAverage:number; interpretation:string; suggestions:string[]}|null>(null);
  const form=useForm<FormValues>({resolver:zodResolver(formSchema),defaultValues:{startingCash:undefined as unknown as number,operatingCashInflow:undefined as unknown as number,operatingCashOutflow:undefined as unknown as number,investingCashFlow:undefined as unknown as number,financingCashFlow:undefined as unknown as number,months:undefined as unknown as number}});

  const onSubmit=(v:FormValues)=>{
    if(v.startingCash===undefined||v.operatingCashInflow===undefined||v.operatingCashOutflow===undefined){ setResult(null); return; }
    const nocf=v.operatingCashInflow-v.operatingCashOutflow;
    const icf=v.investingCashFlow||0;
    const fcf=v.financingCashFlow||0;
    const ncf=nocf+icf+fcf;
    const months=v.months||1;
    const ec=v.startingCash+(ncf*months);
    const ma=ncf;
    const interp=`Ending cash: ${ec.toFixed(2)}. Net operating cash flow: ${nocf.toFixed(2)}. Net cash flow: ${ncf.toFixed(2)}. Average monthly: ${ma.toFixed(2)}.`;
    setResult({endingCash:ec,netOperatingCashFlow:nocf,netCashFlow:ncf,monthlyAverage:ma,interpretation:interp,suggestions:['Cash flow forecasting helps plan for liquidity needs and identify potential shortfalls.','Monitor operating cash flow trends; positive flow indicates healthy operations.','Negative cash flow requires funding from investing or financing activities.','Update forecasts regularly based on actual results and changing business conditions.']});
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
          <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" /> Cash Flow Forecasting Calculator</CardTitle>
          <CardDescription>Forecast future cash flows by projecting operating, investing, and financing cash flows over specified periods.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField control={form.control} name="startingCash" render={({field})=>(<FormItem><FormLabel>Starting Cash Balance</FormLabel><FormControl>{num('e.g., 100000',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="operatingCashInflow" render={({field})=>(<FormItem><FormLabel>Operating Cash Inflow (monthly)</FormLabel><FormControl>{num('e.g., 50000',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="operatingCashOutflow" render={({field})=>(<FormItem><FormLabel>Operating Cash Outflow (monthly)</FormLabel><FormControl>{num('e.g., 40000',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="investingCashFlow" render={({field})=>(<FormItem><FormLabel>Investing Cash Flow (monthly, optional)</FormLabel><FormControl>{num('e.g., -5000',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="financingCashFlow" render={({field})=>(<FormItem><FormLabel>Financing Cash Flow (monthly, optional)</FormLabel><FormControl>{num('e.g., 10000',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="months" render={({field})=>(<FormItem><FormLabel>Forecast Period (months)</FormLabel><FormControl>{num('e.g., 12',field)}</FormControl><FormMessage/></FormItem>)} />
              </div>
              <Button type="submit" className="w-full md:w-auto">Calculate</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result&&(
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Results & Insights</CardTitle><CardDescription>Cash flow forecast</CardDescription></CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Ending Cash Balance</p><p className={`text-2xl font-bold ${result.endingCash>=0?'text-green-600':'text-red-600'}`}>{result.endingCash.toFixed(2)}</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Net Operating Cash Flow</p><p className={`text-2xl font-bold ${result.netOperatingCashFlow>=0?'text-green-600':'text-red-600'}`}>{result.netOperatingCashFlow.toFixed(2)}</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Net Cash Flow (monthly)</p><p className={`text-2xl font-bold ${result.netCashFlow>=0?'text-green-600':'text-red-600'}`}>{result.netCashFlow.toFixed(2)}</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Monthly Average</p><p className={`text-2xl font-bold ${result.monthlyAverage>=0?'text-green-600':'text-red-600'}`}>{result.monthlyAverage.toFixed(2)}</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Interpretation</p><p className="font-medium">{result.interpretation}</p></div>
            </div>
            <div><h4 className="font-semibold mb-2">Suggestions</h4><ul className="list-disc pl-6 text-muted-foreground space-y-1">{result.suggestions.map((s,i)=>(<li key={i}>{s}</li>))}</ul></div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Related Calculators</CardTitle><CardDescription>Cash flow and forecasting</CardDescription></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/free-cash-flow-calculator" className="text-primary hover:underline">Free Cash Flow Calculator</a></h4><p className="text-sm text-muted-foreground">Free cash flow.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/financial-forecast-growth-rate-calculator" className="text-primary hover:underline">Financial Forecast Calculator</a></h4><p className="text-sm text-muted-foreground">Growth forecasting.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/working-capital-requirement-estimator" className="text-primary hover:underline">Working Capital Estimator</a></h4><p className="text-sm text-muted-foreground">Capital requirements.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/dcf-calculator" className="text-primary hover:underline">DCF Calculator</a></h4><p className="text-sm text-muted-foreground">Discounted cash flow.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Complete Guide to Cash Flow Forecasting</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none"><p>Placeholder guide content.</p><p>Explain cash flow components, forecasting methods, operating vs investing vs financing flows, and cash management.</p></CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Frequently Asked Questions</CardTitle><CardDescription>Cash flow forecasting</CardDescription></CardHeader>
        <CardContent className="space-y-6">
          <div><h4 className="font-semibold mb-2">What is cash flow forecasting?</h4><p className="text-muted-foreground">Projecting future cash inflows and outflows to predict cash position; essential for liquidity planning and management.</p></div>
          <div><h4 className="font-semibold mb-2">What are the three types of cash flows?</h4><p className="text-muted-foreground">Operating (day-to-day business), investing (asset purchases/sales), and financing (debt/equity transactions).</p></div>
          <div><h4 className="font-semibold mb-2">How to forecast operating cash flow?</h4><p className="text-muted-foreground">Project sales receipts, customer payments timing, operating expenses, and payment schedules based on historical patterns.</p></div>
          <div><h4 className="font-semibold mb-2">What is net operating cash flow?</h4><p className="text-muted-foreground">Operating cash inflows minus operating cash outflows; indicates cash generated from core business operations.</p></div>
          <div><h4 className="font-semibold mb-2">Why is cash flow forecasting important?</h4><p className="text-muted-foreground">Identifies cash shortfalls, plans financing needs, optimizes cash management, and ensures liquidity for operations.</p></div>
          <div><h4 className="font-semibold mb-2">How often should cash flow be forecasted?</h4><p className="text-muted-foreground">Monthly for operational planning; weekly for tight cash situations; update based on actual results and changing conditions.</p></div>
          <div><h4 className="font-semibold mb-2">What is a cash flow shortfall?</h4><p className="text-muted-foreground">When cash outflows exceed inflows; requires financing, expense reduction, or delayed payments to bridge gap.</p></div>
          <div><h4 className="font-semibold mb-2">How to improve cash flow accuracy?</h4><p className="text-muted-foreground">Use historical data, account for seasonality, consider payment timing, update regularly, and use multiple scenarios.</p></div>
          <div><h4 className="font-semibold mb-2">What is the difference from profit?</h4><p className="text-muted-foreground">Profit is accounting measure (revenue - expenses); cash flow is actual cash movement; can differ due to timing and non-cash items.</p></div>
          <div><h4 className="font-semibold mb-2">How to handle uncertainty in forecasts?</h4><p className="text-muted-foreground">Create best-case, base-case, and worst-case scenarios; monitor key assumptions; maintain cash reserves for contingencies.</p></div>
        </CardContent>
      </Card>
    </div>
  );
}

