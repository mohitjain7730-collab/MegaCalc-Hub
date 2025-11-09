'use client';

import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Info, DollarSign } from 'lucide-react';

const formSchema = z.object({
  netIncome: z.number().optional(),
  depreciation: z.number().min(0).optional(),
  capitalExpenditures: z.number().min(0).optional(),
  changeInWorkingCapital: z.number().optional(),
  netBorrowing: z.number().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function FreeCashFlowToEquityCalculator() {
  const [result, setResult] = useState<{
    fcfe: number;
    operatingCashFlow: number;
    freeCashFlow: number;
    interpretation: string;
  } | null>(null);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      netIncome: undefined as unknown as number,
      depreciation: undefined as unknown as number,
      capitalExpenditures: undefined as unknown as number,
      changeInWorkingCapital: undefined as unknown as number,
      netBorrowing: undefined as unknown as number,
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
                let min: number | undefined = undefined;
                if (name === 'depreciation' || name === 'capitalExpenditures') {
                  min = 0;
                }
                field.onChange(Number.isFinite(n as any) && n !== null && (min === undefined || n >= min) ? n : undefined);
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
    if (v.netIncome == null) {
      setResult(null);
      return;
    }
    const depreciation = v.depreciation ?? 0;
    const capitalExpenditures = v.capitalExpenditures ?? 0;
    const changeInWorkingCapital = v.changeInWorkingCapital ?? 0;
    const netBorrowing = v.netBorrowing ?? 0;
    
    // Operating Cash Flow = Net Income + Depreciation - Change in Working Capital
    const operatingCashFlow = v.netIncome + depreciation - changeInWorkingCapital;
    
    // Free Cash Flow = Operating Cash Flow - Capital Expenditures
    const freeCashFlow = operatingCashFlow - capitalExpenditures;
    
    // FCFE = Free Cash Flow - Net Debt Repayment + Net Borrowing
    // Simplified: FCFE = Net Income + Depreciation - CapEx - Change in WC + Net Borrowing
    const fcfe = v.netIncome + depreciation - capitalExpenditures - changeInWorkingCapital + netBorrowing;
    
    const interpretation = `Free Cash Flow to Equity (FCFE): $${fcfe.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}. Operating Cash Flow: $${operatingCashFlow.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}. Free Cash Flow: $${freeCashFlow.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}. FCFE represents the cash available to equity holders after all expenses, investments, and debt obligations. Positive FCFE indicates the company can pay dividends, buy back shares, or reinvest in growth.`;
    setResult({ fcfe, operatingCashFlow, freeCashFlow, interpretation });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><DollarSign className="h-5 w-5"/> Free Cash Flow to Equity (FCFE) Calculator</CardTitle>
          <CardDescription>Calculate free cash flow to equity from net income, capital expenditures, and changes in working capital for equity valuation.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {numInput('netIncome', 'Net Income ($)', 'e.g., 10000000', '$')}
              {numInput('depreciation', 'Depreciation & Amortization ($, optional)', 'e.g., 2000000', '$')}
              {numInput('capitalExpenditures', 'Capital Expenditures ($, optional)', 'e.g., 3000000', '$')}
              {numInput('changeInWorkingCapital', 'Change in Working Capital ($, optional, positive = increase)', 'e.g., -500000', '$')}
              {numInput('netBorrowing', 'Net Borrowing ($, optional, positive = borrowing)', 'e.g., 1000000', '$')}
              <Button type="submit" className="w-full md:w-auto">Calculate</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Results</CardTitle>
            <CardDescription>Free cash flow to equity analysis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div><div className="text-sm text-muted-foreground">FCFE</div><div className={`text-2xl font-semibold ${result.fcfe >= 0 ? 'text-green-600' : 'text-red-600'}`}>${result.fcfe.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div></div>
              <div><div className="text-sm text-muted-foreground">Operating Cash Flow</div><div className="text-xl font-medium">${result.operatingCashFlow.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div></div>
              <div><div className="text-sm text-muted-foreground">Free Cash Flow</div><div className="text-xl font-medium">${result.freeCashFlow.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div></div>
            </div>
            <p className="text-sm leading-6">{result.interpretation}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Related Calculators</CardTitle>
          <CardDescription>Cash flow and valuation analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/equity-enterprise-value-bridge-calculator" className="text-primary hover:underline">Equity vs Enterprise Value</a></h4><p className="text-sm text-muted-foreground">Valuation bridge.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/dcf-valuation-calculator" className="text-primary hover:underline">DCF Valuation</a></h4><p className="text-sm text-muted-foreground">Discounted cash flow.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/free-cash-flow-calculator" className="text-primary hover:underline">Free Cash Flow</a></h4><p className="text-sm text-muted-foreground">Operating cash flow.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Guide</CardTitle>
          <CardDescription>Understanding free cash flow to equity and equity valuation</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-6 space-y-2 text-sm">
            <li>FCFE = Net Income + Depreciation - Capital Expenditures - Change in Working Capital + Net Borrowing. It represents cash available to equity holders.</li>
            <li>FCFE is used in equity valuation (DCF models) because it represents the cash that can be paid to shareholders as dividends or used for share buybacks.</li>
            <li>Positive FCFE indicates the company generates cash after all expenses and investments, allowing dividends, buybacks, or growth investments.</li>
            <li>Negative FCFE indicates the company requires external financing (debt or equity) to fund operations or investments, which may not be sustainable long-term.</li>
            <li>FCFE differs from Free Cash Flow (FCF) by accounting for net borrowing. FCFE focuses on equity holders, while FCF focuses on all investors.</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Frequently Asked Questions</CardTitle>
          <CardDescription>Free cash flow to equity, equity valuation, and cash flow analysis</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div><h4 className="font-semibold mb-2">What is free cash flow to equity (FCFE)?</h4><p className="text-muted-foreground">FCFE is the cash available to equity holders after all expenses, capital expenditures, working capital changes, and debt obligations. It represents cash that can be paid as dividends or used for share buybacks.</p></div>
          <div><h4 className="font-semibold mb-2">How is FCFE calculated?</h4><p className="text-muted-foreground">FCFE = Net Income + Depreciation - Capital Expenditures - Change in Working Capital + Net Borrowing. It starts with net income and adjusts for non-cash items, investments, and financing.</p></div>
          <div><h4 className="font-semibold mb-2">What is the difference between FCFE and free cash flow (FCF)?</h4><p className="text-muted-foreground">FCFE focuses on equity holders and accounts for net borrowing, while FCF focuses on all investors (equity + debt) and doesn't account for financing. FCFE = FCF - Net Debt Repayment + Net Borrowing.</p></div>
          <div><h4 className="font-semibold mb-2">Why is FCFE important for equity valuation?</h4><p className="text-muted-foreground">FCFE represents the cash available to equity holders, making it the appropriate cash flow metric for equity valuation in DCF models. It shows what can be paid to shareholders.</p></div>
          <div><h4 className="font-semibold mb-2">What does positive FCFE mean?</h4><p className="text-muted-foreground">Positive FCFE indicates the company generates cash after all expenses and investments, allowing dividends, share buybacks, or growth investments. It's a sign of financial strength and value creation.</p></div>
          <div><h4 className="font-semibold mb-2">What does negative FCFE mean?</h4><p className="text-muted-foreground">Negative FCFE indicates the company requires external financing (debt or equity) to fund operations or investments. This may be acceptable for growth companies but can be unsustainable long-term.</p></div>
          <div><h4 className="font-semibold mb-2">How does net borrowing affect FCFE?</h4><p className="text-muted-foreground">Net borrowing (new debt - debt repayment) increases FCFE because borrowing provides cash to equity holders. However, excessive borrowing increases financial risk and may not be sustainable.</p></div>
          <div><h4 className="font-semibold mb-2">How is FCFE used in DCF valuation?</h4><p className="text-muted-foreground">FCFE is discounted at the cost of equity to calculate equity value. The DCF model projects future FCFE and discounts it to present value, representing the intrinsic value of equity.</p></div>
          <div><h4 className="font-semibold mb-2">What is the relationship between FCFE and dividends?</h4><p className="text-muted-foreground">FCFE represents the maximum cash available for dividends. Companies can pay dividends up to FCFE, but may retain some FCFE for growth investments. Dividends exceeding FCFE require external financing.</p></div>
          <div><h4 className="font-semibold mb-2">How do I interpret FCFE trends?</h4><p className="text-muted-foreground">Growing FCFE indicates improving cash generation and value creation. Declining or negative FCFE may indicate financial stress or heavy investment. Compare FCFE to net income to assess cash quality and sustainability.</p></div>
        </CardContent>
      </Card>
    </div>
  );
}



