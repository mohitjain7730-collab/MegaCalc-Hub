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
  currentBalance: z.number().min(0).optional(),
  currentAPR: z.number().min(0).max(100).optional(),
  transferFee: z.number().min(0).max(100).optional(),
  newAPR: z.number().min(0).max(100).optional(),
  monthlyPayment: z.number().min(0).optional(),
  promotionalMonths: z.number().min(0).max(60).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function BalanceTransferCreditCardSavingsCalculator() {
  const [result,setResult]=useState<{oldTotalInterest:number; newTotalInterest:number; savings:number; breakEvenMonths:number; interpretation:string; suggestions:string[]}|null>(null);
  const form=useForm<FormValues>({resolver:zodResolver(formSchema),defaultValues:{currentBalance:undefined as unknown as number,currentAPR:undefined as unknown as number,transferFee:undefined as unknown as number,newAPR:undefined as unknown as number,monthlyPayment:undefined as unknown as number,promotionalMonths:undefined as unknown as number}});

  const onSubmit=(v:FormValues)=>{
    if(v.currentBalance===undefined||v.currentAPR===undefined||v.transferFee===undefined||v.newAPR===undefined||v.monthlyPayment===undefined||v.promotionalMonths===undefined||v.monthlyPayment===0){ setResult(null); return; }
    const rOld=v.currentAPR/100/12; const rNew=v.newAPR/100/12;
    let balOld=v.currentBalance; let monthsOld=0; let intOld=0; const maxMonths=120;
    while(balOld>0.01&&monthsOld<maxMonths){ const int=balOld*rOld; const pay=Math.min(balOld+int,v.monthlyPayment); intOld+=int; balOld=Math.max(0,balOld+int-pay); monthsOld++; }
    let balNew=v.currentBalance+v.currentBalance*(v.transferFee/100); let monthsNew=0; let intNew=0;
    while(balNew>0.01&&monthsNew<maxMonths){ const rate=monthsNew<v.promotionalMonths?0:rNew; const int=balNew*rate; const pay=Math.min(balNew+int,v.monthlyPayment); intNew+=int; balNew=Math.max(0,balNew+int-pay); monthsNew++; }
    const savings=intOld-intNew-v.currentBalance*(v.transferFee/100);
    const breakEven=savings>0?Math.ceil((v.currentBalance*(v.transferFee/100))/(intOld-intNew)*monthsOld):0;
    const interp=`Savings: ${savings.toFixed(2)}. Break-even: ${breakEven} months. Old interest: ${intOld.toFixed(2)}, New: ${intNew.toFixed(2)}.`;
    setResult({oldTotalInterest:intOld,newTotalInterest:intNew,savings,breakEvenMonths:breakEven,interpretation:interp,suggestions:['Balance transfers save money if promotional rate is low and balance is paid quickly.','Consider transfer fee vs interest savings; break-even typically 6-12 months.','Pay off balance before promotional period ends to avoid high post-promo rates.','Avoid new purchases on transfer card; focus on paying down transferred balance.']});
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
          <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" /> Balance Transfer Credit Card Savings Calculator</CardTitle>
          <CardDescription>Calculate potential savings from transferring credit card balance to a card with lower APR or promotional rate.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField control={form.control} name="currentBalance" render={({field})=>(<FormItem><FormLabel>Current Balance</FormLabel><FormControl>{num('e.g., 10000',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="currentAPR" render={({field})=>(<FormItem><FormLabel>Current APR (%)</FormLabel><FormControl>{num('e.g., 24',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="transferFee" render={({field})=>(<FormItem><FormLabel>Transfer Fee (%)</FormLabel><FormControl>{num('e.g., 3',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="newAPR" render={({field})=>(<FormItem><FormLabel>New/Promo APR (%)</FormLabel><FormControl>{num('e.g., 0',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="monthlyPayment" render={({field})=>(<FormItem><FormLabel>Monthly Payment</FormLabel><FormControl>{num('e.g., 300',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="promotionalMonths" render={({field})=>(<FormItem><FormLabel>Promotional Months</FormLabel><FormControl>{num('e.g., 18',field)}</FormControl><FormMessage/></FormItem>)} />
              </div>
              <Button type="submit" className="w-full md:w-auto">Calculate</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result&&(
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Results & Insights</CardTitle><CardDescription>Balance transfer analysis</CardDescription></CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Old Total Interest</p><p className="text-2xl font-bold">{result.oldTotalInterest.toFixed(2)}</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">New Total Interest</p><p className="text-2xl font-bold">{result.newTotalInterest.toFixed(2)}</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Total Savings</p><p className={`text-2xl font-bold ${result.savings>=0?'text-green-600':'text-red-600'}`}>{result.savings.toFixed(2)}</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Break-Even (months)</p><p className="text-2xl font-bold">{result.breakEvenMonths}</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Interpretation</p><p className="font-medium">{result.interpretation}</p></div>
            </div>
            <div><h4 className="font-semibold mb-2">Suggestions</h4><ul className="list-disc pl-6 text-muted-foreground space-y-1">{result.suggestions.map((s,i)=>(<li key={i}>{s}</li>))}</ul></div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Related Calculators</CardTitle><CardDescription>Credit card management</CardDescription></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/credit-card-payoff-calculator" className="text-primary hover:underline">Credit Card Payoff Calculator</a></h4><p className="text-sm text-muted-foreground">Payoff planning.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/credit-utilization-ratio-calculator" className="text-primary hover:underline">Credit Utilization Ratio</a></h4><p className="text-sm text-muted-foreground">Credit health.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/debt-snowball-avalanche-repayment-calculator" className="text-primary hover:underline">Debt Repayment Calculator</a></h4><p className="text-sm text-muted-foreground">Repayment strategies.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/monthly-budget-planner-calculator" className="text-primary hover:underline">Monthly Budget Planner</a></h4><p className="text-sm text-muted-foreground">Budget management.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Complete Guide to Balance Transfers</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none"><p>Placeholder guide content.</p><p>Explain transfer fees, promotional rates, break-even analysis, and best practices.</p></CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Frequently Asked Questions</CardTitle><CardDescription>Balance transfers</CardDescription></CardHeader>
        <CardContent className="space-y-6">
          <div><h4 className="font-semibold mb-2">What is a balance transfer?</h4><p className="text-muted-foreground">Moving debt from one credit card to another with lower interest rate, often with promotional 0% APR period.</p></div>
          <div><h4 className="font-semibold mb-2">How much does a balance transfer cost?</h4><p className="text-muted-foreground">Typically 3-5% of transferred amount or flat fee ($5-10); compare fee to interest savings to determine if worth it.</p></div>
          <div><h4 className="font-semibold mb-2">When is a balance transfer worth it?</h4><p className="text-muted-foreground">If promotional rate saves more than transfer fee over payoff period; break-even usually 6-12 months.</p></div>
          <div><h4 className="font-semibold mb-2">What happens after promotional period?</h4><p className="text-muted-foreground">Standard APR applies (often high 18-25%); pay off balance before promo ends to maximize savings.</p></div>
          <div><h4 className="font-semibold mb-2">Can I transfer multiple times?</h4><p className="text-muted-foreground">Yes—but each transfer adds fees; only worthwhile if you pay off balance quickly or get another 0% promo.</p></div>
          <div><h4 className="font-semibold mb-2">Does balance transfer affect credit score?</h4><p className="text-muted-foreground">Hard inquiry lowers score slightly; opening new card may lower average account age; but paying down debt improves score.</p></div>
          <div><h4 className="font-semibold mb-2">Should I close old card after transfer?</h4><p className="text-muted-foreground">Usually no—closing reduces available credit, increasing utilization; keep open if no annual fee unless overspending risk.</p></div>
          <div><h4 className="font-semibold mb-2">What if I can't pay off before promo ends?</h4><p className="text-muted-foreground">Transfer again to new 0% card if available, or pay aggressively; post-promo rates are typically high.</p></div>
          <div><h4 className="font-semibold mb-2">Can I make purchases on transfer card?</h4><p className="text-muted-foreground">Avoid if possible—new purchases may not get promotional rate; focus on paying transferred balance first.</p></div>
          <div><h4 className="font-semibold mb-2">How to maximize balance transfer savings?</h4><p className="text-muted-foreground">Choose longest promotional period, lowest transfer fee, pay aggressively, avoid new purchases, pay off before promo ends.</p></div>
        </CardContent>
      </Card>
    </div>
  );
}

