import Link from 'next/link';
import { Gamepad2, ArrowRight, BrainCircuit } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import RobloxPetValueCalculatorInteractive from './roblox-pet-value-calculator-interactive';

const relatedCalculators = [
  {
    name: '(Roblox) Pet Simulator X Golden Pet Value',
    slug: 'roblox-pet-simulator-x-golden-pet-value-calculator',
    description: 'Calculate Golden and Rainbow upgrades specifically.',
  },
  {
    name: '(Roblox) Egg Hatch Odds Simulator',
    slug: 'roblox-egg-hatch-odds-simulator',
    description: 'Simulate your luck with egg hatching.',
  },
  {
    name: '(Roblox) Trade Tax Calculator',
    slug: 'roblox-trade-tax-calculator',
    description: 'Don\'t forget the 30% tax!',
  },
  {
    name: '(Roblox) Inventory Value Estimator',
    slug: 'roblox-inventory-value-estimator',
    description: 'Get a total estimation of your entire backpack.',
  },
  {
    name: '(Roblox) Pet Dupe Value Calculator',
    slug: 'roblox-pet-dupe-value-calculator',
    description: 'Check values for duped pets.',
  },
  {
    name: '(Roblox) Limited Item Resale Predictor',
    slug: 'roblox-limited-item-resale-predictor',
    description: 'Predict resale values for limited items.',
  },
];

const faqs = [
  {
    question: 'How do I know the "Base Rarity" of my pet?',
    answer:
      'The background color of your pet in the inventory usually indicates rarity: Grey (Common), Green (Uncommon), Blue (Rare), Purple (Epic), Orange/Red (Legendary), Pink (Mythical). Exclusive pets often have special tags or animated backgrounds.',
  },
  {
    question: 'Why does "Demand" change the value so much?',
    answer:
      'Roblox economies are market-driven. A pet can be rare (low supply) but if nobody wants it (low demand), it has no trading power. Conversely, a common pet needed for a new fusion event will skyrocket in value due to high demand.',
  },
  {
    question: 'How does Age add value?',
    answer:
      'Older pets are often discontinued or "OG". In games like Adopt Me or PSX, having a pet from 2019 or 2020 proves you are a veteran player. Collectors pay a premium for these "clean" history pets.',
  },
  {
    question: 'What counts as a "Special Attribute"?',
    answer:
      'Attributes include: Shiny, Rainbow, Golden, Neon, Mega Neon, Glitched, Signed (by a developer/YouTuber), or low serial number. Each of these adds a multiplier to the base price.',
  },
  {
    question: 'Is this calculator for Adopt Me or Pet Simulator?',
    answer:
      'This is a universal value estimator using standard economic principles applicable to most Roblox collection games (Adopt Me, PS99, PSX, MM2). For game-specific mechanics (like Golden Machine), use our specific calculators linked below.',
  },
  {
    question: 'Should I trust this value 100%?',
    answer:
      'Use this as a "fair value" baseline. The actual trade depends on the person you are trading with. If a user really wants your specific pet, they may overpay. Always check recent listings in the trading plaza.',
  },
  {
    question: 'What is the "Exclusive" tier?',
    answer:
      'Exclusive pets are usually bought with Robux or obtained from limited-time events. They do not come from regular eggs. Their value is tied to their Robux cost and inflation, making them very stable currencies.',
  },
];

