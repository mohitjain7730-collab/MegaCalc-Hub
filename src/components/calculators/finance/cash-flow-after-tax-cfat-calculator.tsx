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
  noiAnnual: z.number().min(0).optional(),
  interestExpense: z.number().min(0).optional(),
  depreciation: z.number().min(0).optional(),
  principalRepayment: z.number().min(0).optional(),
  taxRatePct: z.number().min(0).max(60).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function CashFlowAfterTaxCFATCalculator(){
  const [result,setResult]=useState<null|{taxableIncome:number; taxes:number; cfat:number; interpretation:string; scenarioTax?:number; scenarioCFAT?:number}>(null);
  const [whatIfTax,setWhatIfTax]=useState<number|null>(null);

  const form=useForm<FormValues>({resolver:zodResolver(formSchema), defaultValues:{noiAnnual:undefined as unknown as number, interestExpense:undefined as unknown as number, depreciation:undefined as unknown as number, principalRepayment:undefined as unknown as number, taxRatePct:undefined as unknown as number}});

  const num=(ph:string,field:any)=>(<Input type="number" step="0.01" placeholder={ph} {...field} value={Number.isFinite(field.value as any)?(field.value as any):''} onChange={e=>{const v=e.target.value; const n=v===''?undefined:Number(v); field.onChange(Number.isFinite(n as any)?n:undefined);}} />);

  const calc=(v:FormValues)=>{
    const noi=v.noiAnnual||0; const int=v.interestExpense||0; const dep=v.depreciation||0; const prin=v.principalRepayment||0; const t=(v.taxRatePct||0)/100;
    const taxable = Math.max(0, noi - int - dep);
    const taxes = taxable * t;
    const cfat = (noi - int - taxes) - prin + dep; // add back depreciation (non-cash)
    return {taxableIncome:taxable, taxes, cfat};
  };

  const onSubmit=(v:FormValues)=>{
    if(v.noiAnnual===undefined||v.taxRatePct===undefined){ setResult(null); return; }
    const base=calc(v);
    let interpretation = `Taxable income: $${base.taxableIncome.toFixed(0)}; Taxes: $${base.taxes.toFixed(0)}. CFAT: $${base.cfat.toFixed(0)}.`;
    interpretation += base.cfat>0? ' Positive after-tax cash flow supports debt service and reserves.' : ' Negative CFAT—consider lowering financing costs or increasing NOI.';
    setResult({...base, interpretation});
  };

  const alt=(taxPct:number)=>{
    const v=form.getValues();
    const res=calc({...v, taxRatePct:taxPct});
    return res.cfat;
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5"/> Cash Flow After Tax (CFAT) Calculator</CardTitle>
          <CardDescription>Estimate after-tax cash flow using NOI, interest, depreciation, principal, and tax rate.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                <FormField control={form.control} name="noiAnnual" render={({field})=>(<FormItem><FormLabel>NOI (annual $)</FormLabel><FormControl>{num('e.g., 24000',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="interestExpense" render={({field})=>(<FormItem><FormLabel>Interest Expense ($/yr)</FormLabel><FormControl>{num('e.g., 8000',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="depreciation" render={({field})=>(<FormItem><FormLabel>Depreciation ($/yr)</FormLabel><FormControl>{num('e.g., 6000',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="principalRepayment" render={({field})=>(<FormItem><FormLabel>Principal Repayment ($/yr)</FormLabel><FormControl>{num('e.g., 5000',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="taxRatePct" render={({field})=>(<FormItem><FormLabel>Tax Rate (%)</FormLabel><FormControl>{num('e.g., 25',field)}</FormControl><FormMessage/></FormItem>)} />
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
            <CardDescription>Explore tax rate sensitivity.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div><div className="text-sm text-muted-foreground">Taxable Income</div><div className="text-2xl font-semibold">${result.taxableIncome.toFixed(0)}</div></div>
              <div><div className="text-sm text-muted-foreground">Taxes</div><div className="text-2xl font-semibold">${result.taxes.toFixed(0)}</div></div>
              <div><div className="text-sm text-muted-foreground">CFAT</div><div className="text-2xl font-semibold">${result.cfat.toFixed(0)}</div></div>
            </div>
            <p className="text-sm leading-6">{result.interpretation}</p>
            <div className="rounded-md border p-3">
              <div className="flex items-center gap-2 font-medium mb-2"><Info className="h-4 w-4"/> What-if: Tax Rate</div>
              <div className="flex flex-wrap gap-2">
                {[15, 20, 25, 30, 35].map(t => (
                  <Button key={t} variant={(whatIfTax===t)?'default':'secondary'} onClick={()=>setWhatIfTax(t)}>{t}%</Button>
                ))}
              </div>
              {whatIfTax!==null && (
                <div className="mt-2 text-sm">At {whatIfTax}% tax rate, CFAT ≈ ${alt(whatIfTax).toFixed(0)}.</div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Guide</CardTitle>
          <CardDescription>Depreciation shields taxable income but is non-cash—added back to CFAT.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-6 space-y-2 text-sm">
            <li>CFAT helps assess cash available for debt service, reserves, and dividends.</li>
            <li>This simplified model ignores state taxes and other adjustments.</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Frequently Asked Questions</CardTitle>
          <CardDescription>SEO‑focused answers about CFAT and real‑estate taxation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div><h4 className="font-semibold mb-2">What is Cash Flow After Tax (CFAT)?</h4><p className="text-muted-foreground">CFAT is net cash generated after accounting for taxes. It starts with NOI, subtracts interest and taxes, adjusts for non‑cash depreciation, and subtracts principal repayments to show distributable cash.</p></div>
          <div><h4 className="font-semibold mb-2">Why is depreciation added back?</h4><p className="text-muted-foreground">Depreciation is a non‑cash expense. It lowers taxable income (reducing taxes) but does not consume cash, so we add it back when computing after‑tax cash flow.</p></div>
          <div><h4 className="font-semibold mb-2">How does loan principal affect CFAT?</h4><p className="text-muted-foreground">Principal repayment is a cash outflow that reduces loan balance but is not tax‑deductible. Therefore it lowers CFAT even though it builds equity.</p></div>
          <div><h4 className="font-semibold mb-2">Is CFAT the same as cash‑on‑cash return?</h4><p className="text-muted-foreground">No. Cash‑on‑cash compares annual pre‑tax cash flow to initial equity. CFAT can be used in that ratio, but the metric itself is simply a dollar amount after taxes.</p></div>
          <div><h4 className="font-semibold mb-2">Which tax rate should I use?</h4><p className="text-muted-foreground">Use your marginal tax rate for rental income after standard adjustments. If you qualify for special deductions (e.g., QBI or passive loss rules), consult a CPA to refine the effective rate.</p></div>
          <div><h4 className="font-semibold mb-2">Are state taxes included?</h4><p className="text-muted-foreground">This calculator uses a single tax rate input. If you have both federal and state taxes, combine them into an effective rate or run scenarios for each.</p></div>
          <div><h4 className="font-semibold mb-2">How do passive losses impact CFAT?</h4><p className="text-muted-foreground">Passive losses may offset rental income depending on income and material participation tests. They reduce taxes and increase CFAT, but rules are complex—seek professional advice.</p></div>
          <div><h4 className="font-semibold mb-2">Does CFAT include capital expenditures (CapEx)?</h4><p className="text-muted-foreground">CFAT here excludes CapEx. Include a CapEx reserve in your budget to reflect roof, HVAC, or major replacements that affect available cash.</p></div>
          <div><h4 className="font-semibold mb-2">How do refinancing and interest‑only periods affect CFAT?</h4><p className="text-muted-foreground">Lower interest or IO periods reduce current taxes and cash outflows, often increasing CFAT. However, future payments may rise—model the entire loan path when evaluating deals.</p></div>
          <div><h4 className="font-semibold mb-2">Can negative CFAT still be acceptable?</h4><p className="text-muted-foreground">Sometimes—if you have strong appreciation or value‑add plans. Persistent negative CFAT stresses liquidity; ensure adequate reserves and a clear path to positive cash flow.</p></div>
        </CardContent>
      </Card>
    </div>
  );
}


