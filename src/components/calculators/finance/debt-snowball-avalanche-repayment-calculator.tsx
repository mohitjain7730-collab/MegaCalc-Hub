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
  monthlyPayment: z.number().min(0).optional(),
  debt1Balance: z.number().min(0).optional(),
  debt1Rate: z.number().min(0).max(100).optional(),
  debt1MinPayment: z.number().min(0).optional(),
  debt2Balance: z.number().min(0).optional(),
  debt2Rate: z.number().min(0).max(100).optional(),
  debt2MinPayment: z.number().min(0).optional(),
  strategy: z.enum(['snowball','avalanche']).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function DebtSnowballAvalancheRepaymentCalculator() {
  const [result,setResult]=useState<{snowballMonths:number; avalancheMonths:number; snowballInterest:number; avalancheInterest:number; better:string; interpretation:string; suggestions:string[]}|null>(null);
  const form=useForm<FormValues>({resolver:zodResolver(formSchema),defaultValues:{monthlyPayment:undefined as unknown as number,debt1Balance:undefined as unknown as number,debt1Rate:undefined as unknown as number,debt1MinPayment:undefined as unknown as number,debt2Balance:undefined as unknown as number,debt2Rate:undefined as unknown as number,debt2MinPayment:undefined as unknown as number,strategy:undefined}});

  const onSubmit=(v:FormValues)=>{
    if(v.monthlyPayment===undefined||v.debt1Balance===undefined||v.debt1Rate===undefined||v.debt1MinPayment===undefined||v.debt2Balance===undefined||v.debt2Rate===undefined||v.debt2MinPayment===undefined||v.strategy===undefined){ setResult(null); return; }
    const r1=v.debt1Rate/100/12; const r2=v.debt2Rate/100/12;
    let b1s=v.debt1Balance; let b2s=v.debt2Balance; let monthsS=0; let intS=0;
    while((b1s>0.01||b2s>0.01)&&monthsS<600){
      const pay1=Math.min(b1s,b1s*r1+v.debt1MinPayment+(b2s<=0.01?v.monthlyPayment-v.debt2MinPayment:0));
      const pay2=Math.min(b2s,b2s*r2+v.debt2MinPayment);
      intS+=b1s*r1+b2s*r2;
      b1s=Math.max(0,b1s*(1+r1)-pay1);
      b2s=Math.max(0,b2s*(1+r2)-pay2);
      monthsS++;
    }
    let b1a=v.debt1Balance; let b2a=v.debt2Balance; let monthsA=0; let intA=0;
    const higherRate=(v.debt1Rate>=v.debt2Rate)?1:2;
    while((b1a>0.01||b2a>0.01)&&monthsA<600){
      const extra=v.monthlyPayment-v.debt1MinPayment-v.debt2MinPayment;
      const pay1=Math.min(b1a,b1a*r1+v.debt1MinPayment+(higherRate===1&&b2a<=0.01?extra:0));
      const pay2=Math.min(b2a,b2a*r2+v.debt2MinPayment+(higherRate===2&&b1a<=0.01?extra:0));
      intA+=b1a*r1+b2a*r2;
      b1a=Math.max(0,b1a*(1+r1)-pay1);
      b2a=Math.max(0,b2a*(1+r2)-pay2);
      monthsA++;
    }
    const better=monthsA<monthsS||intA<intS?'Avalanche':'Snowball';
    const interp=`Snowball: ${monthsS} months, ${intS.toFixed(2)} interest. Avalanche: ${monthsA} months, ${intA.toFixed(2)} interest. ${better} is better.`;
    setResult({snowballMonths:monthsS,avalancheMonths:monthsA,snowballInterest:intS,avalancheInterest:intA,better,interpretation:interp,suggestions:['Snowball: pay smallest balance first for quick wins and motivation.','Avalanche: pay highest rate first to minimize total interest paid.','Choose snowball if you need motivation; choose avalanche for savings.','Both strategies work; consistency and commitment matter most.']});
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
          <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" /> Debt Snowball / Avalanche Repayment Calculator</CardTitle>
          <CardDescription>Compare debt snowball and avalanche repayment strategies to find the best approach for paying off multiple debts.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <FormField control={form.control} name="monthlyPayment" render={({field})=>(<FormItem><FormLabel>Total Monthly Payment</FormLabel><FormControl>{num('e.g., 800',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="debt1Balance" render={({field})=>(<FormItem><FormLabel>Debt 1 Balance</FormLabel><FormControl>{num('e.g., 5000',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="debt1Rate" render={({field})=>(<FormItem><FormLabel>Debt 1 Rate (%)</FormLabel><FormControl>{num('e.g., 18',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="debt1MinPayment" render={({field})=>(<FormItem><FormLabel>Debt 1 Min Payment</FormLabel><FormControl>{num('e.g., 150',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="debt2Balance" render={({field})=>(<FormItem><FormLabel>Debt 2 Balance</FormLabel><FormControl>{num('e.g., 3000',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="debt2Rate" render={({field})=>(<FormItem><FormLabel>Debt 2 Rate (%)</FormLabel><FormControl>{num('e.g., 12',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="debt2MinPayment" render={({field})=>(<FormItem><FormLabel>Debt 2 Min Payment</FormLabel><FormControl>{num('e.g., 100',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="strategy" render={({field})=>(<FormItem><FormLabel>Preferred Strategy (optional)</FormLabel><FormControl><Input placeholder="snowball or avalanche" {...field as any} value={field.value??''} onChange={e=>field.onChange((e.target.value as any)||undefined)} /></FormControl><FormMessage/></FormItem>)} />
              </div>
              <Button type="submit" className="w-full md:w-auto">Calculate</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result&&(
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Results & Insights</CardTitle><CardDescription>Strategy comparison</CardDescription></CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Snowball Months</p><p className="text-2xl font-bold">{result.snowballMonths}</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Avalanche Months</p><p className="text-2xl font-bold">{result.avalancheMonths}</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Snowball Interest</p><p className="text-2xl font-bold">{result.snowballInterest.toFixed(2)}</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Avalanche Interest</p><p className="text-2xl font-bold">{result.avalancheInterest.toFixed(2)}</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Better Strategy</p><p className={`text-2xl font-bold ${result.better==='Avalanche'?'text-blue-600':'text-green-600'}`}>{result.better}</p></div>
            </div>
            <div><h4 className="font-semibold mb-2">Interpretation</h4><p className="text-muted-foreground">{result.interpretation}</p></div>
            <div><h4 className="font-semibold mb-2">Suggestions</h4><ul className="list-disc pl-6 text-muted-foreground space-y-1">{result.suggestions.map((s,i)=>(<li key={i}>{s}</li>))}</ul></div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Related Calculators</CardTitle><CardDescription>Debt repayment</CardDescription></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/credit-card-payoff-calculator" className="text-primary hover:underline">Credit Card Payoff Calculator</a></h4><p className="text-sm text-muted-foreground">Payoff planning.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/dti-ratio-calculator" className="text-primary hover:underline">Debt-to-Income Ratio</a></h4><p className="text-sm text-muted-foreground">DTI analysis.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/monthly-budget-planner-calculator" className="text-primary hover:underline">Monthly Budget Planner</a></h4><p className="text-sm text-muted-foreground">Budget management.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/credit-utilization-ratio-calculator" className="text-primary hover:underline">Credit Utilization Ratio</a></h4><p className="text-sm text-muted-foreground">Credit health.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Complete Guide to Debt Repayment Strategies</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none"><p>Placeholder guide content.</p><p>Explain snowball vs avalanche methods, implementation, and psychological factors.</p></CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Frequently Asked Questions</CardTitle><CardDescription>Debt repayment strategies</CardDescription></CardHeader>
        <CardContent className="space-y-6">
          <div><h4 className="font-semibold mb-2">What is the debt snowball method?</h4><p className="text-muted-foreground">Pay minimums on all debts, put extra toward smallest balance first; provides quick wins and motivation.</p></div>
          <div><h4 className="font-semibold mb-2">What is the debt avalanche method?</h4><p className="text-muted-foreground">Pay minimums on all debts, put extra toward highest interest rate first; minimizes total interest paid.</p></div>
          <div><h4 className="font-semibold mb-2">Which saves more money?</h4><p className="text-muted-foreground">Avalanche typically saves more in interest; snowball may finish faster if small debts have high rates.</p></div>
          <div><h4 className="font-semibold mb-2">Which is psychologically better?</h4><p className="text-muted-foreground">Snowball provides early wins and motivation; many find it easier to stick with than avalanche.</p></div>
          <div><h4 className="font-semibold mb-2">Can I combine both strategies?</h4><p className="text-muted-foreground">Start with snowball for quick wins, then switch to avalanche; or use avalanche but keep smallest debt for motivation.</p></div>
          <div><h4 className="font-semibold mb-2">What if rates are similar?</h4><p className="text-muted-foreground">Use snowball if rates are close; the motivation boost may outweigh small interest difference.</p></div>
          <div><h4 className="font-semibold mb-2">Should I include all debts?</h4><p className="text-muted-foreground">Include credit cards, personal loans, auto loans; exclude mortgage unless paying off aggressively.</p></div>
          <div><h4 className="font-semibold mb-2">How much extra should I pay?</h4><p className="text-muted-foreground">As much as possible; even $50-100 extra monthly makes significant difference; prioritize debt payoff over other goals.</p></div>
          <div><h4 className="font-semibold mb-2">What about debt consolidation?</h4><p className="text-muted-foreground">Consider if rate is lower than current rates; simplifies payments but may extend timeline; compare carefully.</p></div>
          <div><h4 className="font-semibold mb-2">How long does payoff take?</h4><p className="text-muted-foreground">Depends on debt amounts and extra payments; typically 2-5 years for consumer debt with consistent effort.</p></div>
        </CardContent>
      </Card>
    </div>
  );
}

