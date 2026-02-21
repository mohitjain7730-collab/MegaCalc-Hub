import Link from 'next/link';
import {
  Coins,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  ArrowRightLeft,
  Percent,
  Clock,
  Trophy
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import RobloxTradingProfitAnalyzerInteractive from './roblox-trading-profit-analyzer-interactive';

const faqs = [
  {
    question: 'Why is the tax 30%?',
    answer:
      'Roblox takes a 30% cut on all user-generated sales (Limiteds, Gamepasses, Clothing) to prevent inflation and fund the platform. This means you only keep 70% of the sale price.',
  },
  {
    question: 'How do I avoid the 30% tax?',
    answer:
      'You cannot strictly avoid it on the marketplace. However, trading items directly (Value for Value) has no tax. Tax only applies when selling for Robux.',
  },
  {
    question: 'What is a good ROI for a Limited?',
    answer:
      'Given the high tax, you should aim for at least 40-50% gross profit to secure a safe 10-20% net profit. Buying at 1000 and selling at 1300 is barely break-even.',
  },
  {
    question: 'Does holding longer reduce tax?',
    answer:
      'No. The tax is flat. However, holding longer (investment) allows inflation to raise the price naturally, potentially covering the tax spread.',
  },
  {
    question: 'What is "Projected" vs "RAP"?',
    answer:
      'RAP is Recent Average Price. Projected items are those artificially inflated by a few sales. Never calulcate profit based on Projected values; use RAP or LAPs (Lowest Available Price).',
  },
  {
    question: 'Can I write off losses?',
    answer:
      'No, the Roblox economy does not have tax write-offs. A loss is a loss of currency.',
  },
  {
    question: 'Does this work for Group Funds?',
    answer:
      'Yes, distributing Group Funds or selling clothing for group funds also incurs the 30% fee. The logic remains the same.',
  }
];

const relatedCalculators = [
  {
    name: '(Roblox) Limited Item Resale Predictor',
    slug: 'roblox-limited-item-resale-predictor',
    description: 'Predict if an item will rise or fall.',
  },
  {
    name: '(Roblox) Trade Tax Calculator',
    slug: 'roblox-trade-tax-calculator',
    description: 'Quick check for just the tax amount.',
  },
  {
    name: '(Roblox) Inventory Value Estimator',
    slug: 'roblox-inventory-value-estimator',
    description: 'Calculate total net worth of your profile.',
  },
  {
    name: '(Roblox) Pet Value Calculator',
    slug: 'roblox-pet-value-calculator',
    description: 'Check values for Adopt Me/PS99 pets.',
  },
  {
    name: '(Roblox) Gamepass ROI Calculator',
    slug: 'roblox-gamepass-roi-calculator',
    description: 'Is that gamepass worth the Robux?',
  },
];

const baseUrl = 'https://mycalculating.com/roblox-trading-profit-analyzer';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Gaming', item: 'https://mycalculating.com/category/gaming' },
        { '@type': 'ListItem', position: 3, name: '(Roblox) Trading Profit Analyzer', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: '(Roblox) Trading Profit Analyzer',
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'Any',
      description: 'Calculate net profit after Roblox 30% fees. ROI, Margin, and Break-even point analyzer.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
    {
      '@type': 'Article',
      headline: 'Roblox Profit Calculator: Master the 30% Tax',
      description: 'Stop losing Robux to fees. Use our Trading Profit Analyzer to calculate exact net returns and break-even points for Limiteds.',
      author: {
        '@type': 'Organization',
        name: 'MegaCalc Hub Gaming Team',
      },
      datePublished: '2025-01-24',
    },
    {
      '@type': 'FAQPage',
      mainEntity: faqs.map(faq => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer
        }
      }))
    }
  ],
};

