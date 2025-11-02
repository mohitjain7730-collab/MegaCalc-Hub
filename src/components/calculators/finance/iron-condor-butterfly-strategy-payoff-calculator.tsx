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
  lowerStrike1: z.number().min(0).optional(),
  lowerStrike2: z.number().min(0).optional(),
  upperStrike1: z.number().min(0).optional(),
  upperStrike2: z.number().min(0).optional(),
  netPremium: z.number().optional(),
  strategyType: z.enum(['iron-condor','butterfly']).optional(),
  finalPrice: z.number().min(0).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function IronCondorButterflyStrategyPayoffCalculator() {
  const [result,setResult]=useState<{profit:number; maxProfit:number; maxLoss:number; breakevens:number[]; interpretation:string; suggestions:string[]}|null>(null);
  const form=useForm<FormValues>({resolver:zodResolver(formSchema),defaultValues:{lowerStrike1:undefined as unknown as number,lowerStrike2:undefined as unknown as number,upperStrike1:undefined as unknown as number,upperStrike2:undefined as unknown as number,netPremium:undefined as unknown as number,strategyType:undefined,finalPrice:undefined as unknown as number}});

  const onSubmit=(v:FormValues)=>{
    if(v.lowerStrike1===undefined||v.lowerStrike2===undefined||v.upperStrike1===undefined||v.upperStrike2===undefined||v.netPremium===undefined||v.strategyType===undefined||v.finalPrice===undefined){ setResult(null); return; }
    let profit=0,maxP=0,maxL=0,bes:number[]=[];
    if(v.strategyType==='iron-condor'){
      const p=v.finalPrice;
      const l1=Math.min(v.lowerStrike1,v.lowerStrike2); const l2=Math.max(v.lowerStrike1,v.lowerStrike2);
      const u1=Math.min(v.upperStrike1,v.upperStrike2); const u2=Math.max(v.upperStrike1,v.upperStrike2);
      if(p<=l1||p>=u2) profit=-Math.abs(v.netPremium);
      else if(p>=l2&&p<=u1) profit=Math.abs(v.netPremium);
      else if(p>l1&&p<l2) profit=v.netPremium-(l2-p);
      else profit=v.netPremium-(p-u1);
      maxP=Math.abs(v.netPremium);
      maxL=-Math.abs(v.netPremium);
      bes=[l1+Math.abs(v.netPremium),u2-Math.abs(v.netPremium)];
    }else{
      const mid=(v.lowerStrike2+v.upperStrike1)/2;
      const w=Math.abs(v.upperStrike1-v.lowerStrike2);
      const p=v.finalPrice;
      if(p===mid) profit=w-Math.abs(v.netPremium);
      else if(p<v.lowerStrike1||p>v.upperStrike2) profit=-Math.abs(v.netPremium);
      else profit=w*(1-Math.abs(p-mid)/w)-Math.abs(v.netPremium);
      maxP=w-Math.abs(v.netPremium);
      maxL=-Math.abs(v.netPremium);
      bes=[mid-Math.abs(v.netPremium),mid+Math.abs(v.netPremium)];
    }
    const interp=`${v.strategyType} profit at ${v.finalPrice}: ${profit>=0?'gain':'loss'} of ${Math.abs(profit).toFixed(2)}.`;
    setResult({profit,maxProfit:maxP,maxLoss:maxL,breakevens:bes,interpretation:interp,suggestions:['Both strategies profit in narrow ranges; watch for large moves.','Monitor time decay; theta favors short options (iron condor).','Adjust strikes based on expected volatility and range.','Close early if profit targets reached or risk limits hit.']});
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
          <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" /> Iron Condor / Butterfly Strategy Payoff Calculator</CardTitle>
          <CardDescription>Analyze profit/loss for iron condor and butterfly spreads at expiry.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <FormField control={form.control} name="lowerStrike1" render={({field})=>(<FormItem><FormLabel>Lower Strike 1</FormLabel><FormControl>{num('e.g., 90',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="lowerStrike2" render={({field})=>(<FormItem><FormLabel>Lower Strike 2</FormLabel><FormControl>{num('e.g., 95',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="upperStrike1" render={({field})=>(<FormItem><FormLabel>Upper Strike 1</FormLabel><FormControl>{num('e.g., 105',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="upperStrike2" render={({field})=>(<FormItem><FormLabel>Upper Strike 2</FormLabel><FormControl>{num('e.g., 110',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="netPremium" render={({field})=>(<FormItem><FormLabel>Net Premium (received +, paid -)</FormLabel><FormControl>{num('e.g., 2',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="strategyType" render={({field})=>(<FormItem><FormLabel>Strategy Type</FormLabel><FormControl><Input placeholder="iron-condor or butterfly" {...field as any} value={field.value??''} onChange={e=>field.onChange((e.target.value as any)||undefined)} /></FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="finalPrice" render={({field})=>(<FormItem><FormLabel>Final Price (scenario)</FormLabel><FormControl>{num('e.g., 100',field)}</FormControl><FormMessage/></FormItem>)} />
              </div>
              <Button type="submit" className="w-full md:w-auto">Calculate</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result&&(
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Results & Insights</CardTitle><CardDescription>Strategy payoff</CardDescription></CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Profit/Loss</p><p className={`text-2xl font-bold ${result.profit>=0?'text-green-600':'text-red-600'}`}>{result.profit.toFixed(2)}</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Max Profit</p><p className="text-2xl font-bold text-green-600">{result.maxProfit.toFixed(2)}</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Max Loss</p><p className="text-2xl font-bold text-red-600">{result.maxLoss.toFixed(2)}</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Breakevens</p><p className="text-2xl font-bold">{result.breakevens.map(b=>b.toFixed(2)).join(', ')}</p></div>
            </div>
            <div><h4 className="font-semibold mb-2">Interpretation</h4><p className="text-muted-foreground">{result.interpretation}</p></div>
            <div><h4 className="font-semibold mb-2">Suggestions</h4><ul className="list-disc pl-6 text-muted-foreground space-y-1">{result.suggestions.map((s,i)=>(<li key={i}>{s}</li>))}</ul></div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Related Calculators</CardTitle><CardDescription>Options strategies</CardDescription></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/option-payoff-calculator" className="text-primary hover:underline">Option Payoff Calculator</a></h4><p className="text-sm text-muted-foreground">General payoff analysis.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/black-scholes-calculator" className="text-primary hover:underline">Black–Scholes Calculator</a></h4><p className="text-sm text-muted-foreground">Component pricing.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/option-greeks-calculator" className="text-primary hover:underline">Option Greeks Calculator</a></h4><p className="text-sm text-muted-foreground">Risk sensitivities.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/probability-expiring-itm-options-calculator" className="text-primary hover:underline">ITM Probability Calculator</a></h4><p className="text-sm text-muted-foreground">Expiry outcomes.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Complete Guide to Iron Condors and Butterflies</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none"><p>Placeholder guide content.</p><p>Explain construction, profit zones, and risk management.</p></CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Frequently Asked Questions</CardTitle><CardDescription>Spread strategies</CardDescription></CardHeader>
        <CardContent className="space-y-6">
          <div><h4 className="font-semibold mb-2">What is an iron condor?</h4><p className="text-muted-foreground">A four-leg spread combining bear call and bull put spreads to profit from low volatility ranges.</p></div>
          <div><h4 className="font-semibold mb-2">What is a butterfly?</h4><p className="text-muted-foreground">Three-leg spread (long middle, short wings) designed to profit if price expires at the middle strike.</p></div>
          <div><h4 className="font-semibold mb-2">Which strategy for low volatility?</h4><p className="text-muted-foreground">Iron condors benefit from low vol; butterflies work best when you expect price to converge to center.</p></div>
          <div><h4 className="font-semibold mb-2">How do I construct an iron condor?</h4><p className="text-muted-foreground">Sell lower put spread and sell higher call spread; all same expiry; strikes define profit zone.</p></div>
          <div><h4 className="font-semibold mb-2">How do I construct a butterfly?</h4><p className="text-muted-foreground">Buy one low strike, sell two middle strikes, buy one high strike; symmetric around center for calls/puts.</p></div>
          <div><h4 className="font-semibold mb-2">What is the profit zone?</h4><p className="text-muted-foreground">Iron condor: between middle strikes. Butterfly: near center strike (symmetry around it).</p></div>
          <div><h4 className="font-semibold mb-2">When is maximum loss?</h4><p className="text-muted-foreground">Iron condor: outside the wings. Butterfly: at wing strikes if price moves far from center.</p></div>
          <div><h4 className="font-semibold mb-2">Does time decay help?</h4><p className="text-muted-foreground">Yes for iron condors (net short options); mixed for butterflies depending on positioning.</p></div>
          <div><h4 className="font-semibold mb-2">How to manage early losses?</h4><p className="text-muted-foreground">Close or adjust spreads if price approaches loss zones; roll to new strikes if needed.</p></div>
          <div><h4 className="font-semibold mb-2">What about assignment risk?</h4><p className="text-muted-foreground">Manage short options carefully; early assignment can disrupt spread structure before expiry.</p></div>
        </CardContent>
      </Card>
    </div>
  );
}


