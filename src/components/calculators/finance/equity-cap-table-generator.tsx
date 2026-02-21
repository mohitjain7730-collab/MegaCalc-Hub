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
  founderShares: z.number({ invalid_type_error: 'Enter founder shares' }).min(0),
  optionPoolShares: z.number({ invalid_type_error: 'Enter option pool shares' }).min(0).optional(),
  investor1Shares: z.number({ invalid_type_error: 'Enter investor 1 shares' }).min(0).optional(),
  investor2Shares: z.number({ invalid_type_error: 'Enter investor 2 shares' }).min(0).optional(),
  newRoundShares: z.number({ invalid_type_error: 'Enter new round shares' }).min(0).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type Row = { label: string; shares: number; percent: number };

type ResultPayload = {
  rows: Row[];
  totalShares: number;
  interpretation: string;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter founder shares (fully diluted).',
  'Enter option pool shares (if any).',
  'Enter investor shares (up to two) and any new round shares.',
  'Review ownership percentages across the cap table.',
];

const faqs = [
  { question: 'What is a cap table?', answer: 'A capitalization table lists all shareholders and their ownership percentages based on fully diluted shares.' },
  { question: 'How is ownership % calculated?', answer: 'Ownership % = Shares / Total Fully Diluted Shares.' },
  { question: 'What counts as fully diluted?', answer: 'Fully diluted includes common, preferred (as-converted), options (granted + pool), and convertibles if converted.' },
  { question: 'How do SAFEs/notes affect the cap table?', answer: 'They add shares when converted; include them for full accuracy. This tool is a simplified view without automatic SAFE conversion.' },
  { question: 'How to model option pools?', answer: 'Add current pool shares. If expanding pre-money, add the expansion amount to the pool before calculating ownership.' },
  { question: 'How to model multiple investors?', answer: 'Add their shares individually; extend the table as needed. This tool provides two investor slots plus a new round bucket.' },
];

const relatedCalculators = [
  { name: 'Founder Dilution Calculator (by Funding Round)', slug: 'founder-dilution-calculator', description: 'Estimate founder dilution per round.' },
  { name: 'SAFE / Convertible Note Conversion Calculator', slug: 'safe-convertible-note-conversion-calculator', description: 'Model SAFE/note conversion to equity.' },
  { name: 'Startup Valuation (Post-Money / Pre-Money) Calculator', slug: 'startup-valuation-post-money-pre-money-calculator', description: 'Compute post-money valuation and ownership.' },
  { name: 'LBO (Leveraged Buyout) Return Calculator', slug: 'lbo-leveraged-buyout-return-calculator', description: 'Compute MOIC and IRR for LBOs.' },
];

const baseUrl = 'https://mycalculating.com/category/finance/equity-cap-table-generator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Finance', item: 'https://mycalculating.com/category/finance' },
        { '@type': 'ListItem', position: 3, name: 'Equity Cap Table Generator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Equity Cap Table Generator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Generate a simplified equity cap table with ownership percentages across founders, option pool, investors, and new round shares.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const calculateResult = (values: FormValues): ResultPayload => {
  const rows: Row[] = [];
  rows.push({ label: 'Founders', shares: values.founderShares, percent: 0 });
  if (values.optionPoolShares !== undefined) rows.push({ label: 'Option Pool', shares: values.optionPoolShares, percent: 0 });
  if (values.investor1Shares !== undefined) rows.push({ label: 'Investor 1', shares: values.investor1Shares, percent: 0 });
  if (values.investor2Shares !== undefined) rows.push({ label: 'Investor 2', shares: values.investor2Shares, percent: 0 });
  if (values.newRoundShares !== undefined) rows.push({ label: 'New Round Shares', shares: values.newRoundShares, percent: 0 });

  const totalShares = rows.reduce((sum, r) => sum + (r.shares || 0), 0);
  rows.forEach((r) => {
    r.percent = totalShares > 0 ? (r.shares / totalShares) * 100 : 0;
  });

  let status: ResultPayload['status'] = 'optimal';
  let interpretation = '';

  const founderRow = rows.find((r) => r.label === 'Founders');
  const founderPct = founderRow?.percent ?? 0;
  if (founderPct === 0) {
    status = 'low';
    interpretation = 'Founders have 0% ownership. Check inputs.';
  } else if (founderPct < 30) {
    status = 'moderate';
    interpretation = 'Founder ownership below 30% is low; ensure this aligns with stage and strategy.';
  } else if (founderPct < 50) {
    status = 'good';
    interpretation = 'Founder ownership 30-50% is common after several rounds.';
  } else {
    status = 'optimal';
    interpretation = 'Founder ownership above 50% retains strong control; typical in early stages.';
  }

  const recommendations = [
    `Total shares: ${totalShares.toLocaleString()}. Founder ownership: ${founderPct.toFixed(1)}%. Option pool and investors allocated per inputs.`,
    'Include SAFEs/notes and future option pool expansions in a full model for accuracy.',
    'If founder % is too low, consider raise size/valuation, pool sizing, and timing of additional capital.',
  ];

  const plan = [
    { label: 'This Week', detail: `Review ownership: founders ${founderPct.toFixed(1)}%, total shares ${totalShares.toLocaleString()}. Confirm alignment with targets.` },
    { label: 'This Month', detail: 'Add SAFEs/notes and option pool expansions to a detailed cap table. Validate dilution across scenarios.' },
    { label: 'Ongoing', detail: 'Update cap table after each round or option grant. Track cumulative dilution over time.' },
  ];

  return { rows, totalShares, interpretation, status, recommendations, plan };
};

