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
  annualDividend: z.number().min(0).optional(),
  preferredPrice: z.number().min(0).optional(),
  flotationCost: z.number().min(0).max(100).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function CostOfPreferredStockCalculator() {
  const [result,setResult]=useState<{costOfPreferred:number; afterFlotation:number; interpretation:string; suggestions:string[]}|null>(null);
  const form=useForm<FormValues>({resolver:zodResolver(formSchema),defaultValues:{annualDividend:undefined as unknown as number,preferredPrice:undefined as unknown as number,flotationCost:undefined as unknown as number}});

  const onSubmit=(v:FormValues)=>{
    if(v.annualDividend===undefined||v.preferredPrice===undefined||v.preferredPrice===0){ setResult(null); return; }
    const kp=(v.annualDividend/v.preferredPrice)*100;
    let afterFlot=NaN;
    if(v.flotationCost!==undefined&&v.flotationCost<100){ afterFlot=(v.annualDividend/(v.preferredPrice*(1-v.flotationCost/100)))*100; }
    const interp=`Cost of preferred stock: ${kp.toFixed(2)}%. ${Number.isFinite(afterFlot)?`After ${v.flotationCost}% flotation: ${afterFlot.toFixed(2)}%.`:''}`;
    setResult({costOfPreferred:kp,afterFlotation:afterFlot,interpretation:interp,suggestions:['Preferred stock cost is dividend divided by price, similar to bond YTM.','Flotation costs increase effective cost when raising new capital.','Use after-tax cost if dividends receive tax benefits.','Compare to cost of common equity and debt for capital structure decisions.']});
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
          <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" /> Cost of Preferred Stock Calculator</CardTitle>
          <CardDescription>Calculate the cost of preferred stock from dividend, price, and flotation costs.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField control={form.control} name="annualDividend" render={({field})=>(<FormItem><FormLabel>Annual Dividend per Share</FormLabel><FormControl>{num('e.g., 5',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="preferredPrice" render={({field})=>(<FormItem><FormLabel>Preferred Stock Price</FormLabel><FormControl>{num('e.g., 100',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="flotationCost" render={({field})=>(<FormItem><FormLabel>Flotation Cost (%)</FormLabel><FormControl>{num('e.g., 2',field)}</FormControl><FormMessage/></FormItem>)} />
              </div>
              <Button type="submit" className="w-full md:w-auto">Calculate</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result&&(
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Results & Insights</CardTitle><CardDescription>Cost of preferred stock</CardDescription></CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Cost of Preferred Stock (%)</p><p className="text-2xl font-bold">{result.costOfPreferred.toFixed(2)}%</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">After Flotation Cost (%)</p><p className="text-2xl font-bold">{Number.isFinite(result.afterFlotation)?result.afterFlotation.toFixed(2)+'%':'N/A'}</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Interpretation</p><p className="font-medium">{result.interpretation}</p></div>
            </div>
            <div><h4 className="font-semibold mb-2">Suggestions</h4><ul className="list-disc pl-6 text-muted-foreground space-y-1">{result.suggestions.map((s,i)=>(<li key={i}>{s}</li>))}</ul></div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Related Calculators</CardTitle><CardDescription>Cost of capital</CardDescription></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/wacc-calculator" className="text-primary hover:underline">WACC Calculator</a></h4><p className="text-sm text-muted-foreground">Weighted average cost of capital.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/capm-calculator" className="text-primary hover:underline">CAPM Calculator</a></h4><p className="text-sm text-muted-foreground">Equity cost model.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/dividend-yield-calculator" className="text-primary hover:underline">Dividend Yield Calculator</a></h4><p className="text-sm text-muted-foreground">Dividend metrics.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/bond-yield-to-maturity-calculator" className="text-primary hover:underline">Bond YTM Calculator</a></h4><p className="text-sm text-muted-foreground">Debt cost comparison.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Complete Guide to Cost of Preferred Stock</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none"><p>Placeholder guide content.</p><p>Explain preferred stock characteristics, dividend requirements, and WACC integration.</p></CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Frequently Asked Questions</CardTitle><CardDescription>Cost of preferred stock</CardDescription></CardHeader>
        <CardContent className="space-y-6">
          <div><h4 className="font-semibold mb-2">What is cost of preferred stock?</h4><p className="text-muted-foreground">The required rate of return on preferred stock, calculated as annual dividend divided by price.</p></div>
          <div><h4 className="font-semibold mb-2">How is it calculated?</h4><p className="text-muted-foreground">Cost = Annual Dividend / Preferred Stock Price; similar to dividend yield for common stock.</p></div>
          <div><h4 className="font-semibold mb-2">Why include flotation costs?</h4><p className="text-muted-foreground">Flotation costs reduce net proceeds when issuing new preferred stock, increasing effective cost.</p></div>
          <div><h4 className="font-semibold mb-2">Is preferred stock cost tax-deductible?</h4><p className="text-muted-foreground">Dividends are not tax-deductible like interest; use after-tax cost unless tax benefits apply.</p></div>
          <div><h4 className="font-semibold mb-2">How does it compare to debt?</h4><p className="text-muted-foreground">Usually higher than debt cost due to non-deductible dividends and lower priority in bankruptcy.</p></div>
          <div><h4 className="font-semibold mb-2">What if dividends are cumulative?</h4><p className="text-muted-foreground">Cumulative dividends must be paid before common dividends; cost calculation remains the same.</p></div>
          <div><h4 className="font-semibold mb-2">Does preferred stock have maturity?</h4><p className="text-muted-foreground">Perpetual preferred has no maturity; callable preferred may be redeemed at specific dates.</p></div>
          <div><h4 className="font-semibold mb-2">How to adjust for callable preferred?</h4><p className="text-muted-foreground">If callable, estimate expected call date and use yield-to-call instead of dividend yield.</p></div>
          <div><h4 className="font-semibold mb-2">What about convertible preferred?</h4><p className="text-muted-foreground">Convertible preferred includes conversion option value; adjust cost for option benefits.</p></div>
          <div><h4 className="font-semibold mb-2">When is preferred stock used?</h4><p className="text-muted-foreground">Companies use preferred to raise capital without diluting common ownership; provides fixed income feature.</p></div>
        </CardContent>
      </Card>
    </div>
  );
}

