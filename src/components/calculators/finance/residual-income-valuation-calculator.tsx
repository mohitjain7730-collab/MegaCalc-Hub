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
  bookValue: z.number().min(0).optional(),
  expectedNI: z.number().optional(),
  requiredReturn: z.number().min(-100).max(100).optional(),
  growthRate: z.number().min(-100).max(100).optional(),
  years: z.number().min(0).max(100).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function ResidualIncomeValuationCalculator() {
  const [result,setResult]=useState<{residualIncome:number; equityValue:number; interpretation:string; suggestions:string[]}|null>(null);
  const form=useForm<FormValues>({resolver:zodResolver(formSchema),defaultValues:{bookValue:undefined as unknown as number,expectedNI:undefined as unknown as number,requiredReturn:undefined as unknown as number,growthRate:undefined as unknown as number,years:undefined as unknown as number}});

  const onSubmit=(v:FormValues)=>{
    if(v.bookValue===undefined||v.expectedNI===undefined||v.requiredReturn===undefined){ setResult(null); return; }
    const r=v.requiredReturn/100;
    const ri=v.expectedNI-(v.bookValue*r);
    let eqVal=v.bookValue;
    if(v.growthRate!==undefined&&v.years!==undefined){
      const g=v.growthRate/100;
      if(r>g&&v.years>0){ const pvri=ri*(1-((1+g)/(1+r))**v.years)/(r-g); eqVal=v.bookValue+pvri; }
      else eqVal=v.bookValue+ri/r;
    } else eqVal=v.bookValue+ri/r;
    const interp=`Equity value: ${eqVal.toFixed(2)}. Residual income: ${ri.toFixed(2)}. Premium to book: ${(eqVal-v.bookValue).toFixed(2)}.`;
    setResult({residualIncome:ri,equityValue:eqVal,interpretation:interp,suggestions:['Residual income is earnings above required return on book equity.','Value equals book plus present value of future residual income.','Use cost of equity for required return; ensure consistency with book value calculation.','Model assumes residual income grows at terminal rate after forecast period.']});
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
          <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" /> Residual Income Valuation Calculator</CardTitle>
          <CardDescription>Estimate equity value using residual income model: book value plus present value of residual income.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                <FormField control={form.control} name="bookValue" render={({field})=>(<FormItem><FormLabel>Current Book Value</FormLabel><FormControl>{num('e.g., 1000000',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="expectedNI" render={({field})=>(<FormItem><FormLabel>Expected Net Income</FormLabel><FormControl>{num('e.g., 150000',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="requiredReturn" render={({field})=>(<FormItem><FormLabel>Required Return (%)</FormLabel><FormControl>{num('e.g., 12',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="growthRate" render={({field})=>(<FormItem><FormLabel>Growth Rate (%)</FormLabel><FormControl>{num('e.g., 5',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="years" render={({field})=>(<FormItem><FormLabel>Forecast Years</FormLabel><FormControl>{num('e.g., 5',field)}</FormControl><FormMessage/></FormItem>)} />
              </div>
              <Button type="submit" className="w-full md:w-auto">Calculate</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result&&(
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Results & Insights</CardTitle><CardDescription>Residual income valuation</CardDescription></CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Residual Income</p><p className={`text-2xl font-bold ${result.residualIncome>=0?'text-green-600':'text-red-600'}`}>{result.residualIncome.toFixed(2)}</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Equity Value</p><p className="text-2xl font-bold">{result.equityValue.toFixed(2)}</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Interpretation</p><p className="font-medium">{result.interpretation}</p></div>
            </div>
            <div><h4 className="font-semibold mb-2">Suggestions</h4><ul className="list-disc pl-6 text-muted-foreground space-y-1">{result.suggestions.map((s,i)=>(<li key={i}>{s}</li>))}</ul></div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Related Calculators</CardTitle><CardDescription>Equity valuation</CardDescription></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/dcf-calculator" className="text-primary hover:underline">DCF Valuation Calculator</a></h4><p className="text-sm text-muted-foreground">Cash flow approach.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/price-to-earnings-ratio-calculator" className="text-primary hover:underline">Price-to-Earnings Ratio</a></h4><p className="text-sm text-muted-foreground">Valuation metrics.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/return-on-equity-calculator" className="text-primary hover:underline">ROE Calculator</a></h4><p className="text-sm text-muted-foreground">Return metrics.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/dividend-discount-model-calculator" className="text-primary hover:underline">Dividend Discount Model</a></h4><p className="text-sm text-muted-foreground">Dividend valuation.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Complete Guide to Residual Income Valuation</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none"><p>Placeholder guide content.</p><p>Explain residual income formula, book value drivers, and terminal value assumptions.</p></CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Frequently Asked Questions</CardTitle><CardDescription>Residual income valuation</CardDescription></CardHeader>
        <CardContent className="space-y-6">
          <div><h4 className="font-semibold mb-2">What is residual income?</h4><p className="text-muted-foreground">Earnings above required return on book equity; Residual Income = Net Income - (Book Equity × Required Return).</p></div>
          <div><h4 className="font-semibold mb-2">How does residual income valuation work?</h4><p className="text-muted-foreground">Equity Value = Book Value + Present Value of Future Residual Income; captures value above book.</p></div>
          <div><h4 className="font-semibold mb-2">What is the required return?</h4><p className="text-muted-foreground">Cost of equity; use CAPM, dividend discount model, or bond yield plus risk premium.</p></div>
          <div><h4 className="font-semibold mb-2">When is residual income model best?</h4><p className="text-muted-foreground">When firms don't pay dividends, book value is meaningful, or accounting quality is high.</p></div>
          <div><h4 className="font-semibold mb-2">What about negative residual income?</h4><p className="text-muted-foreground">Negative RI reduces equity value below book; indicates poor returns relative to required rate.</p></div>
          <div><h4 className="font-semibold mb-2">How to forecast residual income?</h4><p className="text-muted-foreground">Forecast net income and book value; residual income = NI - (Beginning Book Equity × Required Return).</p></div>
          <div><h4 className="font-semibold mb-2">What is terminal value?</h4><p className="text-muted-foreground">Present value of residual income beyond forecast period; assumes constant growth or zero RI.</p></div>
          <div><h4 className="font-semibold mb-2">Does it work for banks?</h4><p className="text-muted-foreground">Yes—residual income is common for financial firms where book value is a key metric.</p></div>
          <div><h4 className="font-semibold mb-2">How does it compare to DCF?</h4><p className="text-muted-foreground">Both should yield same value if assumptions are consistent; residual income focuses on accounting earnings.</p></div>
          <div><h4 className="font-semibold mb-2">What adjustments are needed?</h4><p className="text-muted-foreground">Clean book value (remove goodwill, adjust for off-balance-sheet items) and use clean surplus accounting.</p></div>
        </CardContent>
      </Card>
    </div>
  );
}

