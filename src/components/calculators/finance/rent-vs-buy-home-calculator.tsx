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
  homePrice: z.number().min(0).optional(),
  downPaymentPercent: z.number().min(0).max(100).optional(),
  mortgageRate: z.number().min(0).optional(),
  termYears: z.number().min(1).optional(),
  propertyTaxRate: z.number().min(0).optional(),
  maintenancePercent: z.number().min(0).optional(),
  homeAppreciation: z.number().optional(),
  rentPerMonth: z.number().min(0).optional(),
  rentGrowthPercent: z.number().optional(),
  investmentReturnPercent: z.number().optional(),
  horizonYears: z.number().min(1).optional(),
});

type FormValues = z.infer<typeof formSchema>;

function monthlyPayment(P:number, annualRate:number, nYears:number){
  const r=annualRate/100/12; const n=nYears*12;
  if(r===0) return P/n;
  return P*r/(1-Math.pow(1+r,-n));
}

export default function RentVsBuyHomeCalculator() {
  const [result,setResult]=useState<{totalOwnCost:number; totalRentCost:number; ownNetPosition:number; interpretation:string; suggestions:string[]}|null>(null);
  const form=useForm<FormValues>({resolver:zodResolver(formSchema),defaultValues:{homePrice:undefined as unknown as number,downPaymentPercent:undefined as unknown as number,mortgageRate:undefined as unknown as number,termYears:undefined as unknown as number,propertyTaxRate:undefined as unknown as number,maintenancePercent:undefined as unknown as number,homeAppreciation:undefined as unknown as number,rentPerMonth:undefined as unknown as number,rentGrowthPercent:undefined as unknown as number,investmentReturnPercent:undefined as unknown as number,horizonYears:undefined as unknown as number}});

  const onSubmit=(v:FormValues)=>{
    if(v.homePrice===undefined||v.downPaymentPercent===undefined||v.mortgageRate===undefined||v.termYears===undefined||v.propertyTaxRate===undefined||v.maintenancePercent===undefined||v.homeAppreciation===undefined||v.rentPerMonth===undefined||v.rentGrowthPercent===undefined||v.investmentReturnPercent===undefined||v.horizonYears===undefined){ setResult(null); return; }
    const dp = v.homePrice * (v.downPaymentPercent/100);
    const loan = v.homePrice - dp;
    const pay = monthlyPayment(loan, v.mortgageRate, v.termYears);
    // Simplified totals over horizon
    let totalMortgage = 0; let totalTax=0; let totalMaint=0; let equity = dp; // start with down payment as equity
    for(let y=1;y<=v.horizonYears;y++){
      totalMortgage += pay*12;
      totalTax += v.homePrice * (v.propertyTaxRate/100);
      totalMaint += v.homePrice * (v.maintenancePercent/100);
      // appreciate home price annually
      v.homePrice = v.homePrice * (1 + (v.homeAppreciation/100));
    }
    const ownAssetValue = v.homePrice;
    equity += ownAssetValue; // simplistic: treat asset value as equity proxy at horizon (ignores amortization)
    const totalOwnCost = totalMortgage + totalTax + totalMaint; // ignores transaction costs and tax benefits

    // Renting
    let totalRent=0; let rent=v.rentPerMonth;
    for(let y=1;y<=v.horizonYears;y++){
      totalRent += rent*12;
      rent = rent * (1 + (v.rentGrowthPercent/100));
    }
    // Invest down payment alternative
    const investFV = dp * Math.pow(1 + (v.investmentReturnPercent/100), v.horizonYears);

    const ownNetPosition = equity - totalOwnCost;
    const rentNetPosition = investFV - totalRent;
    const interpretation = ownNetPosition>=rentNetPosition
      ? `Buying looks better by ${(ownNetPosition - rentNetPosition).toFixed(0)} over ${v.horizonYears} years (simplified).`
      : `Renting looks better by ${(rentNetPosition - ownNetPosition).toFixed(0)} over ${v.horizonYears} years (simplified).`;

    setResult({totalOwnCost, totalRentCost: totalRent, ownNetPosition, interpretation, suggestions:[
      'Refine with amortization schedule, tax deductions, insurance, and HOA fees.',
      'Stress test with higher rates, slower appreciation, and faster rent growth.',
      'Include buyers’ closing costs and sellers’ costs at exit to improve accuracy.',
      'Consider flexibility needs: moving plans favor renting despite cost parity.'
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
          <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" /> Rent vs Buy Home Calculator</CardTitle>
          <CardDescription>Compare long-term costs of renting versus buying a home (simplified model).</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <FormField control={form.control} name="homePrice" render={({field})=>(<FormItem><FormLabel>Home Price</FormLabel><FormControl>{num('e.g., 500000',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="downPaymentPercent" render={({field})=>(<FormItem><FormLabel>Down Payment (%)</FormLabel><FormControl>{num('e.g., 20',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="mortgageRate" render={({field})=>(<FormItem><FormLabel>Mortgage Rate (%)</FormLabel><FormControl>{num('e.g., 6.5',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="termYears" render={({field})=>(<FormItem><FormLabel>Term (years)</FormLabel><FormControl>{num('e.g., 30',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="propertyTaxRate" render={({field})=>(<FormItem><FormLabel>Property Tax (%/yr)</FormLabel><FormControl>{num('e.g., 1.2',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="maintenancePercent" render={({field})=>(<FormItem><FormLabel>Maintenance (%/yr)</FormLabel><FormControl>{num('e.g., 1.0',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="homeAppreciation" render={({field})=>(<FormItem><FormLabel>Home Appreciation (%/yr)</FormLabel><FormControl>{num('e.g., 3',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="rentPerMonth" render={({field})=>(<FormItem><FormLabel>Rent per Month</FormLabel><FormControl>{num('e.g., 2500',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="rentGrowthPercent" render={({field})=>(<FormItem><FormLabel>Rent Growth (%/yr)</FormLabel><FormControl>{num('e.g., 3',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="investmentReturnPercent" render={({field})=>(<FormItem><FormLabel>Investment Return (%/yr)</FormLabel><FormControl>{num('e.g., 5',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="horizonYears" render={({field})=>(<FormItem><FormLabel>Horizon (years)</FormLabel><FormControl>{num('e.g., 7',field)}</FormControl><FormMessage/></FormItem>)} />
              </div>
              <Button type="submit" className="w-full md:w-auto">Calculate</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result&&(
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Results & Insights</CardTitle><CardDescription>Rent vs buy comparison</CardDescription></CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Total Owning Cost</p><p className="text-2xl font-bold">{result.totalOwnCost.toFixed(0)}</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Total Rent Cost</p><p className="text-2xl font-bold">{result.totalRentCost.toFixed(0)}</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Owner Net Position</p><p className={`text-2xl font-bold ${result.ownNetPosition>=0?'text-green-600':'text-red-600'}`}>{result.ownNetPosition.toFixed(0)}</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Interpretation</p><p className="font-medium">{result.interpretation}</p></div>
            </div>
            <div><h4 className="font-semibold mb-2">Suggestions</h4><ul className="list-disc pl-6 text-muted-foreground space-y-1">{result.suggestions.map((s,i)=>(<li key={i}>{s}</li>))}</ul></div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Related Calculators</CardTitle><CardDescription>Home decisions</CardDescription></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/mortgage-payment-calculator" className="text-primary hover:underline">Mortgage Payment</a></h4><p className="text-sm text-muted-foreground">Monthly payment.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/house-down-payment-savings-calculator" className="text-primary hover:underline">Down Payment Savings</a></h4><p className="text-sm text-muted-foreground">Save for DP.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/interest-only-loan-payment-calculator" className="text-primary hover:underline">Interest-only Loan</a></h4><p className="text-sm text-muted-foreground">Compare IO.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/monthly-budget-planner-calculator" className="text-primary hover:underline">Monthly Budget Planner</a></h4><p className="text-sm text-muted-foreground">Budget impact.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Complete Guide to Rent vs Buy</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none"><p>Placeholder guide content.</p><p>Explain assumptions, costs, and opportunity cost of capital.</p></CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Frequently Asked Questions</CardTitle><CardDescription>Rent vs buy</CardDescription></CardHeader>
        <CardContent className="space-y-6">
          <div><h4 className="font-semibold mb-2">What factors drive rent vs buy decisions?</h4><p className="text-muted-foreground">Horizon length, interest rates, local appreciation, rent growth, taxes, and personal flexibility needs all affect the outcome.</p></div>
          <div><h4 className="font-semibold mb-2">How does opportunity cost influence results?</h4><p className="text-muted-foreground">Down payment cash invested elsewhere may compound; accounting for its return can tilt results toward renting in some cases.</p></div>
          <div><h4 className="font-semibold mb-2">Should I include tax deductions?</h4><p className="text-muted-foreground">Yes. Mortgage interest and property tax deductions can lower owning cost depending on your tax situation; consult a tax professional.</p></div>
          <div><h4 className="font-semibold mb-2">What about transaction costs?</h4><p className="text-muted-foreground">Include buyers’ closing costs and sellers’ costs (agent fees, transfer taxes) when modeling shorter horizons; they materially affect outcomes.</p></div>
          <div><h4 className="font-semibold mb-2">How sensitive are results to appreciation?</h4><p className="text-muted-foreground">Very. Lower appreciation or price declines reduce owner equity; run downside scenarios before deciding.</p></div>
          <div><h4 className="font-semibold mb-2">Is renting always cheaper short-term?</h4><p className="text-muted-foreground">Often, due to lower upfront costs; but persistent rent growth can make buying attractive if you stay long enough.</p></div>
          <div><h4 className="font-semibold mb-2">How long should my horizon be?</h4><p className="text-muted-foreground">Many markets require 5–7 years to overcome transaction costs of buying; frequent moves favor renting.</p></div>
          <div><h4 className="font-semibold mb-2">What non-financial factors matter?</h4><p className="text-muted-foreground">Stability, customization, school districts, and commute trade-offs may outweigh purely financial considerations.</p></div>
        </CardContent>
      </Card>
    </div>
  );
}





