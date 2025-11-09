
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
      <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/FinanceSummary">
    {/* SEO & SCHEMA METADATA (HIGHLY OPTIMIZED) */}
    <meta itemProp="name" content="The Definitive Guide to Currency Exchange Rates, Cross Rates, and FX Transaction Mechanics" />
    <meta itemProp="description" content="An expert guide detailing the fundamentals of foreign exchange (FX) rates, how to calculate conversions between base and quote currencies, understanding bid-ask spreads, and the mechanics of cross-rate calculation." />
    <meta itemProp="keywords" content="currency exchange calculation, FX rate conversion formula, bid-ask spread explained, cross rate calculation, base and quote currency, interbank vs retail exchange rate, spot rate mechanics" />
    <meta itemProp="author" content="[Your Site's Financial Analyst Team]" />
    <meta itemProp="datePublished" content="2025-10-25" /> 
    <meta itemProp="url" content="/definitive-currency-exchange-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Currency Exchange: Rates, Cross Rates, and Transaction Mechanics</h1>
    <p className="text-lg italic text-muted-foreground">Master the foundational concept of the foreign exchange market and how money is valued across international borders.</p>

    {/* TABLE OF CONTENTS (INTERNAL LINKS FOR UX AND SEO) */}
    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-primary">
        <li><a href="#basics" className="hover:underline">Exchange Rate Basics: Base, Quote, and Direct Quotes</a></li>
        <li><a href="#conversion" className="hover:underline">The Currency Conversion Formula</a></li>
        <li><a href="#cross-rate" className="hover:underline">Cross Rate Calculation and Arbitrage</a></li>
        <li><a href="#spread" className="hover:underline">The Bid-Ask Spread and Transaction Costs</a></li>
        <li><a href="#factors" className="hover:underline">Factors Influencing Exchange Rates</a></li>
    </ul>
<hr />

    {/* EXCHANGE RATE BASICS: BASE, QUOTE, AND DIRECT QUOTES */}
    <h2 id="basics" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Exchange Rate Basics: Base, Quote, and Direct Quotes</h2>
    <p>An **Exchange Rate** is the price of one country's currency expressed in terms of another country's currency. All transactions in the foreign exchange (FX) market rely on this rate to facilitate trade, investment, and travel.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Base Currency and Quote Currency</h3>
    <p>Exchange rates are always quoted in pairs, such as EUR/USD or USD/JPY. The notation A/B means:</p>
    <ul className="list-disc ml-6 space-y-2">
        <li>The <strong className="font-semibold">Base Currency (A):</strong> The unit of currency for which the quotation is made (the currency being bought or sold). The Base Currency is always equal to one unit.</li>
        <li>The <strong className="font-semibold">Quote Currency (B):</strong> The currency in which the price is expressed (the money used to purchase the base currency).</li>
    </ul>
    <p>For example, a quote of EUR/USD = 1.10 means one Euro (EUR) costs 1.10 U.S. Dollars (USD).</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Direct vs. Indirect Quotes</h3>
    <p>A <strong className="font-semibold">Direct Quote</strong> expresses the value of a foreign currency in terms of the domestic (local) currency (e.g., in the U.S., USD/EUR = 0.909). An <strong className="font-semibold">Indirect Quote</strong> expresses the value of the domestic currency in terms of the foreign currency (e.g., in the U.S., EUR/USD = 1.10).</p>

<hr />

    {/* THE CURRENCY CONVERSION FORMULA */}
    <h2 id="conversion" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Currency Conversion Formula</h2>
    <p>The calculation of converted funds is a straightforward multiplication or division based on whether the local currency is the Base or the Quote currency in the rate pair.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Converting Base to Quote</h3>
    <p>If you are converting an amount of the Base Currency into the Quote Currency, you multiply the amount by the exchange rate:</p>
    <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
        <p className="font-mono text-xl text-destructive font-bold">
            {'Amount (Quote) = Amount (Base) * Exchange Rate'}
        </p>
    </div>
    <p>Example: To convert 100 EUR to USD at a rate of 1.10, you calculate 100 multiplied by 1.10 = 110 USD.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Converting Quote to Base</h3>
    <p>If you are converting an amount of the Quote Currency into the Base Currency, you divide the amount by the exchange rate:</p>
    <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
        <p className="font-mono text-xl text-destructive font-bold">
            {'Amount (Base) = Amount (Quote) / Exchange Rate'}
        </p>
    </div>
    <p>Example: To convert 110 USD to EUR at a rate of 1.10, you calculate 110 / 1.10 = 100 EUR.</p>