const baseUrl = 'https://mycalculating.com/category/gaming/roblox-pet-value-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: '(Roblox) Pet Value Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Any',
      description: 'Calculate the trading value of Roblox pets based on rarity, age, demand, and attributes.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
    {
      '@type': 'Article',
      headline: 'Roblox Pet Value Calculator: The Ultimate Trading Guide',
      description: 'Accurately estimate the value of any Roblox pet. account for rarity, demand, age, and special attributes to win every trade.',
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

export default function RobloxPetValueCalculator() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
      />

      <Card className="border-l-4 border-l-blue-500 shadow-xl overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Gamepad2 className="h-6 w-6 text-blue-500" />
            Roblox Pet Value Calculator
          </CardTitle>
          <CardDescription>
            Universal value estimator for Adopt Me, PS99, and MM2.
          </CardDescription>
        </CardHeader>
      </Card>

      <RobloxPetValueCalculatorInteractive />

      {/* SEO & Guide Section */}
      <section
        className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg"
        itemScope
        itemType="https://schema.org/Article"
      >
        <meta itemProp="name" content="Roblox Pet Value Calculator: Official Trading Values" />
        <meta itemProp="description" content="Calculate accurate Roblox pet values. Our algorithm uses rarity, demand, age, and attributes to give you the real trading price." />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">Roblox Pet Value Calculator: The Ultimate Trading Logic</h1>
        <p className="text-lg italic text-muted-foreground">Stop getting scammed. Use data-driven value estimation to ensure you win every trade in Adopt Me, Pet Simulator 99, and MM2.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">How Pet Value is Calculated</h2>
        <p>
          The economy of Roblox is complex. Unlike traditional RPGs where an item has a fixed gold price, Roblox pets fluctuate exclusively based on <strong>player sentiment regarding supply and demand</strong>.
          This calculator mimics that volatile market by weighting four key pillars.
        </p>

        <h3 className="text-xl font-semibold text-foreground mt-6">1. The Rarity Foundation</h3>
        <p>
          Every pet starts with a "Base Value" defined by its hatch chane. A <strong>Common Cat</strong> (50% hatch rate) is virtually worthless because supply is infinite.
          A <strong>Mythical Dragon</strong> (0.0001% hatch rate) has high base value because supply is choked.
          <br />
          However, rarity is not everything. An ugly Mythical might be worth less than a cute Legendary. This is where <em>Demand</em> comes in.
        </p>

        <h3 className="text-xl font-semibold text-foreground mt-6">2. The Demand Multiplier (Hype)</h3>
        <p>
          Demand is the most powerful force in Roblox trading. We rate demand on a 0-100 scale:
        </p>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li><strong>0-20 (Dead):</strong> Old event pets that look bad. Hard to sell even for cheap.</li>
          <li><strong>50 (Stable):</strong> Standard tier pets (e.g., Unicorns) that always have a buyer.</li>
          <li><strong>80-100 (Hyped):</strong> New update pets. For the first 48 hours, these can trade for 5x-10x their actual rarity value.</li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">3. Age & Vintage Status</h3>
        <p>
          In economies like <em>Adopt Me</em>, an egg from 2019 (e.g., Safari Egg) is worth massive amounts not just because of what's inside, but because it is a "collectible antique".
          Our algorithm applies a <strong>Vintage Multiplier</strong> that grows for every year the pet exists. A 3-year-old pet is automatically considered a "High Tier" asset regardless of its base stats.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Worked Examples</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-bold text-foreground">Scenario A: The New Update Pet</h4>
            <p className="text-sm"><strong>Pet:</strong> Cyber Agony (Mythical)</p>
            <p className="text-sm"><strong>Age:</strong> 1 Day</p>
            <p className="text-sm"><strong>Demand:</strong> 100 (Max Hype)</p>
            <p className="text-sm mt-2"><strong>Result:</strong> Value skyrockets. Even though it's just a Mythical, the max demand pushes it to Exclusive tier prices. <span className="text-red-500 font-bold">Recommendation: SELL NOW.</span></p>
          </div>
          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-bold text-foreground">Scenario B: The Forgotten Exclusive</h4>
            <p className="text-sm"><strong>Pet:</strong> Old Event Corgi</p>
            <p className="text-sm"><strong>Age:</strong> 500 Days</p>
            <p className="text-sm"><strong>Demand:</strong> 20 (Low)</p>
            <p className="text-sm mt-2"><strong>Result:</strong> High Base Value + High Age Bonus, but crushed by Low Demand. <span className="text-blue-500 font-bold">Recommendation: HOLD.</span> Wait for a "Dog Event" to sell when hype returns.</p>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">ROI: Investment Strategy</h2>
        <p>
          <strong>The "Inflation Hedge" Strategy:</strong> The safest place to park your Gems/Bucks is in <strong>Huge or Titanic</strong> pets.
          Because currency acts inflationary (more gems enter the game every day), pets with fixed supply automatically go up in numerical value.
          Never hold millions of Gems; always convert them into liquid pets (like Huge Hell Rocks) to preserve buying power.
        </p>
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
                  <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-blue-500" />
                  <Link href={`/category/gaming/${calc.slug}`} className="text-foreground hover:text-blue-500 transition-colors">
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
            <BrainCircuit className="h-5 w-5" />
            Summary for AI
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            Calculates Roblox pet value using a weighted formula:
            <code>Value = Base_Rarity (100-1M) * Age_Mult (1.0-5.0x) * Demand_Mult (0.1-5.0x) * Attributes (1.5x per trait)</code>.
          </p>
          <p>
            It provides specific trading advice (Hold vs Sell) based on the calculated volatility.
            Designed for Pet Simulator 99, Adopt Me, and MM2 trading economies. Includes rarity tiers, demand logic, and ROI strategy guides.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
