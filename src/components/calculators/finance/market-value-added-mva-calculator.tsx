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
  marketValue: z.number().min(0).optional(),
  bookValue: z.number().min(0).optional(),
  investedCapital: z.number().min(0).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function MarketValueAddedMVACalculator() {
  const [result,setResult]=useState<{mva:number; marketToBook:number; interpretation:string; suggestions:string[]}|null>(null);
  const form=useForm<FormValues>({resolver:zodResolver(formSchema),defaultValues:{marketValue:undefined as unknown as number,bookValue:undefined as unknown as number,investedCapital:undefined as unknown as number}});

  const onSubmit=(v:FormValues)=>{
    if(v.marketValue===undefined||v.bookValue===undefined){ setResult(null); return; }
    const mva=v.marketValue-v.bookValue;
    const mtb=v.bookValue>0?(v.marketValue/v.bookValue):NaN;
    const interp=mva>=0?`Positive MVA: market value exceeds book value by ${mva.toFixed(2)}. Market-to-book: ${Number.isFinite(mtb)?mtb.toFixed(2):'N/A'}.`:`Negative MVA: market value below book value. Destruction: ${Math.abs(mva).toFixed(2)}.`;
    setResult({mva,marketToBook:mtb,interpretation:interp,suggestions:['MVA measures market premium or discount to book value.','Positive MVA suggests market expects future value creation.','Compare MVA to peers and historical levels for context.','Market value reflects forward-looking expectations; book is historical cost.']});
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
          <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" /> Market Value Added (MVA) Calculator</CardTitle>
          <CardDescription>Calculate MVA as the difference between market value and book value of capital.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField control={form.control} name="marketValue" render={({field})=>(<FormItem><FormLabel>Market Value of Capital</FormLabel><FormControl>{num('e.g., 6000000',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="bookValue" render={({field})=>(<FormItem><FormLabel>Book Value of Capital</FormLabel><FormControl>{num('e.g., 5000000',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="investedCapital" render={({field})=>(<FormItem><FormLabel>Invested Capital (optional)</FormLabel><FormControl>{num('e.g., 4800000',field)}</FormControl><FormMessage/></FormItem>)} />
              </div>
              <Button type="submit" className="w-full md:w-auto">Calculate</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result&&(
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Results & Insights</CardTitle><CardDescription>MVA analysis</CardDescription></CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Market Value Added</p><p className={`text-2xl font-bold ${result.mva>=0?'text-green-600':'text-red-600'}`}>{result.mva.toFixed(2)}</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Market-to-Book Ratio</p><p className="text-2xl font-bold">{Number.isFinite(result.marketToBook)?result.marketToBook.toFixed(2):'N/A'}</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Interpretation</p><p className="font-medium">{result.interpretation}</p></div>
            </div>
            <div><h4 className="font-semibold mb-2">Suggestions</h4><ul className="list-disc pl-6 text-muted-foreground space-y-1">{result.suggestions.map((s,i)=>(<li key={i}>{s}</li>))}</ul></div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Related Calculators</CardTitle><CardDescription>Value metrics</CardDescription></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/economic-value-added-eva-calculator" className="text-primary hover:underline">Economic Value Added Calculator</a></h4><p className="text-sm text-muted-foreground">Period value creation.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/return-on-equity-calculator" className="text-primary hover:underline">ROE Calculator</a></h4><p className="text-sm text-muted-foreground">Equity returns.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/enterprise-value-calculator" className="text-primary hover:underline">Enterprise Value Calculator</a></h4><p className="text-sm text-muted-foreground">Total firm value.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/return-on-investment-calculator" className="text-primary hover:underline">ROI Calculator</a></h4><p className="text-sm text-muted-foreground">Return metrics.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Complete Guide to Market Value Added</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none"><p>Placeholder guide content.</p><p>Explain MVA vs EVA, market-to-book, and interpretation.</p></CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Frequently Asked Questions</CardTitle><CardDescription>MVA basics</CardDescription></CardHeader>
        <CardContent className="space-y-6">
          <div><h4 className="font-semibold mb-2">What is Market Value Added?</h4><p className="text-muted-foreground">Difference between market value of capital and book value; measures market premium or discount.</p></div>
          <div><h4 className="font-semibold mb-2">How is MVA different from EVA?</h4><p className="text-muted-foreground">EVA measures period profit; MVA measures cumulative value creation reflected in market price.</p></div>
          <div><h4 className="font-semibold mb-2">What does positive MVA mean?</h4><p className="text-muted-foreground">Market expects future value creation above book value; investors pay premium for growth potential.</p></div>
          <div><h4 className="font-semibold mb-2">What does negative MVA mean?</h4><p className="text-muted-foreground">Market values firm below book; suggests past investments not expected to create value.</p></div>
          <div><h4 className="font-semibold mb-2">How to calculate market value?</h4><p className="text-muted-foreground">Shares outstanding × stock price for equity; add debt market value if available, or use book debt.</p></div>
          <div><h4 className="font-semibold mb-2">What is market-to-book ratio?</h4><p className="text-muted-foreground">Market value divided by book value; ratios above 1 indicate market premium.</p></div>
          <div><h4 className="font-semibold mb-2">Why might MVA differ from cumulative EVA?</h4><p className="text-muted-foreground">MVA reflects forward-looking expectations; EVA is historical. Market anticipates future EVA changes.</p></div>
          <div><h4 className="font-semibold mb-2">Does MVA fluctuate with stock prices?</h4><p className="text-muted-foreground">Yes—MVA changes daily with market movements; use longer-term averages for trend analysis.</p></div>
          <div><h4 className="font-semibold mb-2">How to compare across companies?</h4><p className="text-muted-foreground">Use MVA as absolute amount or scale by invested capital; compare within industries for context.</p></div>
          <div><h4 className="font-semibold mb-2">What about intangible assets?</h4><p className="text-muted-foreground">Intangibles often not on books; MVA captures market recognition of intangible value.</p></div>
        </CardContent>
      </Card>
    </div>
  );
}