export default function EquityCapTableGenerator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      founderShares: undefined,
      optionPoolShares: undefined,
      investor1Shares: undefined,
      investor2Shares: undefined,
      newRoundShares: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="equity-cap-table-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Equity Cap Table Generator
          </CardTitle>
          <CardDescription>Generate a simplified equity cap table with ownership percentages.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input cap table components</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="founderShares"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Founder Shares</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 4000000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="optionPoolShares"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Option Pool Shares (Optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 600000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="investor1Shares"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Investor 1 Shares (Optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 800000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="investor2Shares"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Investor 2 Shares (Optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 400000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="newRoundShares"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Round Shares (Optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 2000000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Generate Cap Table
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
            <CardDescription>See ownership percentages by holder.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border">
                <thead>
                  <tr className="bg-muted">
                    <th className="border p-2 text-left">Holder</th>
                    <th className="border p-2 text-right">Shares</th>
                    <th className="border p-2 text-right">Ownership %</th>
                  </tr>
                </thead>
                <tbody>
                  {result.rows.map((row) => (
                    <tr key={row.label}>
                      <td className="border p-2">{row.label}</td>
                      <td className="border p-2 text-right">{row.shares.toLocaleString()}</td>
                      <td className="border p-2 text-right">{row.percent.toFixed(2)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Total Shares</p>
                <p className="text-2xl font-semibold text-primary">{result.totalShares.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Fully diluted (simplified)</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="text-2xl font-semibold text-primary capitalize">{result.status}</p>
                <p className="text-xs text-muted-foreground">{result.interpretation}</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Founders %</p>
                <p className="text-2xl font-semibold text-primary">{(result.rows.find((r) => r.label === 'Founders')?.percent ?? 0).toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">Control indicator</p>
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
          <p><strong>Ownership %</strong> = Shares / Total Shares (fully diluted, simplified)</p>
          <p>Fully diluted should include all common, preferred (as-converted), options, and convertibles. This tool provides a simplified view with two investors and an option pool.</p>
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
        <meta itemProp="name" content="Equity Cap Table Generator: Simplified Ownership Modeling" />
        <meta itemProp="description" content="Generate a simplified equity cap table with ownership percentages across founders, option pool, investors, and new round shares." />
        <meta itemProp="keywords" content="cap table, ownership, dilution, fully diluted shares" />
        <meta itemProp="author" content="[Your Site's Finance Team]" />
        <meta itemProp="datePublished" content="2025-12-02" />
        <meta itemProp="url" content="/finance/equity-cap-table-generator" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">Equity Cap Table Generator: Simplified Ownership Modeling</h1>
        <p className="text-lg italic text-gray-700 dark:text-gray-300">A lightweight cap table view to understand ownership splits and dilution.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
        <ul className="list-disc ml-6 space-y-2 text-blue-600 dark:text-blue-400">
          <li><a href="#basics" className="hover:underline">Cap Table Basics</a></li>
          <li><a href="#ownership" className="hover:underline">Ownership Calculation</a></li>
          <li><a href="#dilution" className="hover:underline">Dilution Considerations</a></li>
          <li><a href="#extensions" className="hover:underline">Extensions (SAFEs/Notes)</a></li>
          <li><a href="#validation" className="hover:underline">Validation and Best Practices</a></li>
        </ul>
        <hr className="my-6" />

        <h2 id="basics" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Cap Table Basics</h2>
        <p>A cap table lists all shareholders and their ownership percentages based on fully diluted shares.</p>

        <h2 id="ownership" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Ownership Calculation</h2>
        <p>Ownership % = Shares / Total fully diluted shares. Include all equity and dilutive instruments for accuracy.</p>

        <h2 id="dilution" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Dilution Considerations</h2>
        <p>New shares (rounds, option pools, SAFEs/notes) dilute existing holders. Track cumulative dilution over time.</p>

        <h2 id="extensions" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Extensions (SAFEs/Notes)</h2>
        <p>Include SAFEs/notes, option pool expansions, and multiple investors for full fidelity. This tool provides two investor slots plus a pool and new round bucket.</p>

        <h2 id="validation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Validation and Best Practices</h2>
        <p>Verify totals against legal docs, track vesting for option grants, and update after each financing or grant.</p>

        <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
        <p>A clear cap table helps founders manage dilution, align incentives, and prepare for future rounds. Use a full model for legal accuracy and scenario planning.</p>
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
          <p>This tool generates a simplified equity cap table with ownership percentages across founders, option pool, investors, and new round shares.</p>
          <p>Outputs include ownership table, total shares, interpretation, recommendations, and an action plan.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}
