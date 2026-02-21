'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Heart, Zap, Target, Activity, Shield } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  safeInvestment: z.number({ invalid_type_error: 'Enter SAFE/note investment' }).min(0),
  valuationCap: z.number({ invalid_type_error: 'Enter valuation cap' }).min(0),
  discountPercent: z.number({ invalid_type_error: 'Enter discount %' }).min(0).max(100),
  roundPricePerShare: z.number({ invalid_type_error: 'Enter round price per share' }).min(0),
  preMoneyShares: z.number({ invalid_type_error: 'Enter pre-money fully diluted shares' }).min(1),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  safeInvestment: number;
  valuationCap: number;
  discountPercent: number;
  roundPricePerShare: number;
  preMoneyShares: number;
  capPrice: number;
  discountPrice: number;
  conversionPrice: number;
  sharesIssued: number;
  ownershipPercent: number;
  interpretation: string;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter SAFE/note investment amount.',
  'Enter valuation cap and discount %.',
  'Enter priced-round price per share and pre-money diluted shares.',
  'Review conversion price, shares issued, and ownership %.',
];

const faqs = [
  { question: 'How is conversion price determined?', answer: 'Conversion price is the lower of: (1) cap price = valuation cap / pre-money shares, (2) discount price = round price Ã— (1 - discount).' },
  { question: 'How many shares are issued?', answer: 'Shares = SAFE investment / conversion price.' },
  { question: 'How is ownership % calculated?', answer: 'Ownership % = SAFE shares / (pre-money shares + SAFE shares). This ignores new round shares for simplicity; include them in a full cap table for precision.' },
  { question: 'What if there is no discount or cap?', answer: 'If discount is 0 and cap is very high, conversion may default to round price. This calculator always picks the better of cap or discount for the investor.' },
  { question: 'How do multiple SAFEs interact?', answer: 'Each SAFE converts, increasing total shares. Model all SAFEs together in a full cap table for accurate ownership.' },
  { question: 'What about MFN or interest?', answer: 'This simplified model excludes MFN/interest. Add accrued interest to investment and adjust terms as needed in a full model.' },
];

const relatedCalculators = [
  { name: 'Startup Valuation (Post-Money / Pre-Money) Calculator', slug: 'startup-valuation-post-money-pre-money-calculator', description: 'Compute post-money valuation and ownership.' },
  { name: 'Founder Dilution Calculator (by Funding Round)', slug: 'founder-dilution-calculator', description: 'Estimate founder dilution per round.' },
  { name: 'Equity Cap Table Generator', slug: 'equity-cap-table-generator', description: 'Build cap tables with ownership splits.' },
  { name: 'LBO (Leveraged Buyout) Return Calculator', slug: 'lbo-leveraged-buyout-return-calculator', description: 'Compute MOIC and IRR for LBOs.' },
];

