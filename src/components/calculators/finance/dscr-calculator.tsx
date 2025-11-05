'use client';

import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Info, Activity } from 'lucide-react';

const formSchema = z.object({
  noiAnnual: z.number().min(0).optional(),
  annualDebtService: z.number().min(0).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function DSCRCalculator(){
  const [result,setResult]=useState<null|{dscr:number; noi:number; debtService:number; interpretation:string}>(null);

  const form=useForm<FormValues>({resolver:zodResolver(formSchema), defaultValues:{noiAnnual:undefined as unknown as number, annualDebtService:undefined as unknown as number}});

  const num=(ph:string,field:any)=>(<Input type="number" step="0.01" placeholder={ph} {...field} value={Number.isFinite(field.value as any)?(field.value as any):''} onChange={e=>{const v=e.target.value; const n=v===''?undefined:Number(v); field.onChange(Number.isFinite(n as any)?n:undefined);}} />);

  const compute = (v:FormValues)=>{
    if(v.noiAnnual===undefined||v.annualDebtService===undefined||v.annualDebtService===0){ setResult(null); return; }
    const dscr=v.noiAnnual/v.annualDebtService;
    let interp=`DSCR: ${dscr.toFixed(2)}.`;
    if(dscr>=1.25) interp+=' Strong coverage—commonly meets lender thresholds.';
    else if(dscr>=1.10) interp+=' Borderline—improve NOI or reduce debt service to de‑risk.';
    else interp+=' Below 1.0—insufficient cash flow to cover debt; restructure needed.';
    setResult({dscr, noi:v.noiAnnual, debtService:v.annualDebtService, interpretation:interp});
  };

  const onSubmit=(v:FormValues)=> compute(v);

  const noiWhatIfs = useMemo(()=>[0.9,1.0,1.1],[]);

  const previewDSCRAtNOI=(mult:number)=>{
    const v = form.getValues();
    if(v.annualDebtService===undefined||v.annualDebtService===0) return null;
    const baseNOI = v.noiAnnual || 0;
    const noi = baseNOI * mult;
    return noi / v.annualDebtService;
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5"/> Debt Service Coverage Ratio (DSCR) Calculator</CardTitle>
          <CardDescription>Assess ability to cover annual debt payments with net operating income (NOI).</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="noiAnnual" render={({field})=>(<FormItem><FormLabel>NOI (annual $)</FormLabel><FormControl>{num('e.g., 120000',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="annualDebtService" render={({field})=>(<FormItem><FormLabel>Annual Debt Service ($)</FormLabel><FormControl>{num('e.g., 90000',field)}</FormControl><FormMessage/></FormItem>)} />
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
            <CardDescription>Interactive NOI sensitivity (what‑if scenarios).</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div><div className="text-sm text-muted-foreground">DSCR</div><div className="text-2xl font-semibold">{result.dscr.toFixed(2)}</div></div>
              <div><div className="text-sm text-muted-foreground">NOI (Annual)</div><div className="text-2xl font-semibold">${result.noi.toLocaleString()}</div></div>
              <div><div className="text-sm text-muted-foreground">Debt Service</div><div className="text-2xl font-semibold">${result.debtService.toLocaleString()}</div></div>
            </div>
            <p className="text-sm leading-6">{result.interpretation}</p>
            <div className="rounded-md border p-3">
              <div className="flex items-center gap-2 font-medium mb-2"><Info className="h-4 w-4"/> What‑if: NOI</div>
              <div className="flex flex-wrap gap-2">
                {noiWhatIfs.map(mult=>{
                  const dscr = previewDSCRAtNOI(mult);
                  const baseNOI = form.getValues('noiAnnual') || 0;
                  const noi = baseNOI * mult;
                  return (
                    <Button key={mult} variant="secondary" onClick={()=>{form.setValue('noiAnnual', noi); const v=form.getValues(); compute(v);}}>
                      NOI {Math.round(mult*100)}%{dscr!=null?` • DSCR ${dscr.toFixed(2)}`:''}
                    </Button>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Related Calculators</CardTitle>
          <CardDescription>Real‑estate financing</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/rental-yield-calculator" className="text-primary hover:underline">Rental Yield</a></h4><p className="text-sm text-muted-foreground">Income return estimate.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/cash-flow-after-tax-cfat-calculator" className="text-primary hover:underline">Cash Flow After Tax (CFAT)</a></h4><p className="text-sm text-muted-foreground">After‑tax cash flow.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/loan-to-value-ltv-ratio-calculator" className="text-primary hover:underline">Loan‑to‑Value (LTV)</a></h4><p className="text-sm text-muted-foreground">Leverage vs value.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/real-estate-cap-rate-sensitivity-calculator" className="text-primary hover:underline">Cap Rate Sensitivity</a></h4><p className="text-sm text-muted-foreground">Value vs cap rate moves.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Guide</CardTitle>
          <CardDescription>How to interpret DSCR and improve coverage</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-6 space-y-2 text-sm">
            <li>DSCR above 1.25 is typically considered strong for stabilized properties.</li>
            <li>Improve DSCR by increasing NOI (rents, occupancy) or lowering debt service (rate, term, principal).</li>
            <li>Include a realistic replacement‑reserve when presenting DSCR to lenders.</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Frequently Asked Questions</CardTitle>
          <CardDescription>Detailed, SEO‑oriented DSCR guidance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div><h4 className="font-semibold mb-2">What is DSCR?</h4><p className="text-muted-foreground">Debt Service Coverage Ratio compares NOI to annual debt service. A value above 1.0 means cash flow covers debt payments; lenders typically target 1.20–1.30+.</p></div>
          <div><h4 className="font-semibold mb-2">Why do lenders care about DSCR?</h4><p className="text-muted-foreground">It's a primary risk metric. Higher DSCR implies more cushion to weather vacancies, repairs, or rate increases, reducing default risk.</p></div>
          <div><h4 className="font-semibold mb-2">What counts as debt service?</h4><p className="text-muted-foreground">Principal plus interest due over a year, including all mortgages or loans secured by the property.</p></div>
          <div><h4 className="font-semibold mb-2">Is DSCR pre‑tax or after‑tax?</h4><p className="text-muted-foreground">DSCR uses operating income (NOI) which is pre‑tax; taxes are excluded to focus on property cash generation.</p></div>
          <div><h4 className="font-semibold mb-2">How do capex and reserves affect DSCR?</h4><p className="text-muted-foreground">Lenders often consider a replacement‑reserve assumption; higher reserves reduce effective NOI, lowering DSCR.</p></div>
          <div><h4 className="font-semibold mb-2">What DSCR do lenders require?</h4><p className="text-muted-foreground">Common thresholds are 1.20–1.30 for stabilized assets; riskier assets or shorter leases may require higher DSCR.</p></div>
          <div><h4 className="font-semibold mb-2">How can I improve DSCR?</h4><p className="text-muted-foreground">Increase rents, reduce expenses, refinance to a lower rate or longer term, add equity to reduce loan amount, or improve occupancy.</p></div>
          <div><h4 className="font-semibold mb-2">Does interest‑only improve DSCR?</h4><p className="text-muted-foreground">Yes—temporarily lowers debt service and boosts DSCR, but amortization later can reduce DSCR unless NOI grows.</p></div>
          <div><h4 className="font-semibold mb-2">Is DSCR the same as ICR?</h4><p className="text-muted-foreground">No. Interest Coverage Ratio compares NOI (or EBITDA) to interest only; DSCR includes principal and interest.</p></div>
          <div><h4 className="font-semibold mb-2">What DSCR is considered risky?</h4><p className="text-muted-foreground">Below 1.10 is often considered weak; below 1.0 means cash flow cannot fully cover debt service.</p></div>
        </CardContent>
      </Card>
    </div>
  );
}
