import Link from 'next/link';
import {
  Gamepad2,
  Target,
  ArrowRight,
  Calculator
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import RobloxGamepassROICalculatorInteractive from './roblox-gamepass-roi-calculator-interactive';

const relatedCalculators = [
  {
    name: '(Roblox) Trading Profit Analyzer',
    slug: 'roblox-trading-profit-analyzer',
    description: 'Check tax and profits for limited trading.',
  },
  {
    name: '(Roblox) Egg Hatch Odds Simulator',
    slug: 'roblox-egg-hatch-odds-simulator',
    description: 'Simulate hatch costs for pets.',
  },
  {
    name: '(Roblox) Inventory Value Estimator',
    slug: 'roblox-inventory-value-estimator',
    description: 'Calculate net worth of your items.',
  },
  {
    name: '(Roblox) Pet Value Calculator',
    slug: 'roblox-pet-value-calculator',
    description: 'Lookup Adopt Me/PS99 pet values.',
  },
];

const faqs = [
  {
    question: 'How do I know if a Gamepass is worth it?',
    answer:
      'The best metric is "Cost per Hour". If a gamepass costs 400 Robux ($5) and you play the game for 100 hours, you represent paying 4 Robux (5 cents) per hour for that fun. That is excellent value.',
  },
  {
    question: 'Are "Double Luck" passes temporary?',
    answer:
      'Usually, no. Gamepasses are permanent one-time purchases on Roblox. "Boosts" are temporary consumables. Always check the description. If it is in the "Store" tab as a Pass, it is forever.',
  },
  {
    question: 'Do multipliers stack?',
    answer:
      'In 99% of Roblox games, yes. If you buy "2x Coins" and "VIP" (which gives +10%), they usually multiply or add. 100 coins becomes 220 or 210.',
  },
  {
    question: 'Can I get a refund on a Gamepass?',
    answer:
      'No. Roblox does not allow refunds on Gamepasses unless the content is deleted or broken by the developer, which is rare and hard to prove.',
  },
  {
    question: 'Is "Speed Run" or "Teleport" worth purchasing?',
    answer:
      'For grinding games (simulators), absolutely. Saving 50% of your travel time literally doubles your grinding efficiency. It effectively acts as a "2x Everything" boost.',
  }
];

const steps = [
  'Enter the Gamepass Cost (Robux).',
  'Estimate how many hours you grind this game daily.',
  'Input what the pass does (Multiplier? Time Save?).',
  'Check the "Cost Value" score to see if it is a smart buy.',
];

const baseUrl = 'https://mycalculating.com/roblox-gamepass-roi-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Gaming', item: 'https://mycalculating.com/gaming' },
        { '@type': 'ListItem', position: 3, name: 'Gamepass ROI Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: '(Roblox) Gamepass ROI Calculator',
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'Web Browser',
      description: 'Calculate if a Roblox Gamepass is worth buying based on your playtime and the utility it provides.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
    {
      '@type': 'Article',
      headline: 'Roblox Gamepass Value: Is It Worth It?',
      description: 'Stop wasting Robux on bad gamepasses. Use our ROI calculator to determine the utility value of Speed, VIP, and Luck passes.',
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

export default function RobloxGamepassROICalculator() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
      />

      <Card className="border-l-4 border-l-orange-500 shadow-xl overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Gamepad2 className="h-6 w-6 text-orange-500" />
            Roblox Gamepass Value Calculator
          </CardTitle>
          <CardDescription>
            Is that 800 Robux gamepass actually worth buying? Find out here.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Calculator */}
        <div className="lg:col-span-2 space-y-6">
          <RobloxGamepassROICalculatorInteractive />
        </div>

        {/* Right Column: Context & Guide */}
        <div className="space-y-6">
          <Card className="bg-gradient-to-b from-orange-50 to-transparent dark:from-orange-900/10">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="h-5 w-5 text-orange-600" />
                Common Passes
              </CardTitle>

            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="p-3 text-left">Type</th>
                    <th className="p-3 text-right">Utility</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {[
                    { r: 'VIP', v: 'Low' },
                    { r: '2x Coins', v: 'High' },
                    { r: 'Fast Hatch', v: 'High' },
                    { r: 'Hoverboard', v: 'Medium' },
                    { r: 'Teleport', v: 'Very High' },
                    { r: 'Magic Eggs', v: 'High' }
                  ].map((row, i) => (
                    <tr key={i} className="hover:bg-muted/50">
                      <td className="p-3 font-medium">{row.r}</td>
                      <td className="p-3 text-right text-muted-foreground font-mono">{row.v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Buying Guide</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-lg">
                <h4 className="font-bold text-emerald-600 flex items-center gap-2"> The "Must Haves"</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Passes that affect speed (Teleport, Hoverboard, Auto-Run) are typically the best value because they act as a multiplier on EVERYTHING you do.
                </p>
              </div>
              <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg">
                <h4 className="font-bold text-red-600 flex items-center gap-2"> The "Traps"</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  VIP passes that only give a "Tag" and a small daily chest are rarely worth the Robux. Only buy for status.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">The "Quitting" Rule</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>Before buying a roughly 1,000 Robux pass ($12.50 USD), ask yourself:</p>
              <p className="italic">"Will I still be playing this game in 14 days?"</p>
              <p>If the answer is no, the cost per hour will be astronomical.</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <section
        className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg"
        itemScope
        itemType="https://schema.org/Article"
      >
        <meta itemProp="name" content="Roblox Gamepass Value Calculator: ROI & Worth Analysis" />
        <meta itemProp="description" content="Should you buy that Gamepass? Calculate the true value of Roblox gamepasses based on your playtime and their utility." />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">Roblox Gamepasses: Investment or Waste?</h1>
        <p className="text-lg italic text-muted-foreground">Roblox developers are geniuses at pricing. They make 499 Robux feel cheap. But is it? By breaking down the "Cost per Hour" and "Time Saved," we can mathematically assume if a Gamepass is a scam or a steal.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">The "Utility" Factor</h2>
        <p>
          Not all Gamepasses are created equal. We categorize them into three tiers:
        </p>
        <ul className="list-disc pl-6 mt-4 space-y-2">
          <li><strong>Multiplier Tier (Tier S):</strong> 2x Coins, 2x Luck. These linear boosters are the best value because they cut your grind time in half.</li>
          <li><strong>QoL Tier (Tier A):</strong> Teleport, Auto-Hatch, Sprint. These make the game less annoying. Highly recommended for long-term players.</li>
          <li><strong>Vanity Tier (Tier F):</strong> VIP Tags, Colored Chat, Pets. These offer zero mathematical advantage. Avoid if you are on a budget.</li>
        </ul>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">The 30-Day Rule</h2>
        <p>
          When calculating ROI, we assume a standard "Game Lifecycle" of 30 days. Most Roblox players switch main games every month.
          <br />
          If a gamepass costs <strong>1,200 Robux</strong>, you need to get 40 Robux of "Value" out of it every single day for a month to break even.
          If you quit after 3 days, you paid 400 Robux per day. That is roughly $5 USD per day just to play a Roblox gameâ€”more expensive than a AAA subscription!
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Worked Examples</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
          <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-lg">
            <h4 className="font-bold text-foreground">Scenario A: The "Grinder"</h4>
            <p className="text-sm"><strong>Pass:</strong> 2x Coins (499 R$)</p>
            <p className="text-sm"><strong>Playtime:</strong> 2 Hours/Day</p>
            <p className="text-sm"><strong>Result:</strong> Saves 60 hours/month.</p>
            <p className="text-xs text-muted-foreground mt-1">Cost is 8 R$ per saved hour. Incredible value.</p>
          </div>
          <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-lg">
            <h4 className="font-bold text-foreground">Scenario B: The "Visual"</h4>
            <p className="text-sm"><strong>Pass:</strong> Gold Name Tag (299 R$)</p>
            <p className="text-sm"><strong>Playtime:</strong> 5 Hours/Day</p>
            <p className="text-sm"><strong>Result:</strong> Saves 0 hours.</p>
            <p className="text-xs text-muted-foreground mt-1">Pure cosmetic. Zero ROI.</p>
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
                  <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-orange-500" />
                  <Link href={`/gaming/${calc.slug}`} className="text-foreground hover:text-orange-500 transition-colors">
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
            <Calculator className="h-5 w-5" />
            Summary for AI
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            A Gamepass Value Calculator for Roblox.
            Inputs: Gamepass Cost, Daily Playtime, Multiplier Amount, Time Saved.
            Outputs: Value Verdict (Must Buy/Ripoff), Cost Per Hour of Use, Break-Even Time, and Total Time Saved.
          </p>
          <p>
            It prioritizes "Time utility" over arbitrary currency values, determining if a purchase is efficient for the user's specific lifestyle.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
