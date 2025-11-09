'use client';

import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Info, TrendingUp } from 'lucide-react';

const formSchema = z.object({
  equityValue: z.number().min(0).optional(),
  totalDebt: z.number().min(0).optional(),
  cash: z.number().min(0).optional(),
  minorityInterests: z.number().min(0).optional(),
  preferredStock: z.number().min(0).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function EquityEnterpriseValueBridgeCalculator() {
  const [result, setResult] = useState<{
    enterpriseValue: number;
    netDebt: number;
    adjustments: number;
    interpretation: string;
  } | null>(null);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      equityValue: undefined as unknown as number,
      totalDebt: undefined as unknown as number,
      cash: undefined as unknown as number,
      minorityInterests: undefined as unknown as number,
      preferredStock: undefined as unknown as number,
    }
  });

  const numInput = (name: keyof FormValues, label: string, placeholder: string, suffix = '') => (
    <FormField control={form.control} name={name} render={({ field }) => (
      <FormItem>
        <FormLabel>{label}</FormLabel>
        <FormControl>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              step="0.01"
              placeholder={placeholder}
              value={Number.isFinite(field.value as any) ? (field.value as any) : ''}
              onChange={e => {
                const v = e.target.value;
                const n = v === '' ? undefined : Number(v);
                field.onChange(Number.isFinite(n as any) && n !== null && n >= 0 ? n : undefined);
              }}
              onBlur={field.onBlur}
              name={field.name}
              ref={field.ref}
            />
            {suffix && <span className="text-sm text-muted-foreground">{suffix}</span>}
          </div>
        </FormControl>
        <FormMessage />
      </FormItem>
    )} />
  );

  const onSubmit = (v: FormValues) => {
    if (v.equityValue == null || v.equityValue <= 0) {
      setResult(null);
      return;
    }
    const totalDebt = v.totalDebt ?? 0;
    const cash = v.cash ?? 0;
    const minorityInterests = v.minorityInterests ?? 0;
    const preferredStock = v.preferredStock ?? 0;
    
    // Net Debt = Total Debt - Cash
    const netDebt = totalDebt - cash;
    
    // Adjustments = Minority Interests + Preferred Stock
    const adjustments = minorityInterests + preferredStock;
    
    // Enterprise Value = Equity Value + Net Debt + Adjustments
    // Or: EV = Equity Value + Total Debt - Cash + Minority Interests + Preferred Stock
    const enterpriseValue = v.equityValue + netDebt + adjustments;
    
    const interpretation = `Enterprise Value: $${enterpriseValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}. Net Debt: $${netDebt.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (Total Debt: $${totalDebt.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} - Cash: $${cash.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}). Adjustments: $${adjustments.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (Minority Interests: $${minorityInterests.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} + Preferred Stock: $${preferredStock.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}). Enterprise Value represents the total value of the business available to all investors (equity and debt holders).`;
    setResult({ enterpriseValue, netDebt, adjustments, interpretation });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5"/> Equity Value vs Enterprise Value Bridge Calculator</CardTitle>
          <CardDescription>Calculate the bridge between equity value and enterprise value by accounting for debt, cash, and other adjustments.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {numInput('equityValue', 'Equity Value (Market Cap) ($)', 'e.g., 1000000000', '$')}
              {numInput('totalDebt', 'Total Debt ($, optional)', 'e.g., 200000000', '$')}
              {numInput('cash', 'Cash & Cash Equivalents ($, optional)', 'e.g., 50000000', '$')}
              {numInput('minorityInterests', 'Minority Interests ($, optional)', 'e.g., 10000000', '$')}
              {numInput('preferredStock', 'Preferred Stock ($, optional)', 'e.g., 5000000', '$')}
              <Button type="submit" className="w-full md:w-auto">Calculate</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Results</CardTitle>
            <CardDescription>Equity to enterprise value bridge</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div><div className="text-sm text-muted-foreground">Enterprise Value</div><div className="text-2xl font-semibold">${result.enterpriseValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div></div>
              <div><div className="text-sm text-muted-foreground">Net Debt</div><div className={`text-xl font-medium ${result.netDebt >= 0 ? 'text-red-600' : 'text-green-600'}`}>${result.netDebt.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div></div>
              <div><div className="text-sm text-muted-foreground">Adjustments</div><div className="text-xl font-medium">${result.adjustments.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div></div>
            </div>
            <p className="text-sm leading-6">{result.interpretation}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Related Calculators</CardTitle>
          <CardDescription>Valuation and financial analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/free-cash-flow-to-equity-calculator" className="text-primary hover:underline">Free Cash Flow to Equity</a></h4><p className="text-sm text-muted-foreground">Equity valuation.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/enterprise-value-calculator" className="text-primary hover:underline">Enterprise Value</a></h4><p className="text-sm text-muted-foreground">Business valuation.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/dcf-valuation-calculator" className="text-primary hover:underline">DCF Valuation</a></h4><p className="text-sm text-muted-foreground">Discounted cash flow.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Guide</CardTitle>
          <CardDescription>Understanding the equity value to enterprise value bridge</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-6 space-y-2 text-sm">
            <li>Enterprise Value (EV) = Equity Value + Net Debt + Adjustments. EV represents the total value of the business available to all investors.</li>
            <li>Net Debt = Total Debt - Cash & Cash Equivalents. Cash reduces enterprise value because it can be used to pay down debt.</li>
            <li>Adjustments include Minority Interests and Preferred Stock, which represent claims on the business that should be included in enterprise value.</li>
            <li>Equity Value (Market Cap) = Share Price × Shares Outstanding. This represents the value available only to equity holders.</li>
            <li>Enterprise Value is used in valuation multiples (EV/Revenue, EV/EBITDA) because it accounts for the capital structure and makes companies more comparable.</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Frequently Asked Questions</CardTitle>
          <CardDescription>Equity value, enterprise value, and valuation bridge</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div><h4 className="font-semibold mb-2">What is equity value?</h4><p className="text-muted-foreground">Equity value (market capitalization) is the total value of a company's equity, calculated as Share Price × Shares Outstanding. It represents the value available to equity holders only.</p></div>
          <div><h4 className="font-semibold mb-2">What is enterprise value?</h4><p className="text-muted-foreground">Enterprise value (EV) is the total value of a business available to all investors (equity and debt holders). EV = Equity Value + Net Debt + Adjustments (minority interests, preferred stock).</p></div>
          <div><h4 className="font-semibold mb-2">Why do we calculate enterprise value?</h4><p className="text-muted-foreground">Enterprise value accounts for capital structure (debt, cash) and makes companies more comparable for valuation. It's used in EV/Revenue, EV/EBITDA multiples, which are capital-structure neutral.</p></div>
          <div><h4 className="font-semibold mb-2">What is net debt?</h4><p className="text-muted-foreground">Net Debt = Total Debt - Cash & Cash Equivalents. Cash reduces enterprise value because it can be used to pay down debt, effectively reducing the cost of acquiring the business.</p></div>
          <div><h4 className="font-semibold mb-2">Why do we subtract cash from debt?</h4><p className="text-muted-foreground">Cash can be used to pay down debt, so net debt (debt minus cash) represents the true debt burden. A company with $100M debt and $50M cash effectively has $50M net debt.</p></div>
          <div><h4 className="font-semibold mb-2">What are minority interests?</h4><p className="text-muted-foreground">Minority interests represent the portion of subsidiaries owned by outside shareholders. They're added to enterprise value because they represent claims on the business that should be included in total value.</p></div>
          <div><h4 className="font-semibold mb-2">What is preferred stock?</h4><p className="text-muted-foreground">Preferred stock is a hybrid security with characteristics of both debt and equity. It's added to enterprise value because it represents a claim on the business that should be included in total value.</p></div>
          <div><h4 className="font-semibold mb-2">Can enterprise value be less than equity value?</h4><p className="text-muted-foreground">Yes. If a company has more cash than debt (negative net debt), enterprise value can be less than equity value. This is common for cash-rich companies with little or no debt.</p></div>
          <div><h4 className="font-semibold mb-2">How is enterprise value used in valuation?</h4><p className="text-muted-foreground">Enterprise value is used in valuation multiples (EV/Revenue, EV/EBITDA, EV/EBIT) because these multiples are capital-structure neutral, making companies with different debt levels more comparable.</p></div>
          <div><h4 className="font-semibold mb-2">What is the difference between market cap and enterprise value?</h4><p className="text-muted-foreground">Market cap (equity value) represents value available to equity holders only. Enterprise value represents total business value available to all investors (equity + debt holders), accounting for capital structure.</p></div>
        </CardContent>
      </Card>
    </div>
  );
}