const baseUrl = 'https://mycalculating.com/finance/safe-convertible-note-conversion-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Finance', item: 'https://mycalculating.com/finance' },
        { '@type': 'ListItem', position: 3, name: 'SAFE / Convertible Note Conversion Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'SAFE / Convertible Note Conversion Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate SAFE/convertible note conversion price, shares issued, and resulting ownership based on cap/discount terms.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const calculateResult = (values: FormValues): ResultPayload => {
  const safeInvestment = values.safeInvestment;
  const valuationCap = values.valuationCap;
  const discount = values.discountPercent / 100;
  const roundPrice = values.roundPricePerShare;
  const preMoneyShares = values.preMoneyShares;

  const capPrice = valuationCap > 0 && preMoneyShares > 0 ? valuationCap / preMoneyShares : roundPrice;
  const discountPrice = roundPrice * (1 - discount);
  const conversionPrice = Math.min(capPrice, discountPrice > 0 ? discountPrice : roundPrice);
  const sharesIssued = conversionPrice > 0 ? safeInvestment / conversionPrice : 0;
  const ownershipPercent = (sharesIssued > 0 ? sharesIssued / (preMoneyShares + sharesIssued) : 0) * 100;

  let status: ResultPayload['status'] = 'optimal';
  let interpretation = '';

  if (sharesIssued <= 0) {
    status = 'low';
    interpretation = 'No shares issued; check inputs.';
  } else if (ownershipPercent < 5) {
    status = 'moderate';
    interpretation = 'Ownership below 5% is modest; typical for small SAFEs.';
  } else if (ownershipPercent <= 20) {
    status = 'good';
    interpretation = 'Ownership 5-20% is common depending on raise size and stage.';
  } else {
    status = 'optimal';
    interpretation = 'Ownership above 20% is high; ensure terms and capital justify this dilution.';
  }

  const recommendations = [
    `Conversion price: ${conversionPrice.toFixed(4)} (cap price ${capPrice.toFixed(4)}, discount price ${discountPrice.toFixed(4)}). Shares issued: ${sharesIssued.toLocaleString()}. Ownership: ${ownershipPercent.toFixed(2)}%.`,
    'Validate that valuation cap and discount are market-consistent. High ownership may indicate aggressive terms.',
    'This simplified ownership excludes priced-round new shares; include them in a full cap table for precision.',
    'If interest or MFN applies, add accrued interest to investment and adjust price per MFN terms.',
  ];

  const plan = [
    { label: 'This Week', detail: `Compute conversion price ${conversionPrice.toFixed(4)} and shares ${sharesIssued.toLocaleString()}. Review ownership impact.` },
    { label: 'This Month', detail: 'Model all SAFEs/notes and option pool in a full cap table. Validate terms vs. market benchmarks.' },
    { label: 'Ongoing', detail: 'Update conversion modeling as priced round terms change. Track cumulative dilution across instruments.' },
  ];

  return {
    safeInvestment,
    valuationCap,
    discountPercent: values.discountPercent,
    roundPricePerShare: roundPrice,
    preMoneyShares,
    capPrice,
    discountPrice,
    conversionPrice,
    sharesIssued,
    ownershipPercent,
    interpretation,
    status,
    recommendations,
    plan,
  };
};

export default function SafeConvertibleNoteConversionCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      safeInvestment: undefined,
      valuationCap: undefined,
      discountPercent: undefined,
      roundPricePerShare: undefined,
      preMoneyShares: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="safe-conversion-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            SAFE / Convertible Note Conversion Calculator
          </CardTitle>
          <CardDescription>Calculate SAFE/convertible note conversion price, shares issued, and resulting ownership using cap/discount terms.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your SAFE/note terms</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="safeInvestment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SAFE/Note Investment</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 500000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="valuationCap"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valuation Cap</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 10000000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="discountPercent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Discount (%)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 20" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="roundPricePerShare"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Round Price per Share</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.0001" placeholder="e.g., 2.50" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="preMoneyShares"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pre-Money Fully Diluted Shares</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 4000000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate Conversion
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Interactive results
            </CardTitle>
            <CardDescription>See conversion price, shares issued, and ownership.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Conversion Price</p>
                <p className="text-2xl font-semibold text-primary">${result.conversionPrice.toFixed(4)}</p>
                <p className="text-xs text-muted-foreground">Lower of cap/discount</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Shares Issued</p>
                <p className="text-2xl font-semibold text-primary">{result.sharesIssued.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">SAFE/note shares</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Ownership (Simplified)</p>
                <p className="text-2xl font-semibold text-primary">{result.ownershipPercent.toFixed(2)}%</p>
                <p className="text-xs text-muted-foreground">Pre-money shares basis</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc pl-4 space-y-1 text-sm text-muted-foreground">
                    {result.recommendations.map((rec, idx) => (
                      <li key={idx}>{rec}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Action plan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {result.plan.map((step) => (
                      <li key={step.label}>
                        <span className="font-semibold">{step.label}:</span> {step.detail}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Formula
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p><strong>Cap Price</strong> = Valuation Cap / Pre-Money Shares</p>
          <p><strong>Discount Price</strong> = Round Price Ã— (1 - Discount)</p>
          <p><strong>Conversion Price</strong> = min(Cap Price, Discount Price)</p>
          <p><strong>Shares Issued</strong> = SAFE Investment / Conversion Price</p>
          <p><strong>Ownership % (simplified)</strong> = SAFE Shares / (Pre-Money Shares + SAFE Shares)</p>
          <p>This simplified ownership excludes priced-round new shares; include them in a full cap table for precision.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
            {steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Related calculators</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {relatedCalculators.map((calc) => (
            <div key={calc.slug} className="p-4 border rounded">
              <h4 className="font-semibold mb-1">
                <Link href={`/finance/${calc.slug}`} className="text-primary hover:underline">
                  {calc.name}
                </Link>
              </h4>
              <p className="text-sm text-muted-foreground">{calc.description}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <section className="space-y-6 text-muted-foreground leading-relaxed bg-white dark:bg-gray-900 p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/Article">
        <meta itemProp="name" content="SAFE / Convertible Note Conversion: Caps, Discounts, and Ownership" />
        <meta itemProp="description" content="Calculate SAFE/convertible note conversion price, shares issued, and ownership using valuation cap and discount terms." />
        <meta itemProp="keywords" content="SAFE conversion, convertible note, valuation cap, discount, conversion price" />
        <meta itemProp="author" content="[Your Site's Finance Team]" />
        <meta itemProp="datePublished" content="2025-12-02" />
        <meta itemProp="url" content="/finance/safe-convertible-note-conversion-calculator" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">SAFE / Convertible Note Conversion: Caps, Discounts, and Ownership</h1>
        <p className="text-lg italic text-gray-700 dark:text-gray-300">A concise guide to converting SAFEs/notes in priced rounds using cap/discount terms.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
        <ul className="list-disc ml-6 space-y-2 text-blue-600 dark:text-blue-400">
          <li><a href="#pricing" className="hover:underline">Conversion Pricing</a></li>
          <li><a href="#shares" className="hover:underline">Shares and Ownership</a></li>
          <li><a href="#terms" className="hover:underline">Caps vs. Discounts</a></li>
          <li><a href="#modeling" className="hover:underline">Modeling Multiple SAFEs</a></li>
          <li><a href="#validation" className="hover:underline">Validation and Best Practices</a></li>
        </ul>
        <hr className="my-6" />

        <h2 id="pricing" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conversion Pricing</h2>
        <p>Conversion price is the better of cap or discount for the investor. Cap price = cap / pre-money shares. Discount price = round price Ã— (1 - discount).</p>

        <h2 id="shares" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Shares and Ownership</h2>
        <p>Shares issued = investment / conversion price. Ownership (simplified) = SAFE shares / (pre-money shares + SAFE shares). Include priced-round shares in a full model.</p>

        <h2 id="terms" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Caps vs. Discounts</h2>
        <p>Caps set a maximum valuation for conversion. Discounts reduce the round price. Conversion uses whichever is more favorable to the investor.</p>

        <h2 id="modeling" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Modeling Multiple SAFEs</h2>
        <p>Each SAFE converts, increasing shares. Model all SAFEs, option pool, and priced-round shares together for accurate ownership.</p>

        <h2 id="validation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Validation and Best Practices</h2>
        <p>Validate terms vs. market, include accrued interest and MFN if applicable, and run sensitivity on caps/discounts.</p>

        <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
        <p>Cap and discount terms drive conversion pricing and dilution. Accurate modeling requires full cap table integration and all instruments.</p>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>FAQs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {faqs.map((faq) => (
            <div key={faq.question}>
              <h4 className="font-semibold">{faq.question}</h4>
              <p className="text-sm text-muted-foreground">{faq.answer}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>This tool calculates SAFE/convertible note conversion price, shares issued, and ownership using valuation cap and discount terms.</p>
          <p>Outputs include conversion price, shares, ownership (simplified), interpretation, recommendations, and an action plan.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}
