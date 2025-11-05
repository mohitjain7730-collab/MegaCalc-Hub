'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Info, Activity } from 'lucide-react';

const formSchema = z.object({
  purchasePrice: z.number().min(0).optional(),
  annualGrossRent: z.number().min(0).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function GRMCalculator(){
  const [result,setResult]=useState<null|{grm:number; interpretation:string}>(null);
  const [whatIfRent,setWhatIfRent]=useState<number|null>(null);
  const form=useForm<FormValues>({resolver:zodResolver(formSchema), defaultValues:{purchasePrice:undefined as unknown as number, annualGrossRent:undefined as unknown as number}});
  const num=(ph:string,field:any)=>(<Input type="number" step="0.01" placeholder={ph} {...field} value={Number.isFinite(field.value as any)?(field.value as any):''} onChange={e=>{const v=e.target.value; const n=v===''?undefined:Number(v); field.onChange(Number.isFinite(n as any)?n:undefined);}} />);

  const onSubmit=(v:FormValues)=>{
    if(v.purchasePrice===undefined||v.annualGrossRent===undefined||v.annualGrossRent===0){ setResult(null); return; }
    const grm=v.purchasePrice/v.annualGrossRent;
    let interp=`GRM: ${grm.toFixed(2)} years of gross rent to equal price.`;
    interp += ' Compare to market GRMs and layer in expenses/capex to judge value.';
    setResult({grm, interpretation:interp});
  };

  const alt=(rent:number)=>{
    const price=(form.getValues('purchasePrice')||0); return rent>0? price/rent : 0;
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5"/> Gross Rent Multiplier (GRM) Calculator</CardTitle>
          <CardDescription>Quickly benchmark a property's price against its annual gross rent.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="purchasePrice" render={({field})=>(<FormItem><FormLabel>Purchase Price ($)</FormLabel><FormControl>{num('e.g., 300000',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="annualGrossRent" render={({field})=>(<FormItem><FormLabel>Annual Gross Rent ($)</FormLabel><FormControl>{num('e.g., 36000',field)}</FormControl><FormMessage/></FormItem>)} />
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
            <CardDescription>Rent sensitivity</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div><div className="text-sm text-muted-foreground">GRM</div><div className="text-2xl font-semibold">{result.grm.toFixed(2)}</div></div>
            </div>
            <p className="text-sm leading-6">{result.interpretation}</p>
            <div className="rounded-md border p-3">
              <div className="flex items-center gap-2 font-medium mb-2"><Info className="h-4 w-4"/> What‑if: Annual Rent</div>
              <div className="flex flex-wrap gap-2">
                {[0.9,1.0,1.1].map(mult=>{ const base=form.getValues('annualGrossRent')||0; const r=base*mult; return (
                  <Button key={mult} variant={(whatIfRent===r)?'default':'secondary'} onClick={()=>setWhatIfRent(r)}>Rent {Math.round(mult*100)}%</Button>
                );})}
              </div>
              {whatIfRent!==null && (<div className="mt-2 text-sm">At annual rent ${whatIfRent.toFixed(0)}, GRM ≈ {alt(whatIfRent).toFixed(2)}.</div>)}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Related Calculators</CardTitle>
          <CardDescription>Real‑estate valuation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/rental-yield-calculator" className="text-primary hover:underline">Rental Yield</a></h4><p className="text-sm text-muted-foreground">Income return estimate.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/real-estate-cap-rate-sensitivity-calculator" className="text-primary hover:underline">Cap Rate Sensitivity</a></h4><p className="text-sm text-muted-foreground">Value vs cap rate moves.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/dscr-calculator" className="text-primary hover:underline">DSCR</a></h4><p className="text-sm text-muted-foreground">Debt service coverage.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/property-appreciation-projection-calculator" className="text-primary hover:underline">Property Appreciation</a></h4><p className="text-sm text-muted-foreground">Future value projection.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Guide</CardTitle>
          <CardDescription>Using GRM for quick screens and next steps</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-6 space-y-2 text-sm">
            <li>Compare GRM to local comps by asset type and neighborhood.</li>
            <li>Move to NOI/cap rate analysis after screening to account for expenses.</li>
            <li>Normalize for concessions and seasonality to avoid overstating rent.</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Frequently Asked Questions</CardTitle>
          <CardDescription>SEO‑oriented guidance on GRM usage</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div><h4 className="font-semibold mb-2">What is GRM?</h4><p className="text-muted-foreground">Gross Rent Multiplier equals purchase price divided by annual gross rent and provides a quick screening metric.</p></div>
          <div><h4 className="font-semibold mb-2">Is a lower GRM better?</h4><p className="text-muted-foreground">Generally yes—lower GRM indicates more rent per purchase dollar. However, expenses and capex can change the picture.</p></div>
          <div><h4 className="font-semibold mb-2">How does GRM differ from cap rate?</h4><p className="text-muted-foreground">Cap rate uses NOI (after expenses); GRM uses gross rent only. Cap rate is more complete but requires expense data.</p></div>
          <div><h4 className="font-semibold mb-2">What is a good GRM?</h4><p className="text-muted-foreground">It varies by market. Urban cores may have higher GRMs than suburban or tertiary markets; compare to local comps.</p></div>
          <div><h4 className="font-semibold mb-2">Can I compare single‑family and multifamily with GRM?</h4><p className="text-muted-foreground">Yes, but adjust for differences in vacancy, maintenance, and management costs.</p></div>
          <div><h4 className="font-semibold mb-2">Does GRM include appreciation potential?</h4><p className="text-muted-foreground">No. GRM measures income multiple only. Consider appreciation and rent growth for total return.</p></div>
          <div><h4 className="font-semibold mb-2">How do concessions or free months affect GRM?</h4><p className="text-muted-foreground">Use effective rent (after concessions) to avoid overstating income and understating GRM.</p></div>
          <div><h4 className="font-semibold mb-2">Should I include other income?</h4><p className="text-muted-foreground">If it is recurring (parking, laundry), add to annual gross income for a more accurate GRM.</p></div>
          <div><h4 className="font-semibold mb-2">Is GRM useful for pricing?</h4><p className="text-muted-foreground">It's a first pass. Use GRM to shortlist, then analyze NOI, capex, financing, and risk for final pricing.</p></div>
          <div><h4 className="font-semibold mb-2">Does GRM work for short‑term rentals?</h4><p className="text-muted-foreground">Use annualized revenue normalized for seasonality and occupancy; volatility may reduce reliability compared with long‑term leases.</p></div>
        </CardContent>
      </Card>
    </div>
  );
}
