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
  carPrice: z.number().min(0).optional(),
  loanTerm: z.number().min(0).max(120).optional(),
  loanRate: z.number().min(0).max(100).optional(),
  downPayment: z.number().min(0).optional(),
  leaseMonthly: z.number().min(0).optional(),
  leaseTerm: z.number().min(0).max(60).optional(),
  residualValue: z.number().min(0).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function CarPurchaseLoanVsLeaseCalculator() {
  const [result,setResult]=useState<{loanTotal:number; leaseTotal:number; difference:number; better:string; interpretation:string; suggestions:string[]}|null>(null);
  const form=useForm<FormValues>({resolver:zodResolver(formSchema),defaultValues:{carPrice:undefined as unknown as number,loanTerm:undefined as unknown as number,loanRate:undefined as unknown as number,downPayment:undefined as unknown as number,leaseMonthly:undefined as unknown as number,leaseTerm:undefined as unknown as number,residualValue:undefined as unknown as number}});

  const onSubmit=(v:FormValues)=>{
    if(v.carPrice===undefined||v.loanTerm===undefined||v.loanRate===undefined||v.downPayment===undefined||v.leaseMonthly===undefined||v.leaseTerm===undefined){ setResult(null); return; }
    const r=v.loanRate/100/12;
    const principal=v.carPrice-v.downPayment;
    const monthlyLoan=r>0?(principal*r*Math.pow(1+r,v.loanTerm))/(Math.pow(1+r,v.loanTerm)-1):principal/v.loanTerm;
    const loanTotal=v.downPayment+(monthlyLoan*v.loanTerm);
    const leaseTotal=v.leaseMonthly*v.leaseTerm;
    const diff=Math.abs(loanTotal-leaseTotal);
    const better=loanTotal<leaseTotal?'Loan':'Lease';
    const interp=`Loan total: ${loanTotal.toFixed(2)}, Lease total: ${leaseTotal.toFixed(2)}. ${better} saves ${diff.toFixed(2)} over term.`;
    setResult({loanTotal,leaseTotal,difference:diff,better,interpretation:interp,suggestions:['Loan: you own car at end, build equity, unlimited mileage, customization allowed.','Lease: lower monthly payments, newer car every few years, no resale hassle, mileage limits.','Consider usage: high mileage favors loan; low mileage and frequent upgrades favor lease.','Factor in maintenance, insurance differences, and end-of-term options (buyout vs return).']});
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
          <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" /> Car Purchase Loan vs Lease Calculator</CardTitle>
          <CardDescription>Compare total cost of buying a car with a loan versus leasing to determine the better financial option.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <FormField control={form.control} name="carPrice" render={({field})=>(<FormItem><FormLabel>Car Price</FormLabel><FormControl>{num('e.g., 30000',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="loanTerm" render={({field})=>(<FormItem><FormLabel>Loan Term (months)</FormLabel><FormControl>{num('e.g., 60',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="loanRate" render={({field})=>(<FormItem><FormLabel>Loan Interest Rate (%)</FormLabel><FormControl>{num('e.g., 5',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="downPayment" render={({field})=>(<FormItem><FormLabel>Down Payment</FormLabel><FormControl>{num('e.g., 5000',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="leaseMonthly" render={({field})=>(<FormItem><FormLabel>Lease Monthly Payment</FormLabel><FormControl>{num('e.g., 400',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="leaseTerm" render={({field})=>(<FormItem><FormLabel>Lease Term (months)</FormLabel><FormControl>{num('e.g., 36',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="residualValue" render={({field})=>(<FormItem><FormLabel>Residual Value (optional)</FormLabel><FormControl>{num('e.g., 15000',field)}</FormControl><FormMessage/></FormItem>)} />
              </div>
              <Button type="submit" className="w-full md:w-auto">Calculate</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result&&(
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Results & Insights</CardTitle><CardDescription>Loan vs lease comparison</CardDescription></CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Loan Total Cost</p><p className="text-2xl font-bold">{result.loanTotal.toFixed(2)}</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Lease Total Cost</p><p className="text-2xl font-bold">{result.leaseTotal.toFixed(2)}</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Difference</p><p className="text-2xl font-bold">{result.difference.toFixed(2)}</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Better Option</p><p className={`text-2xl font-bold ${result.better==='Loan'?'text-green-600':'text-blue-600'}`}>{result.better}</p></div>
            </div>
            <div><h4 className="font-semibold mb-2">Interpretation</h4><p className="text-muted-foreground">{result.interpretation}</p></div>
            <div><h4 className="font-semibold mb-2">Suggestions</h4><ul className="list-disc pl-6 text-muted-foreground space-y-1">{result.suggestions.map((s,i)=>(<li key={i}>{s}</li>))}</ul></div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Related Calculators</CardTitle><CardDescription>Auto financing</CardDescription></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/loan-emi-calculator" className="text-primary hover:underline">Loan EMI Calculator</a></h4><p className="text-sm text-muted-foreground">Loan payments.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/amortization-schedule-generator" className="text-primary hover:underline">Amortization Schedule</a></h4><p className="text-sm text-muted-foreground">Payment breakdown.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/monthly-budget-planner-calculator" className="text-primary hover:underline">Monthly Budget Planner</a></h4><p className="text-sm text-muted-foreground">Budget impact.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/dti-ratio-calculator" className="text-primary hover:underline">Debt-to-Income Ratio</a></h4><p className="text-sm text-muted-foreground">Affordability check.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Complete Guide to Car Loan vs Lease</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none"><p>Placeholder guide content.</p><p>Explain loan vs lease pros/cons, total cost analysis, and decision factors.</p></CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Frequently Asked Questions</CardTitle><CardDescription>Loan vs lease</CardDescription></CardHeader>
        <CardContent className="space-y-6">
          <div><h4 className="font-semibold mb-2">What is the difference between loan and lease?</h4><p className="text-muted-foreground">Loan: buy car, make payments, own at end; Lease: rent car, return at end or buy out, lower monthly payments.</p></div>
          <div><h4 className="font-semibold mb-2">Which costs less overall?</h4><p className="text-muted-foreground">Loan typically costs more upfront but you own car; lease costs less monthly but no ownership; depends on terms and usage.</p></div>
          <div><h4 className="font-semibold mb-2">What are advantages of buying?</h4><p className="text-muted-foreground">Ownership, no mileage limits, can customize, build equity, keep car after loan paid, unlimited use.</p></div>
          <div><h4 className="font-semibold mb-2">What are advantages of leasing?</h4><p className="text-muted-foreground">Lower monthly payments, drive new car every few years, warranty coverage, no resale hassle, tax benefits for business use.</p></div>
          <div><h4 className="font-semibold mb-2">How does mileage affect lease vs buy?</h4><p className="text-muted-foreground">Leases have mileage limits (10-15k/year); excess miles cost 15-25 cents/mile; high mileage favors buying.</p></div>
          <div><h4 className="font-semibold mb-2">What about wear and tear on lease?</h4><p className="text-muted-foreground">Lease charges for excess wear; scratches, dents, and interior damage assessed at return; buying avoids these charges.</p></div>
          <div><h4 className="font-semibold mb-2">Can I negotiate lease terms?</h4><p className="text-muted-foreground">Yes—negotiate capitalized cost (purchase price), residual value, money factor, and lease terms like buying does.</p></div>
          <div><h4 className="font-semibold mb-2">What happens at end of lease?</h4><p className="text-muted-foreground">Return car (pay excess wear/miles), buy car at residual value, or lease another car; three options.</p></div>
          <div><h4 className="font-semibold mb-2">Should I lease or buy if I want new cars often?</h4><p className="text-muted-foreground">Lease if you want new car every 2-3 years; lower payments and no trade-in negotiation; buying requires selling/trading.</p></div>
          <div><h4 className="font-semibold mb-2">What about insurance costs?</h4><p className="text-muted-foreground">Leased cars often require higher coverage; gap insurance may be needed; compare insurance costs for both options.</p></div>
        </CardContent>
      </Card>
    </div>
  );
}

