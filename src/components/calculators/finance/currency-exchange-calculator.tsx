
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, Calculator, Info, FileText, Globe, TrendingUp } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

const formSchema = z.object({
  amount: z.number().positive(),
  fromCurrency: z.string().min(3, "Use 3-letter code").max(3, "Use 3-letter code"),
  toCurrency: z.string().min(3, "Use 3-letter code").max(3, "Use 3-letter code"),
  rate: z.number().positive(),
});

type FormValues = z.infer<typeof formSchema>;

export default function CurrencyExchangeCalculator() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: 0,
      fromCurrency: '',
      toCurrency: '',
      rate: 0,
    },
  });

  const onSubmit = (values: FormValues) => {
    setResult(values.amount * values.rate);
  };

  return (
    <div className="space-y-8">
      {/* Alert Notice */}
      <Alert>
        <AlertTitle>Live Rates Not Available</AlertTitle>
        <AlertDescription>This calculator requires you to manually enter the current exchange rate. For live rates, please consult a financial data provider.</AlertDescription>
      </Alert>

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Currency Conversion Parameters
          </CardTitle>
          <CardDescription>
            Enter amount and exchange rate to convert between currencies
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField 
                  control={form.control} 
                  name="amount" 
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="e.g., 1000"
                          {...field} 
                          value={field.value || ''} 
                          onChange={e => field.onChange(parseFloat(e.target.value) || 0)} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} 
                />
                <FormField 
                  control={form.control} 
                  name="fromCurrency" 
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>From Currency (e.g., USD)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="USD"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} 
                />
                <FormField 
                  control={form.control} 
                  name="toCurrency" 
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>To Currency (e.g., EUR)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="EUR"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} 
                />
                <FormField 
                  control={form.control} 
                  name="rate" 
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Exchange Rate (1 From = ? To)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="any"
                          placeholder="e.g., 0.85"
                          {...field} 
                          value={field.value || ''} 
                          onChange={e => field.onChange(parseFloat(e.target.value) || 0)} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} 
                />
              </div>
              <Button type="submit">Convert</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Results */}
      {result !== null && (
        <Card>
          <CardHeader>
            <div className='flex items-center gap-4'>
              <RefreshCw className="h-8 w-8 text-primary" />
              <div>
                <CardTitle>Converted Amount</CardTitle>
                <CardDescription>Result of currency conversion</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-center">
              {result.toLocaleString(undefined, { style: 'currency', currency: form.getValues('toCurrency').toUpperCase() || 'USD', maximumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Understanding Inputs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Understanding the Inputs
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold text-foreground mb-2">Amount</h4>
            <p className="text-muted-foreground">
              The amount of money you wish to convert from the source currency. Enter the numeric value only.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-2">From/To Currency</h4>
            <p className="text-muted-foreground">
              The three-letter currency codes (ISO 4217) for the currencies you are converting between. Common examples include USD (United States Dollar), EUR (Euro), GBP (British Pound), JPY (Japanese Yen), and CNY (Chinese Yuan).
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-2">Exchange Rate</h4>
            <p className="text-muted-foreground">
              The current market rate for the currency pair. Enter this as "1 unit of From Currency equals X units of To Currency". For example, if 1 USD = 0.92 EUR, enter 0.92. This rate should be current and obtained from a reliable financial source.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Related Calculators */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Related Calculators
          </CardTitle>
          <CardDescription>
            Explore other currency and financial calculators
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <h4 className="font-semibold mb-2">
                <a href="/category/finance/currency-volatility-calculator" className="text-primary hover:underline">
                  Currency Volatility Impact Calculator
                </a>
              </h4>
              <p className="text-sm text-muted-foreground">
                Calculate the financial impact of exchange rate fluctuations on your currency holdings.
              </p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <h4 className="font-semibold mb-2">
                <a href="/category/finance/npv-calculator" className="text-primary hover:underline">
                  Net Present Value (NPV) Calculator
                </a>
              </h4>
              <p className="text-sm text-muted-foreground">
                Calculate the present value of future cash flows to evaluate investment profitability.
              </p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <h4 className="font-semibold mb-2">
                <a href="/category/finance/forward-rate-agreement-calculator" className="text-primary hover:underline">
                  Forward Rate Agreement Calculator
                </a>
              </h4>
              <p className="text-sm text-muted-foreground">
                Calculate settlement payments for forward rate agreements on interest rates.
              </p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <h4 className="font-semibold mb-2">
                <a href="/category/finance/currency-exchange-calculator" className="text-primary hover:underline">
                  Foreign Exchange Position Calculator
                </a>
              </h4>
              <p className="text-sm text-muted-foreground">
                Analyze foreign currency exposure and hedging strategies.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Complete Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Complete Guide to Currency Exchange
          </CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>This is a sample line for the complete guide section. You can add your detailed content here.</p>
          <p>This is another sample line for the guide section. Replace these with your comprehensive guide content.</p>
        </CardContent>
      </Card>

      {/* FAQ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>
            Common questions about currency exchange and conversion
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold text-foreground mb-2">How do I find the current exchange rate?</h4>
            <p className="text-muted-foreground">
              Current exchange rates are available from financial institutions, currency exchange services, and financial data providers like banks, currency converter websites, and forex trading platforms. Rates fluctuate constantly throughout trading hours.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">Why do exchange rates fluctuate?</h4>
            <p className="text-muted-foreground">
              Exchange rates fluctuate due to supply and demand dynamics, economic conditions, interest rate differentials, political stability, inflation rates, and market sentiment. Central bank policies and geopolitical events also significantly impact rates.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">What's the difference between the rate I see online and what I get at a bank?</h4>
            <p className="text-muted-foreground">
              Online rates are typically "mid-market" rates. Banks and exchange services add a markup (spread) to these rates, so you'll pay more to buy foreign currency and receive less when selling. This spread is how currency providers make money.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">How do I interpret a currency exchange rate?</h4>
            <p className="text-muted-foreground">
              Exchange rates show how much of one currency equals one unit of another. For example, USD/EUR = 0.92 means 1 US Dollar equals 0.92 Euros. Rates can be quoted either way (EUR/USD = 1.09), so ensure you're using the correct direction for your conversion.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">What is a currency pair?</h4>
            <p className="text-muted-foreground">
              A currency pair consists of two currencies that are quoted against each other. The first currency is the base currency, and the second is the quote currency. For example, in USD/EUR, USD is the base and EUR is the quote.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">What are currency code standards?</h4>
            <p className="text-muted-foreground">
              Currency codes follow the ISO 4217 standard, using three-letter abbreviations. These codes are internationally recognized and used in banking, finance, and international trade. Examples include USD, EUR, GBP, JPY, and CAD.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">Should I convert currency now or wait?</h4>
            <p className="text-muted-foreground">
              Timing currency conversion depends on your needs, budget, and risk tolerance. If you need money for travel or immediate expenses, convert when you need it. For larger amounts, consider using forward contracts or discussing hedging strategies with a financial advisor.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">How do I protect against unfavorable exchange rate movements?</h4>
            <p className="text-muted-foreground">
              You can protect against unfavorable movements using forward contracts, options, or currency swaps. These hedging instruments lock in exchange rates or provide flexibility to benefit from favorable rate movements while limiting downside risk.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">What are forward exchange rates?</h4>
            <p className="text-muted-foreground">
              Forward exchange rates are locked-in rates for currency conversion at a future date. These rates typically differ from spot rates based on interest rate differentials between the two currencies. They're used for hedging future currency needs.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">Why are some currency conversions different from simple multiplication?</h4>
            <p className="text-muted-foreground">
              While this calculator uses simple multiplication, real-world conversions may include fees, commissions, or adjustments for forward contracts. The rate you get may differ from the market rate due to spreads added by currency providers.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