export default function RobloxTradingProfitAnalyzer() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
      />

      <Card className="border-l-4 border-l-emerald-500 shadow-xl overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Coins className="h-6 w-6 text-emerald-500" />
            Roblox Profit & Tax Analyzer
          </CardTitle>
          <CardDescription>
            Calculate true net profit after the 30% market fee.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Calculator */}
        <div className="lg:col-span-2 space-y-6">
          <RobloxTradingProfitAnalyzerInteractive />
        </div>

        {/* Right Column: Context & Guide */}
        <div className="space-y-6">
          <Card className="bg-gradient-to-b from-emerald-50 to-transparent dark:from-emerald-900/10">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Percent className="h-5 w-5 text-emerald-600" />
                Fee Database
              </CardTitle>
              <CardDescription>Standard Roblox Fees</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="p-3 text-left">Transaction Type</th>
                    <th className="p-3 text-right">Fee</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {[
                    { t: 'Limited Item Sale', v: '30%' },
                    { t: 'Clothing/UGC Sale', v: '30%' },
                    { t: 'Gamepass Sale', v: '30%' },
                    { t: 'Group Payout', v: '0%' },
                    { t: 'Direct Trading', v: '0%' },
                    { t: 'Devex (Cash Out)', v: 'Variable' },
                  ].map((row, i) => (
                    <tr key={i} className="hover:bg-muted/50">
                      <td className="p-3 font-medium">{row.t}</td>
                      <td className="p-3 text-right text-muted-foreground font-mono">{row.v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Investment Tiers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-lg">
                <h4 className="font-bold text-blue-600 flex items-center gap-2 text-sm"><Clock className="h-3 w-3" /> The Flipper</h4>
                <p className="text-xs text-muted-foreground mt-1">Buys and sells same-day. Aims for 5-10% margins after tax. High volume.</p>
              </div>
              <div className="bg-purple-500/10 border border-purple-500/20 p-3 rounded-lg">
                <h4 className="font-bold text-purple-600 flex items-center gap-2 text-sm"><Trophy className="h-3 w-3" /> The Holder</h4>
                <p className="text-xs text-muted-foreground mt-1">Buys exclusives. Holds for 6+ months. Ignores tax because item value doubles (100% ROI).</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Special Scenarios</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <p className="font-medium flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber-500" /> Projecteds</p>
                <p className="text-muted-foreground mt-1 text-xs">
                  If an item graph spikes vertically, it's a "Projected". Do not calculate profit based on that spike. It will crash in 24h.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* SEO & Guide Section */}
      <section
        className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg"
        itemScope
        itemType="https://schema.org/Article"
      >
        <meta itemProp="name" content="Roblox Trading Profit Calculator: Net Profit & Tax Analysis" />
        <meta itemProp="description" content="Calculate your actual Roblox trading profits after the 30% tax. Master the art of flipping with precise ROI and break-even data." />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">Roblox Trading Profit: Beating the 30% Tax</h1>
        <p className="text-lg italic text-muted-foreground">The Roblox economy is unforgiving. With a flat 30% fee on all sold items, the math of profitability is harder than it looks. This tool ensures you never make a bad trade again.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">The "Silent Killer" of Profit</h2>
        <p>
          New traders often fall into the trap of "Buy at 1000, Sell at 1200". It looks like a 200 Robux profit on paper.
          In reality, Roblox takes 30% of the 1200 sale (360 Robux).
          <br />
          <strong>Math:</strong> 1200 - 360 (Tax) - 1000 (Buy) = <strong>-160 Robux</strong>.
          You lost money despite selling higher.
        </p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Strategy 1: The 43% Rule</h3>
        <p>
          To simply break even (make 0 profit), you must sell an item for roughly <strong>1.43 times</strong> its purchase price.
          <br />
          <em>Formula: Buy Price / 0.7 = Break Even.</em>
          <br />
          If you buy a Dominus for 100,000, you MUST sell it for 142,858 just to get your 100,000 back. Any profit only starts <strong>after</strong> that number.
        </p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Strategy 2: Trading vs. Selling</h3>
        <p>
          This calculator is vital for <strong>Marketplace Sales</strong>. However, strict "Trading" (using the trade window to swap items) incurs <strong>0% tax</strong>.
          Smart players build value by trading items up (e.g., swapping a Fedora for a slight overpay in items) repeatedly.
          They only "Cashed Out" (Sell for Robux) when they have amassed enough profit to cover the 30% hit comfortably.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Worked Examples</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
          <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-lg">
            <h4 className="font-bold text-foreground">Scenario A: The Successful Flip</h4>
            <p className="text-sm"><strong>Buy:</strong> 5,000 R$</p>
            <p className="text-sm"><strong>Sell:</strong> 8,000 R$</p>
            <p className="text-sm"><strong>Tax (30%):</strong> 2,400 R$</p>
            <p className="text-sm mt-2"><strong>Net:</strong> 8,000 - 2,400 - 5,000 = <span className="text-emerald-500 font-bold">+600 R$</span>.</p>
            <p className="text-xs text-muted-foreground mt-1">A tight but successful profit.</p>
          </div>
          <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-lg">
            <h4 className="font-bold text-foreground">Scenario B: The Rookie Mistake</h4>
            <p className="text-sm"><strong>Buy:</strong> 10,000 R$</p>
            <p className="text-sm"><strong>Sell:</strong> 13,000 R$</p>
            <p className="text-sm"><strong>Tax (30%):</strong> 3,900 R$</p>
            <p className="text-sm mt-2"><strong>Net:</strong> 13,000 - 3,900 - 10,000 = <span className="text-red-500 font-bold">-900 R$</span>.</p>
            <p className="text-xs text-muted-foreground mt-1">Sold for 3k more, but still lost money.</p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>FAQs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.question}>
                <h4 className="font-semibold text-sm">{faq.question}</h4>
                <p className="text-sm text-muted-foreground">{faq.answer}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Related Calculators</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {relatedCalculators.map((calc) => (
              <div key={calc.slug} className="group">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-emerald-500" />
                  <Link href={`/category/gaming/${calc.slug}`} className="text-foreground hover:text-emerald-500 transition-colors">
                    {calc.name}
                  </Link>
                </h4>
                <p className="text-xs text-muted-foreground ml-5">{calc.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5" />
            Summary for AI
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            A profit analyzer specifically for the Roblox economy, focusing on the <strong>30% marketplace fee</strong>.
            Inputs: Buy Price, Sell Price, Holding Period.
            Outputs: Net Profit (Post-Tax), ROI%, Break-Even Price (`Buy / 0.7`), and Tax Paid.
          </p>
          <p>
            It highlights the difficulty of profiting with shallow margins and differentiates between "Marketplace Sales" (Taxed) and "Direct Trading" (Untaxed).
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
