'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Info } from 'lucide-react';

const formSchema = z.object({
  purchasePrice: z.number().min(0).optional(),
  monthlyRent: z.number().min(0).optional(),
  vacancyRatePct: z.number().min(0).max(100).optional(),
  monthlyExpenses: z.number().min(0).optional(), // taxes+ins+maint+mgmt+hoa total
});

type FormValues = z.infer<typeof formSchema>;

export default function RentalYieldCalculator(){
  const [result,setResult]=useState<null|{grossYieldPct:number; netYieldPct:number; noi:number; interpretation:string; altVacancy?:number; altNetYield?:number}>(null);
  const [whatIfVacancy,setWhatIfVacancy]=useState<number|null>(null);

  const form=useForm<FormValues>({resolver:zodResolver(formSchema), defaultValues:{purchasePrice:undefined as unknown as number, monthlyRent:undefined as unknown as number, vacancyRatePct:undefined as unknown as number, monthlyExpenses:undefined as unknown as number}});

  const num=(ph:string,field:any)=>(<Input type="number" step="0.01" placeholder={ph} {...field} value={Number.isFinite(field.value as any)?(field.value as any):''} onChange={e=>{const v=e.target.value; const n=v===''?undefined:Number(v); field.onChange(Number.isFinite(n as any)?n:undefined);}} />);

  const onSubmit=(v:FormValues)=>{
    if(v.purchasePrice===undefined||v.monthlyRent===undefined||v.vacancyRatePct===undefined||v.monthlyExpenses===undefined){ setResult(null); return; }
    const annualRent=v.monthlyRent*12;
    const grossYield= v.purchasePrice>0 ? (annualRent/v.purchasePrice)*100 : 0;
    const effectiveRent= annualRent*(1 - v.vacancyRatePct/100);
    const expensesAnnual=(v.monthlyExpenses||0)*12;
    const noi = effectiveRent - expensesAnnual;
    const netYield = v.purchasePrice>0 ? (noi / v.purchasePrice) * 100 : 0;
    let interpretation = `Gross yield: ${grossYield.toFixed(1)}%. Net yield (after vacancy ${v.vacancyRatePct.toFixed(1)}% and expenses $${expensesAnnual.toFixed(0)}/yr): ${netYield.toFixed(1)}%.`;
    interpretation += netYield>=6? ' This looks strong for many markets.':' Consider improving rent, reducing costs, or negotiating price.';
    setResult({grossYieldPct:grossYield, netYieldPct:netYield, noi, interpretation});
  };

  const altYield=(vac:number)=>{
    const price=(form.getValues('purchasePrice')||0); const rent=(form.getValues('monthlyRent')||0); const exp=(form.getValues('monthlyExpenses')||0);
    const eff= rent*12*(1 - vac/100); const noi=eff - exp*12; return price>0? (noi/price)*100 : 0;
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5"/> Rental Yield Calculator</CardTitle>
          <CardDescription>Compute gross and net rental yield using rent, vacancy, and operating expenses.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <FormField control={form.control} name="purchasePrice" render={({field})=>(<FormItem><FormLabel>Purchase Price ($)</FormLabel><FormControl>{num('e.g., 300000',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="monthlyRent" render={({field})=>(<FormItem><FormLabel>Monthly Rent ($)</FormLabel><FormControl>{num('e.g., 2200',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="vacancyRatePct" render={({field})=>(<FormItem><FormLabel>Vacancy Rate (%)</FormLabel><FormControl>{num('e.g., 5',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="monthlyExpenses" render={({field})=>(<FormItem><FormLabel>Monthly Operating Expenses ($)</FormLabel><FormControl>{num('taxes+ins+mgmt+hoa',field)}</FormControl><FormMessage/></FormItem>)} />
              </div>
              <Button type="submit" className="w-full md:w-auto">Calculate</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Results</CardTitle>
            <CardDescription>Interactive vacancy sensitivity.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div><div className="text-sm text-muted-foreground">Gross Yield</div><div className="text-2xl font-semibold">{result.grossYieldPct.toFixed(1)}%</div></div>
              <div><div className="text-sm text-muted-foreground">Net Yield</div><div className="text-2xl font-semibold">{result.netYieldPct.toFixed(1)}%</div></div>
              <div><div className="text-sm text-muted-foreground">NOI (annual)</div><div className="text-2xl font-semibold">${result.noi.toFixed(0)}</div></div>
            </div>
            <p className="text-sm leading-6">{result.interpretation}</p>
            <div className="rounded-md border p-3">
              <div className="flex items-center gap-2 font-medium mb-2"><Info className="h-4 w-4"/> What-if: Vacancy</div>
              <div className="flex flex-wrap gap-2">
                {[0,3,5,8,10].map(v=> (
                  <Button key={v} variant={(whatIfVacancy===v)?'default':'secondary'} onClick={()=>setWhatIfVacancy(v)}>{v}%</Button>
                ))}
              </div>
              {whatIfVacancy!==null && (
                <div className="mt-2 text-sm">At {whatIfVacancy}% vacancy, net yield ≈ {altYield(whatIfVacancy).toFixed(1)}%.</div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Guide</CardTitle>
          <CardDescription>Compare to your market’s risk-adjusted target return after financing.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-6 space-y-2 text-sm">
            <li>Net yield excludes financing; include mortgage to evaluate cash-on-cash later.</li>
            <li>Vacancy can swing returns substantially—stress test in tougher scenarios.</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Related Calculators</CardTitle>
          <CardDescription>Real‑estate income metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/real-estate-cap-rate-sensitivity-calculator" className="text-primary hover:underline">Cap Rate Sensitivity</a></h4><p className="text-sm text-muted-foreground">Value vs NOI and cap rate.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/gross-rent-multiplier-grm-calculator" className="text-primary hover:underline">Gross Rent Multiplier (GRM)</a></h4><p className="text-sm text-muted-foreground">Price relative to rent.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/dscr-calculator" className="text-primary hover:underline">DSCR</a></h4><p className="text-sm text-muted-foreground">Debt service coverage ratio.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/loan-to-value-ltv-ratio-calculator" className="text-primary hover:underline">Loan‑to‑Value (LTV)</a></h4><p className="text-sm text-muted-foreground">Leverage vs value.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Frequently Asked Questions</CardTitle>
          <CardDescription>Deep answers about rental yields and assumptions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div><h4 className="font-semibold mb-2">What is the difference between gross and net rental yield?</h4><p className="text-muted-foreground">Gross yield uses annual rent ÷ purchase price. Net yield subtracts operating expenses and vacancy first, giving a truer measure of property performance before financing.</p></div>
          <div><h4 className="font-semibold mb-2">Which expenses should be included?</h4><p className="text-muted-foreground">Include property taxes, insurance, repairs/maintenance, management fees, utilities you pay, HOA/condo fees, and a reserve allowance. Exclude mortgage costs for a clean operating view.</p></div>
          <div><h4 className="font-semibold mb-2">How should I model vacancy?</h4><p className="text-muted-foreground">Use market vacancy data or at least 5–8% as a baseline. For student or short‑term rentals, seasonality can raise effective vacancy—stress test higher rates.</p></div>
          <div><h4 className="font-semibold mb-2">What’s a good net yield?</h4><p className="text-muted-foreground">It depends on risk, location, and growth expectations. Many investors seek 5–8% net yield before financing in balanced markets; higher yields may imply greater risk or deferred maintenance.</p></div>
          <div><h4 className="font-semibold mb-2">How do cap rates relate to yield?</h4><p className="text-muted-foreground">Cap rate equals NOI ÷ property value. Net yield in this tool is NOI ÷ purchase price—numerically similar when purchase price reflects market value.</p></div>
          <div><h4 className="font-semibold mb-2">Should I include appreciation in my return?</h4><p className="text-muted-foreground">Yield measures current income productivity. For total return, combine expected appreciation with net yield and financing effects (amortization and leverage).</p></div>
          <div><h4 className="font-semibold mb-2">How do repairs and CapEx differ?</h4><p className="text-muted-foreground">Repairs keep the property rentable; CapEx are large, infrequent replacements (roof, HVAC). Budget a separate CapEx reserve to avoid overstating yield.</p></div>
          <div><h4 className="font-semibold mb-2">Can self‑management inflate yield?</h4><p className="text-muted-foreground">If you self‑manage, include a notional management fee (e.g., 8–10%) to value your time and maintain comparable metrics to professionally managed properties.</p></div>
          <div><h4 className="font-semibold mb-2">Does rent growth change yield?</h4><p className="text-muted-foreground">Yes—rising rents can improve yield if expenses grow slower. However, property taxes and insurance often rise with rents and valuations, partially offsetting gains.</p></div>
          <div><h4 className="font-semibold mb-2">How do I compare two properties with different prices?</h4><p className="text-muted-foreground">Normalize using net yield and cap rate. Then layer in location quality, tenant risk, renovation needs, and appreciation potential to choose the stronger risk‑adjusted opportunity.</p></div>
        </CardContent>
      </Card>
    </div>
  );
}