<hr />

    {/* CROSS RATE CALCULATION AND ARBITRAGE */}
    <h2 id="cross-rate" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Cross Rate Calculation and Arbitrage</h2>
    <p>A <strong className="font-semibold">Cross Rate</strong> is the exchange rate between two currencies that is calculated based on their relationship to a third, primary currency (usually the U.S. Dollar). The vast majority of currency trading flows through the U.S. Dollar.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Calculation Identity</h3>
    <p>The cross rate between two non-USD currencies (A and B) is derived from the known rates between each of them and the USD:</p>
    <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
        <p className="font-mono text-xl text-destructive font-bold">
            {'Rate (A/B) = Rate (A/USD) / Rate (B/USD)'}
        </p>
    </div>
    <p>This is the primary method used to ensure mathematical consistency across the entire FX market.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Triangular Arbitrage</h3>
    <p>If the calculated cross rate does not match the actual market rate, a temporary phenomenon known as <strong className="font-semibold">Triangular Arbitrage</strong> occurs. A trader can profit by simultaneously exchanging three currencies (e.g., USD $\to$ EUR $\to$ JPY $\to$ USD) and ending up with more of the starting currency than they began with. Automated trading systems quickly eliminate these mispricings.</p>

<hr />

    {/* THE BID-ASK SPREAD AND TRANSACTION COSTS */}
    <h2 id="spread" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Bid-Ask Spread and Transaction Costs</h2>
    <p>When executing an exchange, the customer does not receive the interbank mid-market rate. Instead, they transact at the <strong className="font-semibold">Bid</strong> or <strong className="font-semibold">Ask</strong> price, creating a cost known as the <strong className="font-semibold">Spread</strong>.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Bid vs. Ask Price</h3>
    <ul className="list-disc ml-6 space-y-2">
        <li><strong className="font-semibold">Bid:</strong> The price at which the dealer (bank/broker) is willing to <strong className="font-semibold">buy</strong> the base currency from you. (This is the lower price).</li>
        <li><strong className="font-semibold">Ask (Offer):</strong> The price at which the dealer is willing to <strong className="font-semibold">sell</strong> the base currency to you. (This is the higher price).</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Spread (Transaction Cost)</h3>
    <p>The <strong className="font-semibold">Bid-Ask Spread</strong> is the difference between the Ask price and the Bid price. This difference represents the dealer's profit margin and is the primary transaction cost borne by the customer. Retail customers (e.g., at currency exchange kiosks) pay a much wider spread than institutional investors, reflecting the lower volume and higher operating costs of the transaction.</p>

<hr />

    {/* FACTORS INFLUENCING EXCHANGE RATES */}
    <h2 id="factors" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Factors Influencing Exchange Rates</h2>
    <p>Exchange rates are constantly fluctuating due to dynamic forces driven by trade, interest rates, and geopolitical stability.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">1. Interest Rate Differentials</h3>
    <p>Central bank interest rates are the most powerful short-term drivers. High interest rates in one country make its currency more attractive to foreign investors (seeking higher returns), increasing demand for that currency and causing it to appreciate.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">2. Trade Flows (Balance of Payments)</h3>
    <p>A country with a large trade surplus (exports exceeding imports) sees increased demand for its currency, as foreign buyers must acquire the domestic currency to pay for the goods, leading to appreciation.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">3. Political and Economic Stability</h3>
    <p>Currencies are often viewed as a reflection of national confidence. Periods of political instability, high inflation, or war cause investors to flee the local currency, leading to sharp depreciation (a flight to quality).</p>

<hr />

    {/* CONCLUSION */}
    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p>Currency exchange is governed by the price of the <strong className="font-semibold">Base Currency</strong> expressed in the <strong className="font-semibold">Quote Currency</strong>. Accurate conversion relies on simple multiplication or division.</p>
    <p>The efficiency of the global market is maintained by <strong className="font-semibold">Cross Rates</strong>, which ensure internal consistency across currency pairs. However, the transaction cost to the consumer is always determined by the <strong className="font-semibold">Bid-Ask Spread</strong>, which represents the dealer's margin for facilitating the exchange.</p>
</section>

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
