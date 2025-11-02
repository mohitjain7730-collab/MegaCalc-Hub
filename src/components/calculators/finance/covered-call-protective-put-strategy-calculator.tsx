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
  spot: z.number().min(0).optional(),
  strike: z.number().min(0).optional(),
  optionPrice: z.number().min(0).optional(),
  shares: z.number().min(0).optional(),
  strategyType: z.enum(['covered-call','protective-put']).optional(),
  finalPrice: z.number().min(0).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function CoveredCallProtectivePutStrategyCalculator() {
  const [result,setResult]=useState<{netCost:number; profit:number; returnPct:number; breakEven:number; interpretation:string; suggestions:string[]}|null>(null);
  const form=useForm<FormValues>({resolver:zodResolver(formSchema),defaultValues:{spot:undefined as unknown as number,strike:undefined as unknown as number,optionPrice:undefined as unknown as number,shares:undefined as unknown as number,strategyType:undefined,finalPrice:undefined as unknown as number}});

  const onSubmit=(v:FormValues)=>{
    if(v.spot===undefined||v.strike===undefined||v.optionPrice===undefined||v.shares===undefined||v.strategyType===undefined||v.finalPrice===undefined){ setResult(null); return; }
    let netCost=0,profit=0;
    if(v.strategyType==='covered-call'){
      netCost=(v.spot-v.optionPrice)*v.shares;
      const stockPnl=(v.finalPrice-v.spot)*v.shares;
      const callPnl=-Math.max(0,v.finalPrice-v.strike)*v.shares;
      profit=stockPnl+callPnl;
    }else{
      netCost=(v.spot+v.optionPrice)*v.shares;
      const stockPnl=(v.finalPrice-v.spot)*v.shares;
      const putPnl=Math.max(0,v.strike-v.finalPrice)*v.shares;
      profit=stockPnl+putPnl;
    }
    const ret=(profit/netCost)*100;
    const be=v.strategyType==='covered-call'?v.spot-v.optionPrice:v.spot+v.optionPrice;
    const interp=v.strategyType==='covered-call'?`Covered call: ${profit>=0?'profitable':'loss'} at ${v.finalPrice}. Max profit if spot<=${v.strike}.`:`Protective put: ${profit>=0?'profitable':'loss'} at ${v.finalPrice}. Protection below ${v.strike}.`;
    setResult({netCost,profit,returnPct:ret,breakEven:be,interpretation:interp,suggestions:['Covered calls limit upside; protective puts limit downside risk.','Consider taxes and commissions in real trading.','Monitor time decay on short options (covered calls).','Reassess strategy if spot moves significantly before expiry.']});
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
          <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" /> Covered Call / Protective Put Strategy Calculator</CardTitle>
          <CardDescription>Analyze covered call and protective put strategies at various price scenarios.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField control={form.control} name="spot" render={({field})=>(<FormItem><FormLabel>Spot Price</FormLabel><FormControl>{num('e.g., 100',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="strike" render={({field})=>(<FormItem><FormLabel>Strike Price</FormLabel><FormControl>{num('e.g., 105',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="optionPrice" render={({field})=>(<FormItem><FormLabel>Option Premium</FormLabel><FormControl>{num('e.g., 3',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="shares" render={({field})=>(<FormItem><FormLabel>Number of Shares</FormLabel><FormControl>{num('e.g., 100',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="strategyType" render={({field})=>(<FormItem><FormLabel>Strategy Type</FormLabel><FormControl><Input placeholder="covered-call or protective-put" {...field as any} value={field.value??''} onChange={e=>field.onChange((e.target.value as any)||undefined)} /></FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="finalPrice" render={({field})=>(<FormItem><FormLabel>Final Price (scenario)</FormLabel><FormControl>{num('e.g., 110',field)}</FormControl><FormMessage/></FormItem>)} />
              </div>
              <Button type="submit" className="w-full md:w-auto">Calculate</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result&&(
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Results & Insights</CardTitle><CardDescription>Strategy performance</CardDescription></CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Net Cost</p><p className="text-2xl font-bold">{result.netCost.toFixed(2)}</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Profit/Loss</p><p className={`text-2xl font-bold ${result.profit>=0?'text-green-600':'text-red-600'}`}>{result.profit.toFixed(2)}</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Return %</p><p className={`text-2xl font-bold ${result.returnPct>=0?'text-green-600':'text-red-600'}`}>{result.returnPct.toFixed(2)}%</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Break-Even</p><p className="text-2xl font-bold">{result.breakEven.toFixed(2)}</p></div>
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
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/option-payoff-calculator" className="text-primary hover:underline">Option Payoff Calculator</a></h4><p className="text-sm text-muted-foreground">Visualize payoffs.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/black-scholes-calculator" className="text-primary hover:underline">Black–Scholes Calculator</a></h4><p className="text-sm text-muted-foreground">Option pricing.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/option-greeks-calculator" className="text-primary hover:underline">Option Greeks Calculator</a></h4><p className="text-sm text-muted-foreground">Risk sensitivities.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/probability-expiring-itm-options-calculator" className="text-primary hover:underline">ITM Probability Calculator</a></h4><p className="text-sm text-muted-foreground">Expiry outcomes.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Complete Guide to Covered Calls and Protective Puts</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none"><p>Placeholder guide content.</p><p>Explain construction, risk/reward profiles, and use cases.</p></CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Frequently Asked Questions</CardTitle><CardDescription>Strategy mechanics</CardDescription></CardHeader>
        <CardContent className="space-y-6">
          <div><h4 className="font-semibold mb-2">What is a covered call?</h4><p className="text-muted-foreground">Selling call options against long stock positions to generate income while limiting upside.</p></div>
          <div><h4 className="font-semibold mb-2">What is a protective put?</h4><p className="text-muted-foreground">Buying put options to hedge downside risk on long stock positions.</p></div>
          <div><h4 className="font-semibold mb-2">When should I use covered calls?</h4><p className="text-muted-foreground">When you want to enhance income on stable or slightly bullish positions and are willing to cap gains.</p></div>
          <div><h4 className="font-semibold mb-2">When should I use protective puts?</h4><p className="text-muted-foreground">When you want to protect against downside while maintaining upside potential, accepting the cost.</p></div>
          <div><h4 className="font-semibold mb-2">What is the maximum profit for covered calls?</h4><p className="text-muted-foreground">Strike minus initial stock price plus premium received, realized if stock stays at or below strike.</p></div>
          <div><h4 className="font-semibold mb-2">What is the maximum loss for protective puts?</h4><p className="text-muted-foreground">Limited to stock price drop to zero plus put premium paid; effectively capped below strike.</p></div>
          <div><h4 className="font-semibold mb-2">How do I choose strikes?</h4><p className="text-muted-foreground">Covered calls: balance income (higher strike) vs protection (lower strike). Protective puts: balance cost vs protection level.</p></div>
          <div><h4 className="font-semibold mb-2">Does time decay help or hurt?</h4><p className="text-muted-foreground">Helps covered calls (short options decay); hurts protective puts (long options decay).</p></div>
          <div><h4 className="font-semibold mb-2">Can I adjust these strategies?</h4><p className="text-muted-foreground">Yes—roll options, close early, or modify strikes/expiries as market conditions change.</p></div>
          <div><h4 className="font-semibold mb-2">What about assignment risk?</h4><p className="text-muted-foreground">Covered calls risk early assignment if calls go deep ITM; manage by closing or rolling positions.</p></div>
        </CardContent>
      </Card>
    </div>
  );
}


