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
  nopat: z.number().optional(),
  investedCapital: z.number().min(0).optional(),
  wacc: z.number().min(-100).max(100).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function EconomicValueAddedEVACalculator() {
  const [result,setResult]=useState<{eva:number; returnOnCapital:number; costOfCapital:number; interpretation:string; suggestions:string[]}|null>(null);
  const form=useForm<FormValues>({resolver:zodResolver(formSchema),defaultValues:{nopat:undefined as unknown as number,investedCapital:undefined as unknown as number,wacc:undefined as unknown as number}});

  const onSubmit=(v:FormValues)=>{
    if(v.nopat===undefined||v.investedCapital===undefined||v.wacc===undefined||v.investedCapital===0){ setResult(null); return; }
    const roc=(v.nopat/v.investedCapital)*100;
    const coc=v.wacc;
    const eva=v.nopat-(v.investedCapital*v.wacc/100);
    const interp=eva>=0?`Positive EVA: returns exceed cost of capital. Value created: ${eva.toFixed(2)}.`:`Negative EVA: returns below cost of capital. Value destroyed: ${Math.abs(eva).toFixed(2)}.`;
    setResult({eva,returnOnCapital:roc,costOfCapital:coc,interpretation:interp,suggestions:['EVA measures true economic profit after capital charge.','Positive EVA indicates value creation; negative suggests value destruction.','Use consistent accounting adjustments for NOPAT (operating lease capitalizations, etc.).','Compare EVA across business units to identify value drivers.']});
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
          <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" /> Economic Value Added (EVA) Calculator</CardTitle>
          <CardDescription>Compute EVA as NOPAT minus capital charge to measure value creation.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField control={form.control} name="nopat" render={({field})=>(<FormItem><FormLabel>NOPAT (Net Operating Profit After Tax)</FormLabel><FormControl>{num('e.g., 500000',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="investedCapital" render={({field})=>(<FormItem><FormLabel>Invested Capital</FormLabel><FormControl>{num('e.g., 5000000',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="wacc" render={({field})=>(<FormItem><FormLabel>WACC (%)</FormLabel><FormControl>{num('e.g., 10',field)}</FormControl><FormMessage/></FormItem>)} />
              </div>
              <Button type="submit" className="w-full md:w-auto">Calculate</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result&&(
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Results & Insights</CardTitle><CardDescription>EVA analysis</CardDescription></CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Economic Value Added</p><p className={`text-2xl font-bold ${result.eva>=0?'text-green-600':'text-red-600'}`}>{result.eva.toFixed(2)}</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Return on Capital (%)</p><p className="text-2xl font-bold">{result.returnOnCapital.toFixed(2)}%</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Cost of Capital (%)</p><p className="text-2xl font-bold">{result.costOfCapital.toFixed(2)}%</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Interpretation</p><p className="font-medium">{result.interpretation}</p></div>
            </div>
            <div><h4 className="font-semibold mb-2">Suggestions</h4><ul className="list-disc pl-6 text-muted-foreground space-y-1">{result.suggestions.map((s,i)=>(<li key={i}>{s}</li>))}</ul></div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Related Calculators</CardTitle><CardDescription>Value and performance</CardDescription></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/wacc-calculator" className="text-primary hover:underline">WACC Calculator</a></h4><p className="text-sm text-muted-foreground">Cost of capital input.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/market-value-added-mva-calculator" className="text-primary hover:underline">Market Value Added Calculator</a></h4><p className="text-sm text-muted-foreground">Market-based value metric.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/return-on-investment-calculator" className="text-primary hover:underline">ROI Calculator</a></h4><p className="text-sm text-muted-foreground">Return metrics.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/return-on-equity-calculator" className="text-primary hover:underline">ROE Calculator</a></h4><p className="text-sm text-muted-foreground">Equity returns.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Complete Guide to Economic Value Added</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none"><p>Placeholder guide content.</p><p>Explain EVA formula, NOPAT adjustments, and capital charge calculation.</p></CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Frequently Asked Questions</CardTitle><CardDescription>EVA basics</CardDescription></CardHeader>
        <CardContent className="space-y-6">
          <div><h4 className="font-semibold mb-2">What is Economic Value Added?</h4><p className="text-muted-foreground">A measure of true economic profit: NOPAT minus capital charge (invested capital × WACC).</p></div>
          <div><h4 className="font-semibold mb-2">How is EVA different from accounting profit?</h4><p className="text-muted-foreground">EVA accounts for the opportunity cost of capital; accounting profit does not.</p></div>
          <div><h4 className="font-semibold mb-2">What is NOPAT?</h4><p className="text-muted-foreground">Net Operating Profit After Tax: operating profit adjusted for taxes, excluding financing costs.</p></div>
          <div><h4 className="font-semibold mb-2">How to calculate invested capital?</h4><p className="text-muted-foreground">Equity plus debt minus cash; or net working capital plus fixed assets (operating assets).</p></div>
          <div><h4 className="font-semibold mb-2">What if EVA is negative?</h4><p className="text-muted-foreground">Company destroys value; returns are below cost of capital despite positive accounting profit.</p></div>
          <div><h4 className="font-semibold mb-2">Can EVA be used for compensation?</h4><p className="text-muted-foreground">Yes—EVA-based incentives align management with value creation; many firms use EVA metrics.</p></div>
          <div><h4 className="font-semibold mb-2">How does EVA relate to NPV?</h4><p className="text-muted-foreground">NPV is discounted future EVA; projects with positive NPV increase EVA.</p></div>
          <div><h4 className="font-semibold mb-2">What adjustments are needed for NOPAT?</h4><p className="text-muted-foreground">Capitalize operating leases, adjust R&D and advertising, exclude non-operating items.</p></div>
          <div><h4 className="font-semibold mb-2">Does EVA require accounting restatements?</h4><p className="text-muted-foreground">Yes—adjust GAAP figures to reflect economic reality and exclude financing decisions.</p></div>
          <div><h4 className="font-semibold mb-2">How often should EVA be calculated?</h4><p className="text-muted-foreground">Quarterly for reporting; monthly for internal management; track trends and drivers.</p></div>
        </CardContent>
      </Card>
    </div>
  );
}

